#!/bin/bash
# SailorSkills Billing Script
# 
# Usage:
#   ./sailorskills-invoice.sh                     # Interactive mode - shows menu
#   ./sailorskills-invoice.sh --list              # List unbilled boats in CSV
#   ./sailorskills-invoice.sh --dry-run           # Preview all without charging
#   ./sailorskills-invoice.sh "Boat Name"         # Bill specific boat
#   ./sailorskills-invoice.sh "Boat1" "Boat2"     # Bill multiple specific boats
#   ./sailorskills-invoice.sh --all               # Bill all unbilled boats
#
# The script tracks billed boats in a companion .billed file to prevent double-billing.

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BILLING_DIR="$HOME/clawd/billing"
NOTION_DB_ID="0ae0e330-780b-4764-956e-12e8ee344ea2"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Ensure billing directory exists
mkdir -p "$BILLING_DIR"

# Help
show_help() {
    echo "SailorSkills Billing Script"
    echo ""
    echo "Usage:"
    echo "  $(basename "$0")                     Interactive mode"
    echo "  $(basename "$0") --list              List unbilled boats"
    echo "  $(basename "$0") --dry-run           Preview all charges"
    echo "  $(basename "$0") \"Boat Name\"         Bill specific boat"
    echo "  $(basename "$0") --all               Bill all unbilled"
    echo "  $(basename "$0") --help              Show this help"
    echo ""
    echo "Billing files are stored in: $BILLING_DIR"
}

# Get current month's billing file
get_billing_file() {
    local month_name=$(date +"%B_%Y" | tr '[:upper:]' '[:lower:]')
    echo "$BILLING_DIR/${month_name}_billing.csv"
}

get_billed_file() {
    local month_name=$(date +"%B_%Y" | tr '[:upper:]' '[:lower:]')
    echo "$BILLING_DIR/${month_name}_billed.txt"
}

# Initialize billing file for current month if needed
init_billing_file() {
    local billing_file=$(get_billing_file)
    local billed_file=$(get_billed_file)
    
    if [[ ! -f "$billing_file" ]]; then
        echo -e "${YELLOW}No billing file for this month.${NC}"
        echo "Create one at: $billing_file"
        echo ""
        echo "CSV format: Boat,Date,HullTotal,Anode,AnodeType,Total"
        echo "Example: Meliora,2026-02-15,125.72,0,,125.72"
        exit 1
    fi
    
    # Create billed tracking file if needed
    touch "$billed_file"
}

# Check if boat is already billed
is_billed() {
    local boat="$1"
    local billed_file=$(get_billed_file)
    grep -qxF "$boat" "$billed_file" 2>/dev/null
}

# Mark boat as billed
mark_billed() {
    local boat="$1"
    local billed_file=$(get_billed_file)
    echo "$boat" >> "$billed_file"
}

# List unbilled boats
list_unbilled() {
    local billing_file=$(get_billing_file)
    local billed_file=$(get_billed_file)
    
    echo -e "${CYAN}Unbilled boats for $(date +"%B %Y"):${NC}"
    echo "=================================="
    
    local count=0
    tail -n +2 "$billing_file" | while IFS=, read -r boat date hull anode atype total; do
        [[ -z "$boat" ]] && continue
        if ! is_billed "$boat"; then
            printf "  %-25s \$%s\n" "$boat" "$total"
            ((count++)) || true
        fi
    done
    
    echo "=================================="
    echo "Run with boat name(s) to bill, or --all for all"
}

# Load API keys
load_keys() {
    echo "Loading API keys..."
    
    # Stripe key from 1Password
    STRIPE_KEY=$(op read "op://Personal/Howard Billing Automation Key/password" 2>/dev/null) || {
        echo -e "${RED}Failed to get Stripe key from 1Password${NC}"
        exit 1
    }
    
    # Notion key - Howard integration for Client List
    local env_file="$HOME/AI/business/sailorskills-platform/.env"
    if [[ -f "$env_file" ]]; then
        NOTION_KEY=$(grep "^NOTION_HOWARD_TOKEN=" "$env_file" | cut -d'=' -f2)
        # Fallback to generic token
        [[ -z "$NOTION_KEY" ]] && NOTION_KEY=$(grep "^NOTION_TOKEN=" "$env_file" | cut -d'=' -f2)
    fi
    
    if [[ -z "$NOTION_KEY" ]]; then
        NOTION_KEY=$(op read "op://Personal/Notion API Key/password" 2>/dev/null || echo "")
    fi
    
    if [[ -z "$NOTION_KEY" ]]; then
        echo -e "${YELLOW}Warning: No Notion key found - email lookup will fail${NC}"
    fi
    
    echo -e "${GREEN}✓ Keys loaded${NC}"
}

