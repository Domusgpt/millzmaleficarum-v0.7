/**
 * Enhanced HyperAV ES6 Module
 * Provides a modernized, ES6 module interface to the enhanced HyperAV v0.8 visualization system
 */

// Import dependencies if using ES modules
// Note: In the current implementation, these are globally available

export class EnhancedHyperAV {
  /**
   * Create a new EnhancedHyperAV instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.hyperAV = null;
    this.options = {
      containerId: 'enhanced-hyperav-container',
      zIndex: -1,
      colorScheme: 'vaporwave',
      density: 0.8,
      intensity: 1.0,
      dimensionality: 4.0,
      renderMode: 'background',
      audioReactive: true,
      dynamicLighting: true,
      activeWorld: 'lattice_world',
      transitionDuration: 2000,
      autoActivateWorlds: true,
      worldActivationInterval: 30000, // 30 seconds between world changes
      worldActivationOrder: 'random', // 'random' or 'sequential'
      ...options
    };
    
    // State
    this.state = {
      initialized: false,
      activeWorldIndex: 0,
      worldActivationTimer: null,
      availableWorlds: [],
      eventListeners: new Map()
    };
    
    // Initialize if autoInit is not explicitly false
    if (options.autoInit !== false) {
      this.initialize();
    }
  }
  
  /**
   * Initialize the Enhanced HyperAV system
   * @returns {boolean} Success state
   */
  initialize() {
    if (this.state.initialized) return true;
    
    try {
      // Check if the UniversalHyperAV class is available
      if (typeof UniversalHyperAV !== 'function') {
        console.error('EnhancedHyperAV: UniversalHyperAV class not found');
        this._dispatchEvent('error', { 
          message: 'UniversalHyperAV class not found. Make sure to include the HyperAV scripts.' 
        });
        return false;
      }
      
      // Create HyperAV instance with callbacks
      this.hyperAV = new UniversalHyperAV({
        containerId: this.options.containerId,
        zIndex: this.options.zIndex,
        colorScheme: this.options.colorScheme,
        density: this.options.density,
        intensity: this.options.intensity,
        dimensionality: this.options.dimensionality,
        renderMode: this.options.renderMode,
        audioReactive: this.options.audioReactive,
        dynamicLighting: this.options.dynamicLighting,
        activeWorld: this.options.activeWorld,
        transitionDuration: this.options.transitionDuration,
        
        // Set up callbacks that will be forwarded to our event system
        callbacks: {
          onWorldChange: (worldName, config) => {
            this._dispatchEvent('worldChange', { worldName, config });
          },
          onTransitionStart: (fromWorld, toWorld) => {
            this._dispatchEvent('transitionStart', { fromWorld, toWorld });
          },
          onTransitionEnd: (fromWorld, toWorld) => {
            this._dispatchEvent('transitionEnd', { fromWorld, toWorld });
          },
          onError: (error) => {
            console.error('EnhancedHyperAV: Error:', error);
            this._dispatchEvent('error', { message: error.message || 'Unknown error' });
          }
        }
      });
      
      // Get available worlds
      if (this.hyperAV && this.hyperAV.state.worlds) {
        this.state.availableWorlds = Object.keys(this.hyperAV.state.worlds);
      }
      
      // Set up auto world activation if enabled
      if (this.options.autoActivateWorlds && this.state.availableWorlds.length > 1) {
        this._startWorldActivationTimer();
      }
      
      // Set up global event listeners
      this._setupGlobalListeners();
      
      this.state.initialized = true;
      this._dispatchEvent('initialized', {});
      return true;
    } catch (error) {
      console.error('EnhancedHyperAV: Initialization failed:', error);
      this._dispatchEvent('error', { 
        message: `Initialization failed: ${error.message}` 
      });
      return false;
    }
  }
  
