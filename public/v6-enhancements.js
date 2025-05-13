/**
 * MillzMaleficarum Codex v0.6 ULTRA
 * Enhanced Visual System Integration
 * - Combines holographic particles with immersive scrolling
 * - Adds laser neon effects and portal transitions
 * - Creates advanced parallax and depth effects
 * - Implements quantum particles for reality distortion
 * - Adds secret hyperspace jump feature
 */

class V6Enhancements {
  constructor(options = {}) {
    this.options = {
      autoInitialize: true,
      useHolographicParticles: true,
      useImmersiveScroll: true,
      usePortalTransitions: true,
      useHyperAV: true,
      useQuantumParticles: true,
      useRealityDistortion: true,
      useHyperspaceJump: true,
      maxParticles: 150,
      quantumParticles: 75,
      particleColors: ['#ff00ff', '#00ffff', '#ff33cc', '#33ffff', '#8a2be2', '#ff00aa'],
      laserGridDensity: 50,
      depthIntensity: 100,
      audioReactive: true,
      dimensionalFractures: true,
      sigilEffects: true,
      secretFeatures: true,
      debugMode: false,
      ...options
    };

    this.components = {
      holoParticles: null,
      immersiveScroll: null,
      portalTransitions: null,
      hyperAV: null,
      quantumParticles: null,
      realityDistortion: null,
      hyperspaceJump: null
    };

    this.state = {
      initialized: false,
      activeSection: null,
      audioContext: null,
      audioAnalyzer: null,
      audioData: null,
      mousePosition: { x: 0, y: 0 },
      reality: {
        stable: true,
        fractures: 0,
        distortion: 0
      },
      secrets: {
        discovered: 0,
        sigils: []
      },
      isTouch: 'ontouchstart' in window
    };

    if (this.options.autoInitialize) {
      this.initialize();
    }
  }

  initialize() {
    if (this.state.initialized) return;

    // Check if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    console.log('V6Enhancements: Setting up...');

    // Add laser grid effect to page
    this.addLaserGrid();

    // Initialize all components
    this.initComponents();

    // Set up audio reactivity if enabled
    if (this.options.audioReactive) {
      this.setupAudioReactivity();
    }

    // Set up event listeners
    this.setupEventListeners();

    // Add sigil markers if enabled
    if (this.options.sigilEffects) {
      this.setupSigils();
    }

    this.state.initialized = true;
    console.log('V6Enhancements: Initialized with all ULTRA features');

    // Trigger initial animations
    this.triggerEntranceAnimation();
  }

