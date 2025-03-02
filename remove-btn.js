document.querySelectorAll('.btn-remove').forEach(button => {
    button.addEventListener('click', function(e) {
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple');
      this.appendChild(ripple);
      
      // Position the ripple
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = e.clientX - rect.left - size/2 + 'px';
      ripple.style.top = e.clientY - rect.top - size/2 + 'px';
      
      // Remove ripple after animation completes
      ripple.addEventListener('animationend', () => {
        ripple.remove();
      });
    });
  });