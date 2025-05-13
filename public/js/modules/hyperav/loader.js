/**
 * HyperAV Loader
 * Initializes both the HyperAV visualization engine and HyperAVAudio modules
 */

import HyperAV from './core/index.js';
import HyperAVAudio, { audioStyles } from './audio/index.js';

/**
 * Initialize the HyperAV visualization engine
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Configuration options for HyperAV
 * @returns {HyperAV} - Initialized HyperAV instance
 */
export function initHyperAV(containerId, options = {}) {
  const hyperAVInstance = new HyperAV(containerId, options);
  
  // Expose instance globally for backward compatibility
  window.hyperAV = hyperAVInstance;
  
  console.log('HyperAV Module: Initialized with ES6 module');
  return hyperAVInstance;
}

/**
 * Initialize the HyperAVAudio module
 * @param {Object} options - Configuration options for HyperAVAudio
 * @returns {HyperAVAudio} - Initialized HyperAVAudio instance
 */
export function initHyperAVAudio(options = {}) {
  // Add audio styles to the document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = audioStyles;
  document.head.appendChild(styleSheet);
  
  // Create audio instance
  const audioInstance = new HyperAVAudio({
    ...options,
    hyperAVInstance: options.hyperAVInstance || window.hyperAV
  });
  
  // Expose instance globally for backward compatibility
  window.hyperAVAudio = audioInstance;
  
  console.log('HyperAV Audio: Initialized with ES6 module');
  return audioInstance;
}

/**
 * Initialize both HyperAV and HyperAVAudio modules
 * @param {string} containerId - ID of the container element
 * @param {Object} hyperAVOptions - Configuration options for HyperAV
 * @param {Object} audioOptions - Configuration options for HyperAVAudio
 * @returns {Object} - Object containing both instances
 */
export function initHyperAVSystem(containerId, hyperAVOptions = {}, audioOptions = {}) {
  // Initialize HyperAV
  const hyperAVInstance = initHyperAV(containerId, hyperAVOptions);
  
  // Initialize HyperAVAudio with the HyperAV instance
  const audioInstance = initHyperAVAudio({
    ...audioOptions,
    hyperAVInstance
  });
  
  console.log('HyperAV System: Fully initialized with ES6 modules');
  return {
    hyperAV: hyperAVInstance,
    hyperAVAudio: audioInstance
  };
}

// Auto-initialize when the document is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if container exists
    if (document.getElementById('hyperav-background')) {
      initHyperAVSystem('hyperav-background', { opacity: 0.3 }, {
        autoplayOnInteraction: true,
        ambientMode: true,
        visualFeedback: true,
        enableMicrophoneInput: true
      });
      
      // Generate synthetic audio for ambient mode
      if (window.hyperAVAudio) {
        window.hyperAVAudio.generateSyntheticAudio('quantum_pulse', 60);
      }
    }
  });
}

export { HyperAV, HyperAVAudio, audioStyles };
export default initHyperAVSystem;