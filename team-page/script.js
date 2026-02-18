// Enhanced interactivity for the team page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize agent cards with enhanced hover effects
    initAgentCards();
    
    // Initialize smooth scrolling with offset
    initSmoothScrolling();
    
    // Initialize parallax effects
    initParallax();
    
    // Initialize pipeline card interactions
    initPipelineCards();
    
    // Initialize values cards interactions
    initValuesCards();
    
    // Add loading animation
    addLoadingAnimation();
});

function initAgentCards() {
    const agentCards = document.querySelectorAll('.agent-card');
    
    agentCards.forEach((card, index) => {
        // Add data attribute for tracking
        card.dataset.index = index;
        
        // Add click handler to show more details
        card.addEventListener('click', function(e) {
            if (!e.target.closest('a')) { // Don't trigger if clicking a link
                this.classList.toggle('expanded');
                
                // Add/remove expanded class for animation
                if (this.classList.contains('expanded')) {
                    this.style.transform = 'translateY(-8px) scale(1.02)';
                    this.style.zIndex = '10';
                } else {
                    this.style.transform = '';
                    this.style.zIndex = '';
                }
            }
        });
        
        // Add keyboard support
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
        
        // Make cards focusable
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Learn more about ${card.querySelector('.agent-name').textContent}`);
    });
}

function initSmoothScrolling() {
    // Smooth scrolling for all anchor links with offset for fixed header
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - headerHeight - 20,
                    behavior: 'smooth'
                });
                
                // Update URL without page jump
                history.pushState(null, null, targetId);
            }
        });
    });
}

function initParallax() {
    // Simple parallax effect for hero section
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        hero.style.transform = `translateY(${rate}px)`;
    });
}

function initPipelineCards() {
    const pipelineCards = document.querySelectorAll('.pipeline-card');
    
    pipelineCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const steps = this.querySelectorAll('.pipeline-step');
            steps.forEach((step, index) => {
                step.style.transitionDelay = `${index * 0.1}s`;
                step.style.transform = 'translateX(5px)';
            });
        });
        
        card.addEventListener('mouseleave', function() {
            const steps = this.querySelectorAll('.pipeline-step');
            steps.forEach(step => {
                step.style.transform = '';
                step.style.transitionDelay = '';
            });
        });
    });
}

function initValuesCards() {
    const valueCards = document.querySelectorAll('.value-card');
    
    valueCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const icon = this.querySelector('i');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
        
        // Add click to expand functionality
        card.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
        
        // Make keyboard accessible
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
    });
}

function addLoadingAnimation() {
    // Add loading animation to agent cards
    const agentCards = document.querySelectorAll('.agent-card');
    
    // Create a simple intersection observer for lazy loading animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });
    
    agentCards.forEach(card => {
        observer.observe(card);
    });
}

// Add some utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handle window resize with debounce
window.addEventListener('resize', debounce(function() {
    // Recalculate any layout-dependent values here
    console.log('Window resized - layout recalculated');
}, 250));

// Add keyboard navigation for agent cards
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any expanded cards
        document.querySelectorAll('.agent-card.expanded').forEach(card => {
            card.classList.remove('expanded');
            card.style.transform = '';
            card.style.zIndex = '';
        });
    }
});

// Add print functionality
function printPage() {
    window.print();
}

// Export functions for debugging if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initAgentCards,
        initSmoothScrolling,
        initParallax,
        initPipelineCards,
        initValuesCards,
        addLoadingAnimation,
        printPage
    };
}