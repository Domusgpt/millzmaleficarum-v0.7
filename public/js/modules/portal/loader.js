/**
 * Portal Transitions Loader
 * Dynamic loader that initializes the portal transitions module
 */

import PortalTransitions, { portalStyles } from './PortalTransitions.js';

/**
 * Initialize the Portal Transitions module
 * @param {Object} options - Configuration options for portal transitions
 * @returns {PortalTransitions} - The initialized portal transitions instance
 */
export function initPortalTransitions(options = {}) {
  // Add portal styles to the document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = portalStyles;
  document.head.appendChild(styleSheet);
  
  // Create and return the portal transitions instance
  const portalInstance = new PortalTransitions(options);
  
  // Expose instance globally for backward compatibility
  window.portalTransitions = portalInstance;
  
  console.log('Portal Transitions Module: Initialized with ES6 module');
  return portalInstance;
}

// Auto-initialize when the document is loaded
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initPortalTransitions({
      useHyperAV: true,
      enableAudio: true
    });
  });
}

export default initPortalTransitions;