  /**
   * Set up global event listeners
   * @private
   */
  _setupGlobalListeners() {
    // Handle visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden - pause auto world activation
        this._pauseWorldActivation();
      } else {
        // Page is visible again - resume auto world activation
        if (this.options.autoActivateWorlds) {
          this._startWorldActivationTimer();
        }
      }
    });
  }
  
  /**
   * Start the automatic world activation timer
   * @private
   */
  _startWorldActivationTimer() {
    // Clear any existing timer
    this._pauseWorldActivation();
    
    // Set up new timer
    this.state.worldActivationTimer = setInterval(() => {
      this._activateNextWorld();
    }, this.options.worldActivationInterval);
  }
  
  /**
   * Pause automatic world activation
   * @private
   */
  _pauseWorldActivation() {
    if (this.state.worldActivationTimer) {
      clearInterval(this.state.worldActivationTimer);
      this.state.worldActivationTimer = null;
    }
  }
  
  /**
   * Activate the next world in sequence or randomly
   * @private
   */
  _activateNextWorld() {
    if (!this.hyperAV || this.state.availableWorlds.length <= 1) return;
    
    let nextWorldName;
    
    if (this.options.worldActivationOrder === 'sequential') {
      // Move to next world in sequence
      this.state.activeWorldIndex = (this.state.activeWorldIndex + 1) % this.state.availableWorlds.length;
      nextWorldName = this.state.availableWorlds[this.state.activeWorldIndex];
    } else {
      // Choose a random world different from current
      let currentIndex = this.state.availableWorlds.indexOf(this.hyperAV.state.currentWorldName);
      if (currentIndex === -1) currentIndex = 0;
      
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * this.state.availableWorlds.length);
      } while (randomIndex === currentIndex && this.state.availableWorlds.length > 1);
      
      nextWorldName = this.state.availableWorlds[randomIndex];
      this.state.activeWorldIndex = randomIndex;
    }
    
    // Activate the selected world
    if (nextWorldName) {
      this.hyperAV.activateWorld(nextWorldName);
    }
  }
  
  /**
   * Dispatch a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} detail - Event details
   * @private
   */
  _dispatchEvent(eventName, detail) {
    // Handle internal event listeners
    if (this.state.eventListeners.has(eventName)) {
      const listeners = this.state.eventListeners.get(eventName);
      listeners.forEach(listener => listener(detail));
    }
    
    // Dispatch DOM custom event for external listeners
    const event = new CustomEvent(`hyperav:${eventName}`, {
      detail,
      bubbles: true
    });
    
    // Dispatch from container if available
    if (this.hyperAV && this.hyperAV.state.container) {
      this.hyperAV.state.container.dispatchEvent(event);
    } else {
      // Fallback to document
      document.dispatchEvent(event);
    }
  }
  
  /**
   * Add an event listener
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Event callback
   * @returns {EnhancedHyperAV} This instance for chaining
   */
  on(eventName, callback) {
    if (typeof callback !== 'function') return this;
    
    if (!this.state.eventListeners.has(eventName)) {
      this.state.eventListeners.set(eventName, []);
    }
    
    this.state.eventListeners.get(eventName).push(callback);
    return this;
  }
  
  /**
   * Remove an event listener
   * @param {string} eventName - Name of the event
   * @param {Function} callback - Event callback to remove
   * @returns {EnhancedHyperAV} This instance for chaining
   */
  off(eventName, callback) {
    if (!this.state.eventListeners.has(eventName)) return this;
    
    const listeners = this.state.eventListeners.get(eventName);
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
    }
    
    return this;
  }
  
  /**
   * Activate a specific world
   * @param {string} worldName - Name of world to activate
   * @returns {boolean} Success state
   */
  activateWorld(worldName) {
    if (!this.hyperAV) return false;
    return this.hyperAV.activateWorld(worldName);
  }
  
  /**
   * Update current world parameters
   * @param {Object} params - Parameters to update
   * @returns {boolean} Success state
   */
  updateCurrentWorld(params) {
    if (!this.hyperAV) return false;
    return this.hyperAV.updateCurrentWorld(params);
  }
  
  /**
   * Get current world name
   * @returns {string|null} Current world name or null if not available
   */
  getCurrentWorld() {
    if (!this.hyperAV) return null;
    return this.hyperAV.state.currentWorldName;
  }
  
  /**
   * Get list of available worlds
   * @returns {string[]} Array of world names
   */
  getAvailableWorlds() {
    return [...this.state.availableWorlds];
  }
  
  /**
   * Enable or disable automatic world activation
   * @param {boolean} enable - Whether to enable auto activation
   * @returns {EnhancedHyperAV} This instance for chaining
   */
  setAutoActivation(enable) {
    this.options.autoActivateWorlds = !!enable;
    
    if (enable) {
      this._startWorldActivationTimer();
    } else {
      this._pauseWorldActivation();
    }
    
    return this;
  }
  
  /**
   * Set world activation interval
   * @param {number} interval - Interval in milliseconds
   * @returns {EnhancedHyperAV} This instance for chaining
   */
  setActivationInterval(interval) {
    if (typeof interval !== 'number' || interval < 1000) {
      console.warn('EnhancedHyperAV: Invalid interval. Must be at least 1000ms.');
      return this;
    }
    
    this.options.worldActivationInterval = interval;
    
    // Restart timer if active
    if (this.options.autoActivateWorlds && this.state.worldActivationTimer) {
      this._startWorldActivationTimer();
    }
    
    return this;
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    // Stop auto activation
    this._pauseWorldActivation();
    
    // Dispose of HyperAV
    if (this.hyperAV) {
      this.hyperAV.dispose();
      this.hyperAV = null;
    }
    
    // Clear event listeners
    this.state.eventListeners.clear();
    
    // Mark as uninitialized
    this.state.initialized = false;
    
    console.log('EnhancedHyperAV: Disposed');
  }
}

// Export a factory function for easy creation
export function createEnhancedHyperAV(options) {
  return new EnhancedHyperAV(options);
}

// Export default for easy importing
export default EnhancedHyperAV;