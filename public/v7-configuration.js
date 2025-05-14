/**
 * MillzMaleficarum Codex v0.7 Configuration
 * Central configuration for v0.7 enhancements and features
 */

// Create global configuration object
window.millzCodex = {
  version: 0.7,
  debug: false,
  features: {
    dimensionalWorlds: true,
    hyperAV: true,
    realityDistortion: true,
    quantumParticles: true,
    textEffects: true,
    spatialAudio: true
  },
  performance: {
    // Will be auto-detected, but can be manually set
    mode: 'auto', // 'high', 'medium', 'low', or 'auto'
    adaptiveQuality: true,
    optimizeParticles: true,
    useOffscreenCanvas: true,
    cullingEnabled: true
  },
  enhancements: {
    molecularDistortion: true,
    vortexTears: true,
    phantomEchoes: true,
    disintegrationEffect: true,
    neonLeakEffect: true,
    voidShiftEffect: true,
    colorShifting: true
  }
};

// Configure v7 systems when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log(`MillzMaleficarum Codex v${window.millzCodex.version} - Initializing configuration`);
  
  // Create global v7Enhancements flag for compatibility with systems that check for it
  window.v7Enhancements = true;
  
  // Detect performance capabilities
  detectPerformance();
  
  // Apply configuration
  configureSystemsWithTimeout();
  
  // Log initialization
  console.log(`MillzMaleficarum Codex v${window.millzCodex.version} - Configuration initialized with ${window.millzCodex.performance.mode} performance mode`);
});

/**
 * Detect performance capabilities and set appropriate mode
 */
function detectPerformance() {
  // Only detect if set to auto
  if (window.millzCodex.performance.mode !== 'auto') return;

  // Start with a base score
  let score = 5;
  
  // Hardware detection
  if (window.navigator.hardwareConcurrency) {
    // Add up to 3 points for multiple cores
    score += Math.min(window.navigator.hardwareConcurrency / 2, 3);
  }
  
  // Device memory detection
  if (window.navigator.deviceMemory) {
    score += Math.min(window.navigator.deviceMemory / 2, 2);
  }
  
  // Check for mobile devices
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    score -= 2;
  }
  
  // Check for reduced motion preference
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    score -= 2;
  }
  
  // Set mode based on score
  if (score >= 7) {
    window.millzCodex.performance.mode = 'high';
  } else if (score >= 4) {
    window.millzCodex.performance.mode = 'medium';
  } else {
    window.millzCodex.performance.mode = 'low';
    
    // Disable some features in low performance mode
    window.millzCodex.enhancements.vortexTears = false;
    window.millzCodex.enhancements.phantomEchoes = false;
  }
  
  if (window.millzCodex.debug) {
    console.log(`Performance detection: score ${score}, mode ${window.millzCodex.performance.mode}`);
  }
}

/**
 * Configure all systems with a timeout to ensure they're loaded
 */
function configureSystemsWithTimeout() {
  // Systems may not be loaded instantly, so we use a short timeout
  setTimeout(() => {
    configureRealityDistortion();
    configureQuantumParticles();
    configureTextEffects();
    configureHyperAV();
  }, 500);
}

/**
 * Configure reality distortion system
 */
function configureRealityDistortion() {
  if (!window.millzCodex.features.realityDistortion) return;
  
  if (window.realityDistortion) {
    // System is already initialized through reality-distortion-enhanced.js
    // Just make sure any configuration options are applied
    window.realityDistortion.options.useSoundEffects = window.millzCodex.features.spatialAudio;
    
    if (window.millzCodex.debug) {
      console.log('Reality Distortion configured with enhanced features enabled');
    }
  }
}

/**
 * Configure quantum particles system
 */
function configureQuantumParticles() {
  if (!window.millzCodex.features.quantumParticles) return;
  
  if (window.quantumParticles) {
    // Apply performance settings
    window.quantumParticles.options.performanceMode = window.millzCodex.performance.mode;
    window.quantumParticles.options.cullingEnabled = window.millzCodex.performance.cullingEnabled;
    window.quantumParticles.options.useOffscreenRendering = window.millzCodex.performance.useOffscreenCanvas;
    window.quantumParticles.options.adaptiveParticleCount = window.millzCodex.performance.optimizeParticles;
    
    // Apply quality settings based on performance mode
    if (window.millzCodex.performance.mode === 'low') {
      window.quantumParticles.options.quantumCount = Math.min(window.quantumParticles.options.quantumCount, 30);
      window.quantumParticles.options.canvasQuality = 0.6;
    } else if (window.millzCodex.performance.mode === 'medium') {
      window.quantumParticles.options.quantumCount = Math.min(window.quantumParticles.options.quantumCount, 50);
      window.quantumParticles.options.canvasQuality = 0.8;
    }
    
    if (window.millzCodex.debug) {
      console.log('Quantum Particles configured with performance mode:', window.millzCodex.performance.mode);
    }
  }
}

/**
 * Configure text effects system
 */
function configureTextEffects() {
  if (!window.millzCodex.features.textEffects) return;
  
  if (window.realityDistortionText) {
    // Apply enhanced effects
    window.realityDistortionText.config.effectTypes = [
      'glitch', 'warp', 'reality-break', 'quantum', 'dimensional',
      'disintegration', 'neon-leak', 'void-shift' // New v0.7 effects
    ];
    
    // Apply performance settings
    window.realityDistortionText.config.performanceMode = window.millzCodex.performance.mode;
    window.realityDistortionText.config.maxParticlesPerEffect = 
      window.millzCodex.performance.mode === 'high' ? 50 :
      window.millzCodex.performance.mode === 'medium' ? 30 : 15;
    
    // Refresh to apply new settings
    window.realityDistortionText.refresh();
    
    if (window.millzCodex.debug) {
      console.log('Reality Distortion Text configured with enhanced effects');
    }
  }
}

/**
 * Configure HyperAV system
 */
function configureHyperAV() {
  if (!window.millzCodex.features.hyperAV) return;
  
  if (window.universalHyperAV) {
    // Apply performance settings
    window.universalHyperAV.setOption('quality', 
      window.millzCodex.performance.mode === 'high' ? 'high' :
      window.millzCodex.performance.mode === 'medium' ? 'medium' : 'low'
    );
    
    // Connect systems for interactivity
    if (window.realityDistortion && window.millzCodex.features.realityDistortion) {
      window.universalHyperAV.registerExternalSystem('realityDistortion', window.realityDistortion);
    }
    
    if (window.quantumParticles && window.millzCodex.features.quantumParticles) {
      window.universalHyperAV.registerExternalSystem('quantumParticles', window.quantumParticles);
    }
    
    if (window.millzCodex.debug) {
      console.log('UniversalHyperAV configured with quality:', window.millzCodex.performance.mode);
    }
  }
}