# Get customer email from Notion
get_customer_email() {
    local boat_name="$1"
    [[ -z "$NOTION_KEY" ]] && return
    
    local response=$(curl -s "https://api.notion.com/v1/databases/$NOTION_DB_ID/query" \
        -H "Authorization: Bearer $NOTION_KEY" \
        -H "Notion-Version: 2022-06-28" \
        -H "Content-Type: application/json" \
        -d "{\"filter\": {\"property\": \"Boat\", \"title\": {\"equals\": \"$boat_name\"}}}" 2>/dev/null)
    
    echo "$response" | jq -r '
        .results[0].properties.Email.email // empty
        (."Email".email // 
         ."Owner Email".email // 
         ."Contact Email".email //
         empty)' 2>/dev/null | head -1
}

# Get or create Stripe customer
get_or_create_customer() {
    local email="$1"
    local boat_name="$2"
    
    local customer_id=$(curl -s "https://api.stripe.com/v1/customers?email=$(echo "$email" | jq -Rr @uri)&limit=1" \
        -u "$STRIPE_KEY:" | jq -r '.data[0].id // empty')
    
    if [[ -n "$customer_id" ]]; then
        echo "$customer_id"
        return
    fi
    
    curl -s "https://api.stripe.com/v1/customers" \
        -u "$STRIPE_KEY:" \
        -d "email=$email" \
        -d "description=$boat_name owner" | jq -r '.id'
}

# Check for payment method
has_payment_method() {
    local customer_id="$1"
    local pm=$(curl -s "https://api.stripe.com/v1/customers/$customer_id" \
        -u "$STRIPE_KEY:" | jq -r '.invoice_settings.default_payment_method // empty')
    [[ -n "$pm" ]]
}

# Create and send invoice
bill_boat() {
    local boat="$1"
    local hull_total="$2"
    local anode="$3"
    local anode_type="$4"
    local total="$5"
    local dry_run="${6:-false}"
    
    local service_month=$(date +"%B %Y")
    
    echo ""
    echo -e "${BLUE}[$boat]${NC}"
    
    # Check if already billed
    if is_billed "$boat"; then
        echo -e "  ${YELLOW}Already billed this month - skipping${NC}"
        return 0
    fi
    
    # Get email
    local email=$(get_customer_email "$boat")
    if [[ -z "$email" ]]; then
        echo -e "  ${RED}✗ No email in Notion - SKIPPED${NC}"
        return 1
    fi
    echo "  Email: $email"
    
    # Get Stripe customer
    local customer_id=$(get_or_create_customer "$email" "$boat")
    if [[ -z "$customer_id" || "$customer_id" == "null" ]]; then
        echo -e "  ${RED}✗ Failed to get Stripe customer - SKIPPED${NC}"
        return 1
    fi
    echo "  Customer: $customer_id"
    
    # Check payment method
    local has_card="false"
    if has_payment_method "$customer_id"; then
        has_card="true"
        echo "  Payment: ✓ Card on file"
    else
        echo "  Payment: ✗ No card (will send invoice)"
    fi
    
    # Dry run stops here
    if [[ "$dry_run" == "true" ]]; then
        echo -e "  ${YELLOW}[DRY RUN] Would charge \$$total${NC}"
        return 0
    fi
    
    # Convert to cents
    local hull_cents=$(echo "$hull_total * 100" | bc | cut -d. -f1)
    local anode_cents=$(echo "$anode * 100" | bc | cut -d. -f1)
    
    # Create invoice items
    curl -s "https://api.stripe.com/v1/invoiceitems" \
        -u "$STRIPE_KEY:" \
        -d "customer=$customer_id" \
        -d "amount=$hull_cents" \
        -d "currency=usd" \
        -d "description=Hull Cleaning - $boat - $service_month" > /dev/null
    
    if [[ $anode_cents -gt 0 ]]; then
        curl -s "https://api.stripe.com/v1/invoiceitems" \
            -u "$STRIPE_KEY:" \
            -d "customer=$customer_id" \
            -d "amount=$anode_cents" \
            -d "currency=usd" \
            -d "description=Anode: $anode_type - Installed" > /dev/null
    fi
    
    # Create invoice
    local collection_method="send_invoice"
    local extra_args="-d days_until_due=7"
    if [[ "$has_card" == "true" ]]; then
        collection_method="charge_automatically"
        extra_args=""
    fi
    
    local invoice=$(curl -s "https://api.stripe.com/v1/invoices" \
        -u "$STRIPE_KEY:" \
        -d "customer=$customer_id" \
        -d "collection_method=$collection_method" \
        $extra_args \
        -d "custom_fields[0][name]=Vessel" \
        -d "custom_fields[0][value]=$boat" \
        -d "custom_fields[1][name]=Service Date" \
        -d "custom_fields[1][value]=$service_month")
    
    local invoice_id=$(echo "$invoice" | jq -r '.id')
    
    if [[ -z "$invoice_id" || "$invoice_id" == "null" ]]; then
        echo -e "  ${RED}✗ Failed to create invoice${NC}"
        return 1
    fi
    
    # Finalize
    curl -s "https://api.stripe.com/v1/invoices/$invoice_id/finalize" \
        -u "$STRIPE_KEY:" -X POST > /dev/null
    
    # Charge or send
    if [[ "$has_card" == "true" ]]; then
        curl -s "https://api.stripe.com/v1/invoices/$invoice_id/pay" \
            -u "$STRIPE_KEY:" -X POST > /dev/null
        
        # Send receipt
        local charge_id=$(curl -s "https://api.stripe.com/v1/invoices/$invoice_id" \
            -u "$STRIPE_KEY:" | jq -r '.charge')
        
        if [[ -n "$charge_id" && "$charge_id" != "null" ]]; then
            curl -s "https://api.stripe.com/v1/charges/$charge_id" \
                -u "$STRIPE_KEY:" \
                -d "receipt_email=$email" > /dev/null
        fi
        echo -e "  ${GREEN}✓ Charged \$$total - receipt sent${NC}"
    else
        curl -s "https://api.stripe.com/v1/invoices/$invoice_id/send" \
            -u "$STRIPE_KEY:" -X POST > /dev/null
        echo -e "  ${GREEN}✓ Invoice sent for \$$total${NC}"
    fi
    
    # Mark as billed
    mark_billed "$boat"
    return 0
}

