// HyperAV Loader for MillzMaleficarum Codex
// This utility helps integrate HyperAV visualizations into magazine content

class HyperAVLoader {
  constructor(options = {}) {
    this.options = {
      sigilMarkers: true,
      autoInitialize: true,
      quantumEffects: true,
      themeColor: 'vaporwave',
      ...options
    };
    
    this.visualizations = [];
    this.sigilElements = [];
    
    if (this.options.autoInitialize) {
      this.initialize();
    }
  }
  
  initialize() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }
  
  setup() {
    // Add required dependencies
    this.loadDependencies()
      .then(() => {
        // Find sigil markers in content
        if (this.options.sigilMarkers) {
          this.processSigilMarkers();
        }
        
        // Create container for quantum effects if enabled
        if (this.options.quantumEffects) {
          this.setupQuantumEffects();
        }
      })
      .catch(error => {
        console.error('Error setting up HyperAV:', error);
      });
  }
  
  loadDependencies() {
    // Load Three.js if not already loaded
    return new Promise((resolve, reject) => {
      if (window.THREE) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  processSigilMarkers() {
    // Find sigil markers in the content
    const content = document.querySelectorAll('.section-content');
    
    content.forEach(section => {
      let html = section.innerHTML;
      
      // Replace Xi sigil marker with visualization
      html = html.replace(/<sigil-Ξ>/g, (match, offset) => {
        const id = `sigil-xi-${this.sigilElements.length}`;
        this.sigilElements.push({
          id: id,
          type: 'dimensional-gateway',
          section: section
        });
        return `<div id="${id}" class="hyperav-sigil sigil-xi"></div>`;
      });
      
      // Replace Omega sigil marker with visualization
      html = html.replace(/<sigil-Ω>/g, (match, offset) => {
        const id = `sigil-omega-${this.sigilElements.length}`;
        this.sigilElements.push({
          id: id,
          type: 'hypercube',
          section: section
        });
        return `<div id="${id}" class="hyperav-sigil sigil-omega"></div>`;
      });
      
      section.innerHTML = html;
    });
    
    // Initialize visualizations for each sigil
    this.sigilElements.forEach(sigil => {
      this.initializeVisualization(sigil);
    });
    
    // Add styles for sigil containers
    this.addSigilStyles();
  }
  
  initializeVisualization(sigil) {
    const element = document.getElementById(sigil.id);
    if (!element) return;
    
    switch (sigil.type) {
      case 'dimensional-gateway':
        this.createDimensionalGateway(sigil.id);
        break;
      case 'hypercube':
        this.createHypercube(sigil.id);
        break;
      default:
        console.warn(`Unknown sigil type: ${sigil.type}`);
    }
  }
  
  createDimensionalGateway(containerId) {
    const viz = new DimensionalGateway(containerId, {
      width: 300,
      height: 200,
      colorScheme: this.options.themeColor,
      particleCount: 500
    });
    
    this.visualizations.push(viz);
  }
  
  createHypercube(containerId) {
    const viz = new Hypercube(containerId, {
      size: 50,
      colorScheme: this.options.themeColor
    });
    
    this.visualizations.push(viz);
  }
  
  setupQuantumEffects() {
    // Create quantum field background
    const container = document.createElement('div');
    container.id = 'quantum-field-container';
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '-1';
    document.body.appendChild(container);
    
    // Initialize quantum field
    const field = new QuantumField('quantum-field-container', {
      colorScheme: this.options.themeColor,
      gridSize: 80
    });
    
    this.visualizations.push(field);
  }
  
  addSigilStyles() {
    // Add CSS styles for sigil containers
    const style = document.createElement('style');
    style.textContent = `
      .hyperav-sigil {
        width: 300px;
        height: 200px;
        margin: 20px auto;
        position: relative;
      }
      
      .sigil-xi {
        border: 1px solid rgba(255, 113, 206, 0.3);
        border-radius: 5px;
      }
      
      .sigil-omega {
        border: 1px solid rgba(1, 205, 254, 0.3);
        border-radius: 50%;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add a new visualization to any element
  addVisualization(elementId, type, options = {}) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return;
    }
    
    // Merge with default options and theme
    const vizOptions = {
      colorScheme: this.options.themeColor,
      ...options
    };
    
    let viz;
    switch (type) {
      case 'dimensional-gateway':
        viz = new DimensionalGateway(elementId, vizOptions);
        break;
      case 'hypercube':
        viz = new Hypercube(elementId, vizOptions);
        break;
      case 'quantum-field':
        viz = new QuantumField(elementId, vizOptions);
        break;
      default:
        console.error(`Unknown visualization type: ${type}`);
        return;
    }
    
    this.visualizations.push(viz);
    return viz;
  }
}

// Initialize when included in page
document.addEventListener('DOMContentLoaded', () => {
  // Check for configuration
  const config = window.hyperAVConfig || {};
  
  // Create loader
  window.hyperAV = new HyperAVLoader(config);
});
