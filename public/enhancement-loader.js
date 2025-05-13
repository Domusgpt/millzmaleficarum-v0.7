/**
 * MillzMaleficarum Codex v0.6
 * Enhancement Loader
 * Provides performance-aware loading of advanced features
 */

class EnhancementLoader {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      adaptiveQuality: options.adaptiveQuality !== false,
      lazyLoadThreshold: options.lazyLoadThreshold || 200, // px from viewport
      priorityFeatures: options.priorityFeatures || ['portalTransitions', 'hyperAV'],
      secondaryFeatures: options.secondaryFeatures || ['quantumParticles', 'realityDistortion'],
      optionalFeatures: options.optionalFeatures || ['hyperAVAudio', 'immersiveScroll'],
      devMode: options.devMode || false,
      enabledFeatures: options.enabledFeatures || {},
      performanceProfile: options.performanceProfile || 'auto', // 'low', 'medium', 'high', 'ultra', 'auto'
      perfMetrics: {
        fpsSamples: [],
        renderTimes: [],
        lastFrameTime: 0,
        sampleSize: 100
      }
    };

    // State
    this.state = {
      loadedModules: {},
      loadPromises: {},
      loadedScripts: new Set(),
      deviceCapabilities: null,
      performanceTier: null,
      isInitialized: false,
      observer: null,
      intersectionElements: new Map(),
      hasReducedMotion: false
    };

    // Initialize
    this._initialize();
  }

  /**
   * Initialize the enhancement loader
   */
  _initialize() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setup());
    } else {
      this._setup();
    }
  }

  /**
   * Setup the enhancement loader
   */
  _setup() {
    // Detect device capabilities
    this._detectCapabilities()
      .then(capabilities => {
        this.state.deviceCapabilities = capabilities;
        this.state.performanceTier = this._determinePerformanceTier(capabilities);
        
        console.log(`Enhancement Loader: Device capabilities detected - Performance tier: ${this.state.performanceTier}`);
        
        // Apply performance settings
        this._applyPerformanceSettings();
        
        // Set up IntersectionObserver for lazy loading
        this._setupLazyLoading();
        
        // Check for reduced motion preference
        this._checkReducedMotionPreference();
        
        // Load priority features immediately
        this.loadPriorityFeatures();
        
        // Mark as initialized
        this.state.isInitialized = true;
        
        // Dispatch ready event
        window.dispatchEvent(new CustomEvent('enhancementsReady', { 
          detail: { 
            performanceTier: this.state.performanceTier,
            capabilities: this.state.deviceCapabilities
          } 
        }));
      })
      .catch(error => {
        console.error('Enhancement Loader: Failed to initialize', error);
        // Load minimal feature set on error
        this._loadMinimalFeatures();
      });
  }

  /**
   * Detect device capabilities
   */
  async _detectCapabilities() {
    const capabilities = {
      webgl: this._checkWebGLSupport(),
      webgl2: this._checkWebGL2Support(),
      performance: await this._benchmarkPerformance(),
      cpu: await this._estimateCPUPower(),
      memory: navigator.deviceMemory || 4, // Default to mid-range if not available
      mobile: this._isMobileDevice(),
      connectionType: (navigator.connection && navigator.connection.effectiveType) || '4g',
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio || 1
      }
    };
    
    return capabilities;
  }

  /**
   * Check WebGL support level
   */
  _checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) return false;
      
      // Get max texture size as indication of GPU power
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const extensions = gl.getSupportedExtensions();
      
      return {
        supported: true,
        maxTextureSize,
        extensions: extensions || [],
        contextAttributes: gl.getContextAttributes()
      };
    } catch (e) {
      console.warn('Enhancement Loader: WebGL detection failed', e);
      return { supported: false };
    }
  }

  /**
   * Check WebGL2 support
   */
  _checkWebGL2Support() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      
      if (!gl) return { supported: false };
      
      // Get max texture size and other capabilities
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      const maxVaryingVectors = gl.getParameter(gl.MAX_VARYING_VECTORS);
      const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
      
      return {
        supported: true,
        maxTextureSize,
        maxVaryingVectors,
        maxVertexAttribs,
        extensions: gl.getSupportedExtensions() || []
      };
    } catch (e) {
      return { supported: false };
    }
  }

  /**
   * Benchmark performance
   */
  async _benchmarkPerformance() {
    return new Promise(resolve => {
      // Create a small canvas for benchmarking
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve({ score: 0 });
        return;
      }
      
      // Prepare benchmark
      const startTime = performance.now();
      let frames = 0;
      const maxFrames = 50; // Number of frames to test
      const colors = ['#ff00aa', '#00eeff', '#cc00ff', '#ffcc00', '#00ffcc'];
      
      // Run animation benchmark
      const runFrame = () => {
        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw multiple shapes with gradients and alpha
        for (let i = 0; i < 50; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const radius = 20 + Math.random() * 50;
          
          // Create gradient
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
          gradient.addColorStop(0, colors[i % colors.length]);
          gradient.addColorStop(1, 'rgba(0,0,0,0)');
          
          ctx.globalAlpha = 0.3 + Math.random() * 0.7;
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
        
        frames++;
        
        if (frames < maxFrames) {
          requestAnimationFrame(runFrame);
        } else {
          const endTime = performance.now();
          const duration = endTime - startTime;
          const fps = frames / (duration / 1000);
          
          // Calculate score based on fps and frame time
          const frameTime = duration / frames;
          const score = Math.round((fps * 10) / (frameTime / 10));
          
          resolve({
            score,
            fps,
            frameTime,
            duration,
            timeStamp: Date.now()
          });
        }
      };
      
      // Start benchmark
      requestAnimationFrame(runFrame);
    });
  }

  /**
   * Estimate CPU power through computational benchmark
   */
  async _estimateCPUPower() {
    return new Promise(resolve => {
      const startTime = performance.now();
      
      // CPU-intensive operation (matrix operations)
      const matrixSize = 200;
      const matrix1 = [];
      const matrix2 = [];
      
      // Initialize matrices with random data
      for (let i = 0; i < matrixSize; i++) {
        matrix1[i] = [];
        matrix2[i] = [];
        for (let j = 0; j < matrixSize; j++) {
          matrix1[i][j] = Math.random();
          matrix2[i][j] = Math.random();
        }
      }
      
      // Perform matrix multiplication (CPU intensive)
      const result = [];
      for (let i = 0; i < matrixSize; i++) {
        result[i] = [];
        for (let j = 0; j < matrixSize; j++) {
          result[i][j] = 0;
          for (let k = 0; k < matrixSize; k++) {
            result[i][j] += matrix1[i][k] * matrix2[k][j];
          }
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Calculate score (lower duration is better)
      const score = Math.round(5000 / duration * 100);
      
      resolve({
        score,
        duration,
        timeStamp: Date.now()
      });
    });
  }

  /**
   * Check if device is mobile
   */
  _isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Determine performance tier based on capabilities
   */
  _determinePerformanceTier(capabilities) {
    // If user specified a profile, use that
    if (this.config.performanceProfile !== 'auto') {
      return this.config.performanceProfile;
    }
    
    // Calculate performance score
    let score = 0;
    
    // WebGL capabilities
    if (capabilities.webgl && capabilities.webgl.supported) {
      score += 20;
      if (capabilities.webgl.maxTextureSize >= 8192) score += 10;
      if (capabilities.webgl.extensions.includes('WEBGL_depth_texture')) score += 5;
    }
    
    // WebGL2 capabilities
    if (capabilities.webgl2 && capabilities.webgl2.supported) {
      score += 20;
    }
    
    // Performance benchmark
    if (capabilities.performance) {
      if (capabilities.performance.score > 500) score += 25;
      else if (capabilities.performance.score > 300) score += 15;
      else if (capabilities.performance.score > 100) score += 5;
    }
    
    // CPU power
    if (capabilities.cpu && capabilities.cpu.score > 200) {
      score += 15;
    } else if (capabilities.cpu && capabilities.cpu.score > 100) {
      score += 5;
    }
    
    // Device memory
    if (capabilities.memory >= 8) score += 15;
    else if (capabilities.memory >= 4) score += 10;
    
    // Mobile devices generally get lower scores
    if (capabilities.mobile) {
      score -= 15;
    }
    
    // Network connection
    if (capabilities.connectionType === 'slow-2g' || capabilities.connectionType === '2g') {
      score -= 10;
    }
    
    // Determine tier based on score
    if (score >= 70) return 'ultra';
    if (score >= 50) return 'high';
    if (score >= 30) return 'medium';
    return 'low';
  }

  /**
   * Apply performance settings based on detected tier
   */
  _applyPerformanceSettings() {
    const tier = this.state.performanceTier;
    
    const settings = {
      low: {
        hyperAV: {
          particleCount: 200,
          complexity: 0.3,
          shaderQuality: 'low',
          disableBloom: true
        },
        portalTransitions: {
          complexity: 0.4,
          particleCount: 300,
          disableDistortion: true
        },
        quantumParticles: {
          count: 100,
          disableGlow: true
        },
        hyperAVAudio: {
          frequencyBands: 16,
          disableVisualizer: true
        }
      },
      medium: {
        hyperAV: {
          particleCount: 500,
          complexity: 0.6,
          shaderQuality: 'medium'
        },
        portalTransitions: {
          complexity: 0.7,
          particleCount: 500
        },
        quantumParticles: {
          count: 300
        },
        hyperAVAudio: {
          frequencyBands: 32
        }
      },
      high: {
        hyperAV: {
          particleCount: 1000,
          complexity: 0.8,
          shaderQuality: 'high'
        },
        portalTransitions: {
          complexity: 0.85,
          particleCount: 700
        },
        quantumParticles: {
          count: 500
        },
        hyperAVAudio: {
          frequencyBands: 64
        }
      },
      ultra: {
        hyperAV: {
          particleCount: 2000,
          complexity: 1.0,
          shaderQuality: 'ultra',
          enableExtraEffects: true
        },
        portalTransitions: {
          complexity: 1.0,
          particleCount: 1000,
          enableExtraEffects: true
        },
        quantumParticles: {
          count: 1000,
          enableExtraEffects: true
        },
        hyperAVAudio: {
          frequencyBands: 128,
          enableSpectrum: true
        }
      }
    };
    
    // Store current performance settings
    this.performanceSettings = settings[tier] || settings.medium;
    
    // Add settings to window for other components to access
    window.enhancementSettings = {
      performanceTier: tier,
      settings: this.performanceSettings,
      capabilities: this.state.deviceCapabilities
    };
    
    console.log(`Enhancement Loader: Applied ${tier} quality settings`);
  }

  /**
   * Check for reduced motion preference
   */
  _checkReducedMotionPreference() {
    // Check for prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.state.hasReducedMotion = reducedMotion;
    
    // Add to settings
    window.enhancementSettings.reducedMotion = reducedMotion;
    
    if (reducedMotion && this.config.devMode) {
      console.log('Enhancement Loader: Reduced motion preference detected');
    }
    
    // Add listener for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
      this.state.hasReducedMotion = e.matches;
      window.enhancementSettings.reducedMotion = e.matches;
      
      // Dispatch event for components to adapt
      window.dispatchEvent(new CustomEvent('motionPreferenceChanged', { 
        detail: { reducedMotion: e.matches } 
      }));
    });
  }

  /**
   * Set up lazy loading with IntersectionObserver
   */
  _setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.state.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const featureType = element.dataset.featureType;
            const featureId = element.dataset.featureId;
            
            if (featureType && featureId) {
              this.loadFeatureForElement(featureType, featureId, element);
              // Unobserve after loading
              this.state.observer.unobserve(element);
              this.state.intersectionElements.delete(element);
            }
          }
        });
      }, {
        rootMargin: `${this.config.lazyLoadThreshold}px`,
        threshold: 0.1
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      console.warn('Enhancement Loader: IntersectionObserver not supported, using fallback');
      // Load all secondary features with a delay
      setTimeout(() => {
        this.loadSecondaryFeatures();
      }, 2000);
    }
  }

  /**
   * Register an element for lazy loading
   */
  registerForLazyLoad(element, featureType, featureId) {
    if (!element || !featureType || !featureId) return;
    
    // Set data attributes
    element.dataset.featureType = featureType;
    element.dataset.featureId = featureId;
    
    // Add to intersection observer
    if (this.state.observer) {
      this.state.observer.observe(element);
      this.state.intersectionElements.set(element, { featureType, featureId });
    } else {
      // Fallback - load immediately
      this.loadFeatureForElement(featureType, featureId, element);
    }
  }

  /**
   * Load feature for specific element
   */
  loadFeatureForElement(featureType, featureId, element) {
    console.log(`Enhancement Loader: Loading ${featureType} for element ${featureId}`);
    
    switch (featureType) {
      case 'hyperAV':
        this.loadModule('hyperAV')
          .then(() => {
            if (window.hyperAV) {
              const viz = window.hyperAV.addVisualization(featureId, 'hypercube', {
                ...this.performanceSettings.hyperAV
              });
            }
          });
        break;
      case 'portal':
        this.loadModule('portalTransitions')
          .then(() => {
            if (window.portalTransitions) {
              // Portal transitions are global, but we can trigger one
              window.portalTransitions.transitionToSection(featureId);
            }
          });
        break;
      case 'particles':
        this.loadModule('quantumParticles')
          .then(() => {
            if (window.quantumParticles) {
              window.quantumParticles.addParticleSystem(featureId, {
                ...this.performanceSettings.quantumParticles
              });
            }
          });
        break;
      default:
        console.warn(`Enhancement Loader: Unknown feature type ${featureType}`);
    }
  }

  /**
   * Load priority features
   */
  loadPriorityFeatures() {
    const features = this.config.priorityFeatures.filter(feature => 
      this.isFeatureEnabled(feature)
    );
    
    console.log(`Enhancement Loader: Loading priority features: ${features.join(', ')}`);
    
    features.forEach(feature => {
      this.loadModule(feature);
    });
  }

  /**
   * Load secondary features
   */
  loadSecondaryFeatures() {
    const features = this.config.secondaryFeatures.filter(feature => 
      this.isFeatureEnabled(feature)
    );
    
    console.log(`Enhancement Loader: Loading secondary features: ${features.join(', ')}`);
    
    features.forEach(feature => {
      this.loadModule(feature);
    });
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featureName) {
    // Check if explicitly disabled
    if (this.config.enabledFeatures[featureName] === false) {
      return false;
    }
    
    // Check if explicitly enabled
    if (this.config.enabledFeatures[featureName] === true) {
      return true;
    }
    
    // Default behavior based on performance tier
    const tier = this.state.performanceTier;
    
    // Enable all features for high and ultra, limited for others
    if (tier === 'ultra' || tier === 'high') {
      return true;
    }
    
    // For medium, enable primary and some secondary
    if (tier === 'medium') {
      return this.config.priorityFeatures.includes(featureName) || 
             (this.config.secondaryFeatures.includes(featureName) && 
              featureName !== 'realityDistortion'); // Disable the most intensive
    }
    
    // For low, only enable essential features
    return this.config.priorityFeatures.includes(featureName);
  }

  /**
   * Load a module by name
   */
  loadModule(name) {
    // Return existing promise if already loading
    if (this.state.loadPromises[name]) {
      return this.state.loadPromises[name];
    }
    
    // Return immediately if already loaded
    if (this.state.loadedModules[name]) {
      return Promise.resolve(this.state.loadedModules[name]);
    }
    
    // Map module names to file paths
    const moduleMap = {
      hyperAV: '/hyperav/hyperav-loader.js',
      portalTransitions: '/portal-transitions.js',
      quantumParticles: '/quantum-particles.js',
      realityDistortion: '/reality-distortion.js',
      hyperAVAudio: '/hyperav-audio.js',
      immersiveScroll: '/immersive-scroll.js'
    };
    
    const path = moduleMap[name];
    if (!path) {
      return Promise.reject(new Error(`Unknown module: ${name}`));
    }
    
    // Load the script
    const promise = this._loadScript(path)
      .then(() => {
        this.state.loadedModules[name] = true;
        delete this.state.loadPromises[name];
        
        console.log(`Enhancement Loader: Module ${name} loaded`);
        
        // For known modules, return their global instance
        switch(name) {
          case 'hyperAV':
            return window.hyperAV;
          case 'portalTransitions':
            return window.portalTransitions;
          case 'quantumParticles':
            return window.quantumParticles;
          case 'realityDistortion':
            return window.realityDistortion;
          case 'hyperAVAudio':
            return window.hyperAVAudio;
          default:
            return true;
        }
      })
      .catch(error => {
        console.error(`Enhancement Loader: Failed to load module ${name}`, error);
        delete this.state.loadPromises[name];
        throw error;
      });
    
    this.state.loadPromises[name] = promise;
    return promise;
  }

  /**
   * Load a script dynamically
   */
  _loadScript(url) {
    // Skip if already loaded
    if (this.state.loadedScripts.has(url)) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => {
        this.state.loadedScripts.add(url);
        resolve();
      };
      
      script.onerror = (error) => {
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      document.head.appendChild(script);
    });
  }

  /**
   * Load minimal features on error
   */
  _loadMinimalFeatures() {
    console.log('Enhancement Loader: Loading minimal feature set');
    
    // Only load the most essential modules
    this.loadModule('hyperAV'); // Main visualization engine
  }

  /**
   * Monitor performance in real-time
   */
  startPerformanceMonitoring() {
    let lastTime = performance.now();
    let frameCount = 0;
    
    const checkPerformance = () => {
      const now = performance.now();
      const deltaTime = now - lastTime;
      frameCount++;
      
      // Sample every second
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / deltaTime);
        
        // Add to samples
        this.config.perfMetrics.fpsSamples.push(fps);
        if (this.config.perfMetrics.fpsSamples.length > this.config.perfMetrics.sampleSize) {
          this.config.perfMetrics.fpsSamples.shift();
        }
        
        // Calculate average
        const avgFps = this.config.perfMetrics.fpsSamples.reduce((sum, val) => sum + val, 0) / 
                       this.config.perfMetrics.fpsSamples.length;
        
        // Check if performance is degrading
        if (avgFps < 30 && this.state.performanceTier !== 'low') {
          console.warn(`Enhancement Loader: Performance degradation detected (${avgFps.toFixed(1)} FPS)`);
          this._downgradePerformance();
        }
        
        // Reset counters
        frameCount = 0;
        lastTime = now;
      }
      
      // Continue monitoring
      this.perfMonitorId = requestAnimationFrame(checkPerformance);
    };
    
    this.perfMonitorId = requestAnimationFrame(checkPerformance);
  }

  /**
   * Stop performance monitoring
   */
  stopPerformanceMonitoring() {
    if (this.perfMonitorId) {
      cancelAnimationFrame(this.perfMonitorId);
      this.perfMonitorId = null;
    }
  }

  /**
   * Downgrade performance settings if FPS is too low
   */
  _downgradePerformance() {
    const currentTier = this.state.performanceTier;
    let newTier;
    
    // Step down one level
    if (currentTier === 'ultra') newTier = 'high';
    else if (currentTier === 'high') newTier = 'medium';
    else if (currentTier === 'medium') newTier = 'low';
    else return; // Already at lowest tier
    
    console.log(`Enhancement Loader: Downgrading performance from ${currentTier} to ${newTier}`);
    
    // Update tier
    this.state.performanceTier = newTier;
    
    // Apply new settings
    this._applyPerformanceSettings();
    
    // Notify components of performance change
    window.dispatchEvent(new CustomEvent('performanceSettingsChanged', {
      detail: {
        performanceTier: newTier,
        settings: this.performanceSettings,
        reason: 'performance_degradation'
      }
    }));
  }

  /**
   * Get current performance metrics
   */
  getPerformanceMetrics() {
    // Calculate average FPS
    const avgFps = this.config.perfMetrics.fpsSamples.length > 0 
      ? this.config.perfMetrics.fpsSamples.reduce((sum, val) => sum + val, 0) / 
        this.config.perfMetrics.fpsSamples.length
      : 0;
    
    return {
      currentTier: this.state.performanceTier,
      averageFps: avgFps,
      fpsSamples: [...this.config.perfMetrics.fpsSamples],
      capabilities: this.state.deviceCapabilities,
      loadedModules: Object.keys(this.state.loadedModules),
      hasReducedMotion: this.state.hasReducedMotion
    };
  }

  /**
   * Create accessibility settings panel
   */
  createAccessibilityPanel() {
    // Create panel container
    const container = document.createElement('div');
    container.className = 'accessibility-panel';
    container.innerHTML = `
      <div class="a11y-panel-toggle" aria-label="Accessibility settings" role="button" tabindex="0">
        <span class="a11y-icon">⚙</span>
      </div>
      <div class="a11y-panel-content">
        <h3>Accessibility Settings</h3>
        <div class="a11y-settings">
          <div class="a11y-setting">
            <label for="reduced-motion">Reduced Motion</label>
            <input type="checkbox" id="reduced-motion" ${this.state.hasReducedMotion ? 'checked' : ''}>
          </div>
          <div class="a11y-setting">
            <label for="high-contrast">High Contrast</label>
            <input type="checkbox" id="high-contrast">
          </div>
          <div class="a11y-setting">
            <label for="performance-level">Visual Effects</label>
            <select id="performance-level">
              <option value="ultra" ${this.state.performanceTier === 'ultra' ? 'selected' : ''}>Maximum</option>
              <option value="high" ${this.state.performanceTier === 'high' ? 'selected' : ''}>High</option>
              <option value="medium" ${this.state.performanceTier === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="low" ${this.state.performanceTier === 'low' ? 'selected' : ''}>Minimal</option>
              <option value="none">None</option>
            </select>
          </div>
          <div class="a11y-setting">
            <label for="text-size">Text Size</label>
            <select id="text-size">
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="x-large">Extra Large</option>
            </select>
          </div>
        </div>
        <button class="a11y-apply-btn">Apply Settings</button>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(container);
    
    // Add styles
    this._addAccessibilityStyles();
    
    // Add event listeners
    const toggle = container.querySelector('.a11y-panel-toggle');
    toggle.addEventListener('click', () => {
      container.classList.toggle('open');
    });
    
    // Handle keyboard navigation
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        container.classList.toggle('open');
        e.preventDefault();
      }
    });
    
    // Apply button
    const applyBtn = container.querySelector('.a11y-apply-btn');
    applyBtn.addEventListener('click', () => {
      this._applyAccessibilitySettings(container);
      container.classList.remove('open');
    });
    
    // Allow closing when clicking outside
    document.addEventListener('click', (e) => {
      if (container.classList.contains('open') && 
          !container.contains(e.target)) {
        container.classList.remove('open');
      }
    });
  }

  /**
   * Add styles for accessibility panel
   */
  _addAccessibilityStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .accessibility-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 10000;
        font-family: sans-serif;
      }
      
      .a11y-panel-toggle {
        width: 44px;
        height: 44px;
        background: rgba(0, 0, 0, 0.7);
        border: 2px solid #00ffcc;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
        transition: transform 0.2s ease;
      }
      
      .a11y-panel-toggle:hover {
        transform: scale(1.1);
      }
      
      .a11y-icon {
        color: #00ffcc;
        font-size: 24px;
      }
      
      .a11y-panel-content {
        position: absolute;
        bottom: 55px;
        right: 0;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid #00ffcc;
        border-radius: 8px;
        padding: 20px;
        width: 260px;
        box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
        transform: translateY(20px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
      }
      
      .accessibility-panel.open .a11y-panel-content {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }
      
      .a11y-panel-content h3 {
        color: #00ffcc;
        margin-top: 0;
        margin-bottom: 15px;
        font-size: 18px;
        border-bottom: 1px solid #00ffcc40;
        padding-bottom: 8px;
      }
      
      .a11y-settings {
        margin-bottom: 20px;
      }
      
      .a11y-setting {
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #fff;
      }
      
      .a11y-setting label {
        font-size: 14px;
      }
      
      .a11y-setting select, 
      .a11y-setting input[type="checkbox"] {
        background: #111;
        border: 1px solid #00ffcc80;
        color: #fff;
        padding: 5px;
        border-radius: 4px;
      }
      
      .a11y-setting select {
        width: 110px;
      }
      
      .a11y-apply-btn {
        background: #00ffcc;
        color: #000;
        border: none;
        padding: 8px 15px;
        border-radius: 4px;
        cursor: pointer;
        width: 100%;
        font-weight: bold;
        transition: all 0.2s ease;
      }
      
      .a11y-apply-btn:hover {
        background: #fff;
      }
      
      /* High contrast mode */
      body.high-contrast {
        filter: contrast(1.3);
      }
      
      /* Text size adjustments */
      body.text-size-large {
        font-size: 120%;
      }
      
      body.text-size-x-large {
        font-size: 150%;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Apply accessibility settings
   */
  _applyAccessibilitySettings(panel) {
    // Get settings
    const reducedMotion = panel.querySelector('#reduced-motion').checked;
    const highContrast = panel.querySelector('#high-contrast').checked;
    const performanceLevel = panel.querySelector('#performance-level').value;
    const textSize = panel.querySelector('#text-size').value;
    
    // Apply reduced motion
    this.state.hasReducedMotion = reducedMotion;
    window.enhancementSettings.reducedMotion = reducedMotion;
    
    // Dispatch event for components to adapt
    window.dispatchEvent(new CustomEvent('motionPreferenceChanged', { 
      detail: { reducedMotion: reducedMotion } 
    }));
    
    // Apply high contrast
    document.body.classList.toggle('high-contrast', highContrast);
    
    // Apply text size
    document.body.classList.remove('text-size-large', 'text-size-x-large');
    if (textSize !== 'normal') {
      document.body.classList.add('text-size-' + textSize);
    }
    
    // Apply performance level
    if (performanceLevel !== this.state.performanceTier) {
      if (performanceLevel === 'none') {
        // Disable all visual effects
        this._disableAllVisualEffects();
      } else {
        // Update performance tier
        this.state.performanceTier = performanceLevel;
        this._applyPerformanceSettings();
        
        // Notify components of performance change
        window.dispatchEvent(new CustomEvent('performanceSettingsChanged', {
          detail: {
            performanceTier: performanceLevel,
            settings: this.performanceSettings,
            reason: 'user_preference'
          }
        }));
      }
    }
    
    // Save settings in localStorage
    this._saveAccessibilitySettings({
      reducedMotion,
      highContrast,
      performanceLevel,
      textSize
    });
  }

  /**
   * Save accessibility settings to localStorage
   */
  _saveAccessibilitySettings(settings) {
    try {
      localStorage.setItem('v6-accessibility', JSON.stringify(settings));
    } catch (e) {
      console.warn('Enhancement Loader: Failed to save accessibility settings to localStorage', e);
    }
  }

  /**
   * Load accessibility settings from localStorage
   */
  _loadAccessibilitySettings() {
    try {
      const savedSettings = localStorage.getItem('v6-accessibility');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Apply settings
        if (settings.reducedMotion !== undefined) {
          this.state.hasReducedMotion = settings.reducedMotion;
          window.enhancementSettings.reducedMotion = settings.reducedMotion;
        }
        
        if (settings.highContrast) {
          document.body.classList.toggle('high-contrast', settings.highContrast);
        }
        
        if (settings.textSize && settings.textSize !== 'normal') {
          document.body.classList.add('text-size-' + settings.textSize);
        }
        
        if (settings.performanceLevel && settings.performanceLevel !== this.state.performanceTier) {
          if (settings.performanceLevel === 'none') {
            this._disableAllVisualEffects();
          } else {
            this.state.performanceTier = settings.performanceLevel;
            this._applyPerformanceSettings();
          }
        }
        
        // Update panel controls if it exists
        const panel = document.querySelector('.accessibility-panel');
        if (panel) {
          const reducedMotionInput = panel.querySelector('#reduced-motion');
          const highContrastInput = panel.querySelector('#high-contrast');
          const performanceLevelSelect = panel.querySelector('#performance-level');
          const textSizeSelect = panel.querySelector('#text-size');
          
          if (reducedMotionInput && settings.reducedMotion !== undefined) {
            reducedMotionInput.checked = settings.reducedMotion;
          }
          
          if (highContrastInput && settings.highContrast !== undefined) {
            highContrastInput.checked = settings.highContrast;
          }
          
          if (performanceLevelSelect && settings.performanceLevel) {
            performanceLevelSelect.value = settings.performanceLevel;
          }
          
          if (textSizeSelect && settings.textSize) {
            textSizeSelect.value = settings.textSize;
          }
        }
      }
    } catch (e) {
      console.warn('Enhancement Loader: Failed to load accessibility settings from localStorage', e);
    }
  }

  /**
   * Disable all visual effects
   */
  _disableAllVisualEffects() {
    console.log('Enhancement Loader: Disabling all visual effects');
    
    // Stop and remove all visual components
    ['hyperAV', 'portalTransitions', 'quantumParticles', 'realityDistortion'].forEach(moduleName => {
      if (window[moduleName] && typeof window[moduleName].destroy === 'function') {
        window[moduleName].destroy();
      }
    });
    
    // Remove all canvas elements
    document.querySelectorAll('canvas').forEach(canvas => {
      if (canvas.parentNode && (
          canvas.classList.contains('hyperav-canvas') || 
          canvas.classList.contains('portal-canvas') || 
          canvas.classList.contains('quantum-canvas') ||
          canvas.classList.contains('reality-canvas'))) {
        canvas.parentNode.removeChild(canvas);
      }
    });
    
    // Add class to body for CSS to handle
    document.body.classList.add('effects-disabled');
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.enhancementLoader = new EnhancementLoader({
    devMode: false,
    // Can override with URL params
    performanceProfile: new URLSearchParams(window.location.search).get('quality') || 'auto'
  });
  
  // Start performance monitoring
  setTimeout(() => {
    window.enhancementLoader.startPerformanceMonitoring();
  }, 5000); // Wait 5 seconds for initial page load to complete
  
  // Create accessibility panel
  setTimeout(() => {
    window.enhancementLoader.createAccessibilityPanel();
    window.enhancementLoader._loadAccessibilitySettings();
  }, 1000);
});