# Process boats
process_boats() {
    local dry_run="$1"
    shift
    local boats=("$@")
    
    local billing_file=$(get_billing_file)
    local billed=0
    local skipped=0
    local total_amount=0
    
    for boat in "${boats[@]}"; do
        # Find boat in CSV
        local line=$(grep "^$boat," "$billing_file" 2>/dev/null || true)
        
        if [[ -z "$line" ]]; then
            echo -e "${RED}Boat not found in billing file: $boat${NC}"
            ((skipped++))
            continue
        fi
        
        IFS=, read -r b date hull anode atype total <<< "$line"
        
        if bill_boat "$boat" "$hull" "$anode" "$atype" "$total" "$dry_run"; then
            ((billed++))
            total_amount=$(echo "$total_amount + $total" | bc)
        else
            ((skipped++))
        fi
    done
    
    echo ""
    echo "=================================="
    echo "Billed: $billed | Skipped: $skipped | Total: \$$total_amount"
}

# Interactive mode
interactive_mode() {
    echo -e "${CYAN}SailorSkills Billing - Interactive Mode${NC}"
    echo "========================================"
    echo ""
    echo "1) List unbilled boats"
    echo "2) Bill specific boat(s)"
    echo "3) Bill all unbilled"
    echo "4) Dry run (preview all)"
    echo "5) Exit"
    echo ""
    read -p "Choice: " choice
    
    case $choice in
        1) list_unbilled ;;
        2) 
            read -p "Boat name(s), comma-separated: " boats_input
            IFS=',' read -ra boats <<< "$boats_input"
            load_keys
            process_boats "false" "${boats[@]}"
            ;;
        3)
            load_keys
            local billing_file=$(get_billing_file)
            local boats=()
            while IFS=, read -r boat rest; do
                [[ -z "$boat" || "$boat" == "Boat" ]] && continue
                is_billed "$boat" || boats+=("$boat")
            done < "$billing_file"
            process_boats "false" "${boats[@]}"
            ;;
        4)
            load_keys
            local billing_file=$(get_billing_file)
            local boats=()
            while IFS=, read -r boat rest; do
                [[ -z "$boat" || "$boat" == "Boat" ]] && continue
                boats+=("$boat")
            done < "$billing_file"
            process_boats "true" "${boats[@]}"
            ;;
        5) exit 0 ;;
        *) echo "Invalid choice" ;;
    esac
}

# Main
main() {
    # Handle help
    if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
        show_help
        exit 0
    fi
    
    init_billing_file
    
    # Handle different modes
    case "${1:-}" in
        "")
            interactive_mode
            ;;
        "--list")
            list_unbilled
            ;;
        "--dry-run")
            load_keys
            local billing_file=$(get_billing_file)
            local boats=()
            while IFS=, read -r boat rest; do
                [[ -z "$boat" || "$boat" == "Boat" ]] && continue
                boats+=("$boat")
            done < "$billing_file"
            process_boats "true" "${boats[@]}"
            ;;
        "--all")
            load_keys
            local billing_file=$(get_billing_file)
            local boats=()
            while IFS=, read -r boat rest; do
                [[ -z "$boat" || "$boat" == "Boat" ]] && continue
                is_billed "$boat" || boats+=("$boat")
            done < "$billing_file"
            process_boats "false" "${boats[@]}"
            ;;
        *)
            # Specific boats
            load_keys
            process_boats "false" "$@"
            ;;
    esac
}

main "$@"
