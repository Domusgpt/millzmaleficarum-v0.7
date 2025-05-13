/**
 * MillzMaleficarum Codex v0.6
 * Main module loader that initializes all system components
 */

import { initPortalTransitions } from './portal/loader.js';
import { initHyperAVSystem } from './hyperav/loader.js';

/**
 * Initialize the entire MillzMaleficarum Codex system
 * @param {Object} options - Configuration options for all modules
 * @returns {Object} - Object containing all initialized module instances
 */
export function initMillzMaleficarum(options = {}) {
  console.log('MillzMaleficarum Codex v0.6: Starting initialization');
  
  // Default options
  const defaultOptions = {
    hyperAV: {
      containerId: 'hyperav-background',
      pattern: 'tesseract',
      opacity: 0.4,
      color1: '#00ffcc',
      color2: '#ff33cc',
      speed: 0.03
    },
    audio: {
      autoplayOnInteraction: true,
      ambientMode: true,
      visualFeedback: true,
      enableMicrophoneInput: true,
      reactivityIntensity: 0.7
    },
    portal: {
      useHyperAV: true,
      enableAudio: true,
      portalIntensity: 0.8
    }
  };
  
  // Merge options
  const mergedOptions = {
    hyperAV: { ...defaultOptions.hyperAV, ...(options.hyperAV || {}) },
    audio: { ...defaultOptions.audio, ...(options.audio || {}) },
    portal: { ...defaultOptions.portal, ...(options.portal || {}) }
  };
  
  // Initialize HyperAV system first
  const hyperAVSystem = initHyperAVSystem(
    mergedOptions.hyperAV.containerId,
    mergedOptions.hyperAV,
    mergedOptions.audio
  );
  
  // Initialize Portal Transitions
  const portalSystem = initPortalTransitions(mergedOptions.portal);
  
  // Create and return system object
  const system = {
    hyperAV: hyperAVSystem.hyperAV,
    hyperAVAudio: hyperAVSystem.hyperAVAudio,
    portalTransitions: portalSystem
  };
  
  console.log('MillzMaleficarum Codex v0.6: Initialization complete');
  
  // Expose system globally for backward compatibility
  window.millzSystem = system;
  
  return system;
}

// Auto-initialize when the document is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initMillzMaleficarum();
  });
}

export default initMillzMaleficarum;