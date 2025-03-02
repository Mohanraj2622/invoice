   // Additional JavaScript for the new elements
   document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Panel toggles
    const panelToggles = document.querySelectorAll('.panel-toggle');
    
    panelToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const panel = this.closest('.panel');
            const panelBody = panel.querySelector('.panel-body');
            
            if (panelBody.style.display === 'none') {
                panelBody.style.display = 'block';
                this.querySelector('i').className = 'fas fa-chevron-up';
            } else {
                panelBody.style.display = 'none';
                this.querySelector('i').className = 'fas fa-chevron-down';
            }
        });
    });
});