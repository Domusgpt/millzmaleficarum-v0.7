/**
 * reality-distortion-enhanced.js - v0.7
 * Enhanced reality distortion effects specifically for new dimensional worlds
 */

// Only create the class if it doesn't already exist
if (!window.RealityDistortionEnhanced) {
class RealityDistortionEnhanced {
  constructor() {
    this.config = {
      worldEffects: {
        chronosynth: {
          effectProbability: 0.3,
          effectIntensity: 1.2,
          specialEffects: ['temporal-glitch', 'echo-cascade', 'timeline-fracture']
        },
        neuromantic: {
          effectProbability: 0.25,
          effectIntensity: 1.1,
          specialEffects: ['synaptic-flare', 'consciousness-ripple', 'affective-burst']
        }
      },
      activeEffects: new Map(),
      initialized: false
    };
    
    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }

  /**
   * Initialize enhanced reality distortion features
   */
  initialize() {
    // Connect to existing reality distortion system if available
    if (window.realityDistortionText) {
      this.realityDistortionText = window.realityDistortionText;
      console.log('Enhanced Reality Distortion: Connected to base system');
    } else {
      // Set up connection to be established later
      document.addEventListener('realityDistortionReady', () => {
        this.realityDistortionText = window.realityDistortionText;
        console.log('Enhanced Reality Distortion: Connected to base system (deferred)');
      });
    }

    // Set up observers for dimensional transitions
    this.setupTransitionObservers();
    
    // Create dimension-specific effects
    this.createEnhancedEffects();
    
    // Set up interaction handlers
    this.setupInteractionHandlers();
    
    this.config.initialized = true;
    console.log('Enhanced Reality Distortion: Initialized');
    
    // Dispatch initialization event
    document.dispatchEvent(new CustomEvent('enhancedDistortionReady'));
  }

  /**
   * Set up observers to detect dimensional transitions
   */
  setupTransitionObservers() {
    // Monitor for dimension changes
    document.addEventListener('dimensionalTransitionStart', (event) => {
      const targetWorld = event.detail?.targetWorld;
      if (targetWorld && this.config.worldEffects[targetWorld.type]) {
        this.activateWorldEffects(targetWorld.type);
      }
    });
    
    // Monitor for dimension arrival
    document.addEventListener('dimensionalTransitionComplete', (event) => {
      const currentWorld = event.detail?.currentWorld;
      if (currentWorld && this.config.worldEffects[currentWorld.type]) {
        this.intensifyWorldEffects(currentWorld.type);
      }
    });
    
    // Check for world-specific element observation
    this.setupElementObservers();
  }

  /**
   * Set up intersection observers for special elements
   */
  setupElementObservers() {
    // Create observer for elements that should trigger effects when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const effectType = element.dataset.distortionEffect;
          if (effectType) {
            this.triggerElementEffect(element, effectType);
          }
        }
      });
    }, { threshold: 0.3 });
    
    // Observe chronosynth elements
    document.querySelectorAll('.temporal-echo, .chronosynth-display').forEach(element => {
      element.dataset.distortionEffect = 'temporal-glitch';
      observer.observe(element);
    });
    
    // Observe neuromantic elements
    document.querySelectorAll('.thought-bubble, .synaptic-pulse').forEach(element => {
      element.dataset.distortionEffect = 'consciousness-ripple';
      observer.observe(element);
    });
  }

  /**
   * Create enhanced effects for new dimensions
   */
  createEnhancedEffects() {
    // Check if we can extend the base system
    if (this.realityDistortionText) {
      this.extendBaseEffectSystem();
    } else {
      // Wait for the base system to be ready
      document.addEventListener('realityDistortionReady', () => {
        this.extendBaseEffectSystem();
      });
    }
    
    // Create custom CSS for enhanced effects
    this.createEnhancedStyles();
  }

  /**
   * Extend the base effect system with new effects
   */
  extendBaseEffectSystem() {
    if (!this.realityDistortionText) return;
    
    // Add new effect types to the base system
    const baseEffects = this.realityDistortionText.config.effectTypes;
    
    // Only add new effects if they don't already exist
    if (!baseEffects.includes('temporal-glitch')) {
      baseEffects.push('temporal-glitch', 'echo-cascade', 'timeline-fracture', 
                       'synaptic-flare', 'consciousness-ripple', 'affective-burst');
                       
      console.log('Enhanced Reality Distortion: Added new effect types');
    }
    
    // Add enhanced effect probabilities
    const baseProbs = this.realityDistortionText.config.effectProbabilities;
    baseProbs['temporal-glitch'] = 0.3;
    baseProbs['echo-cascade'] = 0.35;
    baseProbs['timeline-fracture'] = 0.25;
    baseProbs['synaptic-flare'] = 0.3;
    baseProbs['consciousness-ripple'] = 0.35;
    baseProbs['affective-burst'] = 0.25;
    
    // Refresh the system
    this.realityDistortionText.refresh();
  }

  /**
   * Create enhanced CSS styles for new effects
   */
  createEnhancedStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Chronosynth Effects */
      .temporal-glitch-text {
        position: relative;
        overflow: visible;
      }
      
      .temporal-glitch-text.active::before,
      .temporal-glitch-text.active::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
        animation: temporal-shift 0.5s cubic-bezier(0.15, 0.84, 0.35, 1) infinite alternate;
      }
      
      .temporal-glitch-text.active::before {
        left: -2px;
        color: #bf00ff;
        opacity: 0.8;
      }
      
      .temporal-glitch-text.active::after {
        left: 2px;
        top: 2px;
        color: #00eeff;
        opacity: 0.8;
        clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
        animation-delay: -0.25s;
      }
      
      @keyframes temporal-shift {
        0% { transform: translateX(-2px) skewX(0deg); }
        25% { transform: translateX(0px) skewX(1deg); }
        75% { transform: translateX(2px) skewX(-1deg); }
        100% { transform: translateX(-1px) skewX(0deg); }
      }
      
      .echo-cascade-text {
        position: relative;
      }
      
      .echo-cascade-text .char-wrapper {
        transition: text-shadow 0.3s ease, transform 0.3s ease;
      }
      
      .echo-cascade-text.active .char-wrapper {
        text-shadow: 
          0 0 5px rgba(191, 0, 255, 0.8),
          0 0 15px rgba(191, 0, 255, 0.5),
          4px 4px 0 rgba(0, 238, 255, 0.3),
          -4px -4px 0 rgba(255, 0, 255, 0.3);
        animation: echo-pulse 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
      }
      
      @keyframes echo-pulse {
        0% { transform: scale(1); filter: blur(0px); }
        25% { transform: scale(1.05); filter: blur(0.5px); }
        50% { transform: scale(0.98); filter: blur(0px); }
        75% { transform: scale(1.02); filter: blur(0.5px); }
        100% { transform: scale(1); filter: blur(0px); }
      }
      
      .timeline-fracture-text {
        position: relative;
      }
      
      .timeline-fracture-text::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          -45deg,
          rgba(191, 0, 255, 0),
          rgba(191, 0, 255, 0) 10px,
          rgba(191, 0, 255, 0.1) 10px,
          rgba(191, 0, 255, 0.1) 20px
        );
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: -1;
      }
      
      .timeline-fracture-text.active::before {
        opacity: 1;
        animation: timeline-scan 3s linear infinite;
      }
      
      @keyframes timeline-scan {
        0% { background-position: 0 0; }
        100% { background-position: 100px 100px; }
      }
      
      /* Neuromantic Effects */
      .synaptic-flare-text {
        position: relative;
      }
      
      .synaptic-flare-text .char {
        transition: color 0.3s ease, text-shadow 0.3s ease;
      }
      
      .synaptic-flare-text.active .char {
        color: #ff0066;
        text-shadow: 0 0 8px #ff0066, 0 0 12px #ff0066;
        animation: synaptic-flicker 2s ease infinite;
      }
      
      @keyframes synaptic-flicker {
        0% { color: #ff0066; text-shadow: 0 0 8px #ff0066, 0 0 12px #ff0066; }
        50% { color: #00eeff; text-shadow: 0 0 8px #00eeff, 0 0 12px #00eeff; }
        100% { color: #ff0066; text-shadow: 0 0 8px #ff0066, 0 0 12px #ff0066; }
      }
      
      .consciousness-ripple-text {
        position: relative;
      }
      
      .consciousness-ripple-text::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        background: radial-gradient(circle, 
          rgba(255, 0, 100, 0.8) 0%, 
          rgba(255, 0, 100, 0.3) 30%, 
          rgba(0, 255, 255, 0.3) 70%, 
          rgba(0, 255, 255, 0) 100%
        );
        border-radius: 50%;
        transform: translate(-50%, -50%);
        opacity: 0;
        z-index: -1;
        transition: all 0.5s ease;
      }
      
      .consciousness-ripple-text.active::before {
        width: 200%;
        height: 200%;
        opacity: 0.5;
        animation: ripple-fade 1.5s ease-out forwards;
      }
      
      @keyframes ripple-fade {
        0% { width: 0; height: 0; opacity: 0; }
        50% { opacity: 0.5; }
        100% { width: 200%; height: 200%; opacity: 0; }
      }
      
      .affective-burst-text {
        position: relative;
      }
      
      .affective-burst-text .char-wrapper {
        transition: transform 0.3s ease, filter 0.3s ease;
      }
      
      .affective-burst-text.active .char-wrapper {
        animation: affect-burst 0.5s cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
      }
      
      @keyframes affect-burst {
        0% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.2); filter: brightness(1.5) hue-rotate(30deg); }
        100% { transform: scale(1); filter: brightness(1); }
      }
      
      /* Enhanced specific element effects */
      .temporal-echo {
        transition: box-shadow 0.3s ease, transform 0.3s ease;
      }
      
      .temporal-echo.effect-active {
        box-shadow: 0 0 20px rgba(191, 0, 255, 0.6);
        animation: echo-shift 4s ease infinite;
      }
      
      @keyframes echo-shift {
        0% { transform: translateX(0) skewX(0deg); }
        25% { transform: translateX(5px) skewX(-1deg); }
        75% { transform: translateX(-5px) skewX(1deg); }
        100% { transform: translateX(0) skewX(0deg); }
      }
      
      .chronosynth-display.effect-active .clock-layer {
        box-shadow: 0 0 20px rgba(191, 0, 255, 0.6);
      }
      
      .chronosynth-display.effect-active .clock-hand {
        box-shadow: 0 0 10px rgba(191, 0, 255, 1);
        animation-duration: 2s !important;
      }
      
      .thought-bubble.effect-active {
        box-shadow: 0 0 20px rgba(255, 0, 100, 0.5);
        animation: bubble-pulse 3s ease infinite alternate;
      }
      
      @keyframes bubble-pulse {
        0% { transform: translateY(0) rotate(-1deg) scale(1); }
        100% { transform: translateY(-8px) rotate(1deg) scale(1.05); }
      }
      
      .synaptic-pulse.effect-active {
        box-shadow: 0 0 60px rgba(255, 0, 100, 0.8);
      }
      
      .synaptic-pulse.effect-active::before,
      .synaptic-pulse.effect-active::after {
        animation-duration: 1.5s !important;
      }
    `;
    
    document.head.appendChild(styleElement);
  }

  /**
   * Set up interaction handlers for enhanced effects
   */
  setupInteractionHandlers() {
    // Add mouseover effects for special elements
    document.addEventListener('mouseover', event => {
      const target = event.target.closest('.temporal-echo, .chronosynth-display, .thought-bubble, .synaptic-pulse');
      if (target) {
        this.triggerElementEffect(target, target.dataset.distortionEffect || 'default');
      }
    });
    
    // Listen for scroll events to trigger dimensional-specific effects
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    // Check if we're in a special dimension
    const currentWorld = this.getCurrentDimension();
    if (currentWorld && this.config.worldEffects[currentWorld]) {
      // Random chance to trigger effects while scrolling
      if (Math.random() < 0.1) {
        const intensity = 0.6 + Math.random() * 0.4;
        this.triggerRandomEffect(currentWorld, intensity);
      }
    }
  }

  /**
   * Get the current dimensional world
   */
  getCurrentDimension() {
    // Check if the dimensional worlds system is available
    if (window.dimensionalWorlds && window.dimensionalWorlds.state.currentWorld) {
      return window.dimensionalWorlds.state.currentWorld.type;
    }
    
    // Fallback: check visible sections
    const sections = document.querySelectorAll('.dimension-world');
    for (const section of sections) {
      if (section.id && getComputedStyle(section).display !== 'none') {
        return section.dataset.worldType;
      }
    }
    
    return null;
  }

  /**
   * Activate effects for a specific world type
   */
  activateWorldEffects(worldType) {
    if (!this.config.worldEffects[worldType]) return;
    
    // Set active world effects
    this.config.activeEffects.set(worldType, {
      active: true,
      lastTriggered: performance.now(),
      intensity: 0.5
    });
    
    // Trigger initial effect
    setTimeout(() => {
      this.triggerRandomEffect(worldType, 0.7);
    }, 500);
    
    console.log(`Enhanced Reality Distortion: Activated ${worldType} effects`);
  }

  /**
   * Intensify effects for the current world
   */
  intensifyWorldEffects(worldType) {
    if (!this.config.worldEffects[worldType]) return;
    
    const state = this.config.activeEffects.get(worldType);
    if (state) {
      state.intensity = 1.0;
      state.lastTriggered = performance.now();
      
      // Trigger intensified effect
      setTimeout(() => {
        this.triggerRandomEffect(worldType, 1.0);
      }, 300);
    }
    
    // Set up recurring effects
    this.setupRecurringEffects(worldType);
  }

  /**
   * Set up recurring effects for a world
   */
  setupRecurringEffects(worldType) {
    if (!this.config.worldEffects[worldType]) return;
    
    // Clear any existing timers
    const state = this.config.activeEffects.get(worldType);
    if (state && state.timer) {
      clearInterval(state.timer);
    }
    
    // Create new timer
    const timer = setInterval(() => {
      // Only trigger if still in the same world
      if (this.getCurrentDimension() === worldType) {
        const probability = this.config.worldEffects[worldType].effectProbability;
        if (Math.random() < probability) {
          const intensity = 0.5 + Math.random() * 0.5;
          this.triggerRandomEffect(worldType, intensity);
        }
      } else {
        // Stop timer if no longer in this world
        clearInterval(timer);
        if (state) {
          state.timer = null;
        }
      }
    }, 5000 + Math.random() * 5000); // Random interval between 5-10 seconds
    
    // Store timer reference
    if (state) {
      state.timer = timer;
    }
  }

  /**
   * Trigger a random effect for a specific world
   */
  triggerRandomEffect(worldType, intensity) {
    if (!this.config.worldEffects[worldType]) return;
    
    // Get effects for this world
    const effects = this.config.worldEffects[worldType].specialEffects;
    
    // Select random effect
    const effect = effects[Math.floor(Math.random() * effects.length)];
    
    // Find suitable element for the effect
    let targetElements;
    if (worldType === 'chronosynth') {
      targetElements = document.querySelectorAll('.chronosynth-section .distort-text, .chronosynth-section h1, .chronosynth-section p');
    } else if (worldType === 'neuromantic') {
      targetElements = document.querySelectorAll('.neuromantic-section .distort-text, .neuromantic-section h1, .neuromantic-section p');
    } else {
      targetElements = document.querySelectorAll('.distort-text');
    }
    
    // Convert NodeList to Array for random selection
    const elementsArray = Array.from(targetElements);
    
    if (elementsArray.length > 0) {
      // Select random element
      const randomIndex = Math.floor(Math.random() * elementsArray.length);
      const element = elementsArray[randomIndex];
      
      // Apply effect through base system if possible
      if (this.realityDistortionText) {
        const state = this.realityDistortionText.state.elementStates.get(element);
        if (state) {
          // Temporarily change effect type
          const originalEffect = state.effect;
          state.effect = effect;
          
          // Apply effect
          this.realityDistortionText._applyEffect(element, state, intensity);
          
          // Restore original effect type after delay
          setTimeout(() => {
            state.effect = originalEffect;
          }, 1000);
          
          return;
        }
      }
      
      // Fallback: apply direct CSS effect
      this.applyDirectEffect(element, effect, intensity);
    }
  }

  /**
   * Apply a direct CSS effect when base system is unavailable
   */
  applyDirectEffect(element, effect, intensity) {
    // Add effect class
    element.classList.add(`${effect}-text`);
    element.classList.add('active');
    
    // Scale intensity (0.5 to 1.5)
    const scaleStyle = `--effect-scale: ${intensity.toFixed(2)};`;
    element.style.cssText += scaleStyle;
    
    // Remove after delay
    setTimeout(() => {
      element.classList.remove(`${effect}-text`);
      element.classList.remove('active');
      
      // Clean up inline style
      element.style.cssText = element.style.cssText.replace(scaleStyle, '');
    }, 1000 + intensity * 1000); // Duration based on intensity
  }

  /**
   * Trigger effect on a specific element
   */
  triggerElementEffect(element, effectType) {
    // Don't retrigger too frequently
    if (element.dataset.lastEffect && performance.now() - element.dataset.lastEffect < 3000) {
      return;
    }
    
    // Store last effect time
    element.dataset.lastEffect = performance.now();
    
    // Add effect class
    element.classList.add('effect-active');
    
    // Remove after delay
    setTimeout(() => {
      element.classList.remove('effect-active');
    }, 3000);
    
    // If it's a text element, apply text effect
    if (element.textContent && (element.tagName === 'P' || element.tagName === 'DIV')) {
      // Determine appropriate effect type
      let effectName;
      if (element.closest('.chronosynth-section')) {
        effectName = 'temporal-glitch';
      } else if (element.closest('.neuromantic-section')) {
        effectName = 'consciousness-ripple';
      } else {
        effectName = 'glitch';
      }
      
      // Apply through base system if possible
      if (this.realityDistortionText) {
        const state = this.realityDistortionText.state.elementStates.get(element);
        if (state) {
          const originalEffect = state.effect;
          state.effect = effectName;
          this.realityDistortionText._applyEffect(element, state, 0.8);
          
          // Restore original effect
          setTimeout(() => {
            state.effect = originalEffect;
          }, 1000);
        }
      }
    }
  }
}

// Create global instance 
document.addEventListener('DOMContentLoaded', () => {
  window.realityDistortionEnhanced = new RealityDistortionEnhanced();
  console.log('Enhanced Reality Distortion: Module loaded');
});
} // Close the if block