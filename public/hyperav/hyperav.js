/**
 * HyperAV Integration for MillzMaleficarum Codex
 * Adds advanced visualizations to the magazine content
 */

// Configuration
const hyperAVConfig = {
  sigilMarkers: true,
  autoInitialize: true,
  quantumEffects: true,
  themeColor: 'vaporwave'
};

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  // Add required dependencies
  loadDependencies()
    .then(() => {
      // Initialize HyperAV system
      initializeHyperAV();
    })
    .catch(error => {
      console.error('Error loading HyperAV dependencies:', error);
    });
});

// Function to load dependencies
function loadDependencies() {
  return new Promise((resolve, reject) => {
    // Check if Three.js is already loaded
    if (window.THREE) {
      console.log('Three.js already loaded');
      loadCSS('/hyperav/hyperav.css').then(resolve).catch(reject);
      return;
    }

    // Load Three.js
    const threeScript = document.createElement('script');
    threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    threeScript.onload = () => {
      // Just load CSS, skip core files as they're already loaded
      loadCSS('/hyperav/hyperav.css').then(resolve).catch(reject);
    };
    threeScript.onerror = reject;
    document.head.appendChild(threeScript);
  });
}

// Helper function to load a script
function loadScript(url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Helper function to load CSS
function loadCSS(url) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

// Initialize HyperAV system
function initializeHyperAV() {
  // Set global configuration
  window.hyperAVConfig = hyperAVConfig;
  
  // The HyperAVLoader will be initialized automatically by hyperav-loader.js
  console.log('HyperAV system initialized');
}
