/**
 * dimensional-worlds.js - v0.7 (Enhanced)
 * Advanced dimensional worlds system with hyperdimensional transitions
 * Added new world types and improved performance
 */

class DimensionalWorlds {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      contentContainer: options.contentContainer || '#magazine-content',
      worldSelector: options.worldSelector || '.world, .cover-section, .editorial-section, .culture-section, .tech-section, .interview-section, .ads-section, .lore-section, .ethereal-section, .fractal-section',
      transitionDuration: options.transitionDuration || 1800,
      transitionOverlayId: options.transitionOverlayId || 'dimensional-transition-overlay',
      navigationContainerId: options.navigationContainerId || 'dimensional-nav',
      useHyperAV: options.useHyperAV !== false,
      usePortalTransitions: options.usePortalTransitions !== false,
      enableAudio: options.enableAudio !== false,
      initialWorldId: options.initialWorldId || null,
      createNav: options.createNav !== false,
      debugMode: options.debugMode || false,
      useSpatialAudio: options.useSpatialAudio !== false,
      preloadWorlds: options.preloadWorlds !== false,
      useAdvancedTransitions: options.useAdvancedTransitions !== false,
      showLoadingIndicator: options.showLoadingIndicator !== false
    };

    // State
    this.state = {
      container: null,
      worlds: [],
      currentWorld: null,
      previousWorld: null,
      hyperAVInstance: window.universalHyperAV || null,
      portalInstance: window.portalTransitions || null,
      transitioning: false,
      navContainer: null,
      navItems: [],
      audioContext: null,
      audioPlayers: {},
      transitionOverlay: null,
      loadingIndicator: null,
      particleSystems: {},
      worldTypeMap: {
        'cover-section': { type: 'cover', colorScheme: 'vaporwave' },
        'editorial-section': { type: 'editorial', colorScheme: 'editorial' },
        'culture-section': { type: 'culture', colorScheme: 'culture' },
        'tech-section': { type: 'tech', colorScheme: 'tech' },
        'interview-section': { type: 'interview', colorScheme: 'interview' },
        'ads-section': { type: 'ads', colorScheme: 'cyber' },
        'lore-section': { type: 'lore', colorScheme: 'lore' },
        'ethereal-section': { type: 'ethereal', colorScheme: 'ethereal' },
        'fractal-section': { type: 'fractal', colorScheme: 'fractal' },
        'chronosynth-section': { type: 'chronosynth', colorScheme: 'chronosynth' },
        'neuromantic-section': { type: 'neuromantic', colorScheme: 'neuromantic' }
      },
      portalButtons: [],
      cacheData: {
        textureCache: new Map(),
        worldRenderedState: new Map()
      },
      portalEffectInstances: {},
      transitionTimers: []
    };

    // Initialize
    this._initialize();
  }

  /**
   * Initialize the dimensional worlds system
   */
  _initialize() {
    // Find the content container
    this.state.container = document.querySelector(this.config.contentContainer);
    if (!this.state.container) {
      console.error('DimensionalWorlds: Content container not found');
      return;
    }

    // Add special class to container for styling
    this.state.container.classList.add('dimensional-worlds-container');

    // Create transition overlay
    this._createTransitionOverlay();
    
    // Create loading indicator
    if (this.config.showLoadingIndicator) {
      this._createLoadingIndicator();
    }
    
    // Initialize audio if enabled
    if (this.config.enableAudio) {
      this._initAudio();
    }
    
    // Wait for document ready to find worlds
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setupWorlds());
    } else {
      this._setupWorlds();
    }
    
    // Connect to HyperAV if available and enabled
    if (this.config.useHyperAV && window.universalHyperAV) {
      this.state.hyperAVInstance = window.universalHyperAV;
    }
    
    // Connect to Portal Transitions if available and enabled
    if (this.config.usePortalTransitions && window.portalTransitions) {
      this.state.portalInstance = window.portalTransitions;
    }
    
    // Add resize event listener
    window.addEventListener('resize', this._handleResize.bind(this));

    // Add portal button listeners
    document.addEventListener('click', this._handlePortalButtonClick.bind(this));
    
    console.log('DimensionalWorlds: Initialized with enhanced features');
  }

  /**
   * Handle resize events
   */
  _handleResize() {
    // Resize canvas elements
    if (this.state.transitionOverlay && this.state.transitionOverlay.canvas) {
      const canvas = this.state.transitionOverlay.canvas;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Resize particle systems
    this._updateParticleSystems();
  }

  /**
   * Handle portal button clicks
   */
  _handlePortalButtonClick(event) {
    const button = event.target.closest('.portal-button');
    if (button && button.dataset.worldTarget) {
      const targetWorldId = button.dataset.worldTarget;
      this.navigateToWorld(targetWorldId);
      
      // Add click effect
      this._createPortalClickEffect(button);
    }
  }

  /**
   * Create a visual effect when a portal button is clicked
   */
  _createPortalClickEffect(button) {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.className = 'portal-button-ripple';
    ripple.style.position = 'absolute';
    ripple.style.top = '50%';
    ripple.style.left = '50%';
    ripple.style.width = '0';
    ripple.style.height = '0';
    ripple.style.borderRadius = '50%';
    ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.transition = 'all 0.6s cubic-bezier(0.19, 1, 0.22, 1)';
    ripple.style.zIndex = '0';
    
    // Add ripple to button
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    // Trigger ripple animation
    setTimeout(() => {
      ripple.style.width = '300%';
      ripple.style.height = '300%';
      ripple.style.opacity = '0';
    }, 10);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  /**
   * Create loading indicator for world transitions
   */
  _createLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'world-loading-indicator';
    
    const spinner = document.createElement('div');
    spinner.className = 'world-loading-spinner';
    
    const text = document.createElement('div');
    text.className = 'world-loading-text';
    text.textContent = 'Traversing dimensions...';
    
    indicator.appendChild(spinner);
    indicator.appendChild(text);
    document.body.appendChild(indicator);
    
    this.state.loadingIndicator = indicator;
  }

  /**
   * Show loading indicator during transitions
   */
  _showLoadingIndicator(show) {
    if (!this.state.loadingIndicator) return;
    
    this.state.loadingIndicator.style.opacity = show ? '1' : '0';
  }

  /**
   * Create transition overlay for dimensional transitions
   */
  _createTransitionOverlay() {
    // Create main transition overlay
    const overlay = document.createElement('div');
    overlay.id = this.config.transitionOverlayId;
    overlay.className = 'dimensional-transition-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    
    // Create portal canvas for effects
    const canvas = document.createElement('canvas');
    canvas.className = 'dimensional-portal-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Add canvas to overlay
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
    
    // Store references
    this.state.transitionOverlay = {
      element: overlay,
      canvas: canvas,
      context: canvas.getContext('2d')
    };
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  /**
   * Set up audio for dimensional transitions
   */
  _initAudio() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.state.audioContext = new AudioContext();
      
      // Generate transition sound effects
      this._generateTransitionSounds();

      // Create spatial audio setup if enabled
      if (this.config.useSpatialAudio) {
        this._setupSpatialAudio();
      }
      
      if (this.config.debugMode) {
        console.log('DimensionalWorlds: Audio initialized with spatial capabilities');
      }
    } catch (error) {
      console.error('DimensionalWorlds: Failed to initialize audio', error);
    }
  }

  /**
   * Setup spatial audio system
   */
  _setupSpatialAudio() {
    if (!this.state.audioContext) return;
    
    // Create listener for spatial audio
    const listener = this.state.audioContext.listener;
    
    // Position listener in the center
    if (listener.positionX) {
      // Modern API
      listener.positionX.value = 0;
      listener.positionY.value = 0;
      listener.positionZ.value = 0;
    } else {
      // Legacy API
      listener.setPosition(0, 0, 0);
    }
    
    // Store spatial audio related objects
    this.state.spatialAudio = {
      listener: listener,
      sources: new Map()
    };
  }

  /**
   * Generate transition sound effects with improved synthesis
   */
  _generateTransitionSounds() {
    // Only generate if we have an audio context
    if (!this.state.audioContext) return;
    
    const ctx = this.state.audioContext;
    const sounds = {};
    
    // Enter dimension sound (whoosh with rising pitch)
    sounds.enter = this._createAudioBuffer(ctx, 2, (t) => {
      // Complex dimensional entry sound
      const carrier = 200 + t * 1200;
      const mod = 80 + t * 120;
      const modIndex = 10 * (1 - t);
      const amp = Math.exp(-2 * t) * 0.5;
      
      // FM synthesis for alien dimensional sound
      return Math.sin(2 * Math.PI * carrier * t + Math.sin(2 * Math.PI * mod * t) * modIndex) * amp;
    });
    
    // Exit dimension sound (reverse whoosh)
    sounds.exit = this._createAudioBuffer(ctx, 2, (t) => {
      // Complex dimensional exit sound
      const carrier = 1200 - t * 800;
      const mod = 200 - t * 120;
      const modIndex = 10 * t;
      const amp = Math.exp(-(2 - t*2) * (2 - t*2)) * 0.5;
      
      // FM synthesis for alien dimensional sound
      return Math.sin(2 * Math.PI * carrier * t + Math.sin(2 * Math.PI * mod * t) * modIndex) * amp;
    });
    
    // Arrival sound (alien ping)
    sounds.arrival = this._createAudioBuffer(ctx, 1, (t) => {
      // Complex dimensional arrival sound
      const freq1 = 1200;
      const freq2 = 1800;
      const sweep = 300 * Math.exp(-5 * t);
      const amp = Math.exp(-10 * t) * 0.3;
      
      // Additive synthesis with frequency sweep
      return (Math.sin(2 * Math.PI * (freq1 + sweep) * t) + 
              Math.sin(2 * Math.PI * (freq2 - sweep) * t)) * amp;
    });
    
    // New sound: Ethereal ambient for ethereal world
    sounds.ethereal = this._createAudioBuffer(ctx, 4, (t) => {
      // Ethereal pad sound with slow attack
      const freq1 = 220; // A3
      const freq2 = 277.18; // C#4
      const freq3 = 329.63; // E4
      const freq4 = 369.99; // F#4
      
      // Slow attack envelope
      const env = Math.min(1, t * 2) * Math.exp(-t / 3);
      
      // Chord with subtle shimmer
      return (
        Math.sin(2 * Math.PI * freq1 * t) * 0.2 +
        Math.sin(2 * Math.PI * freq2 * t) * 0.15 +
        Math.sin(2 * Math.PI * freq3 * t) * 0.15 +
        Math.sin(2 * Math.PI * freq4 * t) * 0.1 +
        Math.sin(2 * Math.PI * (freq3 * 2) * t) * 0.05 * Math.sin(2 * Math.PI * 0.5 * t)
      ) * env * 0.3;
    });
    
    // New sound: Fractal descent for fractal world
    sounds.fractal = this._createAudioBuffer(ctx, 5, (t) => {
      // Frequencies based on Sierpinski triangle pattern
      const baseFreq = 110; // A2
      const time = t * 5; // Stretch time
      const level1 = baseFreq;
      const level2 = baseFreq * 2;
      const level3 = baseFreq * 3;
      const level4 = baseFreq * 5;
      const level5 = baseFreq * 8;
      
      // Modulation with fractal rhythm - each subdivision gets faster
      const mod1 = Math.sin(2 * Math.PI * 0.5 * time);
      const mod2 = Math.sin(2 * Math.PI * 1.5 * time);
      const mod3 = Math.sin(2 * Math.PI * 4.5 * time);
      
      // Complex envelope
      const env = Math.pow(Math.sin(Math.PI * t), 2) * Math.exp(-t / 4);
      
      // Fractal-like sound
      return (
        Math.sin(2 * Math.PI * level1 * time) * 0.2 +
        Math.sin(2 * Math.PI * level2 * time * (1 + 0.01 * mod1)) * 0.15 +
        Math.sin(2 * Math.PI * level3 * time * (1 + 0.02 * mod2)) * 0.1 +
        Math.sin(2 * Math.PI * level4 * time * (1 + 0.03 * mod3)) * 0.05 +
        Math.sin(2 * Math.PI * level5 * time * (1 + 0.04 * mod1 * mod2)) * 0.02
      ) * env * 0.3;
    });
    
    // New sound: Chronosynth recursion for chronosynth world
    sounds.chronosynth = this._createAudioBuffer(ctx, 6, (t) => {
      // Time-stretched sound with recursion
      const timePhase = t * 3; // Base time scaling
      const reverseTime = 6 - timePhase; // Reverse time for recursion
      
      // Base frequencies for major 7th chord with added 9th (ethereal jazz)
      const freq1 = 146.83; // D3
      const freq2 = 196.00; // G3
      const freq3 = 246.94; // B3
      const freq4 = 329.63; // E4
      const freq5 = 392.00; // G4
      
      // Time recursion modulation
      const recursionMod = Math.sin(2 * Math.PI * 0.25 * reverseTime) * 0.2;
      
      // Create complex temporal patterns with feedback loops
      const normalSignal = (
        Math.sin(2 * Math.PI * freq1 * timePhase) * 0.15 +
        Math.sin(2 * Math.PI * freq2 * timePhase) * 0.12 +
        Math.sin(2 * Math.PI * freq3 * timePhase) * 0.1 +
        Math.sin(2 * Math.PI * freq4 * timePhase) * 0.08 +
        Math.sin(2 * Math.PI * freq5 * timePhase) * 0.05
      );
      
      // Create reversed signal
      const reverseSignal = (
        Math.sin(2 * Math.PI * freq1 * reverseTime * (1 + recursionMod)) * 0.15 +
        Math.sin(2 * Math.PI * freq2 * reverseTime * (1 - recursionMod)) * 0.12 +
        Math.sin(2 * Math.PI * freq3 * reverseTime * (1 + recursionMod * 0.5)) * 0.1 +
        Math.sin(2 * Math.PI * freq4 * reverseTime * (1 - recursionMod * 0.3)) * 0.08 +
        Math.sin(2 * Math.PI * freq5 * reverseTime * (1 + recursionMod * 0.7)) * 0.05
      );
      
      // Create time-fracture effect with amplitude modulation
      const fractureMod = Math.sin(2 * Math.PI * 8 * t) * Math.sin(2 * Math.PI * 4.7 * t) * 0.5 + 0.5;
      
      // Complex envelope with slow attack and release
      const envelope = Math.min(1, t * 1.5) * Math.max(0, 1 - (t - 4) * 0.5);
      
      // Mix normal and reverse signals with time fracture modulation
      return (normalSignal * (1 - fractureMod) + reverseSignal * fractureMod) * envelope * 0.3;
    });
    
    // New sound: Neuromantic synaptic flare for neuromantic world
    sounds.neuromantic = this._createAudioBuffer(ctx, 5, (t) => {
      // Complex emotional synthesis
      const tension = 100 + Math.sin(2 * Math.PI * 0.1 * t) * 30; // Emotional tension frequency
      const release = 200 + Math.cos(2 * Math.PI * 0.13 * t) * 50; // Emotional release frequency
      const yearning = 300 + Math.sin(2 * Math.PI * 0.17 * t) * 100; // Yearning frequency
      const memory = 400 + Math.cos(2 * Math.PI * 0.19 * t) * 150; // Memory frequency
      const wonder = 500 + Math.sin(2 * Math.PI * 0.23 * t) * 200; // Wonder frequency
      
      // Emotional state mixing over time
      const tensionAmp = Math.sin(2 * Math.PI * 0.3 * t) * 0.5 + 0.5;
      const releaseAmp = Math.cos(2 * Math.PI * 0.4 * t) * 0.5 + 0.5;
      const yearningAmp = Math.sin(2 * Math.PI * 0.5 * t) * 0.5 + 0.5;
      const memoryAmp = Math.cos(2 * Math.PI * 0.7 * t) * 0.5 + 0.5;
      const wonderAmp = Math.sin(2 * Math.PI * 0.9 * t) * 0.5 + 0.5;
      
      // Sudden synaptic bursts
      const burstFreq = 1200;
      const burstThreshold = 0.95;
      const burstTrigger = Math.random() > burstThreshold ? 1 : 0;
      const burstEnv = burstTrigger * Math.exp(-t * 20);
      
      // Emotional envelope - gentle waves with complexity
      const envelope = Math.min(1, t * 2) * Math.max(0, 1 - (t - 3) * 0.5);
      
      // Create synthetic emotion sound
      return (
        Math.sin(2 * Math.PI * tension * t) * 0.1 * tensionAmp +
        Math.sin(2 * Math.PI * release * t) * 0.1 * releaseAmp +
        Math.sin(2 * Math.PI * yearning * t) * 0.1 * yearningAmp +
        Math.sin(2 * Math.PI * memory * t) * 0.05 * memoryAmp +
        Math.sin(2 * Math.PI * wonder * t) * 0.05 * wonderAmp +
        Math.sin(2 * Math.PI * burstFreq * t) * 0.2 * burstEnv
      ) * envelope * 0.3;
    });
    
    this.state.audioPlayers = sounds;
  }

  /**
   * Create audio buffer with custom waveform
   */
  _createAudioBuffer(context, duration, waveformFn) {
    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / sampleRate;
      channel[i] = waveformFn(t);
    }
    
    return buffer;
  }

  /**
   * Play a transition sound effect with enhanced audio processing
   */
  _playTransitionSound(soundName, options = {}) {
    if (!this.state.audioContext || !this.state.audioPlayers[soundName]) return;
    
    // Resume audio context if suspended (browser autoplay policy)
    if (this.state.audioContext.state === 'suspended') {
      this.state.audioContext.resume();
    }
    
    // Create source node
    const source = this.state.audioContext.createBufferSource();
    source.buffer = this.state.audioPlayers[soundName];
    
    // Create gain node for volume control
    const gainNode = this.state.audioContext.createGain();
    gainNode.gain.value = options.volume || 0.5;
    
    // Add lowpass filter for dimensional feel
    const filter = this.state.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = options.filterFreq || 2000;
    filter.Q.value = options.filterQ || 1;
    
    // Add spacial effect with convolver
    const convolver = this.state.audioContext.createConvolver();
    const convolverBuffer = this.state.audioContext.createBuffer(2, 8000, this.state.audioContext.sampleRate);
    const left = convolverBuffer.getChannelData(0);
    const right = convolverBuffer.getChannelData(1);
    
    // Create reverb impulse response
    for (let i = 0; i < convolverBuffer.length; i++) {
      left[i] = (Math.random() * 2 - 1) * Math.exp(-i / (convolverBuffer.length / 3));
      right[i] = (Math.random() * 2 - 1) * Math.exp(-i / (convolverBuffer.length / 3));
    }
    
    convolver.buffer = convolverBuffer;
    
    // Create stereo panner for spatial positioning
    const panner = this.state.audioContext.createStereoPanner();
    panner.pan.value = options.pan || 0;
    
    // Add a subtle chorus effect
    const chorus = this._createChorusEffect();
    
    // Connect audio graph
    source.connect(filter);
    filter.connect(chorus.input);
    chorus.output.connect(convolver);
    convolver.connect(panner);
    panner.connect(gainNode);
    gainNode.connect(this.state.audioContext.destination);
    
    // Automate parameters
    if (options.filterSweep) {
      filter.frequency.setValueAtTime(options.filterSweep.start || 500, this.state.audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(
        options.filterSweep.end || 4000, 
        this.state.audioContext.currentTime + (options.filterSweep.duration || 1)
      );
    }
    
    if (options.fadeOut) {
      gainNode.gain.setValueAtTime(options.volume || 0.5, this.state.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.001, 
        this.state.audioContext.currentTime + (options.fadeOut || 1)
      );
    }
    
    // Start playback
    source.start();
    
    // Return cleanup function
    return () => {
      source.stop();
      source.disconnect();
      filter.disconnect();
      chorus.input.disconnect();
      chorus.output.disconnect();
      convolver.disconnect();
      panner.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * Create a simple chorus effect
   */
  _createChorusEffect() {
    const ctx = this.state.audioContext;
    
    // Create nodes
    const input = ctx.createGain();
    const output = ctx.createGain();
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    const delay = ctx.createDelay();
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    
    // Set values
    dry.gain.value = 0.7;
    wet.gain.value = 0.3;
    delay.delayTime.value = 0.025;
    depth.gain.value = 0.005;
    lfo.frequency.value = 0.5;
    
    // Connect nodes
    input.connect(dry);
    dry.connect(output);
    input.connect(delay);
    lfo.connect(depth);
    depth.connect(delay.delayTime);
    delay.connect(wet);
    wet.connect(output);
    
    // Start LFO
    lfo.start(0);
    
    return {
      input: input,
      output: output
    };
  }

  /**
   * Set up worlds and navigation with enhanced features
   */
  _setupWorlds() {
    // Find all world sections
    const allWorlds = Array.from(document.querySelectorAll(this.config.worldSelector));
    
    if (allWorlds.length === 0) {
      console.warn('DimensionalWorlds: No worlds found');
      return;
    }
    
    // Process each world
    allWorlds.forEach((world, index) => {
      this._initializeWorld(world, index);
    });
    
    // Create navigation if enabled
    if (this.config.createNav) {
      this._createNavigation();
    }
    
    // Create portal effects
    this._initPortalEffects();
    
    // Setup special effects for new worlds
    this._setupWorldSpecialEffects();
    
    // Show the initial world
    const initialWorldId = this.config.initialWorldId || (this.state.worlds.length > 0 ? this.state.worlds[0].id : null);
    if (initialWorldId) {
      this.navigateToWorld(initialWorldId, { immediate: true });
    }
    
    // Preload worlds if enabled
    if (this.config.preloadWorlds) {
      this._preloadWorldsContent();
    }
    
    console.log(`DimensionalWorlds: Found ${this.state.worlds.length} worlds`);
  }

  /**
   * Setup special effects for specific world types
   */
  _setupWorldSpecialEffects() {
    // Setup ethereal world particles
    const etherealWorld = this.state.worlds.find(world => world.type === 'ethereal');
    if (etherealWorld) {
      this._createEtherealParticles(etherealWorld);
    }
    
    // Setup fractal world animations
    const fractalWorld = this.state.worlds.find(world => world.type === 'fractal');
    if (fractalWorld) {
      this._setupFractalAnimations(fractalWorld);
    }
  }

  /**
   * Create ethereal particles effect
   */
  _createEtherealParticles(world) {
    const container = document.getElementById('ethereal-particles');
    if (!container) return;
    
    // Create particles
    const particleCount = 30;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'ethereal-particle';
      
      // Random properties
      const size = Math.random() * 80 + 40;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 10;
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.animationDelay = `${delay}s`;
      particle.style.animationDuration = `${duration}s`;
      
      container.appendChild(particle);
      particles.push(particle);
    }
    
    // Store reference
    this.state.particleSystems.ethereal = {
      container: container,
      particles: particles
    };
  }

  /**
   * Setup fractal world animations
   */
  _setupFractalAnimations(world) {
    // Additional fractal animations could be added here
    const fractalElements = document.querySelectorAll('.fractal-element');
    
    fractalElements.forEach((element, index) => {
      // Add random animation delays for more organic feel
      const delay = Math.random() * 5;
      element.style.animationDelay = `${delay}s`;
    });
  }

  /**
   * Update particle systems on resize or world change
   */
  _updateParticleSystems() {
    // Update ethereal particles
    if (this.state.particleSystems.ethereal) {
      // Could resize or adjust particles here if needed
    }
  }

  /**
   * Initialize portal transition effects
   */
  _initPortalEffects() {
    // Find all portal buttons
    const portalButtons = document.querySelectorAll('.portal-button');
    
    portalButtons.forEach(button => {
      // Store references
      this.state.portalButtons.push(button);
      
      // Add hover effect for advanced portals
      if (button.classList.contains('advanced-portal')) {
        button.addEventListener('mouseenter', () => {
          this._createPortalHoverEffect(button);
        });
      }
    });
  }

  /**
   * Create hover effect for portal buttons
   */
  _createPortalHoverEffect(button) {
    // Only create effect if not already transitioning
    if (this.state.transitioning) return;
    
    // Add subtle audio feedback
    if (this.state.audioContext && this.config.enableAudio) {
      const ctx = this.state.audioContext;
      
      // Resume context if needed
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // Create oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      // Set properties
      osc.type = 'sine';
      osc.frequency.value = 300;
      gain.gain.value = 0;
      filter.type = 'bandpass';
      filter.frequency.value = 1000;
      filter.Q.value = 2;
      
      // Connect
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      // Envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.5);
      
      // Start and stop
      osc.start();
      setTimeout(() => {
        osc.stop();
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      }, 500);
    }
  }

  /**
   * Preload content for worlds to improve transition performance
   */
  _preloadWorldsContent() {
    // Mark all worlds for preloading
    this.state.worlds.forEach(world => {
      // Set priority for preloading
      const priority = this._getWorldPreloadPriority(world);
      
      // Schedule preloading based on priority
      setTimeout(() => {
        this._preloadWorldContent(world);
      }, priority * 300); // Stagger preloading to avoid overloading
    });
  }

  /**
   * Determine preload priority for a world (lower = higher priority)
   */
  _getWorldPreloadPriority(world) {
    // Start world and connected worlds have higher priority
    if (world.id === this.config.initialWorldId) {
      return 0; // Highest priority
    }
    
    // Find connected worlds to the initial world
    const initialWorld = this.state.worlds.find(w => w.id === this.config.initialWorldId);
    if (initialWorld) {
      const connectedWorlds = this._findConnectedWorlds(initialWorld.id);
      if (connectedWorlds.includes(world.id)) {
        return 1; // High priority
      }
    }
    
    // Default priority based on index
    return 2 + world.index * 0.5;
  }

  /**
   * Find worlds connected to a given world through portal buttons
   */
  _findConnectedWorlds(worldId) {
    const world = document.getElementById(worldId);
    if (!world) return [];
    
    // Find portal buttons in this world
    const portalButtons = world.querySelectorAll('.portal-button');
    const connectedWorldIds = [];
    
    portalButtons.forEach(button => {
      if (button.dataset.worldTarget) {
        connectedWorldIds.push(button.dataset.worldTarget);
      }
    });
    
    return connectedWorldIds;
  }

  /**
   * Preload content for a single world
   */
  _preloadWorldContent(world) {
    // If world is already visible, no need to preload
    if (world.element.style.display === 'block') return;
    
    // Mark as preloading
    world.isPreloading = true;
    
    // Temporarily make world visible but hidden to trigger content loading
    world.element.style.display = 'block';
    world.element.style.opacity = '0';
    world.element.style.transform = 'translateY(100vh)'; // Move offscreen
    world.element.style.pointerEvents = 'none';
    
    // Load world-specific assets
    this._loadWorldAssets(world);
    
    // Mark as preloaded after a delay
    setTimeout(() => {
      if (world !== this.state.currentWorld) {
        // Hide again if not current world
        world.element.style.display = 'none';
        world.element.style.transform = '';
      }
      world.isPreloaded = true;
      world.isPreloading = false;
      
      if (this.config.debugMode) {
        console.log(`DimensionalWorlds: Preloaded world "${world.id}"`);
      }
    }, 500);
  }

  /**
   * Load assets specific to a world type
   */
  _loadWorldAssets(world) {
    // Different loading strategies for different world types
    switch(world.type) {
      case 'ethereal':
        // Ensure particles are initialized
        if (!this.state.particleSystems.ethereal) {
          this._createEtherealParticles(world);
        }
        break;
        
      case 'fractal':
        // Initialize fractal animations
        this._setupFractalAnimations(world);
        break;
        
      default:
        // Generic asset loading for other world types
        break;
    }
  }

  /**
   * Initialize a world with type and config
   */
  _initializeWorld(worldElement, index) {
    // Skip if element already processed
    if (worldElement.dataset.worldInitialized === 'true') return;
    
    // Get world ID
    const worldId = worldElement.id || `world-${index}`;
    
    // If no ID, assign one
    if (!worldElement.id) {
      worldElement.id = worldId;
    }
    
    // Determine world type based on class or data attribute
    let worldType = 'generic';
    let worldTheme = 'vaporwave';
    
    // Check classes against known types
    for (const className of worldElement.classList) {
      if (this.state.worldTypeMap[className]) {
        worldType = this.state.worldTypeMap[className].type;
        worldTheme = this.state.worldTypeMap[className].colorScheme;
        break;
      }
    }
    
    // Allow override via data attributes
    if (worldElement.dataset.worldType) {
      worldType = worldElement.dataset.worldType;
    }
    
    if (worldElement.dataset.worldTheme) {
      worldTheme = worldElement.dataset.worldTheme;
    }
    
    // Add dimension world class
    worldElement.classList.add('dimension-world');
    worldElement.classList.add(`world-${worldType}`);
    
    // Configure world styles
    worldElement.style.position = 'absolute';
    worldElement.style.top = '0';
    worldElement.style.left = '0';
    worldElement.style.width = '100%';
    worldElement.style.height = '100%';
    worldElement.style.display = 'none';
    worldElement.style.opacity = '0';
    worldElement.style.transition = 'opacity 0.5s ease';
    
    // Add world info to state
    this.state.worlds.push({
      id: worldId,
      element: worldElement,
      type: worldType,
      theme: worldTheme,
      index: index,
      isPreloaded: false
    });
    
    // Mark as initialized
    worldElement.dataset.worldInitialized = 'true';
  }

  /**
   * Create navigation UI with enhanced design
   */
  _createNavigation() {
    // Create navigation container
    const navContainer = document.createElement('div');
    navContainer.id = this.config.navigationContainerId;
    navContainer.className = 'dimensional-navigation';
    
    // Create navigation items for each world
    this.state.worlds.forEach(world => {
      const navItem = document.createElement('div');
      navItem.className = 'nav-item';
      navItem.dataset.worldId = world.id;
      
      // Format world type name
      let displayName = world.type.charAt(0).toUpperCase() + world.type.slice(1);
      
      // Handle special names
      if (world.type === 'tech') displayName = 'Technosphere';
      if (world.type === 'cover') displayName = 'Nexus';
      if (world.type === 'lore') displayName = 'Archives';
      
      navItem.textContent = displayName;
      
      // Add click event
      navItem.addEventListener('click', () => {
        this.navigateToWorld(world.id);
      });
      
      // Store nav item
      this.state.navItems.push(navItem);
      navContainer.appendChild(navItem);
    });
    
    document.body.appendChild(navContainer);
    this.state.navContainer = navContainer;
    
    return navContainer;
  }

  /**
   * Navigate to a specific world by ID
   */
  navigateToWorld(worldId, options = {}) {
    const immediate = options.immediate || false;
    
    // Find the target world
    const targetWorld = this.state.worlds.find(world => world.id === worldId);
    if (!targetWorld) {
      console.error(`DimensionalWorlds: World "${worldId}" not found`);
      return false;
    }
    
    // Skip if already on this world or transitioning
    if (this.state.currentWorld === targetWorld || (this.state.transitioning && !immediate)) {
      return false;
    }
    
    // Update previous and current world
    this.state.previousWorld = this.state.currentWorld;
    this.state.currentWorld = targetWorld;
    
    // If immediate switch is requested, skip transition
    if (immediate) {
      if (this.state.previousWorld) {
        this.state.previousWorld.element.style.display = 'none';
        this.state.previousWorld.element.style.opacity = '0';
      }
      targetWorld.element.style.display = 'block';
      targetWorld.element.style.opacity = '1';
      targetWorld.element.style.transform = '';
      targetWorld.element.style.pointerEvents = 'auto';
      
      // Update HyperAV if available
      if (this.state.hyperAVInstance && this.config.useHyperAV) {
        this.state.hyperAVInstance.activateWorld(targetWorld.type);
      }
      
      // Update navigation
      this._updateNavigation();
      
      return true;
    }
    
    // Trigger dimensional transition
    this._triggerDimensionalTransition(this.state.previousWorld, targetWorld);
    
    return true;
  }

  /**
   * Trigger a dimensional transition between worlds
   */
  _triggerDimensionalTransition(fromWorld, toWorld) {
    // Prevent concurrent transitions
    if (this.state.transitioning) return;
    this.state.transitioning = true;
    
    // Show loading indicator if enabled
    if (this.config.showLoadingIndicator) {
      this._showLoadingIndicator(true);
    }
    
    // Get world information
    const fromId = fromWorld ? fromWorld.id : null;
    const fromType = fromWorld ? fromWorld.type : null;
    const toId = toWorld.id;
    const toType = toWorld.type;
    
    // Show the transition overlay
    const overlay = this.state.transitionOverlay.element;
    overlay.style.opacity = '1';
    
    // Play world-specific sounds
    if (this.config.enableAudio) {
      // Play exit sound for previous world
      if (fromWorld) {
        this._playTransitionSound('exit', {
          pan: -0.3,
          volume: 0.4,
          filterSweep: {
            start: 4000,
            end: 800,
            duration: 1
          }
        });
      }
      
      // Play transition sound
      this._playTransitionSound('enter', {
        volume: 0.5,
        filterSweep: {
          start: 800,
          end: 3000,
          duration: 1.5
        }
      });
      
      // Schedule world-specific ambient sound
      if (toWorld.type === 'ethereal' || toWorld.type === 'fractal') {
        // Schedule special world sounds
        setTimeout(() => {
          this._playTransitionSound(toWorld.type, {
            volume: 0.3,
            fadeOut: 3
          });
        }, 1000);
      }
    }
    
    // If HyperAV is available, integrate with the transition
    if (this.state.hyperAVInstance && this.config.useHyperAV) {
      // Prepare next world's environment
      this.state.hyperAVInstance.activateWorld(toWorld.type);
    }
    
    // If world hasn't been preloaded, display it now
    if (!toWorld.isPreloaded && !toWorld.isPreloading) {
      toWorld.element.style.display = 'block';
      toWorld.element.style.opacity = '0';
      toWorld.element.style.pointerEvents = 'none';
      
      // Load world-specific assets
      this._loadWorldAssets(toWorld);
    } else {
      // If it was preloaded or is preloading, make sure it's visible
      toWorld.element.style.display = 'block';
      toWorld.element.style.opacity = '0';
      toWorld.element.style.transform = '';
      toWorld.element.style.pointerEvents = 'none';
    }
    
    // Start dimensional transition animation
    this._animateDimensionalTransition(fromWorld, toWorld, () => {
      // Transition complete
      
      // If coming from a world, hide it
      if (fromWorld) {
        fromWorld.element.style.display = 'none';
        fromWorld.element.style.opacity = '0';
      }
      
      // Show the new world
      toWorld.element.style.display = 'block';
      toWorld.element.style.opacity = '1';
      toWorld.element.style.pointerEvents = 'auto';
      
      // Hide the transition overlay
      overlay.style.opacity = '0';
      
      // Hide loading indicator
      if (this.config.showLoadingIndicator) {
        this._showLoadingIndicator(false);
      }
      
      // Play arrival sound
      if (this.config.enableAudio) {
        this._playTransitionSound('arrival', {
          volume: 0.4,
          pan: 0.3
        });
      }
      
      // Update navigation
      this._updateNavigation();
      
      // Clear transition state
      this.state.transitioning = false;
      
      if (this.config.debugMode) {
        console.log(`Dimensional transition complete: ${fromId || 'none'} → ${toId}`);
      }
    });
    
    if (this.config.debugMode) {
      console.log(`Dimensional transition started: ${fromId || 'none'} → ${toId}`);
    }
  }

  /**
   * Animate the dimensional transition effect with enhanced visuals
   */
  _animateDimensionalTransition(fromWorld, toWorld, onComplete) {
    const canvas = this.state.transitionOverlay.canvas;
    const ctx = this.state.transitionOverlay.context;
    const startTime = performance.now();
    const duration = this.config.transitionDuration;
    
    // Determine colors based on world themes
    const fromTheme = fromWorld ? fromWorld.theme : 'vaporwave';
    const toTheme = toWorld.theme;
    
    // Determine colors based on themes
    const colorMap = {
      vaporwave: { primary: '#ff00ff', secondary: '#00ffff', tertiary: '#ff33cc' },
      editorial: { primary: '#00eeff', secondary: '#ff00aa', tertiary: '#8a2be2' },
      quantum: { primary: '#00ff00', secondary: '#ffff00', tertiary: '#00ffcc' },
      cyber: { primary: '#00ffff', secondary: '#ff0088', tertiary: '#00ff88' },
      cosmic: { primary: '#8000ff', secondary: '#0088ff', tertiary: '#ff00ff' },
      culture: { primary: '#cc00ff', secondary: '#ffcc00', tertiary: '#00ffaa' },
      tech: { primary: '#00ffcc', secondary: '#ff00aa', tertiary: '#00ccff' },
      interview: { primary: '#ffcc00', secondary: '#cc00ff', tertiary: '#00ffaa' },
      lore: { primary: '#8a2be2', secondary: '#00eeff', tertiary: '#ff33cc' },
      ethereal: { primary: '#bf00ff', secondary: '#ff99ff', tertiary: '#cc66ff' },
      fractal: { primary: '#00ccff', secondary: '#0066ff', tertiary: '#00ffcc' },
      chronosynth: { primary: '#9900cc', secondary: '#cc00ff', tertiary: '#6600ff' },
      neuromantic: { primary: '#ff0066', secondary: '#00eeff', tertiary: '#cc0066' }
    };
    
    const fromColors = colorMap[fromTheme] || colorMap.vaporwave;
    const toColors = colorMap[toTheme] || colorMap.vaporwave;
    
    // Determine transition type based on worlds
    const transitionType = this._determineTransitionType(fromWorld, toWorld);
    
    // Select the appropriate transition animation
    switch (transitionType) {
      case 'portal':
        this._animatePortalTransition(ctx, canvas.width, canvas.height, fromColors, toColors, startTime, duration, onComplete);
        break;
      case 'fractal':
        this._animateFractalTransition(ctx, canvas.width, canvas.height, fromColors, toColors, startTime, duration, onComplete);
        break;
      case 'ethereal':
        this._animateEtherealTransition(ctx, canvas.width, canvas.height, fromColors, toColors, startTime, duration, onComplete);
        break;
      case 'chronosynth':
        this._animateChronosynthTransition(ctx, canvas.width, canvas.height, fromColors, toColors, startTime, duration, onComplete);
        break;
      case 'neuromantic':
        this._animateNeuromanticTransition(ctx, canvas.width, canvas.height, fromColors, toColors, startTime, duration, onComplete);
        break;
      default:
        this._animateStandardTransition(ctx, canvas.width, canvas.height, fromColors, toColors, startTime, duration, onComplete);
    }
  }

  /**
   * Determine the transition type based on source and target worlds
   */
  _determineTransitionType(fromWorld, toWorld) {
    // If transitioning to chronosynth world, use chronosynth transition
    if (toWorld.type === 'chronosynth') {
      return 'chronosynth';
    }
    
    // If transitioning to neuromantic world, use neuromantic transition
    if (toWorld.type === 'neuromantic') {
      return 'neuromantic';
    }
    
    // If either world is ethereal, use ethereal transition
    if (fromWorld && fromWorld.type === 'ethereal' || toWorld.type === 'ethereal') {
      return 'ethereal';
    }
    
    // If either world is fractal, use fractal transition
    if (fromWorld && fromWorld.type === 'fractal' || toWorld.type === 'fractal') {
      return 'fractal';
    }
    
    // Use portal transition for advanced portal buttons
    if (fromWorld) {
      const portalButtons = fromWorld.element.querySelectorAll('.portal-button.advanced-portal');
      for (const button of portalButtons) {
        if (button.dataset.worldTarget === toWorld.id) {
          return 'portal';
        }
      }
    }
    
    // Default transition
    return 'standard';
  }

  /**
   * Animate standard dimensional transition
   */
  _animateStandardTransition(ctx, width, height, fromColors, toColors, startTime, duration, onComplete) {
    // Create portal animation effect
    const animate = (timestamp) => {
      // Calculate progress (0 to 1)
      const progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw dimensional transition effect
      this._drawDimensionalEffect(ctx, width, height, fromColors, toColors, progress);
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        onComplete();
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }

  /**
   * Animate portal transition effect
   */
  _animatePortalTransition(ctx, width, height, fromColors, toColors, startTime, duration, onComplete) {
    // Portal transition parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(width * width + height * height) / 1.5;
    
    // Create animation frame function
    const animate = (timestamp) => {
      // Calculate progress (0 to 1)
      const progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Step 1: Draw background rays
      ctx.save();
      ctx.translate(centerX, centerY);
      
      const rayCount = 24;
      const maxRayLength = maxRadius * 1.5;
      ctx.strokeStyle = this._interpolateColor(fromColors.secondary, toColors.primary, progress);
      ctx.lineWidth = 3;
      
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const rayLength = maxRayLength * Math.pow(progress, 0.5) * (0.5 + Math.sin(progress * Math.PI * 3 + i) * 0.5);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
        ctx.globalAlpha = 0.2 + Math.sin(progress * Math.PI * 2 + i) * 0.1;
        ctx.stroke();
      }
      
      // Step 2: Draw portal rings
      const ringCount = 6;
      for (let i = 0; i < ringCount; i++) {
        const ringProgress = (progress + i / ringCount) % 1;
        const ringRadius = maxRadius * Math.pow(ringProgress, 2) * (1 + Math.sin(progress * Math.PI * 3) * 0.1);
        const ringWidth = 10 + Math.sin(progress * Math.PI * 5 + i) * 5;
        
        ctx.beginPath();
        ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
        ctx.lineWidth = ringWidth;
        ctx.strokeStyle = this._interpolateColor(
          i % 2 === 0 ? fromColors.primary : fromColors.tertiary,
          i % 2 === 0 ? toColors.primary : toColors.tertiary,
          ringProgress
        );
        ctx.globalAlpha = 0.2 + 0.3 * Math.sin(Math.PI * ringProgress);
        ctx.stroke();
      }
      
      // Step 3: Draw central portal glow
      const portalRadius = maxRadius * 0.3 * Math.pow(progress, 0.7);
      const portalGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, portalRadius);
      
      portalGlow.addColorStop(0, `${toColors.primary}ff`);
      portalGlow.addColorStop(0.6, `${toColors.secondary}77`);
      portalGlow.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = portalGlow;
      ctx.globalAlpha = Math.min(1, progress * 2);
      ctx.beginPath();
      ctx.arc(0, 0, portalRadius, 0, Math.PI * 2);
      ctx.fill();
      
      // Step 4: Draw lightning-like energy bolts from center
      if (progress > 0.4) {
        const boltProgress = (progress - 0.4) / 0.6;
        const boltCount = 8;
        
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7 * boltProgress;
        
        for (let i = 0; i < boltCount; i++) {
          const boltAngle = (i / boltCount) * Math.PI * 2 + progress * Math.PI;
          const boltLength = portalRadius + (maxRadius - portalRadius) * boltProgress;
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          
          // Create jagged lightning path
          let x = 0;
          let y = 0;
          const segments = 8;
          const maxDeviation = 30 * boltProgress;
          
          for (let j = 1; j <= segments; j++) {
            const segmentProgress = j / segments;
            const distanceFromCenter = boltLength * segmentProgress;
            
            // Calculate straight-line position
            const straightX = Math.cos(boltAngle) * distanceFromCenter;
            const straightY = Math.sin(boltAngle) * distanceFromCenter;
            
            // Add random deviation, more as we get further from center
            const deviation = maxDeviation * segmentProgress;
            const deviationAngle = boltAngle + Math.PI/2 + (Math.random() - 0.5) * Math.PI;
            
            x = straightX + Math.cos(deviationAngle) * deviation * Math.sin(progress * Math.PI * 10 + i + j);
            y = straightY + Math.sin(deviationAngle) * deviation * Math.sin(progress * Math.PI * 10 + i + j);
            
            ctx.lineTo(x, y);
          }
          
          // Draw using gradient stroke
          const gradient = ctx.createLinearGradient(0, 0, x, y);
          gradient.addColorStop(0, toColors.primary);
          gradient.addColorStop(1, toColors.secondary);
          ctx.strokeStyle = gradient;
          ctx.stroke();
        }
      }
      
      ctx.restore();
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        onComplete();
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }

  /**
   * Animate ethereal transition effect
   */
  _animateEtherealTransition(ctx, width, height, fromColors, toColors, startTime, duration, onComplete) {
    // Parameters
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create animation frame function
    const animate = (timestamp) => {
      // Calculate progress (0 to 1)
      const progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Background glow
      const bgGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, width
      );
      
      bgGradient.addColorStop(0, `${toColors.primary}33`);
      bgGradient.addColorStop(0.5, `${toColors.secondary}11`);
      bgGradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw ethereal light beams
      ctx.save();
      ctx.translate(centerX, centerY);
      
      const beamCount = 12;
      for (let i = 0; i < beamCount; i++) {
        const angle = (i / beamCount) * Math.PI * 2 + progress * Math.PI;
        const innerRadius = width * 0.1 * (1 + Math.sin(progress * Math.PI * 2));
        const outerRadius = width * 0.8 * Math.pow(progress, 0.5);
        
        // Create beam gradient
        const beamGradient = ctx.createLinearGradient(
          Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius,
          Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius
        );
        
        beamGradient.addColorStop(0, `${toColors.primary}cc`);
        beamGradient.addColorStop(0.5, `${toColors.secondary}66`);
        beamGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        // Draw beam
        ctx.beginPath();
        
        // Beam width varies with angle
        const beamWidth = Math.PI / 15 * (1 + 0.5 * Math.sin(angle * 3 + progress * Math.PI * 5));
        
        ctx.moveTo(
          Math.cos(angle - beamWidth) * innerRadius,
          Math.sin(angle - beamWidth) * innerRadius
        );
        
        ctx.lineTo(
          Math.cos(angle + beamWidth) * innerRadius,
          Math.sin(angle + beamWidth) * innerRadius
        );
        
        ctx.lineTo(
          Math.cos(angle + beamWidth * 2) * outerRadius,
          Math.sin(angle + beamWidth * 2) * outerRadius
        );
        
        ctx.lineTo(
          Math.cos(angle - beamWidth * 2) * outerRadius,
          Math.sin(angle - beamWidth * 2) * outerRadius
        );
        
        ctx.closePath();
        
        ctx.globalAlpha = 0.2 * (1 + Math.sin(angle * 2 + progress * Math.PI * 3));
        ctx.fillStyle = beamGradient;
        ctx.fill();
      }
      
      // Draw energy particles
      const particleCount = 100;
      const maxParticleSize = 8;
      
      for (let i = 0; i < particleCount; i++) {
        const particleProgress = (progress + i / particleCount) % 1;
        const distance = width * 0.7 * Math.pow(particleProgress, 2);
        const angle = (i / particleCount) * Math.PI * 20 + progress * Math.PI * 10;
        
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        const size = maxParticleSize * (0.5 + 0.5 * Math.sin(particleProgress * Math.PI));
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? toColors.primary : toColors.tertiary;
        ctx.globalAlpha = 0.7 * (1 - particleProgress);
        ctx.fill();
      }
      
      // Draw central orb
      const orbSize = width * 0.15 * (0.5 + 0.5 * Math.sin(progress * Math.PI));
      const orbGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, orbSize);
      
      orbGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      orbGradient.addColorStop(0.2, `${toColors.tertiary}cc`);
      orbGradient.addColorStop(0.7, `${toColors.primary}66`);
      orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = orbGradient;
      ctx.beginPath();
      ctx.arc(0, 0, orbSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw pulsing rings
      const ringCount = 5;
      
      for (let i = 0; i < ringCount; i++) {
        const ringProgress = (progress + i / ringCount) % 1;
        const ringSize = orbSize * 1.2 + width * 0.3 * Math.pow(ringProgress, 2);
        
        ctx.beginPath();
        ctx.arc(0, 0, ringSize, 0, Math.PI * 2);
        ctx.lineWidth = 2 + 3 * Math.sin(ringProgress * Math.PI);
        ctx.strokeStyle = this._interpolateColor(toColors.primary, toColors.secondary, ringProgress);
        ctx.globalAlpha = 0.5 * (1 - ringProgress);
        ctx.stroke();
      }
      
      ctx.restore();
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        onComplete();
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }

  /**
   * Animate fractal transition effect
   */
  _animateFractalTransition(ctx, width, height, fromColors, toColors, startTime, duration, onComplete) {
    // Parameters
    const centerX = width / 2;
    const centerY = height / 2;
    const maxSize = Math.min(width, height) * 0.8;
    
    // Create animation frame function
    const animate = (timestamp) => {
      // Calculate progress (0 to 1)
      const progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw fractal background
      ctx.fillStyle = 'rgba(0, 10, 30, 0.3)';
      ctx.fillRect(0, 0, width, height);
      
      // Draw recursive fractal
      ctx.save();
      ctx.translate(centerX, centerY);
      
      // Rotate overall pattern
      ctx.rotate(progress * Math.PI * 2);
      
      // Draw fractal pattern
      this._drawFractalPattern(
        ctx, 
        0, 0, 
        maxSize * Math.pow(progress, 0.5), 
        0, 
        4, // Max depth
        toColors,
        progress
      );
      
      ctx.restore();
      
      // Continue animation if not complete
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete
        onComplete();
      }
    };
    
    // Start animation
    requestAnimationFrame(animate);
  }

  /**
   * Draw recursive fractal pattern
   */
  _drawFractalPattern(ctx, x, y, size, depth, maxDepth, colors, progress) {
    // Base color based on depth
    const depthRatio = depth / maxDepth;
    const color = this._interpolateColor(
      colors.primary, 
      colors.tertiary, 
      depthRatio
    );
    
    // Draw current shape
    ctx.save();
    ctx.translate(x, y);
    
    // Rotate each level differently
    ctx.rotate(depth * Math.PI / 4 + progress * Math.PI * (depth + 1));
    
    // Draw shape - alternating between square and circle
    ctx.globalAlpha = 0.7 - 0.5 * depthRatio;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * (1 - depthRatio);
    
    if (depth % 2 === 0) {
      // Rectangle
      ctx.strokeRect(-size/2, -size/2, size, size);
    } else {
      // Circle
      ctx.beginPath();
      ctx.arc(0, 0, size/2, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.restore();
    
    // Stop recursion at max depth
    if (depth >= maxDepth) return;
    
    // Draw recursive patterns
    const newSize = size * 0.5;
    const childCount = 3;
    
    for (let i = 0; i < childCount; i++) {
      // Calculate child position
      const angle = (i / childCount) * Math.PI * 2 + depth * Math.PI / 6 + progress * Math.PI * 2;
      const distance = size * 0.4;
      const newX = x + Math.cos(angle) * distance;
      const newY = y + Math.sin(angle) * distance;
      
      // Draw child
      this._drawFractalPattern(
        ctx,
        newX,
        newY,
        newSize,
        depth + 1,
        maxDepth,
        colors,
        progress
      );
    }
  }

  /**
   * Draw enhanced dimensional transition effect
   */
  _drawDimensionalEffect(ctx, width, height, fromColors, toColors, progress) {
    // Center of effect
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Enhanced dimensional rift effect
    ctx.save();
    
    // Center everything
    ctx.translate(centerX, centerY);
    
    // Draw background glow
    const bgGlow = ctx.createRadialGradient(
      0, 0, 0,
      0, 0, width
    );
    
    // Interpolate colors
    const bgColor = this._interpolateColor(fromColors.primary, toColors.primary, progress);
    
    bgGlow.addColorStop(0, `${bgColor}33`);
    bgGlow.addColorStop(0.7, `${bgColor}11`);
    bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = bgGlow;
    ctx.fillRect(-width, -height, width * 2, height * 2);
    
    // Draw dimensional layers (rings)
    const layerCount = 5;
    for (let i = 0; i < layerCount; i++) {
      const layerProgress = (progress + i / layerCount) % 1;
      const layerSize = width * 0.8 * Math.pow(layerProgress, 2) * (1 + Math.sin(progress * Math.PI * 2) * 0.1);
      
      // Create dimensional field
      const dimensionalGradient = ctx.createRadialGradient(
        0, 0, layerSize * 0.8,
        0, 0, layerSize
      );
      
      // Interpolate colors for dimensional field
      const primaryColor = this._interpolateColor(fromColors.primary, toColors.primary, layerProgress);
      const secondaryColor = this._interpolateColor(fromColors.secondary, toColors.secondary, 1 - layerProgress);
      const tertiaryColor = this._interpolateColor(fromColors.tertiary, toColors.tertiary, layerProgress);
      
      dimensionalGradient.addColorStop(0, `${primaryColor}00`);
      dimensionalGradient.addColorStop(0.7, `${secondaryColor}33`);
      dimensionalGradient.addColorStop(0.9, `${tertiaryColor}55`);
      dimensionalGradient.addColorStop(1, `rgba(0,0,0,0)`);
      
      ctx.fillStyle = dimensionalGradient;
      
      // Draw distorted dimensional field
      ctx.save();
      ctx.rotate(layerProgress * Math.PI * 2);
      
      ctx.beginPath();
      
      // Add distortion to the shape
      const segments = 64;
      for (let j = 0; j <= segments; j++) {
        const angle = (j / segments) * Math.PI * 2;
        
        // Add distortion
        const angleFactor = Math.sin(angle * 5 + progress * Math.PI * 4) * 0.1;
        const radiusFactor = Math.sin(angle * 3 + progress * Math.PI * 6) * 0.1;
        
        const x = Math.cos(angle + angleFactor) * layerSize * (1 + radiusFactor);
        const y = Math.sin(angle + angleFactor) * layerSize * (1 + radiusFactor);
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    
    // Draw energy tendrils
    const tendrilCount = 24;
    ctx.strokeStyle = this._interpolateColor(fromColors.secondary, toColors.secondary, progress);
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    
    for (let i = 0; i < tendrilCount; i++) {
      const tendrilAngle = (i / tendrilCount) * Math.PI * 2 + progress * Math.PI * 2;
      const tendrilLength = width * 0.7 * Math.pow(progress, 0.5) * (1 + Math.sin(progress * Math.PI * 5 + i) * 0.2);
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      
      // Create curved tendrils
      const control1Dist = tendrilLength * 0.3;
      const control2Dist = tendrilLength * 0.6;
      const angle1 = tendrilAngle + Math.sin(progress * 10) * 0.2;
      const angle2 = tendrilAngle - Math.sin(progress * 8) * 0.3;
      
      const ctrl1X = Math.cos(angle1) * control1Dist;
      const ctrl1Y = Math.sin(angle1) * control1Dist;
      
      const ctrl2X = Math.cos(angle2) * control2Dist;
      const ctrl2Y = Math.sin(angle2) * control2Dist;
      
      const endX = Math.cos(tendrilAngle) * tendrilLength;
      const endY = Math.sin(tendrilAngle) * tendrilLength;
      
      ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
      ctx.stroke();
    }
    
    // Draw central portal
    ctx.globalAlpha = 1;
    const portalSize = width * 0.15 * Math.pow(progress, 0.5) * (1 + Math.sin(progress * Math.PI * 3) * 0.1);
    const portalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, portalSize);
    
    // Portal colors
    portalGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    portalGradient.addColorStop(0.2, `${toColors.tertiary}cc`);
    portalGradient.addColorStop(0.6, `${toColors.primary}55`);
    portalGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    ctx.fillStyle = portalGradient;
    ctx.beginPath();
    ctx.arc(0, 0, portalSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Add flickering highlights
    if (Math.random() > 0.7) {
      ctx.globalAlpha = 0.4 * Math.random();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, portalSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  /**
   * Interpolate between two colors based on progress
   */
  _interpolateColor(color1, color2, progress) {
    // Handle string input
    if (typeof color1 === 'string') {
      color1 = color1.replace('#', '');
    }
    if (typeof color2 === 'string') {
      color2 = color2.replace('#', '');
    }
    
    // Convert hex colors to RGB
    const r1 = parseInt(color1.slice(0, 2), 16);
    const g1 = parseInt(color1.slice(2, 4), 16);
    const b1 = parseInt(color1.slice(4, 6), 16);
    
    const r2 = parseInt(color2.slice(0, 2), 16);
    const g2 = parseInt(color2.slice(2, 4), 16);
    const b2 = parseInt(color2.slice(4, 6), 16);
    
    // Interpolate RGB values
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Update navigation UI to reflect current world
   */
  _updateNavigation() {
    if (!this.state.navContainer) return;
    
    // Update all nav items
    this.state.navItems.forEach(navItem => {
      const isActive = navItem.dataset.worldId === this.state.currentWorld.id;
      
      // Highlight active item
      if (isActive) {
        navItem.style.backgroundColor = 'rgba(0, 60, 120, 0.8)';
        navItem.style.boxShadow = '0 0 15px rgba(0, 238, 255, 0.7)';
        navItem.style.color = '#ffffff';
        navItem.classList.add('active');
      } else {
        navItem.style.backgroundColor = 'rgba(0, 0, 30, 0.7)';
        navItem.style.boxShadow = 'none';
        navItem.style.color = '#cccccc';
        navItem.classList.remove('active');
      }
    });
  }

  /**
   * Clean up resources and event listeners
   */
  dispose() {
    // Remove nav container
    if (this.state.navContainer) {
      this.state.navContainer.remove();
    }
    
    // Remove transition overlay
    if (this.state.transitionOverlay && this.state.transitionOverlay.element) {
      this.state.transitionOverlay.element.remove();
    }
    
    // Remove loading indicator
    if (this.state.loadingIndicator) {
      this.state.loadingIndicator.remove();
    }
    
    // Close audio context
    if (this.state.audioContext) {
      this.state.audioContext.close();
    }
    
    // Clear all transition timers
    this.state.transitionTimers.forEach(timerId => {
      clearTimeout(timerId);
    });
    
    // Remove event listeners
    window.removeEventListener('resize', this._handleResize);
    document.removeEventListener('click', this._handlePortalButtonClick);
    
    console.log('DimensionalWorlds: Disposed');
  }
}

// Add enhanced stylesheet automatically
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance with advanced configuration
  window.dimensionalWorlds = new DimensionalWorlds({
    useHyperAV: true,
    enableAudio: true,
    createNav: true,
    useSpatialAudio: true,
    useAdvancedTransitions: true,
    showLoadingIndicator: true,
    preloadWorlds: true,
    debugMode: false
  });
  
  console.log('DimensionalWorlds: Enhanced module loaded');
  
  // Set up portal button click interaction
  const setupPortalButtonInteraction = () => {
    const portalButtons = document.querySelectorAll('.portal-button');
    
    portalButtons.forEach(button => {
      // Set role for accessibility
      button.setAttribute('role', 'button');
      button.setAttribute('tabindex', '0');
      
      // Add keyboard support
      button.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          
          // Get target world
          const targetWorldId = button.dataset.worldTarget;
          if (targetWorldId && window.dimensionalWorlds) {
            window.dimensionalWorlds.navigateToWorld(targetWorldId);
          }
        }
      });
    });
  };
  
  // Setup additional interactions
  setupPortalButtonInteraction();
});

// Expose class for modular usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DimensionalWorlds;
}