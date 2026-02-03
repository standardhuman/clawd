#!/bin/bash
# SailorSkills January 2026 Billing Script
# Usage: ./invoice-january.sh [--dry-run]
#
# Reads billing data from CSV, fetches customer emails from Notion,
# creates Stripe invoices, charges (if card on file), and sends receipts.

set -euo pipefail

# Configuration
BILLING_CSV="$HOME/clawd/january_2026_billing_final.csv"
NOTION_DB_ID="0ae0e330-780b-4764-956e-12e8ee344ea2"
SERVICE_MONTH="January 2026"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=true
    echo -e "${YELLOW}=== DRY RUN MODE ===${NC}"
    echo ""
fi

echo "Loading API keys from 1Password..."
STRIPE_KEY=$(op read "op://Personal/Howard Billing Automation Key/password" 2>/dev/null) || {
    echo -e "${RED}Failed to get Stripe key from 1Password${NC}"
    echo "Make sure 'Howard Billing Automation Key' exists in Personal vault"
    exit 1
}

# Try different possible names for Notion key
NOTION_KEY=$(op read "op://Personal/Notion API Key/password" 2>/dev/null || \
             op read "op://Personal/Notion/credential" 2>/dev/null || \
             op read "op://Personal/Notion Integration/password" 2>/dev/null || \
             echo "")

if [[ -z "$NOTION_KEY" ]]; then
    echo -e "${YELLOW}Warning: Could not get Notion key from 1Password${NC}"
    echo "Will skip email lookup - you may need to add emails manually"
    echo ""
fi

echo -e "${GREEN}✓ API keys loaded${NC}"
echo ""

# Function to get customer email from Notion by boat name
get_customer_email() {
    local boat_name="$1"
    
    [[ -z "$NOTION_KEY" ]] && return
    
    # URL encode the boat name
    local encoded_name=$(echo "$boat_name" | jq -Rr @uri)
    
    # Search Notion for the boat
    local response=$(curl -s "https://api.notion.com/v1/databases/$NOTION_DB_ID/query" \
        -H "Authorization: Bearer $NOTION_KEY" \
        -H "Notion-Version: 2022-06-28" \
        -H "Content-Type: application/json" \
        -d "{\"filter\": {\"property\": \"Name\", \"title\": {\"equals\": \"$boat_name\"}}}" 2>/dev/null)
    
    # Try different possible email property names
    echo "$response" | jq -r '
        .results[0].properties | 
        (."Email".email // 
         ."Owner Email".email // 
         ."Contact Email".email //
         ."email".email //
         empty)' 2>/dev/null | head -1
}

# Function to find or create Stripe customer
get_or_create_customer() {
    local email="$1"
    local boat_name="$2"
    
    # Search for existing customer
    local customer_id=$(curl -s "https://api.stripe.com/v1/customers?email=$(echo "$email" | jq -Rr @uri)&limit=1" \
        -u "$STRIPE_KEY:" | jq -r '.data[0].id // empty')
    
    if [[ -n "$customer_id" ]]; then
        echo "$customer_id"
        return
    fi
    
    # Create new customer
    local new_customer=$(curl -s "https://api.stripe.com/v1/customers" \
        -u "$STRIPE_KEY:" \
        -d "email=$email" \
        -d "description=$boat_name owner")
    
    echo "$new_customer" | jq -r '.id'
}

# Function to check if customer has payment method
has_payment_method() {
    local customer_id="$1"
    
    local pm=$(curl -s "https://api.stripe.com/v1/customers/$customer_id" \
        -u "$STRIPE_KEY:" | jq -r '.invoice_settings.default_payment_method // empty')
    
    [[ -n "$pm" ]]
}

