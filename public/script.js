/**
 * MillzMaleficarum Codex v0.7
 * Main frontend script for the dimensional magazine experience
 */

// Global instances
let universalHyperAV;
let dimensionalWorlds;
let realityDistortionText;

document.addEventListener('DOMContentLoaded', function() {
  // Create quantum loader
  createQuantumLoader();
  
  // Initialize systems
  initializeHyperAV();
  initializeDimensionalWorlds();
  setupPortalNavigation();
  
  // Hide quantum loader when everything is ready
  setTimeout(() => {
    const loader = document.querySelector('.quantum-loader');
    if (loader) {
      loader.classList.add('inactive');
      setTimeout(() => loader.remove(), 500);
    }
  }, 2000);
});

/**
 * Creates a loading animation
 */
function createQuantumLoader() {
  const loader = document.createElement('div');
  loader.className = 'quantum-loader';
  
  const spinner = document.createElement('div');
  spinner.className = 'quantum-spinner';
  
  const text = document.createElement('div');
  text.className = 'quantum-text';
  text.textContent = 'Initializing Dimensional Interface...';
  
  loader.appendChild(spinner);
  loader.appendChild(text);
  document.body.appendChild(loader);
}

/**
 * Initialize HyperAV universal visualization system
 */
function initializeHyperAV() {
  // Create world configurations for different sections
  const worldConfigs = {
    cover: {
      colorScheme: 'vaporwave',
      dimensionality: 4.0,
      rotationSpeed: 0.1,
      universeModifier: 1.0,
      patternIntensity: 0.7,
      gridDensity: 8.0,
      worldBlend: 0.4,
      worldIntensity: 0.8
    },
    editorial: {
      colorScheme: 'editorial',
      dimensionality: 4.2,
      rotationSpeed: 0.15,
      universeModifier: 1.2,
      patternIntensity: 0.6,
      gridDensity: 6.0,
      worldBlend: 0.5,
      worldIntensity: 0.7
    },
    tech: {
      colorScheme: 'tech',
      dimensionality: 4.5,
      rotationSpeed: 0.2,
      universeModifier: 1.5,
      patternIntensity: 0.9,
      gridDensity: 12.0,
      worldBlend: 0.7,
      worldIntensity: 0.9
    },
    culture: {
      colorScheme: 'culture',
      dimensionality: 3.8,
      rotationSpeed: 0.12,
      universeModifier: 0.9,
      patternIntensity: 0.8,
      gridDensity: 5.0,
      worldBlend: 0.6,
      worldIntensity: 0.8
    },
    interview: {
      colorScheme: 'interview',
      dimensionality: 4.0,
      rotationSpeed: 0.1,
      universeModifier: 1.1,
      patternIntensity: 0.5,
      gridDensity: 7.0,
      worldBlend: 0.3,
      worldIntensity: 0.6
    },
    lore: {
      colorScheme: 'lore',
      dimensionality: 4.7,
      rotationSpeed: 0.08,
      universeModifier: 1.3,
      patternIntensity: 0.7,
      gridDensity: 9.0,
      worldBlend: 0.8,
      worldIntensity: 0.9
    }
  };

  // Initialize Universal HyperAV
  universalHyperAV = new UniversalHyperAV({
    containerId: 'hyperav-universal-container',
    colorScheme: 'vaporwave',
    density: 0.8,
    intensity: 0.9,
    dimensionality: 4.0,
    renderMode: 'background',
    audioReactive: true,
    dynamicLighting: true,
    activeWorld: 'cover',
    worldConfigs: worldConfigs,
    onWorldChange: (worldName, config) => {
      console.log(`HyperAV world changed to: ${worldName}`);
    }
  });
  
  // Make globally available
  window.universalHyperAV = universalHyperAV;
}

/**
 * Initialize dimensional worlds system
 */
function initializeDimensionalWorlds() {
  // Initialize dimensional worlds
  dimensionalWorlds = new DimensionalWorlds({
    contentContainer: '#magazine-content',
    worldSelector: '.cover-section, .editorial-section, .culture-section, .tech-section, .interview-section, .lore-section',
    transitionDuration: 1500,
    useHyperAV: true,
    usePortalTransitions: true,
    enableAudio: true,
    initialWorldId: 'cover',
    createNav: true
  });
  
  // Make globally available
  window.dimensionalWorlds = dimensionalWorlds;
}

/**
 * Set up portal button navigation
 */
function setupPortalNavigation() {
  // Create event delegation for portal buttons
  document.addEventListener('click', (event) => {
    // Check if a portal button was clicked
    if (event.target.classList.contains('portal-button') && event.target.dataset.worldTarget) {
      const targetWorld = event.target.dataset.worldTarget;
      
      // Navigate to the target world
      if (window.dimensionalWorlds) {
        window.dimensionalWorlds.navigateToWorld(targetWorld);
      }
    }
  });
}

/**
 * Creates a reality distortion effect
 */
function triggerRealityDistortion() {
  document.body.classList.add('reality-distortion-active');
  
  // Create distortion elements
  createDistortionElements();
  
  // Remove after animation completes
  setTimeout(() => {
    document.body.classList.remove('reality-distortion-active');
    removeDistortionElements();
  }, 2000);
}

/**
 * Creates visual elements for reality distortion effect
 */
function createDistortionElements() {
  // Add distortion container if it doesn't exist
  let container = document.querySelector('.reality-distortion-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'reality-distortion-container';
    document.body.appendChild(container);
  }
  
  // Create laser grid overlay
  const laserGrid = document.createElement('div');
  laserGrid.className = 'laser-grid-overlay';
  container.appendChild(laserGrid);
  
  // Create random dimensional rifts
  for (let i = 0; i < 5; i++) {
    const rift = document.createElement('div');
    rift.className = 'dimensional-rift';
    rift.style.top = `${Math.random() * 100}%`;
    rift.style.left = `${Math.random() * 100}%`;
    rift.style.width = `${50 + Math.random() * 100}px`;
    rift.style.height = `${50 + Math.random() * 100}px`;
    container.appendChild(rift);
  }
  
  // Create fracture points
  for (let i = 0; i < 8; i++) {
    const fracture = document.createElement('div');
    fracture.className = 'fracture-point';
    fracture.style.top = `${Math.random() * 100}%`;
    fracture.style.left = `${Math.random() * 100}%`;
    container.appendChild(fracture);
  }
}

/**
 * Removes distortion elements
 */
function removeDistortionElements() {
  const container = document.querySelector('.reality-distortion-container');
  if (container) {
    // Wait for animations to complete
    setTimeout(() => {
      container.innerHTML = '';
    }, 2000);
  }
}

// Expose global functions
window.triggerRealityDistortion = triggerRealityDistortion;