  addLaserGrid() {
    // Add a laser grid background to the entire page
    const laserGrid = document.createElement('div');
    laserGrid.className = 'laser-grid';
    laserGrid.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      z-index: -100;
      background-image:
        linear-gradient(to right, rgba(255, 0, 255, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(0, 255, 255, 0.05) 1px, transparent 1px);
      background-size: ${this.options.laserGridDensity}px ${this.options.laserGridDensity}px;
      transform: perspective(1000px) rotateX(80deg) translateZ(-200px) scale(3);
      transform-origin: center center;
      transform-style: preserve-3d;
      animation: laser-grid-move 20s linear infinite;
    `;

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes laser-grid-move {
        0% { transform: perspective(1000px) rotateX(80deg) translateZ(-200px) translateY(0) scale(3); }
        100% { transform: perspective(1000px) rotateX(80deg) translateZ(-200px) translateY(${this.options.laserGridDensity * 2}px) scale(3); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(laserGrid);
  }

  initComponents() {
    // Initialize HolographicParticles if enabled
    if (this.options.useHolographicParticles && window.HolographicParticles) {
      console.log('V6Enhancements: Initializing HolographicParticles');
      this.components.holoParticles = new HolographicParticles({
        particleCount: this.options.maxParticles,
        particleColors: this.options.particleColors,
        depthRange: this.options.depthIntensity
      });
    }

    // Initialize ImmersiveScroll if enabled
    if (this.options.useImmersiveScroll && window.ImmersiveScroll) {
      console.log('V6Enhancements: Initializing ImmersiveScroll');
      this.components.immersiveScroll = new ImmersiveScroll({
        depthFactor: this.options.depthIntensity,
        usePortalEffects: true
      });
    }

    // Initialize PortalTransitions if enabled
    if (this.options.usePortalTransitions && window.portalTransitions) {
      console.log('V6Enhancements: Connecting to PortalTransitions');
      this.components.portalTransitions = window.portalTransitions;
    }

    // Connect to HyperAV if enabled
    if (this.options.useHyperAV && window.hyperAV) {
      console.log('V6Enhancements: Connecting to HyperAV');
      this.components.hyperAV = window.hyperAV;
    }

    // Initialize QuantumParticles if enabled
    if (this.options.useQuantumParticles && window.QuantumParticles) {
      console.log('V6Enhancements: Initializing QuantumParticles');
      this.components.quantumParticles = window.quantumParticles || new QuantumParticles({
        quantumCount: this.options.quantumParticles,
        primaryColors: this.options.particleColors,
        syncWithAudio: this.options.audioReactive
      });
    }

    // Initialize RealityDistortion if enabled
    if (this.options.useRealityDistortion && window.RealityDistortion) {
      console.log('V6Enhancements: Initializing RealityDistortion');
      this.components.realityDistortion = window.realityDistortion || new RealityDistortion({
        sigilActivation: this.options.sigilEffects,
        dimensionalRifts: this.options.dimensionalFractures,
        reactionToHyperAV: this.options.useHyperAV,
        useSoundEffects: this.options.audioReactive
      });
    }

    // Initialize HyperspaceJump if enabled
    if (this.options.useHyperspaceJump && window.HyperspaceJump) {
      console.log('V6Enhancements: Initializing HyperspaceJump');
      this.components.hyperspaceJump = window.hyperspaceJump || new HyperspaceJump({
        particleCount: this.options.maxParticles * 10,
        useAudio: this.options.audioReactive,
        tunnelColors: this.options.particleColors
      });
    }
  }

  setupAudioReactivity() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.state.audioContext = new AudioContext();

      // Create analyzer
      this.state.audioAnalyzer = this.state.audioContext.createAnalyser();
      this.state.audioAnalyzer.fftSize = 256;

      // Create buffer for frequency data
      this.state.audioData = new Uint8Array(this.state.audioAnalyzer.frequencyBinCount);

      // Create dummy oscillator for initial audio (since we can't use mic without permission)
      const oscillator = this.state.audioContext.createOscillator();
      const gainNode = this.state.audioContext.createGain();

      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;

      oscillator.connect(gainNode);
      gainNode.connect(this.state.audioAnalyzer);

      // Start oscillator
      oscillator.start();

      // Start analysis loop
      this.analyzeAudio();

      console.log('V6Enhancements: Audio reactivity initialized');
    } catch (error) {
      console.error('V6Enhancements: Audio reactivity initialization failed', error);
    }
  }

  analyzeAudio() {
    if (!this.state.audioAnalyzer) return;

    // Get frequency data
    this.state.audioAnalyzer.getByteFrequencyData(this.state.audioData);

    // Calculate average levels for bass, mid, high
    const bass = this.getAverageFrequency(0, 6);
    const mid = this.getAverageFrequency(7, 14);
    const high = this.getAverageFrequency(15, 30);

    // Apply audio reactivity to components
    this.applyAudioReactivity(bass, mid, high);

    // Continue analysis loop
    requestAnimationFrame(() => this.analyzeAudio());
  }

  getAverageFrequency(startIndex, endIndex) {
    if (!this.state.audioData) return 0;

    let sum = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      sum += this.state.audioData[i];
    }

    return sum / (endIndex - startIndex + 1) / 255;
  }

  applyAudioReactivity(bass, mid, high) {
    // Apply to laser grid
    const laserGrid = document.querySelector('.laser-grid');
    if (laserGrid) {
      const bassEffect = 1 + bass * 0.5;
      const highEffect = 1 + high * 0.3;

      laserGrid.style.opacity = 0.05 + bass * 0.1;
      laserGrid.style.transform = `perspective(1000px) rotateX(${80 - mid * 10}deg) translateZ(-200px) scale(${3 * bassEffect})`;
    }

    // Apply to quantum particles
    if (this.components.quantumParticles && this.components.quantumParticles.setAudioData) {
      this.components.quantumParticles.setAudioData(this.state.audioData);
    }

    // Apply to HyperAV if available with intensity method
    if (this.components.hyperAV && typeof this.components.hyperAV.setAudioIntensity === 'function') {
      this.components.hyperAV.setAudioIntensity(bass, mid, high);
    }

    // Advanced audio reactivity - trigger reality distortion on extreme audio peaks
    if (this.options.useRealityDistortion && bass > 0.8 && this.components.realityDistortion) {
      // Random chance for distortion effect when bass is high
      if (Math.random() < 0.05) {
        this.triggerRealityDistortion({
          intensity: bass * 1.5,
          type: 'audio'
        });
      }
    }

    // Log audio levels in debug mode
    if (this.options.debugMode && Math.random() < 0.01) {
      console.log(`Audio Levels - Bass: ${bass.toFixed(2)}, Mid: ${mid.toFixed(2)}, High: ${high.toFixed(2)}`);
    }
  }

  setupEventListeners() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.state.mousePosition.x = e.clientX;
      this.state.mousePosition.y = e.clientY;
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (this.components.holoParticles) {
        this.components.holoParticles.resize();
      }
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Pause animations when page is not visible
        if (this.components.holoParticles) {
          this.components.holoParticles.stop();
        }
        if (this.components.quantumParticles) {
          this.components.quantumParticles.stop();
        }
      } else {
        // Resume animations when page becomes visible
        if (this.components.holoParticles) {
          this.components.holoParticles.start();
        }
        if (this.components.quantumParticles) {
          this.components.quantumParticles.start();
        }
      }
    });

    // Add special event listeners for sigil activation
    if (this.options.sigilEffects) {
      this.setupSigilListeners();
    }

    // Secret click combinations
    if (this.options.secretFeatures) {
      this.setupSecretCombinations();
    }
  }

  setupSigils() {
    // Find sigil markers in content
    const sigilClasses = [
      '.sigil-Xi', '.sigil-Theta', '.sigil-Gamma', '.sigil-Pi', '.sigil-Lambda',
      '.sigil-Sigma', '.sigil-Phi', '.sigil-Psi', '.sigil-Omega', '.sigil-Delta',
      '.sigil'
    ];

    // Set up observer to detect sigils in dynamically loaded content
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // Check for new sigils after content changes
          setTimeout(() => this.detectSigils(), 500);
        }
      });
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial detection
    setTimeout(() => this.detectSigils(), 1000);
  }

  detectSigils() {
    // Find sigil markers in content
    const sigilClasses = [
      '.sigil-Xi', '.sigil-Theta', '.sigil-Gamma', '.sigil-Pi', '.sigil-Lambda',
      '.sigil-Sigma', '.sigil-Phi', '.sigil-Psi', '.sigil-Omega', '.sigil-Delta',
      '.sigil'
    ];

    // Combined selector
    const sigilSelector = sigilClasses.join(', ');
    const sigils = document.querySelectorAll(sigilSelector);

    // Mark sigils and store references
    sigils.forEach(sigil => {
      if (!sigil.dataset.sigilMarked) {
        sigil.dataset.sigilMarked = 'true';
        sigil.dataset.sigilType = this.getSigilType(sigil);
        sigil.classList.add('quantum-entangled');

        // Store in state
        this.state.secrets.sigils.push({
          element: sigil,
          type: sigil.dataset.sigilType,
          activated: false
        });
      }
    });

    if (this.options.debugMode) {
      console.log(`Detected ${this.state.secrets.sigils.length} sigils`);
    }
  }

  getSigilType(element) {
    // Determine sigil type from class name
    const classes = element.className.split(' ');
    for (const cls of classes) {
      if (cls.startsWith('sigil-')) {
        return cls.replace('sigil-', '');
      }
    }
    return 'unknown';
  }

  setupSigilListeners() {
    // We'll use event delegation for dynamically added sigils
    document.addEventListener('click', (e) => {
      // Check if target is a sigil or has a sigil parent
      let target = e.target;
      let isSigil = false;

      while (target && target !== document.body) {
        if (target.dataset && target.dataset.sigilMarked === 'true') {
          isSigil = true;
          break;
        }
        target = target.parentNode;
      }

      if (isSigil) {
        this.activateSigil(target);
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  activateSigil(sigilElement) {
    // Find sigil in state
    const sigilInfo = this.state.secrets.sigils.find(s => s.element === sigilElement);

    if (sigilInfo && !sigilInfo.activated) {
      // Mark as activated
      sigilInfo.activated = true;
      this.state.secrets.discovered++;

      // Add special class
      sigilElement.classList.add('sigil-activated');

      // Trigger reality distortion
      if (this.components.realityDistortion) {
        const rect = sigilElement.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        this.triggerRealityDistortion({
          x: x,
          y: y,
          intensity: 1.5,
          type: 'sigil',
          sigil: sigilInfo.type
        });
      }

      // Reveal special message if all sigils found
      if (this.state.secrets.discovered >= this.state.secrets.sigils.length &&
          this.state.secrets.sigils.length > 0) {
        this.revealSecretMessage();
      }
    }
  }

  triggerRealityDistortion(options = {}) {
    if (this.components.realityDistortion &&
        typeof this.components.realityDistortion.triggerRealityDistortion === 'function') {
      this.components.realityDistortion.triggerRealityDistortion(options);
    }
  }

  setupSecretCombinations() {
    // Click counter for special patterns
    let clickCount = 0;
    let lastClickTime = 0;
    let clickPositions = [];

    // Track rapid click patterns
    document.addEventListener('click', (e) => {
      const now = Date.now();

      // Reset if more than 500ms between clicks
      if (now - lastClickTime > 500) {
        clickCount = 0;
        clickPositions = [];
      }

      // Store click position
      clickPositions.push({
        x: e.clientX,
        y: e.clientY
      });

      clickCount++;
      lastClickTime = now;

      // Check for secret activation patterns
      if (clickCount >= 5) {
        // Check if clicks form a pentagram
        if (this.isPentagramPattern(clickPositions)) {
          this.activatePentagramRitual();
          clickCount = 0;
          clickPositions = [];
        }
      }
    });

    // Secret key sequence for hyperspace
    let keySequence = [];
    document.addEventListener('keydown', (e) => {
      keySequence.push(e.key.toLowerCase());

      // Limit sequence length
      if (keySequence.length > 5) {
        keySequence.shift();
      }

      // Check for "millz" sequence
      const secretWord = 'millz';
      const matchesPattern = secretWord.split('').every(
        (key, i) => keySequence[i] === key
      );

      if (matchesPattern) {
        this.activateMillzSecretFeature();
        keySequence = [];
      }
    });
  }

  isPentagramPattern(points) {
    // Simplified pentagram detection
    if (points.length < 5) return false;

    // Use last 5 points
    const last5 = points.slice(-5);

    // Calculate center point
    const centerX = last5.reduce((sum, pt) => sum + pt.x, 0) / 5;
    const centerY = last5.reduce((sum, pt) => sum + pt.y, 0) / 5;

    // Calculate angles from center
    const angles = last5.map(pt => {
      return Math.atan2(pt.y - centerY, pt.x - centerX);
    });

    // Convert to degrees
    const degAngles = angles.map(a => (a * 180 / Math.PI + 360) % 360);

    // Sort angles
    const sortedAngles = [...degAngles].sort((a, b) => a - b);

    // Check if angles are roughly 72 degrees apart
    for (let i = 1; i < sortedAngles.length; i++) {
      const diff = sortedAngles[i] - sortedAngles[i-1];
      // Allow some tolerance
      if (Math.abs(diff - 72) > 20) {
        return false;
      }
    }

    return true;
  }

  activatePentagramRitual() {
    console.log('V6Enhancements: Pentagram ritual activated');

    // Apply special effect to whole page
    document.body.classList.add('pentagram-ritual');

    // Create pentagram effect
    const pentagram = document.createElement('div');
    pentagram.className = 'pentagram-effect';
    pentagram.innerHTML = `
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="50,10 61,40 95,40 67,60 78,90 50,75 22,90 33,60 5,40 39,40"
                 fill="none" stroke="#ff00ff" stroke-width="1" />
      </svg>
    `;

    document.body.appendChild(pentagram);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .pentagram-effect {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10000;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .pentagram-effect svg {
        width: 50%;
        height: 50%;
        opacity: 0;
        animation: pentagram-appear 3s forwards;
        filter: drop-shadow(0 0 10px #ff00ff);
      }

      @keyframes pentagram-appear {
        0% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
        100% { opacity: 0; transform: scale(0) rotate(360deg); }
      }

      .pentagram-ritual {
        animation: pentagram-ritual 3s forwards;
      }

      @keyframes pentagram-ritual {
        0% { filter: none; }
        25% { filter: invert(1) hue-rotate(180deg); }
        50% { filter: saturate(300%) contrast(150%) brightness(150%); }
        75% { filter: invert(0.5) hue-rotate(90deg); }
        100% { filter: none; }
      }
    `;

    document.head.appendChild(style);

    // Trigger massive reality distortion
    if (this.components.realityDistortion) {
      this.triggerRealityDistortion({
        intensity: 3,
        type: 'pentagram',
        fractures: 5,
        duration: 3000
      });
    }

    // Remove after animation
    setTimeout(() => {
      document.body.classList.remove('pentagram-ritual');
      if (pentagram.parentNode) {
        pentagram.parentNode.removeChild(pentagram);
      }
    }, 3000);
  }

  activateMillzSecretFeature() {
    console.log('V6Enhancements: MiLLz secret activated');

    // Glitch effect
    document.body.classList.add('millz-secret-active');

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .millz-secret-active {
        animation: millz-glitch 2s forwards;
      }

      @keyframes millz-glitch {
        0% { filter: none; }
        10% { filter: hue-rotate(90deg) saturate(200%); }
        20% { filter: contrast(200%) brightness(150%); }
        30% { filter: hue-rotate(-90deg) saturate(300%); }
        40% { filter: invert(0.5) hue-rotate(180deg); }
        50% { filter: blur(2px) brightness(200%); }
        60% { filter: contrast(300%) saturate(200%); }
        70% { filter: hue-rotate(45deg) blur(1px); }
        80% { filter: invert(0.2) brightness(150%); }
        90% { filter: hue-rotate(-45deg) saturate(200%); }
        100% { filter: none; }
      }
    `;

    document.head.appendChild(style);

    // Show secret message
    const message = document.createElement('div');
    message.className = 'millz-secret-message';
    message.textContent = 'GEN-R-L MiLLz acknowledges your discovery';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: #ff00ff;
      padding: 20px;
      border: 2px solid #00eeff;
      box-shadow: 0 0 20px rgba(0, 238, 255, 0.8), inset 0 0 10px rgba(255, 0, 255, 0.8);
      z-index: 10001;
      font-family: 'VT323', monospace;
      font-size: 24px;
      text-align: center;
    `;

    document.body.appendChild(message);

    // Remove after animation
    setTimeout(() => {
      document.body.classList.remove('millz-secret-active');
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 3000);
  }

  revealSecretMessage() {
    console.log('V6Enhancements: All sigils activated!');

    // Show congratulatory message
    const message = document.createElement('div');
    message.className = 'all-sigils-message';
    message.innerHTML = `
      <h2>All Sigils Activated</h2>
      <p>You have unlocked the secrets of the MillzMaleficarum Codex.</p>
      <p>Type "hyper" to unleash the final secret.</p>
    `;

    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #ffffff;
      padding: 30px;
      border: 2px solid #ff00ff;
      box-shadow: 0 0 30px rgba(255, 0, 255, 0.8), inset 0 0 15px rgba(0, 238, 255, 0.8);
      z-index: 10001;
      font-family: 'VT323', monospace;
      text-align: center;
      border-radius: 5px;
    `;

    document.body.appendChild(message);

    // Massive reality distortion
    if (this.components.realityDistortion) {
      this.triggerRealityDistortion({
        intensity: 2,
        type: 'all-sigils',
        fractures: 7,
        duration: 5000
      });
    }

    // Hide message after a while
    setTimeout(() => {
      if (message.parentNode) {
        message.style.opacity = '0';
        message.style.transition = 'opacity 1s ease';
        setTimeout(() => {
          if (message.parentNode) {
            message.parentNode.removeChild(message);
          }
        }, 1000);
      }
    }, 10000);
  }

  triggerEntranceAnimation() {
    // Add entrance animation class to body
    document.body.classList.add('v6-entrance');

    // Remove class after animation completes
    setTimeout(() => {
      document.body.classList.remove('v6-entrance');
    }, 3000);
  }

  // Method to get intensity for other modules
  getIntensity() {
    if (!this.state.audioData) return 0;

    // Calculate overall intensity from audio data
    let sum = 0;
    for (let i = 0; i < this.state.audioData.length; i++) {
      sum += this.state.audioData[i];
    }

    return sum / (this.state.audioData.length * 255);
  }

  destroy() {
    // Destroy all components
    if (this.components.holoParticles) {
      this.components.holoParticles.destroy();
    }

    if (this.components.immersiveScroll) {
      this.components.immersiveScroll.destroy();
    }

    if (this.components.quantumParticles) {
      this.components.quantumParticles.destroy();
    }

    if (this.components.realityDistortion) {
      this.components.realityDistortion.destroy();
    }

    if (this.components.hyperspaceJump) {
      this.components.hyperspaceJump.destroy();
    }

    // Remove laser grid
    const laserGrid = document.querySelector('.laser-grid');
    if (laserGrid && laserGrid.parentNode) {
      laserGrid.parentNode.removeChild(laserGrid);
    }

    // Close audio context
    if (this.state.audioContext) {
      this.state.audioContext.close();
    }

    this.state.initialized = false;
    console.log('V6Enhancements: Destroyed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Define entrance animation styles
  const entranceStyle = document.createElement('style');
  entranceStyle.textContent = `
    .v6-entrance {
      animation: v6-entrance-anim 3s ease-out forwards;
    }

    @keyframes v6-entrance-anim {
      0% { filter: brightness(0) blur(20px); }
      15% { filter: brightness(0.3) blur(15px) hue-rotate(90deg) saturate(200%); }
      30% { filter: brightness(0.6) blur(10px) hue-rotate(180deg) saturate(300%); }
      50% { filter: brightness(1.5) blur(5px) hue-rotate(270deg) saturate(400%); }
      70% { filter: brightness(1.2) blur(3px) hue-rotate(180deg) saturate(300%); }
      85% { filter: brightness(1.1) blur(1px) hue-rotate(90deg) saturate(200%); }
      100% { filter: brightness(1) blur(0) hue-rotate(0) saturate(100%); }
    }
  `;
  document.head.appendChild(entranceStyle);

  // Create global instance
  window.v6Enhancements = new V6Enhancements();
});