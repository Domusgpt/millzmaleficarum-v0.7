/**
 * MillzMaleficarum Codex v0.4
 * Reactive Micro-Animations Module
 * Adds interactive, responsive animations to text and UI elements
 */

class ReactiveAnimations {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      textClass: 'reactive-text',
      sigilClass: 'sigil',
      depthLayerClass: 'depth-layer',
      glitchIntensity: options.glitchIntensity || 0.5,
      mouseReactivity: options.mouseReactivity || 0.7,
      scrollReactivity: options.scrollReactivity || 0.8,
      sigilSyncEnabled: options.sigilSyncEnabled !== false,
      ambientMotionEnabled: options.ambientMotionEnabled !== false,
      performanceMode: options.performanceMode || 'auto' // 'auto', 'high', 'medium', 'low'
    };

    // State
    this.state = {
      mouseX: 0,
      mouseY: 0,
      scrollY: 0,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      sigilPulsePhase: 0,
      performanceLevel: 0, // 0-1 value set based on device capabilities
      isReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      intersectionObserver: null,
      rafId: null,
      elements: {
        reactiveTexts: [],
        sigils: [],
        depthLayers: []
      }
    };

    // Initialize
    this._detectPerformance();
    this._setupEventListeners();
    this._initializeElements();
    this._startAnimationLoop();
  }

  /**
   * Initializes all reactive elements
   */
  _initializeElements() {
    // Find all reactive text elements
    this.state.elements.reactiveTexts = Array.from(document.querySelectorAll(`.${this.config.textClass}`));
    
    // Find all sigil elements
    this.state.elements.sigils = Array.from(document.querySelectorAll(`.${this.config.sigilClass}`));
    
    // Find all depth layer elements
    this.state.elements.depthLayers = Array.from(document.querySelectorAll(`.${this.config.depthLayerClass}`));
    
    // Set up intersection observer for scroll animations
    this._setupIntersectionObserver();
    
    console.log(`Reactive Animations: Initialized with ${this.state.elements.reactiveTexts.length} reactive text elements, ${this.state.elements.sigils.length} sigils, and ${this.state.elements.depthLayers.length} depth layers`);
  }

  /**
   * Sets up intersection observer for scroll-based animations
   */
  _setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('Reactive Animations: IntersectionObserver not supported');
      return;
    }

    this.state.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          
          // Apply randomized entry animations based on element type
          if (entry.target.classList.contains(this.config.textClass)) {
            this._applyTextEntryAnimation(entry.target);
          } else if (entry.target.classList.contains(this.config.sigilClass)) {
            this._applySigilEntryAnimation(entry.target);
          }
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    // Observe all reactive elements
    [...this.state.elements.reactiveTexts, ...this.state.elements.sigils].forEach(el => {
      this.state.intersectionObserver.observe(el);
    });
  }

  /**
   * Apply randomized entry animation to text
   */
  _applyTextEntryAnimation(element) {
    const animations = [
      'fade-in-scramble',
      'slide-in-glitch',
      'assemble-in',
      'phase-in'
    ];
    
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    element.dataset.entryAnimation = randomAnimation;
  }

  /**
   * Apply entry animation to sigil
   */
  _applySigilEntryAnimation(element) {
    element.dataset.entryAnimation = 'pulse-in';
    
    // Add to synchronized pulse system
    if (this.config.sigilSyncEnabled) {
      // Set a random initial phase offset
      element.dataset.pulseOffset = Math.random() * Math.PI * 2;
    }
  }

  /**
   * Setup event listeners for mouse movement, scroll, etc.
   */
  _setupEventListeners() {
    // Mouse movement for reactive animations
    document.addEventListener('mousemove', this._handleMouseMove.bind(this), { passive: true });
    
    // Scroll for parallax and reveal effects
    window.addEventListener('scroll', this._handleScroll.bind(this), { passive: true });
    
    // Resize for viewport updates
    window.addEventListener('resize', this._handleResize.bind(this), { passive: true });
    
    // Reduced motion preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.state.isReducedMotion = e.matches;
    });
  }

  /**
   * Handle mouse movement
   */
  _handleMouseMove(e) {
    this.state.mouseX = e.clientX;
    this.state.mouseY = e.clientY;
    
    // Only apply immediate effects if performance allows
    if (this.state.performanceLevel > 0.6) {
      this._applyMouseEffects();
    }
  }

  /**
   * Apply mouse-based effects to elements
   */
  _applyMouseEffects() {
    if (this.state.isReducedMotion) return;
    
    const { mouseX, mouseY, viewport } = this.state;
    const mouseXRatio = mouseX / viewport.width;
    const mouseYRatio = mouseY / viewport.height;
    
    // Apply to each reactive text element within a reasonable distance
    this.state.elements.reactiveTexts.forEach(el => {
      const rect = el.getBoundingClientRect();
      
      // Skip if element is not visible in viewport
      if (rect.bottom < 0 || rect.top > viewport.height) return;
      
      // Calculate distance from mouse to element center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distX = (mouseX - centerX) / viewport.width;
      const distY = (mouseY - centerY) / viewport.height;
      const dist = Math.sqrt(distX * distX + distY * distY);
      
      // Only apply effect if mouse is relatively close
      if (dist < 0.3) {
        const intensity = (1 - dist / 0.3) * this.config.mouseReactivity;
        el.style.transform = `skew(${distX * 3 * intensity}deg, ${distY * 2 * intensity}deg)`;
        el.style.textShadow = `${distX * 5 * intensity}px ${distY * 5 * intensity}px 3px rgba(var(--glow-color-rgb), 0.3)`;
      } else {
        el.style.transform = '';
        el.style.textShadow = '';
      }
    });
    
    // Apply to depth layers for parallax effect
    this.state.elements.depthLayers.forEach((el, index) => {
      const layerDepth = parseInt(el.dataset.depth || index) + 1;
      const parallaxX = (0.5 - mouseXRatio) * layerDepth * 20 * this.config.mouseReactivity;
      const parallaxY = (0.5 - mouseYRatio) * layerDepth * 20 * this.config.mouseReactivity;
      
      el.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
    });
  }

  /**
   * Handle scroll events
   */
  _handleScroll() {
    this.state.scrollY = window.scrollY;
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    this.state.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }

  /**
   * Detect device performance capabilities
   */
  _detectPerformance() {
    if (this.config.performanceMode !== 'auto') {
      // Manual performance setting
      switch (this.config.performanceMode) {
        case 'high': this.state.performanceLevel = 1; break;
        case 'medium': this.state.performanceLevel = 0.6; break;
        case 'low': this.state.performanceLevel = 0.3; break;
        default: this.state.performanceLevel = 0.6;
      }
      return;
    }
    
    // Auto-detect based on device capabilities
    const browserInfo = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(browserInfo);
    const isOldBrowser = /MSIE|Trident|Edge\/1[0-5]/i.test(browserInfo);
    
    if (isOldBrowser) {
      this.state.performanceLevel = 0.2; // Minimal effects
    } else if (isMobile) {
      this.state.performanceLevel = 0.4; // Reduced effects
    } else {
      // Full effects for modern desktop browsers
      this.state.performanceLevel = 0.9;
    }
    
    console.log(`Reactive Animations: Performance level set to ${this.state.performanceLevel.toFixed(2)}`);
  }

  /**
   * Start the animation loop for continuous effects
   */
  _startAnimationLoop() {
    if (this.state.isReducedMotion) {
      console.log('Reactive Animations: Reduced motion preference detected, limiting animations');
      return;
    }
    
    const animate = () => {
      // Update sigil pulse phase
      if (this.config.sigilSyncEnabled) {
        this.state.sigilPulsePhase += 0.05;
        this._updateSigilPulses();
      }
      
      // Apply ambient motion if enabled
      if (this.config.ambientMotionEnabled) {
        this._applyAmbientMotion();
      }
      
      // Mouse effects are applied directly on mousemove for better responsiveness
      // but we still apply them here for touch devices or reduced frequency
      if (this.state.performanceLevel < 0.6) {
        this._applyMouseEffects();
      }
      
      // Request next frame
      this.state.rafId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    this.state.rafId = requestAnimationFrame(animate);
  }

  /**
   * Updates sigil pulse animations to create harmonic patterns
   */
  _updateSigilPulses() {
    if (!this.config.sigilSyncEnabled) return;
    
    const base = this.state.sigilPulsePhase;
    
    this.state.elements.sigils.forEach(sigil => {
      const offset = parseFloat(sigil.dataset.pulseOffset || 0);
      const phase = base + offset;
      const scale = 1 + Math.sin(phase) * 0.1 * this.config.glitchIntensity;
      const opacity = 0.7 + Math.sin(phase * 1.3) * 0.3 * this.config.glitchIntensity;
      
      sigil.style.transform = `scale(${scale})`;
      sigil.style.opacity = opacity;
    });
  }

  /**
   * Applies subtle ambient motion to elements
   */
  _applyAmbientMotion() {
    const time = performance.now() * 0.001;
    
    // Apply subtle floating effect to various elements
    document.querySelectorAll('.floating-element').forEach((el, i) => {
      const seed = i * 10.731;
      const floatX = Math.sin(time * 0.5 + seed) * 5 * this.config.glitchIntensity;
      const floatY = Math.cos(time * 0.4 + seed) * 7 * this.config.glitchIntensity;
      const rotate = Math.sin(time * 0.3 + seed) * 1 * this.config.glitchIntensity;
      
      el.style.transform = `translate(${floatX}px, ${floatY}px) rotate(${rotate}deg)`;
    });
    
    // Apply subtle wave effect to section backgrounds
    document.querySelectorAll('.section').forEach((el, i) => {
      const seed = i * 3.14159;
      const bgPos = Math.sin(time * 0.2 + seed) * 2 * this.config.glitchIntensity;
      
      el.style.backgroundPositionX = `calc(50% + ${bgPos}px)`;
    });
  }

  /**
   * Creates a text scramble effect on a specified element
   */
  createTextScrambleEffect(element, text, duration = 2000) {
    const chars = '!<>-_\\/[]{}—=+*^?#________';
    const originalText = text || element.textContent;
    let frame = 0;
    const frames = 20;
    let resolve;
    
    // Return a promise that resolves when the animation is complete
    const promise = new Promise(r => resolve = r);
    
    const update = () => {
      let output = '';
      const progress = frame / frames;
      
      for (let i = 0; i < originalText.length; i++) {
        if (originalText[i] === ' ') {
          output += ' ';
          continue;
        }
        
        // If character should be revealed
        if (progress >= i / originalText.length) {
          output += originalText[i];
        } else {
          output += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      
      element.textContent = output;
      
      if (frame < frames) {
        frame++;
        setTimeout(update, duration / frames);
      } else {
        resolve();
      }
    };
    
    update();
    return promise;
  }

  /**
   * Creates a reality tear effect at specified coordinates
   */
  createRealityTearEffect(x, y, size = 100, duration = 1000) {
    const tear = document.createElement('div');
    tear.className = 'reality-tear';
    tear.style.left = `${x - size/2}px`;
    tear.style.top = `${y - size/2}px`;
    tear.style.width = `${size}px`;
    tear.style.height = `${size}px`;
    
    document.body.appendChild(tear);
    
    // Animate tear opening
    setTimeout(() => {
      tear.classList.add('active');
      
      // Animate tear closing and remove
      setTimeout(() => {
        tear.classList.remove('active');
        setTimeout(() => tear.remove(), 500);
      }, duration);
    }, 10);
  }

  /**
   * Stops all animations and cleans up resources
   */
  destroy() {
    // Cancel animation frame
    if (this.state.rafId) {
      cancelAnimationFrame(this.state.rafId);
    }
    
    // Disconnect intersection observer
    if (this.state.intersectionObserver) {
      this.state.intersectionObserver.disconnect();
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this._handleMouseMove);
    window.removeEventListener('scroll', this._handleScroll);
    window.removeEventListener('resize', this._handleResize);
    
    // Reset styles
    this.state.elements.reactiveTexts.forEach(el => {
      el.style.transform = '';
      el.style.textShadow = '';
    });
    
    this.state.elements.sigils.forEach(el => {
      el.style.transform = '';
      el.style.opacity = '';
    });
    
    this.state.elements.depthLayers.forEach(el => {
      el.style.transform = '';
    });
    
    console.log('Reactive Animations: Destroyed');
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.reactiveAnimations = new ReactiveAnimations({
    glitchIntensity: 0.7,
    mouseReactivity: 0.8,
    scrollReactivity: 0.6
  });
  
  console.log('Reactive Animations: Module loaded');
});

// Expose class for modular usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactiveAnimations;
}