/**
 * UniversalHyperAV.js - v0.8
 * Extends HyperAV visualization from contained elements to full immersive environments
 * 
 * Enhancements in v0.8:
 * - Multi-world visualization system with 5 distinct world types
 * - Enhanced audio reactivity with spectrum-based effects
 * - Optimized shader performance for smoother transitions
 * - Advanced transition effects between worlds
 * - Improved mouse interactivity for immersive experience
 */

class UniversalHyperAV {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      containerId: options.containerId || 'hyperav-universal-container',
      zIndex: options.zIndex || -1,
      colorScheme: options.colorScheme || 'vaporwave',
      density: options.density || 0.7,
      intensity: options.intensity || 0.8,
      dimensionality: options.dimensionality || 4.0,
      renderMode: options.renderMode || 'background',
      audioReactive: options.audioReactive !== false,
      dynamicLighting: options.dynamicLighting !== false,
      worldEffects: options.worldEffects || {},
      activeWorld: options.activeWorld || 'default',
      transitionDuration: options.transitionDuration || 1500,
      worldConfigs: options.worldConfigs || {}
    };

    // State
    this.state = {
      container: null,
      canvas: null,
      gl: null,
      shaderManager: null,
      hypercubeCore: null,
      worlds: {},
      initialized: false,
      currentWorldName: null,
      previousWorldName: null,
      transitioning: false,
      audioContext: null,
      audioAnalyser: null,
      audioData: null,
      audioLevels: { bass: 0, mid: 0, high: 0 },
      mousePosition: { x: 0.5, y: 0.5 },
      frameId: null,
      callbacks: {
        onWorldChange: options.onWorldChange || null,
        onTransitionStart: options.onTransitionStart || null,
        onTransitionEnd: options.onTransitionEnd || null,
        onError: options.onError || null
      }
    };

    // Initialize
    if (options.autoInit !== false) {
      this.initialize();
    }
  }

  /**
   * Initialize the UniversalHyperAV system
   */
  initialize() {
    if (this.state.initialized) return;
    
    // Create container if it doesn't exist
    this._createContainer();
    
    // Initialize the WebGL context
    this._initWebGL();
    
    // Set up shader manager
    this._initShaderManager();
    
    // Create hypercube core
    this._initHypercubeCore();
    
    // Initialize audio analyzer if enabled
    if (this.config.audioReactive) {
      this._initAudioAnalyzer();
    }
    
    // Initialize event listeners
    this._initEventListeners();
    
    // Create default world configuration
    this._initDefaultWorld();
    
    // Mark as initialized
    this.state.initialized = true;
    
    // Start rendering
    this._startRendering();
    
    console.log('UniversalHyperAV: Initialized');
  }

  /**
   * Create container element for the visualization
   */
  _createContainer() {
    // Check if container exists
    let container = document.getElementById(this.config.containerId);
    
    // Create container if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.id = this.config.containerId;
      document.body.appendChild(container);
    }
    
    // Set container style
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = this.config.zIndex;
    container.style.pointerEvents = 'none';
    container.style.overflow = 'hidden';
    
    // Store container reference
    this.state.container = container;
  }

  /**
   * Initialize WebGL context
   */
  _initWebGL() {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    this.state.container.appendChild(canvas);
    
    // Get WebGL context
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      const error = new Error('WebGL not supported');
      console.error('UniversalHyperAV: WebGL not supported');
      if (this.state.callbacks.onError) {
        this.state.callbacks.onError(error);
      }
      return;
    }
    
    this.state.canvas = canvas;
    this.state.gl = gl;
    
    // Handle window resize
    window.addEventListener('resize', this._handleResize.bind(this));
  }

  /**
   * Initialize shader manager
   */
  _initShaderManager() {
    if (!this.state.gl) return;
    
    // Create shader manager
    this.state.shaderManager = new ShaderManager(this.state.gl);
    
    // Register core shaders
    this._registerUniversalShaders();
  }

  /**
   * Register all shaders needed for universal visualization
   */
  _registerUniversalShaders() {
    const sm = this.state.shaderManager;
    if (!sm) return;
    
    // Register vertex shaders for different geometries
    sm.registerVertexShader('hypercube', `
      attribute vec4 a_position;
      varying vec2 v_texCoord;
      void main() {
        gl_Position = a_position;
        v_texCoord = a_position.xy * 0.5 + 0.5;
      }
    `);
    
    // Register fragment shaders for different environments
    sm.registerFragmentShader('universal_environment', `
      precision highp float;
      varying vec2 v_texCoord;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform float u_dimension;
      uniform float u_morphFactor;
      uniform float u_rotationSpeed;
      uniform float u_universeModifier;
      uniform float u_patternIntensity;
      uniform float u_gridDensity;
      uniform float u_audioBass;
      uniform float u_audioMid;
      uniform float u_audioHigh;
      uniform vec3 u_primaryColor;
      uniform vec3 u_secondaryColor;
      uniform vec3 u_backgroundColor;
      uniform vec2 u_mousePosition;
      uniform float u_worldBlend;
      uniform float u_worldIntensity;
      
      // Pseudo-random function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      // Simplex noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
      
      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      // Hyperdimensional rotation matrix
      mat4 hyperRotation(float t) {
        float c1 = cos(t * u_rotationSpeed);
        float s1 = sin(t * u_rotationSpeed);
        float c2 = cos(t * u_rotationSpeed * 0.7);
        float s2 = sin(t * u_rotationSpeed * 0.7);
        float c3 = cos(t * u_rotationSpeed * 0.5 + u_audioBass);
        float s3 = sin(t * u_rotationSpeed * 0.5 + u_audioBass);
        
        return mat4(
          c1, -s1, 0.0, 0.0,
          s1, c1, 0.0, 0.0,
          0.0, 0.0, c2, -s2,
          0.0, 0.0, s2, c2
        ) * mat4(
          c3, 0.0, -s3, 0.0,
          0.0, 1.0, 0.0, 0.0,
          s3, 0.0, c3, 0.0,
          0.0, 0.0, 0.0, 1.0
        );
      }
      
      // Hypercube projection
      float hypercube(vec2 uv, float time) {
        // Transform UV to centered coordinate system
        vec2 p = (uv * 2.0 - 1.0) * u_resolution / min(u_resolution.x, u_resolution.y);
        
        // Scale by audio
        p *= 1.0 + u_audioBass * 0.2;
        
        // Apply mouse interaction
        vec2 mouseOffset = u_mousePosition * 2.0 - 1.0;
        p += mouseOffset * 0.1;
        
        // 4D position
        vec4 pos = vec4(p, 0.0, 0.0);
        
        // Add time-based offset for w component
        pos.w = sin(time * 0.5) * u_universeModifier;
        
        // Apply 4D rotation
        pos = hyperRotation(time) * pos;
        
        // Project from 4D to 3D with perspective
        float w = 1.0 / (2.0 - pos.w * u_dimension * 0.2);
        vec3 proj = vec3(pos.x * w, pos.y * w, pos.z * w);
        
        // Calculate distance from origin in 3D projected space
        float dist = length(proj);
        
        // Apply morphing based on time and audio
        float morph = u_morphFactor + u_audioMid * 0.3;
        
        // Create hypercube wireframe effect
        float size = 0.5 + u_audioMid * 0.2;
        float edge = size - abs(mod(dist - time * 0.1, size * 2.0) - size);
        edge = smoothstep(0.0, 0.1, edge) * smoothstep(0.2, 0.1, edge);
        
        // Apply grid pattern
        float grid = 0.0;
        for(float i=0.0; i<4.0; i+=1.0) {
          float d = abs(proj[int(i % 3.0)]);
          grid += smoothstep(0.02, 0.01, abs(mod(d * u_gridDensity, 1.0) - 0.5));
        }
        
        return edge * morph + grid * u_patternIntensity * (1.0 - morph);
      }
      
      // Quantum field effect
      float quantumField(vec2 uv, float time) {
        float scale = 10.0 * u_gridDensity;
        float intensity = u_patternIntensity + u_audioMid * 0.5;
        
        // Create grid effect
        vec2 grid = fract(uv * scale) - 0.5;
        float gridLines = smoothstep(0.05, 0.0, abs(grid.x)) + smoothstep(0.05, 0.0, abs(grid.y));
        
        // Add noise to create quantum fluctuations
        float noise = snoise(uv * scale + time * 0.2);
        
        // Modulate grid with noise
        float quantumEffect = gridLines * 0.3 + noise * intensity;
        
        // Add wave pattern
        float wave = sin((uv.x + uv.y) * 5.0 + time * 0.5) * 0.5 + 0.5;
        wave *= sin((uv.x - uv.y) * 3.0 - time * 0.3) * 0.5 + 0.5;
        
        return quantumEffect * wave * intensity;
      }
      
      void main() {
        // Normalized coordinates
        vec2 uv = v_texCoord;
        
        // Time with audio modulation
        float time = u_time + u_audioBass * 0.5;
        
        // Base hypercube visualization
        float hyperEffect = hypercube(uv, time);
        
        // Quantum field backdrop
        float quantumEffect = quantumField(uv, time);
        
        // Combine effects based on world blend
        float worldEffect = mix(hyperEffect, quantumEffect, u_worldBlend);
        
        // Apply world intensity
        worldEffect *= u_worldIntensity;
        
        // Calculate color mixing based on effect intensity
        vec3 color = mix(
          u_backgroundColor, 
          mix(u_primaryColor, u_secondaryColor, worldEffect), 
          worldEffect * 0.7
        );
        
        // Add audio-reactive glow
        float glow = u_audioBass * 0.3 + u_audioMid * 0.2 + u_audioHigh * 0.1;
        color += u_primaryColor * glow * 0.5;
        
        // Output final color
        gl_FragColor = vec4(color, 0.8 * worldEffect + 0.1);
      }
    `);
  }

  /**
   * Initialize HypercubeCore
   */
  _initHypercubeCore() {
    if (!this.state.gl || !this.state.shaderManager) return;
    
    // Create hypercube core
    this.state.hypercubeCore = new HypercubeCore(
      this.state.canvas, 
      this.state.shaderManager,
      {
        geometryType: 'hypercube',
        projectionMethod: 'universal_environment',
        shaderProgramName: 'universal_hyperav',
        dimensions: this.config.dimensionality,
        rotationSpeed: 0.2,
        universeModifier: 1.0,
        patternIntensity: this.config.intensity,
        gridDensity: 8.0,
        lineThickness: 0.03,
        colorScheme: this._getColorSchemeRGB(),
        callbacks: {
          onError: (error) => {
            console.error('UniversalHyperAV: HypercubeCore error', error);
            if (this.state.callbacks.onError) {
              this.state.callbacks.onError(error);
            }
          }
        }
      }
    );
  }

  /**
   * Convert hex color scheme to RGB for shaders
   */
  _getColorSchemeRGB() {
    const schemes = {
      vaporwave: {
        primary: [1.0, 0.1, 0.8],
        secondary: [0.0, 0.8, 1.0],
        background: [0.0, 0.0, 0.1]
      },
      quantum: {
        primary: [0.0, 1.0, 0.7],
        secondary: [1.0, 1.0, 0.0],
        background: [0.0, 0.0, 0.2]
      },
      cyber: {
        primary: [0.0, 1.0, 1.0],
        secondary: [1.0, 0.0, 0.5],
        background: [0.0, 0.0, 0.0]
      },
      cosmic: {
        primary: [0.5, 0.0, 1.0],
        secondary: [0.0, 0.5, 1.0],
        background: [0.05, 0.0, 0.1]
      }
    };
    
    return schemes[this.config.colorScheme] || schemes.vaporwave;
  }

  /**
   * Initialize audio analyzer for reactive effects
   */
  _initAudioAnalyzer() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.state.audioContext = new AudioContext();
      this.state.audioAnalyser = this.state.audioContext.createAnalyser();
      this.state.audioAnalyser.fftSize = 512;
      
      // Create data array for frequency analysis
      const bufferLength = this.state.audioAnalyser.frequencyBinCount;
      this.state.audioData = new Uint8Array(bufferLength);
      
      // If there's no audio source, create one with oscillator
      const dummyOsc = this.state.audioContext.createOscillator();
      dummyOsc.frequency.value = 0;
      dummyOsc.connect(this.state.audioAnalyser);
      dummyOsc.start();
      
      console.log('UniversalHyperAV: Audio analyzer initialized');
    } catch (error) {
      console.error('UniversalHyperAV: Audio analyzer initialization failed', error);
    }
  }

  /**
   * Update audio levels from analyzer with enhanced reactivity
   * - Improved frequency band separation for more accurate audio response
   * - Peak detection for triggering events on beats
   * - Adaptive smoothing based on audio characteristics
   * - Spectrum analysis for richer visualization control
   */
  _updateAudioLevels() {
    if (!this.state.audioAnalyser || !this.state.audioData) return;
    
    // Get frequency data
    this.state.audioAnalyser.getByteFrequencyData(this.state.audioData);
    
    // Store previous audio levels for transient detection
    const prevLevels = { ...this.state.audioLevels };
    
    // Define more precise frequency bands
    // We create 5 bands for more detailed audio reactivity
    const dataLength = this.state.audioData.length;
    const nyquist = this.audioContext ? (this.audioContext.sampleRate / 2) : 22050;
    const freqPerBin = nyquist / dataLength;
    
    // Define band ranges in Hz for more musical response
    const bands = {
      // Sub-bass (20-60Hz)
      subBass: { min: 20, max: 60 },
      // Bass (60-250Hz)
      bass: { min: 60, max: 250 },
      // Low-mid (250-500Hz)
      lowMid: { min: 250, max: 500 },
      // Mid (500-2000Hz)
      mid: { min: 500, max: 2000 },
      // High-mid (2000-4000Hz)
      highMid: { min: 2000, max: 4000 },
      // High (4000-12000Hz)
      high: { min: 4000, max: 12000 }
    };
    
    // Calculate bin indices for each band
    const bandIndices = {};
    Object.keys(bands).forEach(bandName => {
      const band = bands[bandName];
      bandIndices[bandName] = {
        start: Math.max(0, Math.floor(band.min / freqPerBin)),
        end: Math.min(dataLength - 1, Math.floor(band.max / freqPerBin))
      };
    });
    
    // Calculate average levels for each band
    const rawLevels = {};
    Object.keys(bandIndices).forEach(bandName => {
      const indices = bandIndices[bandName];
      let sum = 0;
      let count = 0;
      
      for (let i = indices.start; i <= indices.end; i++) {
        sum += this.state.audioData[i];
        count++;
      }
      
      // Normalize to 0-1 range
      rawLevels[bandName] = count > 0 ? sum / (count * 255) : 0;
    });
    
    // Initialize audio levels object if not exists
    if (!this.state.audioLevels) {
      this.state.audioLevels = {
        bass: 0, lowMid: 0, mid: 0, highMid: 0, high: 0,
        subBass: 0, 
        bassSmooth: 0, midSmooth: 0, highSmooth: 0,
        transients: { bass: 0, mid: 0, high: 0 },
        beatDetected: false,
        energy: 0
      };
    }
    
    // Calculate overall energy
    const energy = (
      rawLevels.subBass * 0.4 + 
      rawLevels.bass * 0.3 + 
      rawLevels.lowMid * 0.2 + 
      rawLevels.mid * 0.05 + 
      rawLevels.highMid * 0.025 + 
      rawLevels.high * 0.025
    );
    
    // Store energy for visualization
    this.state.audioLevels.energy = energy;
    
    // Apply adaptive smoothing based on energy level
    // More energetic audio gets less smoothing for responsiveness
    const baseSmoothing = 0.75;
    const adaptiveSmoothing = baseSmoothing + (1 - energy) * 0.2;
    
    // Combine some bands for backward compatibility
    const combinedBass = rawLevels.subBass * 0.4 + rawLevels.bass * 0.6;
    const combinedMid = rawLevels.lowMid * 0.5 + rawLevels.mid * 0.5;
    const combinedHigh = rawLevels.highMid * 0.6 + rawLevels.high * 0.4;
    
    // Store all individual band values
    Object.keys(rawLevels).forEach(bandName => {
      this.state.audioLevels[bandName] = rawLevels[bandName];
    });
    
    // Apply smoothing to combined bands for visualization
    this.state.audioLevels.bass = combinedBass;
    this.state.audioLevels.mid = combinedMid;
    this.state.audioLevels.high = combinedHigh;
    
    // Apply adaptive smoothing for smoother visuals while maintaining responsiveness
    this.state.audioLevels.bassSmooth = this.state.audioLevels.bassSmooth * adaptiveSmoothing + combinedBass * (1 - adaptiveSmoothing);
    this.state.audioLevels.midSmooth = this.state.audioLevels.midSmooth * adaptiveSmoothing + combinedMid * (1 - adaptiveSmoothing);
    this.state.audioLevels.highSmooth = this.state.audioLevels.highSmooth * adaptiveSmoothing + combinedHigh * (1 - adaptiveSmoothing);
    
    // Add minor random variation for more organic movement when audio is quiet
    const quietThreshold = 0.1;
    if (energy < quietThreshold) {
      const randomFactor = (quietThreshold - energy) / quietThreshold;
      this.state.audioLevels.bassSmooth += (Math.random() * 0.05 - 0.025) * randomFactor;
      this.state.audioLevels.midSmooth += (Math.random() * 0.03 - 0.015) * randomFactor;
      this.state.audioLevels.highSmooth += (Math.random() * 0.02 - 0.01) * randomFactor;
    }
    
    // Calculate transients (sudden increases in energy)
    // These are useful for detecting beats and sudden changes
    this.state.audioLevels.transients = {
      bass: Math.max(0, this.state.audioLevels.bass - prevLevels.bass),
      mid: Math.max(0, this.state.audioLevels.mid - prevLevels.mid),
      high: Math.max(0, this.state.audioLevels.high - prevLevels.high)
    };
    
    // Beat detection - primarily based on bass transients
    const beatThreshold = 0.15;
    if (this.state.audioLevels.transients.bass > beatThreshold || 
        (this.state.audioLevels.transients.bass > beatThreshold * 0.7 && 
         this.state.audioLevels.bass > 0.6)) {
      
      // Store beat detection state
      this.state.audioLevels.beatDetected = true;
      
      // Auto-reset beat detection after a short delay (100ms)
      if (this._beatResetTimeout) {
        clearTimeout(this._beatResetTimeout);
      }
      
      this._beatResetTimeout = setTimeout(() => {
        if (this.state.audioLevels) {
          this.state.audioLevels.beatDetected = false;
        }
      }, 100);
      
      // Trigger any beat-related visualizations
      this._onBeatDetected();
    }
    
    // Ensure values are within valid range
    ['bass', 'mid', 'high', 'bassSmooth', 'midSmooth', 'highSmooth'].forEach(key => {
      this.state.audioLevels[key] = Math.max(0, Math.min(1, this.state.audioLevels[key]));
    });
  }
  
  /**
   * Handle beat detection events
   * @private
   */
  _onBeatDetected() {
    // Only react if we're not already transitioning
    if (this.state.transitioning) return;
    
    // Get current world config
    const worldConfig = this.state.worlds[this.state.currentWorldName];
    if (!worldConfig) return;
    
    // Apply subtle pulse effect on beat
    if (this.state.hypercubeCore) {
      const beatIntensity = 1.0 + this.state.audioLevels.bass * 0.5;
      
      // Apply beat-reactive parameter changes
      this.state.hypercubeCore.updateParameters({
        patternIntensity: worldConfig.patternIntensity * beatIntensity,
        rotationSpeed: worldConfig.rotationSpeed * (1.0 + this.state.audioLevels.bass * 0.1),
      });
      
      // Restore normal parameters after pulse
      setTimeout(() => {
        if (this.state.hypercubeCore && !this.state.transitioning) {
          this.state.hypercubeCore.updateParameters({
            patternIntensity: worldConfig.patternIntensity,
            rotationSpeed: worldConfig.rotationSpeed,
          });
        }
      }, 100);
    }
  }

  /**
   * Initialize enhanced event listeners for better interactivity
   */
  _initEventListeners() {
    // Enhanced mouse tracking with momentum and smoothing
    this.state.mousePosition = { x: 0.5, y: 0.5 };
    this.state.targetMousePosition = { x: 0.5, y: 0.5 };
    this.state.mouseVelocity = { x: 0, y: 0 };
    this.state.mouseActive = false;
    this.state.lastMouseMoveTime = 0;
    
    // Track mouse movement for interactive effects
    document.addEventListener('mousemove', (event) => {
      // Update target position immediately
      this.state.targetMousePosition = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight
      };
      
      // Calculate velocity based on time since last move
      const now = performance.now();
      const dt = Math.min(100, now - this.state.lastMouseMoveTime) / 1000; // Cap at 100ms, convert to seconds
      
      if (dt > 0) {
        const dx = this.state.targetMousePosition.x - this.state.mousePosition.x;
        const dy = this.state.targetMousePosition.y - this.state.mousePosition.y;
        
        this.state.mouseVelocity = {
          x: dx / dt * 0.1, // Scale down for more reasonable values
          y: dy / dt * 0.1
        };
      }
      
      this.state.lastMouseMoveTime = now;
      this.state.mouseActive = true;
      
      // Reset inactivity timer
      if (this._mouseInactivityTimer) {
        clearTimeout(this._mouseInactivityTimer);
      }
      
      // Mark as inactive after 2 seconds of no movement
      this._mouseInactivityTimer = setTimeout(() => {
        this.state.mouseActive = false;
      }, 2000);
    });
    
    // Handle clicks for potential interaction points
    document.addEventListener('click', (event) => {
      // Get mouse position relative to window
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      
      // Only handle clicks if we're not transitioning
      if (!this.state.transitioning) {
        // Trigger a small effect on click
        this._onInteractionPoint(x, y);
      }
    });
    
    // Handle window resize with debouncing
    let resizeTimeout;
    window.addEventListener('resize', () => {
      // Debounce resize events
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      
      resizeTimeout = setTimeout(() => {
        this._handleResize();
      }, 100);
    });
    
    // Handle visibility changes for better performance when tab is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Reduce update frequency when tab is not visible
        this._onVisibilityHidden();
      } else {
        // Resume normal update frequency when tab becomes visible
        this._onVisibilityVisible();
      }
    });
    
    // Start mouse position update loop
    this._updateMousePosition();
  }
  
  /**
   * Update mouse position with smoothing and momentum
   * @private
   */
  _updateMousePosition() {
    if (!this.state.initialized) return;
    
    // Apply smoothing to mouse position for more organic movement
    const smoothingFactor = this.state.mouseActive ? 0.85 : 0.95;
    
    // Update position with smoothing
    this.state.mousePosition.x = this.state.mousePosition.x * smoothingFactor + 
                               this.state.targetMousePosition.x * (1 - smoothingFactor);
    this.state.mousePosition.y = this.state.mousePosition.y * smoothingFactor + 
                               this.state.targetMousePosition.y * (1 - smoothingFactor);
    
    // Add velocity-based momentum when mouse is active
    if (this.state.mouseActive) {
      // Apply velocity with damping
      this.state.mouseVelocity.x *= 0.9;
      this.state.mouseVelocity.y *= 0.9;
    } else {
      // When inactive, gradually return to center with subtle movement
      const centeringForce = 0.001;
      this.state.mouseVelocity.x = (0.5 - this.state.mousePosition.x) * centeringForce;
      this.state.mouseVelocity.y = (0.5 - this.state.mousePosition.y) * centeringForce;
    }
    
    // Request next update
    requestAnimationFrame(() => this._updateMousePosition());
  }
  
  /**
   * Handle interaction point (click)
   * @param {number} x - X position (0-1)
   * @param {number} y - Y position (0-1)
   * @private
   */
  _onInteractionPoint(x, y) {
    // Skip if not initialized or transitioning
    if (!this.state.initialized || this.state.transitioning) return;
    
    // Get current world config
    const worldConfig = this.state.worlds[this.state.currentWorldName];
    if (!worldConfig) return;
    
    // Create a ripple effect at click point
    if (this.state.hypercubeCore) {
      // Calculate distance from center for effect intensity
      const centerX = 0.5;
      const centerY = 0.5;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      // Create parameters for the effect
      const effectParams = {
        // Temporary boost to pattern intensity
        patternIntensity: worldConfig.patternIntensity * (1.5 - distance * 0.5),
        
        // Create ripple from click point using modified universe modifier
        universeModifier: worldConfig.universeModifier * (1.2 - distance * 0.4),
        
        // Add some glitch effect
        glitchIntensity: 0.1 * (1 - distance)
      };
      
      // Apply click effect
      this.state.hypercubeCore.updateParameters(effectParams);
      
      // Clear effect after a short duration
      setTimeout(() => {
        if (this.state.hypercubeCore && !this.state.transitioning) {
          this.state.hypercubeCore.updateParameters({
            patternIntensity: worldConfig.patternIntensity,
            universeModifier: worldConfig.universeModifier,
            glitchIntensity: 0
          });
        }
      }, 300);
    }
  }
  
  /**
   * Handle visibility change to hidden
   * @private
   */
  _onVisibilityHidden() {
    // Reduce animation quality when tab is not visible
    if (this.state.hypercubeCore) {
      // Store current state for restoration
      this._visibilityState = {
        quality: this.state.hypercubeCore.getQuality()
      };
      
      // Reduce quality to save resources
      this.state.hypercubeCore.setQuality(0.5);
    }
  }
  
  /**
   * Handle visibility change to visible
   * @private
   */
  _onVisibilityVisible() {
    // Restore animation quality when tab becomes visible
    if (this.state.hypercubeCore && this._visibilityState) {
      // Restore previous quality
      this.state.hypercubeCore.setQuality(this._visibilityState.quality || 1.0);
    }
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    if (!this.state.canvas) return;
    
    // Update canvas dimensions
    this.state.canvas.width = window.innerWidth;
    this.state.canvas.height = window.innerHeight;
    
    // Update WebGL viewport
    if (this.state.gl) {
      this.state.gl.viewport(0, 0, this.state.canvas.width, this.state.canvas.height);
    }
  }

  /**
   * Initialize default world configuration with enhanced visualization modes
   */
  _initDefaultWorld() {
    // Create default world configuration
    const defaultWorld = {
      name: 'default',
      colorScheme: this.config.colorScheme,
      dimensionality: this.config.dimensionality,
      intensity: this.config.intensity,
      rotationSpeed: 0.2,
      universeModifier: 1.0,
      patternIntensity: 0.8,
      gridDensity: 8.0,
      worldBlend: 0.5,
      worldIntensity: this.config.intensity
    };
    
    // Add default world
    this.addWorld('default', defaultWorld);
    
    // Add pre-defined world types with optimized configurations
    this._addPredefinedWorlds();
    
    // Add user-configured worlds
    for (const worldName in this.config.worldConfigs) {
      this.addWorld(worldName, this.config.worldConfigs[worldName]);
    }
    
    // Set active world
    this.activateWorld(this.config.activeWorld);
  }
  
  /**
   * Add predefined world types with optimized settings
   * @private
   */
  _addPredefinedWorlds() {
    // Lattice World - 4D Hypercube visualization
    this.addWorld('lattice_world', {
      name: 'lattice_world',
      colorScheme: 'lattice',
      dimensionality: 4.0,
      intensity: 1.0,
      rotationSpeed: 0.15,
      universeModifier: 1.2,
      patternIntensity: 0.9,
      gridDensity: 10.0,
      worldBlend: 0.1,  // Mostly lattice visualization
      worldIntensity: 1.0,
      morphFactor: 0.2  // Slight wireframe blend
    });
    
    // Quantum Field World - Energetic quantum particles
    this.addWorld('quantum_field', {
      name: 'quantum_field',
      colorScheme: 'quantum_field',
      dimensionality: 3.8,
      intensity: 1.2,
      rotationSpeed: 0.2,
      universeModifier: 0.8,
      patternIntensity: 1.1,
      gridDensity: 12.0,
      worldBlend: 0.3,  // Quantum field dominant
      worldIntensity: 1.0,
      morphFactor: 0.4  // More shape morphing
    });
    
    // Vortex World - Swirling spiral patterns
    this.addWorld('vortex_world', {
      name: 'vortex_world',
      colorScheme: 'vortex',
      dimensionality: 4.2,
      intensity: 1.0,
      rotationSpeed: 0.25,
      universeModifier: 1.5,
      patternIntensity: 0.95,
      gridDensity: 8.0,
      worldBlend: 0.5,  // Vortex field dominant
      worldIntensity: 1.1,
      morphFactor: 0.6  // More abstract shapes
    });
    
    // Nebula World - Cosmic cloud visualization
    this.addWorld('nebula_world', {
      name: 'nebula_world',
      colorScheme: 'nebula',
      dimensionality: 3.6,
      intensity: 0.9,
      rotationSpeed: 0.15,
      universeModifier: 0.7,
      patternIntensity: 0.8,
      gridDensity: 6.0,
      worldBlend: 0.7,  // Nebula field dominant
      worldIntensity: 0.9,
      morphFactor: 0.8  // Very smooth, gas-like shapes
    });
    
    // Circuit World - Digital circuit patterns
    this.addWorld('circuit_world', {
      name: 'circuit_world',
      colorScheme: 'circuit',
      dimensionality: 4.0,
      intensity: 1.1,
      rotationSpeed: 0.1,
      universeModifier: 1.0,
      patternIntensity: 1.0,
      gridDensity: 15.0,
      worldBlend: 0.9,  // Circuit field dominant
      worldIntensity: 1.0,
      morphFactor: 1.0  // Grid pattern focus
    });
    
    // High contrast worlds for special effects
    
    // Neon World - High contrast bright visualization
    this.addWorld('neon_world', {
      name: 'neon_world',
      colorScheme: 'neon',
      dimensionality: 4.5,
      intensity: 1.4,
      rotationSpeed: 0.3,
      universeModifier: 1.8,
      patternIntensity: 1.3,
      gridDensity: 10.0,
      worldBlend: 0.2,  // Lattice with some quantum aspects
      worldIntensity: 1.2,
      morphFactor: 0.3  // More defined shapes
    });
    
    // Eclipse World - Dark backdrop with bright contours
    this.addWorld('eclipse_world', {
      name: 'eclipse_world',
      colorScheme: 'eclipse',
      dimensionality: 3.8,
      intensity: 1.0,
      rotationSpeed: 0.15,
      universeModifier: 1.1,
      patternIntensity: 0.9,
      gridDensity: 8.0,
      worldBlend: 0.6,  // Mixed nebula/vortex
      worldIntensity: 0.9,
      morphFactor: 0.7  // Smooth transformations
    });
    
    // Digital World - Matrix-like patterns
    this.addWorld('digital_world', {
      name: 'digital_world',
      colorScheme: 'digital',
      dimensionality: 4.0,
      intensity: 1.1,
      rotationSpeed: 0.25,
      universeModifier: 1.0,
      patternIntensity: 1.1,
      gridDensity: 20.0,  // Dense grid
      worldBlend: 0.8,  // Circuit dominant
      worldIntensity: 1.0,
      morphFactor: 1.2  // Enhanced grid structure
    });
  }

  /**
   * Add a new world configuration
   */
  addWorld(worldName, worldConfig) {
    if (!worldName) return false;
    
    // Merge with default settings
    const defaultWorldConfig = {
      name: worldName,
      colorScheme: this.config.colorScheme,
      dimensionality: this.config.dimensionality,
      intensity: this.config.intensity,
      rotationSpeed: 0.2,
      universeModifier: 1.0,
      patternIntensity: 0.8,
      gridDensity: 8.0,
      worldBlend: 0.5,
      worldIntensity: this.config.intensity
    };
    
    // Store world configuration
    this.state.worlds[worldName] = {
      ...defaultWorldConfig,
      ...worldConfig
    };
    
    return true;
  }

  /**
   * Activate a world by name
   */
  activateWorld(worldName) {
    // Skip if world doesn't exist or is already active
    if (!this.state.worlds[worldName] || this.state.currentWorldName === worldName) {
      return false;
    }
    
    // If transitioning, complete immediately
    if (this.state.transitioning) {
      this._completeTransition();
    }
    
    // Store previous world
    this.state.previousWorldName = this.state.currentWorldName;
    this.state.currentWorldName = worldName;
    
    const worldConfig = this.state.worlds[worldName];
    
    // Trigger transition
    this._transitionToWorld(worldConfig);
    
    return true;
  }

  /**
   * Transition to a new world configuration with enhanced effects
   */
  _transitionToWorld(worldConfig) {
    // Mark as transitioning
    this.state.transitioning = true;
    
    // Store the transition start time for future calculations
    this.state.transitionStartTime = performance.now();
    
    // Notify transition start
    if (this.state.callbacks.onTransitionStart) {
      this.state.callbacks.onTransitionStart(this.state.previousWorldName, this.state.currentWorldName);
    }
    
    // Get previous world config for smooth transitioning between values
    const prevWorldConfig = this.state.worlds[this.state.previousWorldName] || worldConfig;
    
    // Calculate optimal world blend value based on world types
    let targetWorldBlend = worldConfig.worldBlend;
    
    // Determine visualization mode based on world name pattern
    if (this.state.currentWorldName.includes('quantum') || this.state.currentWorldName.includes('particle')) {
      targetWorldBlend = 0.3; // Quantum field dominant
    } else if (this.state.currentWorldName.includes('vortex') || this.state.currentWorldName.includes('spiral')) {
      targetWorldBlend = 0.5; // Vortex field dominant
    } else if (this.state.currentWorldName.includes('nebula') || this.state.currentWorldName.includes('cloud')) {
      targetWorldBlend = 0.7; // Nebula field dominant
    } else if (this.state.currentWorldName.includes('circuit') || this.state.currentWorldName.includes('tech')) {
      targetWorldBlend = 0.9; // Circuit field dominant
    } else {
      targetWorldBlend = 0.1; // Default to lattice dominant
    }
    
    // Store the target world blend for smooth transitions
    this.state.targetWorldBlend = targetWorldBlend;
    this.state.initialWorldBlend = prevWorldConfig.worldBlend || 0.5;
    
    // Convert color scheme to RGB
    const colorScheme = this._getColorSchemeFromName(worldConfig.colorScheme);
    const prevColorScheme = this._getColorSchemeFromName(prevWorldConfig.colorScheme);
    
    // Store initial and target colors for smooth transitions
    this.state.transitionColors = {
      initial: prevColorScheme,
      target: colorScheme
    };
    
    // Calculate initial parameter differences for animation
    this.state.transitionParams = {
      dimensions: {
        initial: prevWorldConfig.dimensionality || this.config.dimensionality,
        target: worldConfig.dimensionality
      },
      rotationSpeed: {
        initial: prevWorldConfig.rotationSpeed || 0.2,
        target: worldConfig.rotationSpeed
      },
      universeModifier: {
        initial: prevWorldConfig.universeModifier || 1.0,
        target: worldConfig.universeModifier
      },
      patternIntensity: {
        initial: prevWorldConfig.patternIntensity || 0.8,
        target: worldConfig.patternIntensity
      },
      gridDensity: {
        initial: prevWorldConfig.gridDensity || 8.0,
        target: worldConfig.gridDensity
      },
      worldIntensity: {
        initial: 0,
        target: worldConfig.worldIntensity || this.config.intensity
      }
    };
    
    // Update hypercube core with transition start parameters
    if (this.state.hypercubeCore) {
      this.state.hypercubeCore.updateParameters({
        dimensions: this.state.transitionParams.dimensions.initial,
        rotationSpeed: this.state.transitionParams.rotationSpeed.initial * 3, // Increase during transition
        universeModifier: this.state.transitionParams.universeModifier.initial,
        patternIntensity: this.state.transitionParams.patternIntensity.initial,
        gridDensity: this.state.transitionParams.gridDensity.initial,
        // Add dramatic effects at transition start
        glitchIntensity: 0.8,
        colorShift: 0.5,
        colorScheme: this.state.transitionColors.initial
      });
    }
    
    // Create animation to smoothly transition parameters
    const duration = this.config.transitionDuration;
    
    const animateTransition = (timestamp) => {
      const elapsed = timestamp - this.state.transitionStartTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Custom easing functions for different transition phases
      // Using this to create more dynamic, interesting transitions
      const easeOutBack = t => {
        const c1 = 1.70158;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      };
      
      const easeInOutExpo = t => 
        t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? 
        Math.pow(2, 20 * t - 10) / 2 : 
        (2 - Math.pow(2, -20 * t + 10)) / 2;
      
      // Use different easing functions for different parameters
      const paramProgress = easeInOutExpo(progress);
      const colorProgress = easeOutBack(progress);
      const worldBlendProgress = easeInOutExpo(progress);
      
      // Add dramatic pulse during transition (stronger at middle of transition)
      const pulseIntensity = Math.sin(progress * Math.PI) * 0.3;
      
      // Interpolate transition colors
      const interpolatedColors = {
        primary: [
          this.state.transitionColors.initial.primary[0] * (1 - colorProgress) + this.state.transitionColors.target.primary[0] * colorProgress,
          this.state.transitionColors.initial.primary[1] * (1 - colorProgress) + this.state.transitionColors.target.primary[1] * colorProgress,
          this.state.transitionColors.initial.primary[2] * (1 - colorProgress) + this.state.transitionColors.target.primary[2] * colorProgress
        ],
        secondary: [
          this.state.transitionColors.initial.secondary[0] * (1 - colorProgress) + this.state.transitionColors.target.secondary[0] * colorProgress,
          this.state.transitionColors.initial.secondary[1] * (1 - colorProgress) + this.state.transitionColors.target.secondary[1] * colorProgress,
          this.state.transitionColors.initial.secondary[2] * (1 - colorProgress) + this.state.transitionColors.target.secondary[2] * colorProgress
        ],
        background: [
          this.state.transitionColors.initial.background[0] * (1 - colorProgress) + this.state.transitionColors.target.background[0] * colorProgress,
          this.state.transitionColors.initial.background[1] * (1 - colorProgress) + this.state.transitionColors.target.background[1] * colorProgress,
          this.state.transitionColors.initial.background[2] * (1 - colorProgress) + this.state.transitionColors.target.background[2] * colorProgress
        ]
      };
      
      // Calculate the interpolated world blend
      const interpolatedWorldBlend = this.state.initialWorldBlend * (1 - worldBlendProgress) + this.state.targetWorldBlend * worldBlendProgress;
      
      // Get audio levels for reactive transition effects
      const audioLevels = this.state.audioLevels || { bass: 0, mid: 0, high: 0 };
      
      // Update hypercube parameters during transition
      if (this.state.hypercubeCore) {
        this.state.hypercubeCore.updateParameters({
          // Interpolate all transition parameters
          dimensions: this.state.transitionParams.dimensions.initial * (1 - paramProgress) + 
                      this.state.transitionParams.dimensions.target * paramProgress,
                      
          rotationSpeed: (this.state.transitionParams.rotationSpeed.initial * (1 - paramProgress) + 
                        this.state.transitionParams.rotationSpeed.target * paramProgress) * 
                        // Add audio-reactive rotation variation
                        (2.0 - progress + audioLevels.mid * 2.0),
                        
          universeModifier: this.state.transitionParams.universeModifier.initial * (1 - paramProgress) + 
                          this.state.transitionParams.universeModifier.target * paramProgress + 
                          // Add pulsing effect to universe modifier
                          pulseIntensity * (1.0 + audioLevels.bass * 2.0),
                          
          patternIntensity: this.state.transitionParams.patternIntensity.initial * (1 - paramProgress) + 
                          this.state.transitionParams.patternIntensity.target * paramProgress +
                          // Add audio-reactive pattern intensity boost
                          audioLevels.high * 0.5,
                          
          gridDensity: this.state.transitionParams.gridDensity.initial * (1 - paramProgress) + 
                     this.state.transitionParams.gridDensity.target * paramProgress,
                     
          // Dynamic effects parameters during transition
          glitchIntensity: Math.max(0, 0.8 - 0.9 * progress + 
                                   // Add audio-reactive glitches
                                   audioLevels.high * 0.3 * Math.sin(elapsed * 0.01)),
                                   
          colorShift: 0.5 * (1 - progress) + 
                     // Add audio-reactive color shifting
                     audioLevels.mid * 0.2 * Math.sin(elapsed * 0.005),
                     
          // Apply interpolated colors
          colorScheme: interpolatedColors,
          
          // Apply world blend transition
          worldBlend: interpolatedWorldBlend,
          
          // Gradually increase world intensity
          worldIntensity: this.state.transitionParams.worldIntensity.initial * (1 - paramProgress) + 
                        this.state.transitionParams.worldIntensity.target * paramProgress +
                        // Add pulsing during transition
                        pulseIntensity
        });
      }
      
      // Continue transition if not complete
      if (progress < 1) {
        requestAnimationFrame(animateTransition);
      } else {
        this._completeTransition();
      }
    };
    
    // Start transition animation
    requestAnimationFrame(animateTransition);
  }

  /**
   * Complete world transition with final parameter refinements
   */
  _completeTransition() {
    // Get the current world configuration
    const worldConfig = this.state.worlds[this.state.currentWorldName];
    
    // Apply final parameters and refinements
    
    // Use stored target world blend if it was computed
    if (this.state.targetWorldBlend !== undefined) {
      worldConfig.worldBlend = this.state.targetWorldBlend;
    }
    
    // Convert color scheme to RGB
    const colorScheme = this._getColorSchemeFromName(worldConfig.colorScheme);
    
    // Update hypercube core with final parameters and refinements
    if (this.state.hypercubeCore) {
      // Apply final parameters with cleaned-up values
      this.state.hypercubeCore.updateParameters({
        // Core parameters
        dimensions: worldConfig.dimensionality,
        rotationSpeed: worldConfig.rotationSpeed,
        universeModifier: worldConfig.universeModifier,
        patternIntensity: worldConfig.patternIntensity,
        gridDensity: worldConfig.gridDensity,
        
        // Reset transition effects
        glitchIntensity: 0.0,
        colorShift: 0.0,
        
        // Apply final color scheme
        colorScheme: colorScheme,
        
        // Apply final world blend and intensity
        worldBlend: worldConfig.worldBlend,
        worldIntensity: worldConfig.worldIntensity
      });
      
      // Add one small final pulse for a satisfying transition completion
      setTimeout(() => {
        // Add a subtle pulse at the end of the transition for a satisfying finish
        if (this.state.hypercubeCore && !this.state.transitioning) {
          // Get audio levels for subtle reactive effect
          const audioLevels = this.state.audioLevels || { bass: 0, mid: 0, high: 0 };
          
          // Calculate a pulse factor based on audio
          const pulseFactor = 1.0 + Math.max(0.1, audioLevels.bass * 0.3);
          
          // Apply a quick pulse to pattern intensity
          this.state.hypercubeCore.updateParameters({
            patternIntensity: worldConfig.patternIntensity * pulseFactor,
            worldIntensity: worldConfig.worldIntensity * pulseFactor
          });
          
          // Restore normal values after the pulse
          setTimeout(() => {
            if (this.state.hypercubeCore && !this.state.transitioning) {
              this.state.hypercubeCore.updateParameters({
                patternIntensity: worldConfig.patternIntensity,
                worldIntensity: worldConfig.worldIntensity
              });
            }
          }, 300);
        }
      }, 100);
    }
    
    // Clean up transition state variables
    this.state.transitionStartTime = null;
    this.state.transitionColors = null;
    this.state.transitionParams = null;
    this.state.targetWorldBlend = null;
    this.state.initialWorldBlend = null;
    
    // Mark as not transitioning
    this.state.transitioning = false;
    
    // Log completion for debugging
    console.log(`UniversalHyperAV: Transition complete to world "${this.state.currentWorldName}"`);
    
    // Notify transition end via callbacks
    if (this.state.callbacks.onWorldChange) {
      this.state.callbacks.onWorldChange(this.state.currentWorldName, worldConfig);
    }
    
    if (this.state.callbacks.onTransitionEnd) {
      this.state.callbacks.onTransitionEnd(this.state.previousWorldName, this.state.currentWorldName);
    }
  }

  /**
   * Get RGB color scheme from name
   * Enhanced with new world-specific color palettes
   */
  _getColorSchemeFromName(schemeName) {
    const schemes = {
      // Original schemes
      vaporwave: {
        primary: [1.0, 0.1, 0.8],
        secondary: [0.0, 0.8, 1.0],
        background: [0.0, 0.0, 0.1]
      },
      quantum: {
        primary: [0.0, 1.0, 0.7],
        secondary: [1.0, 1.0, 0.0],
        background: [0.0, 0.0, 0.2]
      },
      cyber: {
        primary: [0.0, 1.0, 1.0],
        secondary: [1.0, 0.0, 0.5],
        background: [0.0, 0.0, 0.0]
      },
      cosmic: {
        primary: [0.5, 0.0, 1.0],
        secondary: [0.0, 0.5, 1.0],
        background: [0.05, 0.0, 0.1]
      },
      editorial: {
        primary: [0.0, 0.8, 1.0],
        secondary: [1.0, 0.1, 0.8],
        background: [0.0, 0.0, 0.15]
      },
      culture: {
        primary: [0.8, 0.0, 1.0],
        secondary: [1.0, 0.8, 0.0],
        background: [0.1, 0.0, 0.2]
      },
      tech: {
        primary: [0.0, 1.0, 0.8],
        secondary: [1.0, 0.1, 0.7],
        background: [0.0, 0.05, 0.1]
      },
      interview: {
        primary: [1.0, 0.8, 0.0],
        secondary: [0.8, 0.0, 1.0],
        background: [0.05, 0.0, 0.1]
      },
      lore: {
        primary: [0.5, 0.0, 1.0],
        secondary: [0.0, 0.8, 1.0],
        background: [0.1, 0.0, 0.15]
      },
      
      // New enhanced world color schemes
      lattice: {
        primary: [0.0, 0.7, 1.0],     // Bright cyan
        secondary: [1.0, 0.0, 0.7],   // Hot pink
        background: [0.02, 0.04, 0.1] // Deep navy
      },
      quantum_field: {
        primary: [0.1, 1.0, 0.5],     // Bright green-cyan
        secondary: [1.0, 0.8, 0.0],   // Golden yellow
        background: [0.02, 0.05, 0.1] // Dark teal-black
      },
      vortex: {
        primary: [0.6, 0.0, 1.0],     // Vibrant purple
        secondary: [0.0, 0.8, 1.0],   // Sky blue
        background: [0.05, 0.0, 0.1]  // Dark purple-black
      },
      nebula: {
        primary: [0.9, 0.3, 0.7],     // Pinkish red
        secondary: [0.2, 0.4, 1.0],   // Medium blue
        background: [0.03, 0.0, 0.08] // Deep space black
      },
      circuit: {
        primary: [0.0, 1.0, 0.6],     // Digital green
        secondary: [0.8, 0.9, 0.1],   // Electric yellow
        background: [0.0, 0.02, 0.05] // Dark digital black
      },
      
      // High contrast modes for visual impact
      neon: {
        primary: [1.0, 0.9, 0.0],     // Bright yellow
        secondary: [0.9, 0.0, 1.0],   // Magenta
        background: [0.0, 0.0, 0.0]   // Pure black
      },
      eclipse: {
        primary: [1.0, 0.1, 0.0],     // Bright red
        secondary: [0.0, 0.0, 0.0],   // Black
        background: [0.1, 0.0, 0.2]   // Deep purple
      },
      sunrise: {
        primary: [1.0, 0.5, 0.0],     // Orange
        secondary: [1.0, 0.9, 0.4],   // Soft yellow
        background: [0.2, 0.0, 0.0]   // Dark red
      },
      digital: {
        primary: [0.0, 1.0, 0.0],     // Matrix green
        secondary: [0.5, 1.0, 0.5],   // Light green
        background: [0.0, 0.05, 0.0]  // Dark green
      },
      ocean: {
        primary: [0.0, 0.7, 1.0],     // Ocean blue
        secondary: [0.0, 1.0, 0.5],   // Teal
        background: [0.0, 0.0, 0.2]   // Deep blue
      }
    };
    
    return schemes[schemeName] || schemes.vaporwave;
  }

  /**
   * Start the rendering loop
   */
  _startRendering() {
    if (!this.state.hypercubeCore) return;
    
    // Start hypercube rendering
    this.state.hypercubeCore.start();
    
    // Start audio update loop
    this._updateAudio();
  }

  /**
   * Update audio levels periodically
   */
  _updateAudio() {
    // Update audio levels
    if (this.config.audioReactive) {
      this._updateAudioLevels();
      
      // Update audio levels in hypercube core
      if (this.state.hypercubeCore) {
        this.state.hypercubeCore.updateParameters({
          audioLevels: this.state.audioLevels
        });
        
        // Add uniforms for mouse position
        this.state.hypercubeCore.updateParameters({
          mousePosition: [this.state.mousePosition.x, this.state.mousePosition.y]
        });
      }
    }
    
    // Continue loop
    this.state.frameId = requestAnimationFrame(this._updateAudio.bind(this));
  }

  /**
   * Update parameters for current world
   */
  updateCurrentWorld(params) {
    if (!this.state.currentWorldName) return false;
    
    // Update world configuration
    const worldConfig = this.state.worlds[this.state.currentWorldName];
    Object.assign(worldConfig, params);
    
    // Update hypercube core
    if (this.state.hypercubeCore) {
      // Convert color scheme to RGB if specified
      let colorScheme = null;
      if (params.colorScheme) {
        colorScheme = this._getColorSchemeFromName(params.colorScheme);
      }
      
      // Update parameters
      this.state.hypercubeCore.updateParameters({
        ...params,
        ...(colorScheme ? { colorScheme } : {})
      });
    }
    
    return true;
  }

  /**
   * Dispose of resources
   */
  dispose() {
    // Stop rendering
    if (this.state.frameId) {
      cancelAnimationFrame(this.state.frameId);
      this.state.frameId = null;
    }
    
    // Stop hypercube core
    if (this.state.hypercubeCore) {
      this.state.hypercubeCore.dispose();
      this.state.hypercubeCore = null;
    }
    
    // Close audio context
    if (this.state.audioContext) {
      this.state.audioContext.close();
      this.state.audioContext = null;
      this.state.audioAnalyser = null;
      this.state.audioData = null;
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this._handleResize);
    
    // Remove container contents
    if (this.state.container) {
      this.state.container.innerHTML = '';
    }
    
    console.log('UniversalHyperAV: Disposed');
  }
}

// Make UniversalHyperAV globally available
window.UniversalHyperAV = UniversalHyperAV;