# Function to create and send invoice
create_invoice() {
    local customer_id="$1"
    local boat_name="$2"
    local service_date="$3"
    local hull_cents="$4"
    local anode_cents="$5"
    local anode_type="$6"
    local has_card="$7"
    
    local total_cents=$((hull_cents + anode_cents))
    local total_dollars=$(echo "scale=2; $total_cents / 100" | bc)
    
    if $DRY_RUN; then
        echo -e "  ${YELLOW}[DRY RUN] Would create invoice:${NC}"
        echo -e "    Hull cleaning: \$$(echo "scale=2; $hull_cents / 100" | bc)"
        [[ $anode_cents -gt 0 ]] && echo -e "    Anode ($anode_type): \$$(echo "scale=2; $anode_cents / 100" | bc)"
        echo -e "    Total: \$$total_dollars"
        return 0
    fi
    
    # Create hull cleaning line item
    curl -s "https://api.stripe.com/v1/invoiceitems" \
        -u "$STRIPE_KEY:" \
        -d "customer=$customer_id" \
        -d "amount=$hull_cents" \
        -d "currency=usd" \
        -d "description=Hull Cleaning - $boat_name - $service_date" > /dev/null
    
    # Create anode line item if applicable
    if [[ $anode_cents -gt 0 ]]; then
        curl -s "https://api.stripe.com/v1/invoiceitems" \
            -u "$STRIPE_KEY:" \
            -d "customer=$customer_id" \
            -d "amount=$anode_cents" \
            -d "currency=usd" \
            -d "description=Anode: $anode_type - Installed" > /dev/null
    fi
    
    # Create invoice with custom fields
    local collection_method="send_invoice"
    local extra_args=""
    if [[ "$has_card" == "true" ]]; then
        collection_method="charge_automatically"
    else
        extra_args="-d days_until_due=7"
    fi
    
    local invoice=$(curl -s "https://api.stripe.com/v1/invoices" \
        -u "$STRIPE_KEY:" \
        -d "customer=$customer_id" \
        -d "collection_method=$collection_method" \
        $extra_args \
        -d "custom_fields[0][name]=Vessel" \
        -d "custom_fields[0][value]=$boat_name" \
        -d "custom_fields[1][name]=Service Date" \
        -d "custom_fields[1][value]=$service_date")
    
    local invoice_id=$(echo "$invoice" | jq -r '.id')
    
    if [[ -z "$invoice_id" || "$invoice_id" == "null" ]]; then
        echo "error"
        return
    fi
    
    # Finalize
    curl -s "https://api.stripe.com/v1/invoices/$invoice_id/finalize" \
        -u "$STRIPE_KEY:" -X POST > /dev/null
    
    # Pay if has card
    if [[ "$has_card" == "true" ]]; then
        curl -s "https://api.stripe.com/v1/invoices/$invoice_id/pay" \
            -u "$STRIPE_KEY:" -X POST > /dev/null
        
        # Get charge ID and send receipt
        local charge_id=$(curl -s "https://api.stripe.com/v1/invoices/$invoice_id" \
            -u "$STRIPE_KEY:" | jq -r '.charge')
        
        if [[ -n "$charge_id" && "$charge_id" != "null" ]]; then
            local email=$(curl -s "https://api.stripe.com/v1/customers/$customer_id" \
                -u "$STRIPE_KEY:" | jq -r '.email')
            curl -s "https://api.stripe.com/v1/charges/$charge_id" \
                -u "$STRIPE_KEY:" \
                -d "receipt_email=$email" > /dev/null
        fi
        echo "charged|$total_dollars"
    else
        # Send invoice for payment
        curl -s "https://api.stripe.com/v1/invoices/$invoice_id/send" \
            -u "$STRIPE_KEY:" -X POST > /dev/null
        echo "sent|$total_dollars"
    fi
}

# Main processing
echo "Processing $SERVICE_MONTH billing..."
echo "CSV: $BILLING_CSV"
echo "=================================="

# Track totals
total_processed=0
total_charged=0
total_sent=0
total_skipped=0
amount_charged=0
amount_sent=0

# Read CSV (skip header)
tail -n +2 "$BILLING_CSV" | while IFS=, read -r boat date hull_total anode anode_type total; do
    # Skip empty lines
    [[ -z "$boat" ]] && continue
    
    echo ""
    echo -e "${BLUE}[$boat]${NC}"
    
    # Get customer email from Notion
    email=$(get_customer_email "$boat")
    
    if [[ -z "$email" ]]; then
        echo -e "  ${RED}✗ No email found in Notion - SKIPPED${NC}"
        echo "$boat" >> /tmp/billing_skipped.txt
        continue
    fi
    
    echo "  Email: $email"
    
    # Get or create Stripe customer
    customer_id=$(get_or_create_customer "$email" "$boat")
    
    if [[ -z "$customer_id" || "$customer_id" == "null" ]]; then
        echo -e "  ${RED}✗ Failed to get/create Stripe customer - SKIPPED${NC}"
        echo "$boat" >> /tmp/billing_skipped.txt
        continue
    fi
    
    echo "  Customer: $customer_id"
    
    # Check payment method
    if has_payment_method "$customer_id"; then
        has_card="true"
        echo "  Payment: ✓ Card on file"
    else
        has_card="false"
        echo "  Payment: ✗ No card (will send invoice)"
    fi
    
    # Convert amounts to cents
    hull_cents=$(echo "$hull_total * 100" | bc | cut -d. -f1)
    anode_cents=$(echo "$anode * 100" | bc | cut -d. -f1)
    
    # Create invoice
    result=$(create_invoice "$customer_id" "$boat" "$SERVICE_MONTH" "$hull_cents" "$anode_cents" "$anode_type" "$has_card")
    
    if [[ "$result" == "0" ]]; then
        # Dry run
        continue
    fi
    
    status=$(echo "$result" | cut -d'|' -f1)
    amount=$(echo "$result" | cut -d'|' -f2)
    
    if [[ "$status" == "charged" ]]; then
        echo -e "  ${GREEN}✓ Charged \$$amount - receipt sent${NC}"
    elif [[ "$status" == "sent" ]]; then
        echo -e "  ${GREEN}✓ Invoice sent for \$$amount${NC}"
    else
        echo -e "  ${RED}✗ Error creating invoice${NC}"
        echo "$boat" >> /tmp/billing_skipped.txt
    fi
    
done

echo ""
echo "=================================="
echo "COMPLETE"
echo "=================================="

if [[ -f /tmp/billing_skipped.txt ]]; then
    echo ""
    echo -e "${YELLOW}Skipped boats (check /tmp/billing_skipped.txt):${NC}"
    cat /tmp/billing_skipped.txt
    rm /tmp/billing_skipped.txt
fi

echo ""
echo "Review invoices at: https://dashboard.stripe.com/invoices"
