/**
 * Enhanced HyperAV Loader - v0.8
 * 
 * This script dynamically loads all required HyperAV components and
 * initializes the enhanced visualization system.
 * 
 * Usage:
 * <script src="js/enhanced-hyperav-loader.js" data-mode="magazine"></script>
 */

(function() {
  // Configuration
  const config = {
    // Base path for scripts
    basePath: '',
    
    // Core scripts to load
    coreScripts: [
      'hyperav/core/GeometryManager.js',
      'hyperav/core/HypercubeCore.js',
      'hyperav/core/ProjectionManager.js',
      'hyperav/core/ShaderManager.js',
      'hyperav/sound/modules/AnalysisModule.js',
      'hyperav/sound/modules/EffectsModule.js',
      'hyperav/sound/SoundInterface.js',
      'hyperav/UniversalHyperAV.js'
    ],
    
    // ES6 module scripts
    moduleScripts: [
      'js/modules/hyperav/enhanced-hyperav.js',
      'js/modules/hyperav/magazine-integration.js'
    ],
    
    // Default options
    defaultOptions: {
      // Demo mode
      demo: {
        containerId: 'hyperav-container',
        colorScheme: 'vaporwave',
        intensity: 1.0,
        audioReactive: true,
        activeWorld: 'lattice_world'
      },
      
      // Magazine mode
      magazine: {
        containerId: 'magazine-hyperav-container',
        zIndex: -1,
        intensity: 0.9,
        sectionAttribute: 'data-section',
        transitionOnScroll: true,
        initialSection: 'default',
        audioReactive: true
      }
    }
  };
  
  // State
  const state = {
    loaded: false,
    scriptsLoaded: 0,
    totalScripts: 0,
    startTime: Date.now(),
    mode: 'demo', // demo or magazine
    options: {},
    onReadyCallbacks: []
  };
  
  // Get current script element
  const currentScript = document.currentScript;
  
  /**
   * Initialize the loader
   */
  function init() {
    // Extract options from script tag attributes
    if (currentScript) {
      // Get mode
      if (currentScript.dataset.mode) {
        state.mode = currentScript.dataset.mode;
      }
      
      // Get base path if specified
      if (currentScript.dataset.path) {
        config.basePath = currentScript.dataset.path;
      }
      
      // Get container ID if specified
      if (currentScript.dataset.container) {
        state.containerOverride = currentScript.dataset.container;
      }
    }
    
    // Get options based on mode
    state.options = {...config.defaultOptions[state.mode]};
    
    // Apply container override if specified
    if (state.containerOverride) {
      state.options.containerId = state.containerOverride;
    }
    
    // Set total scripts count
    state.totalScripts = config.coreScripts.length + config.moduleScripts.length;
    
    // Load core scripts
    loadCoreScripts();
  }
  
  /**
   * Load core scripts
   */
  function loadCoreScripts() {
    config.coreScripts.forEach(script => {
      loadScript(script, 'classic');
    });
  }
  
  /**
   * Load module scripts
   */
  function loadModuleScripts() {
    config.moduleScripts.forEach(script => {
      loadScript(script, 'module');
    });
  }
  
  /**
   * Load a script
   * @param {string} src - Script source path
   * @param {string} type - Script type ('classic' or 'module')
   */
  function loadScript(src, type) {
    const script = document.createElement('script');
    script.src = config.basePath ? `${config.basePath}/${src}` : src;
    script.async = false;
    
    if (type === 'module') {
      script.type = 'module';
    }
    
    script.onload = () => {
      state.scriptsLoaded++;
      
      // Log progress
      console.log(`HyperAV Loader: ${state.scriptsLoaded}/${state.totalScripts} scripts loaded`);
      
      // Check if all scripts are loaded
      if (state.scriptsLoaded === config.coreScripts.length) {
        // Core scripts loaded, now load module scripts
        loadModuleScripts();
      } else if (state.scriptsLoaded === state.totalScripts) {
        // All scripts loaded
        onScriptsLoaded();
      }
    };
    
    script.onerror = (error) => {
      console.error(`HyperAV Loader: Failed to load script ${src}`, error);
    };
    
    document.head.appendChild(script);
  }
  
  /**
   * Handle all scripts loaded
   */
  function onScriptsLoaded() {
    state.loaded = true;
    
    // Calculate load time
    const loadTime = Date.now() - state.startTime;
    console.log(`HyperAV Loader: All scripts loaded in ${loadTime}ms`);
    
    // Initialize based on mode
    if (state.mode === 'magazine') {
      initMagazineMode();
    } else {
      initDemoMode();
    }
    
    // Call onReady callbacks
    state.onReadyCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('HyperAV Loader: Error in onReady callback', error);
      }
    });
  }
  
  /**
   * Initialize magazine mode
   */
  function initMagazineMode() {
    // Wait for modules to be available
    const initInterval = setInterval(() => {
      if (window.MagazineHyperAV) {
        clearInterval(initInterval);
        
        // Create magazine integration with options
        window.magazineHyperAV = new window.MagazineHyperAV(state.options);
        
        // Dispatch ready event
        dispatchReadyEvent('magazine');
      }
    }, 50);
  }
  
  /**
   * Initialize demo mode
   */
  function initDemoMode() {
    // Wait for UniversalHyperAV to be available
    const initInterval = setInterval(() => {
      if (window.UniversalHyperAV) {
        clearInterval(initInterval);
        
        // Create instance with options
        window.hyperAV = new window.UniversalHyperAV(state.options);
        
        // Dispatch ready event
        dispatchReadyEvent('demo');
      }
    }, 50);
  }
  
  /**
   * Dispatch ready event
   * @param {string} mode - The mode that was initialized
   */
  function dispatchReadyEvent(mode) {
    const event = new CustomEvent('hyperav:ready', {
      detail: {
        mode,
        options: state.options,
        instance: mode === 'magazine' ? window.magazineHyperAV : window.hyperAV
      },
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Register a callback for when HyperAV is ready
   * @param {Function} callback - Function to call when ready
   */
  function onReady(callback) {
    if (typeof callback !== 'function') return;
    
    if (state.loaded) {
      // Already loaded, call immediately
      callback();
    } else {
      // Add to callback queue
      state.onReadyCallbacks.push(callback);
    }
  }
  
  // Expose API
  window.HyperAVLoader = {
    onReady,
    getMode: () => state.mode,
    isLoaded: () => state.loaded
  };
  
  // Start loading when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();