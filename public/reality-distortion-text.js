/**
 * reality-distortion-text.js - v0.7
 * Advanced text animations with reality distortion effects
 */

class RealityDistortionText {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      textSelector: options.textSelector || '.distort-text, h1, h2, h3, .section-title, .world-title',
      effectIntensity: options.effectIntensity || 1.0,
      mouseInteraction: options.mouseInteraction !== false,
      audioReactive: options.audioReactive !== false,
      autoStart: options.autoStart !== false,
      effectTypes: options.effectTypes || [
        'glitch', 'warp', 'reality-break', 'quantum', 'dimensional',
        'disintegration', 'neon-leak', 'void-shift' // New effects added in v0.7
      ],
      effectProbabilities: options.effectProbabilities || {
        disintegration: 0.3,  // Higher probability for new effects
        'neon-leak': 0.35,
        'void-shift': 0.3
      },
      performanceMode: options.performanceMode || 'auto', // 'high', 'medium', 'low', or 'auto'
      particleOptimization: options.particleOptimization !== false,
      maxParticlesPerEffect: options.maxParticlesPerEffect || 50,
      debugMode: options.debugMode || false
    };
    
    // Performance detection
    if (this.config.performanceMode === 'auto') {
      // Detect device capabilities
      const performanceScore = this._detectPerformance();
      
      if (performanceScore > 7) {
        this.config.performanceMode = 'high';
      } else if (performanceScore > 4) {
        this.config.performanceMode = 'medium'; 
      } else {
        this.config.performanceMode = 'low';
      }
      
      if (this.config.debugMode) {
        console.log(`RealityDistortionText: Auto-detected performance mode: ${this.config.performanceMode}`);
      }
    }

    // State
    this.state = {
      elements: [],
      elementStates: new Map(),
      audioData: {
        bass: 0,
        mid: 0,
        high: 0
      },
      mousePosition: {
        x: 0,
        y: 0
      },
      isRunning: false,
      animationFrameId: null,
      glitchTimeout: null
    };

    // Initialize
    if (this.config.autoStart) {
      this.initialize();
    }
  }

  /**
   * Initialize the text distortion system
   */
  initialize() {
    // Add styles
    this._addStyles();
    
    // Find all target elements
    this._findElements();
    
    // Initialize event listeners
    this._initEventListeners();
    
    // Start animation loop
    this.start();
    
    console.log('RealityDistortionText: Initialized');
  }

  /**
   * Add CSS styles for effects
   */
  _addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      /* Base styles for distortion effects */
      .distortion-container {
        position: relative;
        display: inline-block;
      }
      
      .distortion-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      
      .char-wrapper {
        display: inline-block;
        position: relative;
        transition: transform 0.05s ease;
      }
      
      /* Glitch Effect */
      .glitch-text {
        position: relative;
        animation-duration: 0.01s;
        animation-iteration-count: 1;
        animation-timing-function: linear;
      }
      
      .glitch-text::before,
      .glitch-text::after {
        content: attr(data-text);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.8;
      }
      
      .glitch-text.active::before {
        color: #00ffff;
        z-index: -1;
        animation: glitch-before 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      
      .glitch-text.active::after {
        color: #ff00ff;
        z-index: -2;
        animation: glitch-after 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
      }
      
      @keyframes glitch-before {
        0% { transform: translate(0); }
        20% { transform: translate(-5px, 5px); }
        40% { transform: translate(-5px, -5px); }
        60% { transform: translate(5px, 5px); }
        80% { transform: translate(5px, -5px); }
        100% { transform: translate(0); }
      }
      
      @keyframes glitch-after {
        0% { transform: translate(0); }
        20% { transform: translate(5px, 5px); }
        40% { transform: translate(5px, -5px); }
        60% { transform: translate(-5px, 5px); }
        80% { transform: translate(-5px, -5px); }
        100% { transform: translate(0); }
      }
      
      /* Warp Effect */
      .warp-text {
        display: inline-block;
        transform-origin: center;
        transition: transform 0.3s ease;
      }
      
      /* Reality Break Effect */
      .reality-break-text {
        position: relative;
        overflow: hidden;
      }
      
      .reality-break-text::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 2px;
        background: linear-gradient(to right, transparent, #00ffff, transparent);
        opacity: 0;
        transform: scaleX(0);
        transform-origin: center;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      
      .reality-break-text.active::before {
        opacity: 1;
        transform: scaleX(1);
      }
      
      /* Quantum Effect */
      .quantum-text {
        position: relative;
      }
      
      .quantum-particle {
        position: absolute;
        width: 2px;
        height: 2px;
        background-color: #00ffff;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
      }
      
      /* Dimensional Effect */
      .dimensional-text {
        transform-style: preserve-3d;
        transition: transform 0.3s ease;
      }
      
      .dimensional-text .char {
        display: inline-block;
        transition: transform 0.3s ease;
        transform-style: preserve-3d;
      }
      
      /* Disintegration Effect - NEW in v0.7 */
      .disintegration-text {
        position: relative;
        overflow: visible;
      }
      
      .disintegration-text .char-wrapper {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      
      .disintegration-text.active .char-wrapper {
        animation: disintegration-pulse 0.5s ease forwards;
      }
      
      .disintegration-particle {
        position: absolute;
        width: 1px;
        height: 1px;
        background-color: #ff00ff;
        border-radius: 50%;
        opacity: 0;
        pointer-events: none;
        box-shadow: 0 0 4px 2px rgba(255, 0, 255, 0.7);
      }
      
      @keyframes disintegration-pulse {
        0% { transform: scale(1); filter: blur(0); }
        50% { transform: scale(1.1); filter: blur(1px); }
        100% { transform: scale(1); filter: blur(0); }
      }
      
      /* Neon Leak Effect - NEW in v0.7 */
      .neon-leak-text {
        position: relative;
      }
      
      .neon-leak-text .char {
        text-shadow: 0 0 0 transparent;
        transition: text-shadow 0.2s ease, color 0.2s ease;
      }
      
      .neon-leak-text.active .char {
        animation: neon-pulse 1.5s ease infinite alternate;
      }
      
      .neon-stream {
        position: absolute;
        background: linear-gradient(90deg, #ff00aa, #00eeff);
        height: 1px;
        opacity: 0;
        pointer-events: none;
        border-radius: 1px;
        filter: blur(1px);
        box-shadow: 0 0 5px 1px rgba(0, 238, 255, 0.7);
      }
      
      @keyframes neon-pulse {
        0% { text-shadow: 0 0 5px rgba(255, 0, 170, 0.8), 0 0 10px rgba(255, 0, 170, 0.5); }
        50% { text-shadow: 0 0 10px rgba(0, 238, 255, 0.8), 0 0 20px rgba(0, 238, 255, 0.5); }
        100% { text-shadow: 0 0 5px rgba(255, 0, 170, 0.8), 0 0 10px rgba(255, 0, 170, 0.5); }
      }
      
      /* Void Shift Effect - NEW in v0.7 */
      .void-shift-text {
        position: relative;
      }
      
      .void-shift-text .char-wrapper {
        filter: none;
        transform: translateZ(0);
      }
      
      .void-shift-text.active .char-wrapper {
        animation: void-pulse 0.5s ease;
      }
      
      .void-portal {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle at center, #000000 0%, rgba(0,0,0,0.8) 50%, transparent 100%);
        opacity: 0;
        transform: scale(0);
        pointer-events: none;
        box-shadow: 0 0 15px 5px rgba(138, 43, 226, 0.6);
      }
      
      @keyframes void-pulse {
        0% { filter: brightness(1) contrast(1); transform: translateZ(0) scale(1); }
        50% { filter: brightness(0.7) contrast(1.5); transform: translateZ(-10px) scale(0.95); }
        100% { filter: brightness(1) contrast(1); transform: translateZ(0) scale(1); }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Find all elements that should receive effects
   */
  _findElements() {
    // Find elements matching the selector
    const elements = Array.from(document.querySelectorAll(this.config.textSelector));
    
    elements.forEach(element => {
      // Skip if already processed
      if (element.dataset.distortionInitialized === 'true') return;
      
      // Prepare element for effects
      this._prepareElement(element);
      
      // Add to tracked elements
      this.state.elements.push(element);
      
      // Mark as initialized
      element.dataset.distortionInitialized = 'true';
    });
    
    if (this.config.debugMode) {
      console.log(`RealityDistortionText: Found ${this.state.elements.length} elements`);
    }
  }

  /**
   * Prepare an element for distortion effects
   */
  _prepareElement(element) {
    // Store original text
    const originalText = element.innerText;
    
    // Create container for effects
    const container = document.createElement('span');
    container.className = 'distortion-container';
    container.dataset.text = originalText;
    
    // Wrap each character in span for individual manipulation
    const chars = originalText.split('');
    
    // Clear original content
    element.innerHTML = '';
    
    // Add wrapped characters
    chars.forEach((char, index) => {
      const charWrapper = document.createElement('span');
      charWrapper.className = 'char-wrapper';
      charWrapper.dataset.charIndex = index;
      
      const charSpan = document.createElement('span');
      charSpan.className = 'char';
      charSpan.textContent = char === ' ' ? '\u00A0' : char;
      
      charWrapper.appendChild(charSpan);
      container.appendChild(charWrapper);
    });
    
    // Add container to element
    element.appendChild(container);
    
    // Determine which effects to apply
    const availableEffects = [...this.config.effectTypes];
    const selectedEffect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
    
    // Add effect class
    element.classList.add(`${selectedEffect}-text`);
    
    // Store element state
    this.state.elementStates.set(element, {
      originalText: originalText,
      effect: selectedEffect,
      state: 'idle',
      lastGlitchTime: 0,
      glitchProbability: 0.005,
      distortionFactor: 0,
      hovering: false,
      charVelocities: chars.map(() => ({
        x: Math.random() * 0.4 - 0.2,
        y: Math.random() * 0.4 - 0.2,
        rot: Math.random() * 0.05 - 0.025
      }))
    });
  }

  /**
   * Initialize event listeners
   */
  _initEventListeners() {
    // Track mouse position for interactive effects
    if (this.config.mouseInteraction) {
      document.addEventListener('mousemove', (event) => {
        this.state.mousePosition = {
          x: event.clientX,
          y: event.clientY
        };
      });
    }
    
    // Listen for element hover
    this.state.elements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        const state = this.state.elementStates.get(element);
        if (state) {
          state.hovering = true;
          state.glitchProbability = 0.05;
          
          // Trigger immediate effect
          this._applyEffect(element, state, 1.0);
        }
      });
      
      element.addEventListener('mouseleave', () => {
        const state = this.state.elementStates.get(element);
        if (state) {
          state.hovering = false;
          state.glitchProbability = 0.005;
        }
      });
    });
    
    // Listen for scroll to update visible elements
    window.addEventListener('scroll', () => {
      this._checkVisibleElements();
    });
    
    // Listen for audio context
    window.addEventListener('click', () => {
      // Initialize audio reactive features on user interaction
      if (this.config.audioReactive && !this.state.audioContext) {
        this._initializeAudio();
      }
    });
    
    // Check for new elements periodically
    setInterval(() => {
      this._findElements();
    }, 2000);
  }

  /**
   * Initialize audio analysis for reactive effects
   */
  _initializeAudio() {
    try {
      // Check if we can access audio from UniversalHyperAV
      if (window.universalHyperAV && window.universalHyperAV.state.audioLevels) {
        this.state.audioSource = 'hyperav';
        return;
      }
      
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.state.audioContext = new AudioContext();
      
      // Create analyzer
      this.state.audioAnalyzer = this.state.audioContext.createAnalyser();
      this.state.audioAnalyzer.fftSize = 32;
      
      // Connect to destination to avoid warning, but with volume 0
      const gain = this.state.audioContext.createGain();
      gain.gain.value = 0;
      
      // Create oscillator for ambient background
      const oscillator = this.state.audioContext.createOscillator();
      oscillator.type = 'triangle';
      oscillator.frequency.value = 110;
      
      // Connect audio graph
      oscillator.connect(this.state.audioAnalyzer);
      this.state.audioAnalyzer.connect(gain);
      gain.connect(this.state.audioContext.destination);
      
      // Start oscillator
      oscillator.start();
      
      // Create buffer for analysis
      this.state.audioData.dataArray = new Uint8Array(this.state.audioAnalyzer.frequencyBinCount);
      
      if (this.config.debugMode) {
        console.log('RealityDistortionText: Audio initialized');
      }
    } catch (error) {
      console.error('RealityDistortionText: Audio initialization failed', error);
    }
  }

  /**
   * Update audio levels for reactive effects
   */
  _updateAudioLevels() {
    // If using HyperAV audio
    if (this.state.audioSource === 'hyperav' && window.universalHyperAV) {
      this.state.audioData.bass = window.universalHyperAV.state.audioLevels.bass || 0;
      this.state.audioData.mid = window.universalHyperAV.state.audioLevels.mid || 0;
      this.state.audioData.high = window.universalHyperAV.state.audioLevels.high || 0;
      return;
    }
    
    // If using our own audio analyzer
    if (this.state.audioAnalyzer && this.state.audioData.dataArray) {
      this.state.audioAnalyzer.getByteFrequencyData(this.state.audioData.dataArray);
      
      const binSize = Math.floor(this.state.audioData.dataArray.length / 3);
      
      // Calculate average levels for low, mid, high frequencies
      let bassSum = 0, midSum = 0, highSum = 0;
      
      for (let i = 0; i < binSize; i++) {
        bassSum += this.state.audioData.dataArray[i];
      }
      
      for (let i = binSize; i < binSize * 2; i++) {
        midSum += this.state.audioData.dataArray[i];
      }
      
      for (let i = binSize * 2; i < this.state.audioData.dataArray.length; i++) {
        highSum += this.state.audioData.dataArray[i];
      }
      
      // Normalize to 0-1
      this.state.audioData.bass = bassSum / (binSize * 255);
      this.state.audioData.mid = midSum / (binSize * 255);
      this.state.audioData.high = highSum / (binSize * 255);
    }
    
    // If no audio data, create some fake activity
    if (!this.state.audioAnalyzer && !this.state.audioSource) {
      this.state.audioData.bass = 0.1 + Math.random() * 0.1;
      this.state.audioData.mid = 0.05 + Math.random() * 0.05;
      this.state.audioData.high = 0.02 + Math.random() * 0.03;
    }
  }

  /**
   * Check which elements are visible in viewport
   */
  _checkVisibleElements() {
    this.state.elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const state = this.state.elementStates.get(element);
      
      if (!state) return;
      
      // Check if element is in viewport
      const isVisible = (
        rect.top >= -rect.height &&
        rect.left >= -rect.width &&
        rect.bottom <= window.innerHeight + rect.height &&
        rect.right <= window.innerWidth + rect.width
      );
      
      state.isVisible = isVisible;
      
      // Increase glitch probability for visible elements
      if (isVisible && state.glitchProbability < 0.01) {
        state.glitchProbability = 0.01;
      } else if (!isVisible && !state.hovering && state.glitchProbability > 0.001) {
        state.glitchProbability = 0.001;
      }
    });
  }

  /**
   * Main animation loop
   */
  _animationLoop() {
    // Stop if not running
    if (!this.state.isRunning) return;
    
    // Update audio levels
    this._updateAudioLevels();
    
    // Random glitch probability based on audio levels
    const globalGlitchProbability = 0.001 + this.state.audioData.bass * 0.05;
    
    // Process all elements
    this.state.elements.forEach(element => {
      const state = this.state.elementStates.get(element);
      
      if (!state || !state.isVisible) return;
      
      // Calculate element-specific glitch probability
      const effectiveGlitchProb = state.glitchProbability + globalGlitchProbability;
      
      // Check for random glitch
      if (Math.random() < effectiveGlitchProb) {
        // Apply effect with random intensity based on audio levels
        const intensity = 0.3 + (this.state.audioData.bass + this.state.audioData.mid) * 0.7;
        this._applyEffect(element, state, intensity * this.config.effectIntensity);
      }
      
      // Apply continuous effects
      this._applyContinuousEffects(element, state);
    });
    
    // Continue animation loop
    this.state.animationFrameId = requestAnimationFrame(this._animationLoop.bind(this));
  }

  /**
   * Apply a distortion effect to an element
   */
  _applyEffect(element, state, intensity) {
    // Skip if glitch already active and too soon for another
    const now = performance.now();
    if (state.state === 'active' && now - state.lastGlitchTime < 500) return;
    
    // Update state
    state.state = 'active';
    state.lastGlitchTime = now;
    state.distortionFactor = intensity;
    
    // Apply effect based on type
    switch (state.effect) {
      case 'glitch':
        this._applyGlitchEffect(element, state, intensity);
        break;
      case 'warp':
        this._applyWarpEffect(element, state, intensity);
        break;
      case 'reality-break':
        this._applyRealityBreakEffect(element, state, intensity);
        break;
      case 'quantum':
        this._applyQuantumEffect(element, state, intensity);
        break;
      case 'dimensional':
        this._applyDimensionalEffect(element, state, intensity);
        break;
      // New effect cases for v0.7
      case 'disintegration':
        this._applyDisintegrationEffect(element, state, intensity);
        break;
      case 'neon-leak':
        this._applyNeonLeakEffect(element, state, intensity);
        break;
      case 'void-shift':
        this._applyVoidShiftEffect(element, state, intensity);
        break;
      default:
        this._applyGlitchEffect(element, state, intensity);
        break;
    }
    
    // Schedule end of effect
    if (this.state.glitchTimeout) {
      clearTimeout(this.state.glitchTimeout);
    }
    
    // Adjust effect duration based on performance mode
    const durationMultiplier = this.config.performanceMode === 'high' ? 1.2 :
                             this.config.performanceMode === 'medium' ? 1.0 : 0.7;
    
    const effectDuration = (300 + intensity * 500) * durationMultiplier;
    
    this.state.glitchTimeout = setTimeout(() => {
      element.classList.remove('active');
      state.state = 'idle';
      state.distortionFactor = 0;
      
      // Clean up any remaining particles/elements
      this._cleanupEffectElements(element, state.effect);
    }, effectDuration);
  }

  /**
   * Apply glitch effect
   */
  _applyGlitchEffect(element, state, intensity) {
    // Add active class to trigger CSS animations
    element.classList.add('active');
    
    // Get character elements
    const charWrappers = element.querySelectorAll('.char-wrapper');
    
    // Randomly offset some characters
    charWrappers.forEach(wrapper => {
      if (Math.random() < intensity * 0.3) {
        const xOffset = (Math.random() - 0.5) * 10 * intensity;
        const yOffset = (Math.random() - 0.5) * 10 * intensity;
        
        wrapper.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        
        // Random character replacement
        if (Math.random() < intensity * 0.2) {
          const charElement = wrapper.querySelector('.char');
          if (charElement && charElement.textContent !== '\u00A0') {
            const glitchChars = '!@#$%^&*()_+-=[]{}|;:,./<>?';
            charElement.dataset.originalChar = charElement.textContent;
            charElement.textContent = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            
            // Restore after a short delay
            setTimeout(() => {
              if (charElement.dataset.originalChar) {
                charElement.textContent = charElement.dataset.originalChar;
                delete charElement.dataset.originalChar;
              }
            }, 150);
          }
        }
        
        // Reset after a short delay
        setTimeout(() => {
          wrapper.style.transform = '';
        }, 50 + Math.random() * 200);
      }
    });
  }

  /**
   * Apply warp effect
   */
  _applyWarpEffect(element, state, intensity) {
    // Add active class
    element.classList.add('active');
    
    // Apply overall warp
    const container = element.querySelector('.distortion-container');
    if (container) {
      const skewX = (Math.random() - 0.5) * 20 * intensity;
      const skewY = (Math.random() - 0.5) * 10 * intensity;
      const rotate = (Math.random() - 0.5) * 5 * intensity;
      const scaleX = 1 + (Math.random() - 0.5) * 0.2 * intensity;
      const scaleY = 1 + (Math.random() - 0.5) * 0.2 * intensity;
      
      container.style.transform = `skew(${skewX}deg, ${skewY}deg) rotate(${rotate}deg) scale(${scaleX}, ${scaleY})`;
      
      // Reset after delay
      setTimeout(() => {
        container.style.transform = '';
      }, 300);
    }
    
    // Add wave effect to characters
    const charWrappers = element.querySelectorAll('.char-wrapper');
    charWrappers.forEach((wrapper, index) => {
      const charElement = wrapper.querySelector('.char');
      if (charElement) {
        const delay = index * 15;
        const waveOffset = Math.sin(index * 0.2) * 10 * intensity;
        
        setTimeout(() => {
          charElement.style.transform = `translateY(${waveOffset}px)`;
          
          // Reset after delay
          setTimeout(() => {
            charElement.style.transform = '';
          }, 200);
        }, delay);
      }
    });
  }

  /**
   * Apply reality break effect
   */
  _applyRealityBreakEffect(element, state, intensity) {
    // Add active class
    element.classList.add('active');
    
    // Get character elements
    const charWrappers = element.querySelectorAll('.char-wrapper');
    
    // Create split effect where top and bottom halves separate
    charWrappers.forEach((wrapper, index) => {
      if (Math.random() < intensity * 0.5) {
        const charElement = wrapper.querySelector('.char');
        if (charElement) {
          // Store original styles
          const originalTransform = charElement.style.transform;
          const originalColor = charElement.style.color;
          
          // Apply effect
          const offsetY = (Math.random() - 0.5) * 20 * intensity;
          const offsetX = (Math.random() - 0.5) * 10 * intensity;
          const rotation = (Math.random() - 0.5) * 30 * intensity;
          
          // Create ghosting effect with text shadow
          charElement.style.textShadow = `
            ${offsetX * 0.5}px ${offsetY * 0.5}px 4px rgba(255, 0, 255, 0.7),
            ${-offsetX * 0.7}px ${-offsetY * 0.7}px 4px rgba(0, 255, 255, 0.7)
          `;
          
          charElement.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`;
          charElement.style.color = 'rgba(255, 255, 255, 0.9)';
          
          // Reset after delay
          setTimeout(() => {
            charElement.style.transform = originalTransform;
            charElement.style.color = originalColor;
            charElement.style.textShadow = '';
          }, 200 + Math.random() * 200);
        }
      }
    });
  }

  /**
   * Apply quantum effect
   */
  _applyQuantumEffect(element, state, intensity) {
    // Add active class
    element.classList.add('active');
    
    // Add quantum particles
    const container = element.querySelector('.distortion-container');
    if (container) {
      // Create quantum particles
      const particleCount = Math.floor(20 * intensity);
      
      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'quantum-particle';
        
        // Position randomly around the text
        const x = Math.random() * container.offsetWidth;
        const y = Math.random() * container.offsetHeight;
        
        // Set styles
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.opacity = Math.random() * 0.7 + 0.3;
        particle.style.transform = 'scale(0)';
        
        // Add to container
        container.appendChild(particle);
        
        // Animate
        setTimeout(() => {
          // Expand
          particle.style.transform = `scale(${Math.random() * 2 + 1})`;
          particle.style.transition = 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)';
          
          // Move in random direction
          const moveX = (Math.random() - 0.5) * 100;
          const moveY = (Math.random() - 0.5) * 100;
          
          setTimeout(() => {
            particle.style.transform += ` translate(${moveX}px, ${moveY}px)`;
            particle.style.opacity = '0';
            
            // Remove after animation
            setTimeout(() => {
              particle.remove();
            }, 500);
          }, 100);
        }, Math.random() * 200);
      }
      
      // Apply quantum uncertainty to characters
      const charWrappers = element.querySelectorAll('.char-wrapper');
      charWrappers.forEach((wrapper, index) => {
        if (Math.random() < intensity * 0.4) {
          const charElement = wrapper.querySelector('.char');
          if (charElement) {
            // Random blurring and fading
            const blurAmount = Math.random() * 5 * intensity;
            const fadeAmount = Math.random() * 0.5 * intensity;
            
            charElement.style.filter = `blur(${blurAmount}px)`;
            charElement.style.opacity = 1 - fadeAmount;
            
            // Reset after delay
            setTimeout(() => {
              charElement.style.filter = '';
              charElement.style.opacity = '';
            }, 100 + Math.random() * 300);
          }
        }
      });
    }
  }

  /**
   * Apply dimensional effect
   */
  _applyDimensionalEffect(element, state, intensity) {
    // Add active class
    element.classList.add('active');
    
    // Get character elements
    const charWrappers = element.querySelectorAll('.char-wrapper');
    
    // Apply 3D transformation to container
    const container = element.querySelector('.distortion-container');
    if (container) {
      const rotateX = (Math.random() - 0.5) * 30 * intensity;
      const rotateY = (Math.random() - 0.5) * 60 * intensity;
      const perspective = 500 - intensity * 200;
      
      container.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      container.style.transformStyle = 'preserve-3d';
      
      // Reset after delay
      setTimeout(() => {
        container.style.transform = '';
      }, 500);
    }
    
    // Apply individual 3D transformations to characters
    charWrappers.forEach((wrapper, index) => {
      const charElement = wrapper.querySelector('.char');
      if (charElement) {
        const delay = index * 20;
        
        setTimeout(() => {
          // Generate random 3D transform
          const translateZ = Math.random() * 50 * intensity;
          const rotateX = (Math.random() - 0.5) * 40 * intensity;
          const rotateY = (Math.random() - 0.5) * 40 * intensity;
          const rotateZ = (Math.random() - 0.5) * 20 * intensity;
          
          charElement.style.transform = `translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
          charElement.style.color = intensity > 0.7 ? 
            `hsl(${Math.random() * 60 + 180}, 100%, 70%)` : '';
          
          // Reset after delay
          setTimeout(() => {
            charElement.style.transform = '';
            charElement.style.color = '';
          }, 300 + Math.random() * 200);
        }, delay);
      }
    });
  }
  
  /**
   * Apply disintegration effect - NEW in v0.7
   * Creates a particle explosion effect where text appears to disintegrate
   */
  _applyDisintegrationEffect(element, state, intensity) {
    // Add active class
    element.classList.add('active');
    
    const container = element.querySelector('.distortion-container');
    if (!container) return;
    
    // Get all character wrappers
    const charWrappers = element.querySelectorAll('.char-wrapper');
    
    // Apply disintegration effect to container
    container.style.filter = `contrast(${1 + intensity * 0.5}) saturate(${1 + intensity})`;
    
    // Determine maximum particles based on performance mode
    let maxParticles;
    switch (this.config.performanceMode) {
      case 'high': maxParticles = this.config.maxParticlesPerEffect; break;
      case 'medium': maxParticles = Math.floor(this.config.maxParticlesPerEffect * 0.6); break;
      case 'low': maxParticles = Math.floor(this.config.maxParticlesPerEffect * 0.3); break;
      default: maxParticles = Math.floor(this.config.maxParticlesPerEffect * 0.6);
    }
    
    // Create disintegration effect for each character
    charWrappers.forEach((wrapper, index) => {
      // Skip some characters based on intensity to improve performance
      if (Math.random() > intensity * 0.7) return;
      
      const charElement = wrapper.querySelector('.char');
      if (!charElement) return;
      
      // Pulse effect on character
      const delay = index * 30;
      setTimeout(() => {
        wrapper.style.transform = `scale(${1 + intensity * 0.3})`;
        wrapper.style.filter = `blur(${intensity * 2}px) brightness(${1 + intensity * 0.5})`;
        
        // Create particles for character
        const charRect = wrapper.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        
        // Calculate position relative to container
        const relativeX = charRect.left - elementRect.left;
        const relativeY = charRect.top - elementRect.top;
        
        // Create particles
        const particleCount = Math.floor(5 + intensity * 15);
        const actualParticleCount = Math.min(particleCount, Math.ceil(maxParticles / charWrappers.length));
        
        for (let i = 0; i < actualParticleCount; i++) {
          this._createDisintegrationParticle(
            container,
            relativeX + charRect.width / 2,
            relativeY + charRect.height / 2,
            intensity
          );
        }
        
        // Reset character after delay
        setTimeout(() => {
          wrapper.style.transform = '';
          wrapper.style.filter = '';
        }, 300 + Math.random() * 200);
      }, delay);
    });
    
    // Reset container filter after animation
    setTimeout(() => {
      container.style.filter = '';
    }, 800);
  }
  
  /**
   * Create a single disintegration particle
   */
  _createDisintegrationParticle(container, x, y, intensity) {
    const particle = document.createElement('div');
    particle.className = 'disintegration-particle';
    
    // Set initial position
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // Random size based on intensity
    const size = 1 + Math.random() * 3 * intensity;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    // Random color (magenta to cyan spectrum)
    const hue = Math.random() < 0.5 ? 320 : 180;
    const saturation = 90 + Math.random() * 10;
    const lightness = 50 + Math.random() * 20;
    particle.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    particle.style.boxShadow = `0 0 ${4 + intensity * 4}px 2px hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`;
    
    // Add to container
    container.appendChild(particle);
    
    // Animate
    requestAnimationFrame(() => {
      // Set opacity
      particle.style.opacity = 0.7 + Math.random() * 0.3;
      
      // Calculate random direction vector
      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 70 * intensity;
      const duration = 500 + Math.random() * 500;
      
      // Set transition
      particle.style.transition = `all ${duration}ms cubic-bezier(0.165, 0.84, 0.44, 1)`;
      
      // Apply movement
      setTimeout(() => {
        const moveX = Math.cos(angle) * distance;
        const moveY = Math.sin(angle) * distance;
        particle.style.transform = `translate(${moveX}px, ${moveY}px) scale(${Math.random() * 0.5 + 0.5})`;
        particle.style.opacity = '0';
      }, 10);
      
      // Remove after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, duration + 100);
    });
  }
  
  /**
   * Apply neon leak effect - NEW in v0.7
   * Creates a neon light leak effect with colored streams
   */
  _applyNeonLeakEffect(element, state, intensity) {
    // Add active class
    element.classList.add('active');
    
    const container = element.querySelector('.distortion-container');
    if (!container) return;
    
    // Get all character elements
    const charElements = element.querySelectorAll('.char');
    
    // Apply pulsing neon glow to characters
    charElements.forEach((charElement, index) => {
      if (Math.random() < intensity * 0.8) {
        const delay = index * 20;
        setTimeout(() => {
          // Random color
          const useBlue = Math.random() > 0.5;
          const color = useBlue ? '#00eeff' : '#ff00aa';
          
          // Apply glow effect
          charElement.style.color = color;
          charElement.style.textShadow = `0 0 ${5 + intensity * 5}px ${color}`;
          
          // Reset after delay
          setTimeout(() => {
            charElement.style.color = '';
            charElement.style.textShadow = '';
          }, 300 + Math.random() * 300);
        }, delay);
      }
    });
    
    // Create neon streams
    const streamCount = Math.min(
      Math.floor(3 + intensity * 6),
      this.config.performanceMode === 'high' ? 8 : 
      this.config.performanceMode === 'medium' ? 5 : 3
    );
    
    const rect = container.getBoundingClientRect();
    
    // Create streams
    for (let i = 0; i < streamCount; i++) {
      const delay = i * 100;
      setTimeout(() => {
        this._createNeonStream(container, rect.width, rect.height, intensity);
      }, delay);
    }
  }
  
  /**
   * Create a single neon stream effect
   */
  _createNeonStream(container, width, height, intensity) {
    const stream = document.createElement('div');
    stream.className = 'neon-stream';
    
    // Random start position
    const startX = Math.random() * width;
    const startY = Math.random() * height;
    
    // Random angle
    const angle = Math.random() * Math.PI * 2;
    
    // Random length
    const length = 20 + Math.random() * 80 * intensity;
    
    // Calculate end position
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    
    // Position and size
    const dx = endX - startX;
    const dy = endY - startY;
    const streamLength = Math.sqrt(dx * dx + dy * dy);
    const streamAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Set styles
    stream.style.left = `${startX}px`;
    stream.style.top = `${startY}px`;
    stream.style.width = `${streamLength}px`;
    stream.style.height = `${1 + intensity * 2}px`;
    stream.style.transform = `rotate(${streamAngle}deg)`;
    stream.style.transformOrigin = '0 50%';
    
    // Set color based on angle
    const hue = (angle * 180 / Math.PI) % 360;
    stream.style.background = `linear-gradient(90deg, 
      hsl(${hue}, 100%, 70%), 
      hsl(${(hue + 180) % 360}, 100%, 70%))`;
    
    // Add to container
    container.appendChild(stream);
    
    // Animate
    requestAnimationFrame(() => {
      // Set initial state
      stream.style.opacity = '0';
      stream.style.transform = `rotate(${streamAngle}deg) scaleX(0.1)`;
      
      // Expand
      setTimeout(() => {
        stream.style.transition = `all ${200 + intensity * 200}ms ease-out`;
        stream.style.opacity = '0.7';
        stream.style.transform = `rotate(${streamAngle}deg) scaleX(1)`;
        
        // Fade out
        setTimeout(() => {
          stream.style.opacity = '0';
          
          // Remove after animation
          setTimeout(() => {
            if (stream.parentNode) {
              stream.parentNode.removeChild(stream);
            }
          }, 300);
        }, 200 + Math.random() * 200);
      }, 10);
    });
  }
  
  /**
   * Apply void shift effect - NEW in v0.7
   * Creates a void/dimensional portal effect
   */
  _applyVoidShiftEffect(element, state, intensity) {
    // Add active class
    element.classList.add('active');
    
    const container = element.querySelector('.distortion-container');
    if (!container) return;
    
    // Create void portal
    const portal = document.createElement('div');
    portal.className = 'void-portal';
    
    // Position in center of container
    const rect = container.getBoundingClientRect();
    const portalSize = Math.max(rect.width, rect.height) * (0.6 + intensity * 0.4);
    
    portal.style.width = `${portalSize}px`;
    portal.style.height = `${portalSize}px`;
    portal.style.left = `${rect.width / 2 - portalSize / 2}px`;
    portal.style.top = `${rect.height / 2 - portalSize / 2}px`;
    
    // Add to container
    container.appendChild(portal);
    
    // Apply overall effect to container
    container.style.filter = `saturate(${1 - intensity * 0.5}) contrast(${1 + intensity * 0.3})`;
    
    // Get character wrappers
    const charWrappers = element.querySelectorAll('.char-wrapper');
    
    // Affect characters
    charWrappers.forEach((wrapper, index) => {
      // Position relative to center
      const wrapperRect = wrapper.getBoundingClientRect();
      const containerCenterX = rect.left + rect.width / 2;
      const containerCenterY = rect.top + rect.height / 2;
      
      const dx = wrapperRect.left + wrapperRect.width / 2 - containerCenterX;
      const dy = wrapperRect.top + wrapperRect.height / 2 - containerCenterY;
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = Math.sqrt(rect.width * rect.width / 4 + rect.height * rect.height / 4);
      
      // Normalize distance (0-1)
      const normalizedDistance = distanceFromCenter / maxDistance;
      
      // Calculate effect strength based on distance from center (stronger near center)
      const effectStrength = (1 - normalizedDistance) * intensity;
      
      // Apply only if effect is strong enough
      if (effectStrength > 0.1) {
        // Calculate delay based on distance (closer = earlier)
        const delay = normalizedDistance * 300;
        
        setTimeout(() => {
          // Apply effect
          wrapper.style.transform = `scale(${1 - effectStrength * 0.2}) translateZ(${-effectStrength * 20}px)`;
          wrapper.style.filter = `brightness(${1 - effectStrength * 0.4}) blur(${effectStrength * 2}px)`;
          
          // Reset
          setTimeout(() => {
            wrapper.style.transition = 'all 0.3s ease';
            wrapper.style.transform = '';
            wrapper.style.filter = '';
          }, 200 + effectStrength * 300);
        }, delay);
      }
    });
    
    // Animate portal
    requestAnimationFrame(() => {
      // Initial state
      portal.style.opacity = '0';
      portal.style.transform = 'scale(0)';
      
      // Expand
      setTimeout(() => {
        portal.style.transition = `all ${300 + intensity * 300}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
        portal.style.opacity = intensity * 0.7;
        portal.style.transform = 'scale(1)';
        
        // Add pulsing glow
        setTimeout(() => {
          portal.style.boxShadow = `0 0 ${15 + intensity * 10}px ${5 + intensity * 5}px rgba(138, 43, 226, 0.6)`;
          portal.style.transition = `all 1s ease`;
          
          // Collapse
          setTimeout(() => {
            portal.style.opacity = '0';
            portal.style.transform = 'scale(0)';
            container.style.filter = '';
            
            // Remove after animation
            setTimeout(() => {
              if (portal.parentNode) {
                portal.parentNode.removeChild(portal);
              }
            }, 500);
          }, 500 + intensity * 300);
        }, 300);
      }, 10);
    });
  }
  
  /**
   * Clean up any remaining effect elements
   */
  _cleanupEffectElements(element, effectType) {
    const container = element.querySelector('.distortion-container');
    if (!container) return;
    
    // Clean up based on effect type
    switch (effectType) {
      case 'disintegration':
        const particles = container.querySelectorAll('.disintegration-particle');
        particles.forEach(particle => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        });
        break;
        
      case 'neon-leak':
        const streams = container.querySelectorAll('.neon-stream');
        streams.forEach(stream => {
          if (stream.parentNode) {
            stream.parentNode.removeChild(stream);
          }
        });
        break;
        
      case 'void-shift':
        const portals = container.querySelectorAll('.void-portal');
        portals.forEach(portal => {
          if (portal.parentNode) {
            portal.parentNode.removeChild(portal);
          }
        });
        break;
        
      case 'quantum':
        const quantumParticles = container.querySelectorAll('.quantum-particle');
        quantumParticles.forEach(particle => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        });
        break;
    }
    
    // Reset any remaining styles
    container.style.filter = '';
    container.style.transform = '';
  }
  
  /**
   * Detect performance capabilities of the device
   * Returns a score from 1-10
   */
  _detectPerformance() {
    // Start with a base score
    let score = 5;
    
    // Check for high-end indicators
    if (window.navigator.hardwareConcurrency) {
      // More CPU cores = better performance
      score += Math.min(window.navigator.hardwareConcurrency / 2, 3);
    }
    
    // Check memory if available (Chrome only)
    if (window.navigator.deviceMemory) {
      score += Math.min(window.navigator.deviceMemory / 2, 2);
    }
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      score -= 2; // Mobile devices typically have lower performance
    }
    
    // Detect if user has reduced motion preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      score -= 2;
    }
    
    // Simple FPS test
    let frameCount = 0;
    const startTime = performance.now();
    
    const measureFrames = (timestamp) => {
      frameCount++;
      if (performance.now() - startTime < 500) { // Test for 500ms
        requestAnimationFrame(measureFrames);
      } else {
        const fps = frameCount * 2; // Multiply by 2 to get approximate FPS (500ms test)
        
        // Adjust score based on FPS
        if (fps > 55) score += 1;
        else if (fps < 30) score -= 2;
        
        // Ensure score stays within bounds
        score = Math.max(1, Math.min(10, score));
        
        if (this.config.debugMode) {
          console.log(`RealityDistortionText: Performance test - FPS: ${fps}, Final score: ${score}`);
        }
      }
    };
    
    requestAnimationFrame(measureFrames);
    
    return score;
  }

  /**
   * Apply continuous subtle effects
   */
  _applyContinuousEffects(element, state) {
    // Only apply continuous effects if in idle state
    if (state.state !== 'idle') return;
    
    // Get audio intensity factor
    const audioFactor = (this.state.audioData.bass * 0.5 + 
                         this.state.audioData.mid * 0.3 + 
                         this.state.audioData.high * 0.2) * 
                         this.config.effectIntensity;
    
    // Get distance to mouse for hover effects
    let mouseFactor = 0;
    if (this.config.mouseInteraction) {
      const rect = element.getBoundingClientRect();
      const elementCenterX = rect.left + rect.width / 2;
      const elementCenterY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(this.state.mousePosition.x - elementCenterX, 2) +
        Math.pow(this.state.mousePosition.y - elementCenterY, 2)
      );
      
      // Normalize factor based on distance (closer = stronger effect)
      const maxDistance = 300;
      mouseFactor = Math.max(0, 1 - distance / maxDistance) * 0.6;
    }
    
    // Combine audio and mouse factors
    const combinedFactor = Math.max(audioFactor, mouseFactor);
    
    // Skip if factor is too small
    if (combinedFactor < 0.05) return;
    
    // Apply subtle continuous effect based on type
    switch (state.effect) {
      case 'warp':
        this._applyContinuousWarp(element, state, combinedFactor);
        break;
      case 'dimensional':
        this._applyContinuousDimensional(element, state, combinedFactor);
        break;
      case 'quantum':
        this._applyContinuousQuantum(element, state, combinedFactor);
        break;
    }
  }

  /**
   * Apply continuous warp effect
   */
  _applyContinuousWarp(element, state, intensity) {
    const container = element.querySelector('.distortion-container');
    if (container) {
      const now = performance.now() / 1000;
      const waveX = Math.sin(now * 2) * 2 * intensity;
      const waveY = Math.cos(now * 1.5) * 1 * intensity;
      const rotate = Math.sin(now) * 1 * intensity;
      
      container.style.transform = `skew(${waveX}deg, ${waveY}deg) rotate(${rotate}deg)`;
    }
  }

  /**
   * Apply continuous dimensional effect
   */
  _applyContinuousDimensional(element, state, intensity) {
    const container = element.querySelector('.distortion-container');
    if (container) {
      const now = performance.now() / 1000;
      const rotateX = Math.sin(now) * 5 * intensity;
      const rotateY = Math.cos(now * 1.3) * 10 * intensity;
      const perspective = 800;
      
      container.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }
  }

  /**
   * Apply continuous quantum effect
   */
  _applyContinuousQuantum(element, state, intensity) {
    // Randomly blur some characters
    const charWrappers = element.querySelectorAll('.char-wrapper');
    
    charWrappers.forEach((wrapper, index) => {
      if (Math.random() < intensity * 0.05) {
        const charElement = wrapper.querySelector('.char');
        if (charElement) {
          const blurAmount = Math.random() * 2 * intensity;
          
          charElement.style.filter = `blur(${blurAmount}px)`;
          charElement.style.opacity = 1 - intensity * 0.3;
          
          // Reset after short delay
          setTimeout(() => {
            charElement.style.filter = '';
            charElement.style.opacity = '';
          }, 100);
        }
      }
    });
  }

  /**
   * Start the animation system
   */
  start() {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    this._checkVisibleElements();
    this._animationLoop();
    
    console.log('RealityDistortionText: Started');
  }

  /**
   * Stop the animation system
   */
  stop() {
    this.state.isRunning = false;
    
    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
      this.state.animationFrameId = null;
    }
    
    if (this.state.glitchTimeout) {
      clearTimeout(this.state.glitchTimeout);
      this.state.glitchTimeout = null;
    }
    
    console.log('RealityDistortionText: Stopped');
  }

  /**
   * Force refresh element list
   */
  refresh() {
    this._findElements();
    this._checkVisibleElements();
    
    console.log('RealityDistortionText: Refreshed elements');
  }

  /**
   * Clean up resources
   */
  dispose() {
    this.stop();
    
    // Remove event listeners
    window.removeEventListener('scroll', this._checkVisibleElements);
    
    // Close audio context if applicable
    if (this.state.audioContext) {
      this.state.audioContext.close();
      this.state.audioContext = null;
    }
    
    console.log('RealityDistortionText: Disposed');
  }
}

// Create global instance
document.addEventListener('DOMContentLoaded', () => {
  window.realityDistortionText = new RealityDistortionText({
    textSelector: '.distort-text, h1, h2, h3, .section-title, .world-title, .dimension-world p:first-of-type',
    effectIntensity: 1.0,
    mouseInteraction: true,
    audioReactive: true,
    autoStart: true
  });
  
  console.log('RealityDistortionText: Module loaded');
});

// Expose class for modular usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealityDistortionText;
}