/**
 * Holographic Particles System - v0.6
 * Creates advanced particle effects with depth and holographic aesthetics
 * For MillzMaleficarum Codex v0.6
 */

class HolographicParticles {
  constructor(options = {}) {
    this.options = {
      containerSelector: '#magazine-content',
      particleCount: 100,
      particleMaxSize: 6,
      particleMinSize: 1,
      particleColors: ['#ff00ff', '#00ffff', '#ff33cc', '#33ffff', '#ffffff'],
      depthLayers: 5,
      depthRange: 100,
      interactionRadius: 150,
      hoverGlowIntensity: 0.7,
      mouseInteraction: true,
      driftSpeed: 0.3,
      animate: true,
      ...options
    };
    
    this.container = null;
    this.particles = [];
    this.animationFrame = null;
    this.isActive = false;
    this.mousePosition = { x: -1000, y: -1000, active: false };
    
    this.init();
  }
  
  init() {
    // Get container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error('HolographicParticles: Container not found');
      return;
    }
    
    // Create particles container
    this.particlesContainer = document.createElement('div');
    this.particlesContainer.className = 'holo-particles';
    this.container.appendChild(this.particlesContainer);
    
    // Create particles
    this.createParticles();
    
    // Set up mouse interaction
    if (this.options.mouseInteraction) {
      this.setupMouseInteraction();
    }
    
    // Start animation
    if (this.options.animate) {
      this.start();
    }
    
    console.log(`HolographicParticles: Initialized with ${this.particles.length} particles`);
  }
  
  createParticles() {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;
    
    // Clear existing particles
    this.particlesContainer.innerHTML = '';
    this.particles = [];
    
    // Create new particles
    for (let i = 0; i < this.options.particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random properties
      const size = Math.random() * (this.options.particleMaxSize - this.options.particleMinSize) + this.options.particleMinSize;
      const depth = Math.random() * this.options.depthRange - (this.options.depthRange / 2);
      const x = Math.random() * containerWidth;
      const y = Math.random() * containerHeight;
      const color = this.options.particleColors[Math.floor(Math.random() * this.options.particleColors.length)];
      const opacity = Math.random() * 0.5 + 0.2;
      const blurAmount = Math.abs(depth) * 0.015;
      
      // Apply styles
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.backgroundColor = color;
      particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      particle.style.transform = `translateZ(${depth}px)`;
      particle.style.opacity = opacity;
      particle.style.filter = `blur(${blurAmount}px)`;
      
      // Store particle properties
      const particleObj = {
        element: particle,
        x,
        y,
        depth,
        size,
        color,
        opacity,
        speedX: (Math.random() - 0.5) * this.options.driftSpeed,
        speedY: (Math.random() - 0.5) * this.options.driftSpeed,
        originalOpacity: opacity
      };
      
      this.particles.push(particleObj);
      this.particlesContainer.appendChild(particle);
    }
  }
  
  setupMouseInteraction() {
    // Track mouse position
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePosition.x = e.clientX - rect.left;
      this.mousePosition.y = e.clientY - rect.top;
      this.mousePosition.active = true;
    });
    
    // Reset mouse position when mouse leaves
    this.container.addEventListener('mouseleave', () => {
      this.mousePosition.active = false;
    });
  }
  
  animateParticles() {
    const containerWidth = this.container.offsetWidth;
    const containerHeight = this.container.offsetHeight;
    
    this.particles.forEach(particle => {
      // Update position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Wrap around edges
      if (particle.x < -particle.size) particle.x = containerWidth + particle.size;
      if (particle.x > containerWidth + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = containerHeight + particle.size;
      if (particle.y > containerHeight + particle.size) particle.y = -particle.size;
      
      // Apply mouse interaction if active
      if (this.mousePosition.active) {
        const dx = particle.x - this.mousePosition.x;
        const dy = particle.y - this.mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.interactionRadius) {
          // Calculate influence (closer = stronger)
          const influence = 1 - (distance / this.options.interactionRadius);
          
          // Apply glow effect
          const glowOpacity = particle.originalOpacity + (influence * this.options.hoverGlowIntensity);
          particle.element.style.opacity = glowOpacity;
          
          // Increase glow radius with influence
          const glowSize = particle.size * (1 + influence * 2);
          particle.element.style.boxShadow = `0 0 ${glowSize * 3}px ${particle.color}`;
          
          // Apply slight repulsion
          const repulsionFactor = 0.5;
          const repulsionX = (dx / distance) * influence * repulsionFactor;
          const repulsionY = (dy / distance) * influence * repulsionFactor;
          
          particle.x += repulsionX;
          particle.y += repulsionY;
        } else {
          // Reset to original state
          particle.element.style.opacity = particle.opacity;
          particle.element.style.boxShadow = `0 0 ${particle.size * 3}px ${particle.color}`;
        }
      }
      
      // Update element position
      particle.element.style.left = `${particle.x}px`;
      particle.element.style.top = `${particle.y}px`;
    });
    
    // Continue animation loop
    if (this.isActive) {
      this.animationFrame = requestAnimationFrame(() => this.animateParticles());
    }
  }
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.animationFrame = requestAnimationFrame(() => this.animateParticles());
    console.log('HolographicParticles: Animation started');
  }
  
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    console.log('HolographicParticles: Animation stopped');
  }
  
  resize() {
    // Recreate particles on container resize
    this.createParticles();
  }
  
  destroy() {
    this.stop();
    
    // Remove particles container
    if (this.particlesContainer && this.particlesContainer.parentNode) {
      this.particlesContainer.parentNode.removeChild(this.particlesContainer);
    }
    
    this.particles = [];
    console.log('HolographicParticles: Destroyed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.holoParticles = new HolographicParticles();
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (window.holoParticles) {
      window.holoParticles.resize();
    }
  });
});