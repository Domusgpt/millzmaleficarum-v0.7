/**
 * HyperAV Magazine Integration Module
 * 
 * Provides easy integration of the enhanced HyperAV visualization system into the MillzMaleficarum magazine.
 * Automatically handles different magazine sections with appropriate world types and transitions.
 */

import { EnhancedHyperAV } from './enhanced-hyperav.js';

// Section to world type mapping
const SECTION_WORLD_MAPPING = {
  'default': 'lattice_world',
  'editorial': 'lattice_world',
  'tech': 'circuit_world',
  'culture': 'nebula_world',
  'interview': 'vortex_world',
  'lore': 'quantum_field',
  'cyber': 'digital_world',
  'deep': 'neon_world',
  'void': 'eclipse_world'
};

// Section to color scheme mapping
const SECTION_COLOR_MAPPING = {
  'default': 'vaporwave',
  'editorial': 'editorial',
  'tech': 'circuit',
  'culture': 'culture',
  'interview': 'interview',
  'lore': 'cosmic',
  'cyber': 'cyber',
  'deep': 'quantum',
  'void': 'eclipse'
};

class MagazineHyperAV {
  /**
   * Create a new MagazineHyperAV integration
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    this.options = {
      containerId: 'magazine-hyperav-container',
      zIndex: -1,
      sectionAttribute: 'data-section',
      sectionChangeTransition: true,
      transitionOnScroll: true,
      scrollThreshold: 0.5, // Percentage of section visibility needed for transition
      initialSection: 'default',
      intensity: 0.9,
      audioReactive: true,
      colorScheme: 'vaporwave',
      ...options
    };
    
    // State
    this.state = {
      hyperAV: null,
      initialized: false,
      currentSection: this.options.initialSection,
      sections: new Map(), // section name -> element
      observer: null,
      scrollListenerActive: false
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the integration
   */
  initialize() {
    if (this.state.initialized) return;
    
    // Create enhanced HyperAV
    this.state.hyperAV = new EnhancedHyperAV({
      containerId: this.options.containerId,
      zIndex: this.options.zIndex,
      intensity: this.options.intensity,
      audioReactive: this.options.audioReactive,
      colorScheme: this.options.colorScheme,
      autoActivateWorlds: false, // We'll handle activation based on sections
      
      // Get world for initial section
      activeWorld: this._getWorldForSection(this.options.initialSection)
    });
    
    // Set up section detection
    this._setupSectionDetection();
    
    // Set up scroll-based transitions if enabled
    if (this.options.transitionOnScroll) {
      this._setupScrollTransitions();
    }
    
    // Set up event listeners
    this._setupEventListeners();
    
    this.state.initialized = true;
    console.log(`MagazineHyperAV: Initialized with ${this.state.sections.size} sections`);
  }
  
  /**
   * Set up section detection
   * @private
   */
  _setupSectionDetection() {
    // Find all elements with section attribute
    const sectionElements = document.querySelectorAll(`[${this.options.sectionAttribute}]`);
    
    // Store sections in map
    sectionElements.forEach(element => {
      const sectionName = element.getAttribute(this.options.sectionAttribute);
      if (sectionName) {
        this.state.sections.set(sectionName, element);
      }
    });
    
    // Set up intersection observer to detect visible sections
    if ('IntersectionObserver' in window) {
      this.state.observer = new IntersectionObserver(
        this._handleIntersection.bind(this),
        {
          threshold: [0, 0.25, 0.5, 0.75, 1.0]
        }
      );
      
      // Observe all section elements
      sectionElements.forEach(element => {
        this.state.observer.observe(element);
      });
    }
  }
  
  /**
   * Handle intersection changes for sections
   * @param {IntersectionObserverEntry[]} entries - Intersection entries
   * @private
   */
  _handleIntersection(entries) {
    // Skip if transition on scroll is active
    if (this.state.scrollListenerActive) return;
    
    // Find the most visible section
    let maxVisibility = 0;
    let mostVisibleSection = null;
    
    entries.forEach(entry => {
      const element = entry.target;
      const sectionName = element.getAttribute(this.options.sectionAttribute);
      
      if (sectionName && entry.intersectionRatio > maxVisibility) {
        maxVisibility = entry.intersectionRatio;
        mostVisibleSection = sectionName;
      }
    });
    
    // Change section if we have a new most visible section above threshold
    if (mostVisibleSection && 
        mostVisibleSection !== this.state.currentSection && 
        maxVisibility >= this.options.scrollThreshold) {
      this.changeSection(mostVisibleSection);
    }
  }
  
  /**
   * Set up scroll-based transitions
   * @private
   */
  _setupScrollTransitions() {
    // Add scroll event listener
    window.addEventListener('scroll', this._handleScroll.bind(this), { passive: true });
  }
  
  /**
   * Handle scroll events
   * @private
   */
  _handleScroll() {
    // Use requestAnimationFrame to limit scroll handling frequency
    if (!this.state.scrollRAF) {
      this.state.scrollRAF = requestAnimationFrame(() => {
        this._processScrollPosition();
        this.state.scrollRAF = null;
      });
    }
  }
  
  /**
   * Process current scroll position to update visualization
   * @private
   */
  _processScrollPosition() {
    // Skip if no hyperAV or no sections
    if (!this.state.hyperAV || this.state.sections.size === 0) return;
    
    // Mark scroll listener as active to prevent intersection conflicts
    this.state.scrollListenerActive = true;
    
    // Get current scroll info
    const scrollPos = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Calculate visible section info
    let maxVisibility = 0;
    let mostVisibleSection = null;
    let visibleSectionRect = null;
    
    this.state.sections.forEach((element, sectionName) => {
      const rect = element.getBoundingClientRect();
      
      // Calculate how much of the element is in the viewport
      const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
      const visibilityRatio = visibleHeight / rect.height;
      
      if (visibilityRatio > maxVisibility) {
        maxVisibility = visibilityRatio;
        mostVisibleSection = sectionName;
        visibleSectionRect = rect;
      }
    });
    
    // Change section if we have a new most visible section above threshold
    if (mostVisibleSection && 
        mostVisibleSection !== this.state.currentSection && 
        maxVisibility >= this.options.scrollThreshold) {
      this.changeSection(mostVisibleSection);
    }
    
    // Update visualization based on scroll position
    if (visibleSectionRect && this.state.hyperAV.hyperAV) {
      // Calculate how far through the section we are (0-1)
      const sectionProgress = Math.max(0, Math.min(1, 
        (windowHeight/2 - visibleSectionRect.top) / visibleSectionRect.height
      ));
      
      // Update visualization parameters based on scroll position
      this.state.hyperAV.updateCurrentWorld({
        // Adjust universe modifier based on scroll position
        universeModifier: 1.0 + (sectionProgress - 0.5) * 0.4,
        
        // Adjust rotation speed - faster when scrolling through middle of section
        rotationSpeed: 0.2 + Math.sin(sectionProgress * Math.PI) * 0.1
      });
    }
    
    // Reset scroll listener active flag after a delay
    setTimeout(() => {
      this.state.scrollListenerActive = false;
    }, 200);
  }
  
  /**
   * Set up event listeners
   * @private
   */
  _setupEventListeners() {
    // Listen for hyperAV events
    if (this.state.hyperAV) {
      this.state.hyperAV.on('transitionEnd', this._handleTransitionEnd.bind(this));
      this.state.hyperAV.on('error', this._handleError.bind(this));
    }
    
    // Listen for custom magazine events
    document.addEventListener('magazine:sectionChange', (event) => {
      if (event.detail && event.detail.section) {
        this.changeSection(event.detail.section);
      }
    });
  }
  
  /**
   * Handle transition end events
   * @param {Object} detail - Event details
   * @private
   */
  _handleTransitionEnd(detail) {
    console.log(`MagazineHyperAV: Transition complete to ${detail.toWorld}`);
    
    // Dispatch section change event
    this._dispatchEvent('sectionVisualizationReady', {
      section: this.state.currentSection,
      world: detail.toWorld
    });
  }
  
  /**
   * Handle error events
   * @param {Object} detail - Error details
   * @private
   */
  _handleError(detail) {
    console.error(`MagazineHyperAV: Error - ${detail.message}`);
  }
  
  /**
   * Get appropriate world for a section
   * @param {string} sectionName - Section name
   * @returns {string} World name
   * @private
   */
  _getWorldForSection(sectionName) {
    return SECTION_WORLD_MAPPING[sectionName] || SECTION_WORLD_MAPPING.default;
  }
  
  /**
   * Get appropriate color scheme for a section
   * @param {string} sectionName - Section name
   * @returns {string} Color scheme name
   * @private
   */
  _getColorForSection(sectionName) {
    return SECTION_COLOR_MAPPING[sectionName] || SECTION_COLOR_MAPPING.default;
  }
  
  /**
   * Dispatch a custom event
   * @param {string} eventName - Event name
   * @param {Object} detail - Event details
   * @private
   */
  _dispatchEvent(eventName, detail) {
    const event = new CustomEvent(`magazine:hyperav:${eventName}`, {
      detail,
      bubbles: true
    });
    
    document.dispatchEvent(event);
  }
  
  /**
   * Change to a different section
   * @param {string} sectionName - Section name
   * @returns {boolean} Success state
   */
  changeSection(sectionName) {
    // Skip if same section or hyperAV not available
    if (sectionName === this.state.currentSection || !this.state.hyperAV) {
      return false;
    }
    
    console.log(`MagazineHyperAV: Changing to section "${sectionName}"`);
    
    // Update current section
    this.state.currentSection = sectionName;
    
    // Get world and color for section
    const worldName = this._getWorldForSection(sectionName);
    const colorScheme = this._getColorForSection(sectionName);
    
    // Update world if needed
    if (this.options.sectionChangeTransition) {
      // Activate world for section with transition
      this.state.hyperAV.activateWorld(worldName);
      
      // Update color scheme
      this.state.hyperAV.updateCurrentWorld({
        colorScheme: colorScheme
      });
    } else {
      // Just update current world parameters without transition
      this.state.hyperAV.updateCurrentWorld({
        colorScheme: colorScheme,
        worldBlend: worldName.includes('quantum') ? 0.3 :
                    worldName.includes('vortex') ? 0.5 :
                    worldName.includes('nebula') ? 0.7 :
                    worldName.includes('circuit') ? 0.9 : 0.1
      });
    }
    
    // Dispatch section change event
    this._dispatchEvent('sectionChange', {
      section: sectionName,
      world: worldName,
      colorScheme: colorScheme
    });
    
    return true;
  }
  
  /**
   * Manually update visualization parameters
   * @param {Object} params - Parameters to update
   * @returns {boolean} Success state
   */
  updateVisualization(params) {
    if (!this.state.hyperAV) return false;
    return this.state.hyperAV.updateCurrentWorld(params);
  }
  
  /**
   * Get current section name
   * @returns {string} Current section name
   */
  getCurrentSection() {
    return this.state.currentSection;
  }
  
  /**
   * Dispose of resources
   */
  dispose() {
    // Disconnect observer
    if (this.state.observer) {
      this.state.observer.disconnect();
      this.state.observer = null;
    }
    
    // Remove scroll listener
    window.removeEventListener('scroll', this._handleScroll);
    
    // Dispose of hyperAV
    if (this.state.hyperAV) {
      this.state.hyperAV.dispose();
      this.state.hyperAV = null;
    }
    
    // Clear other resources
    this.state.sections.clear();
    this.state.initialized = false;
    
    console.log('MagazineHyperAV: Disposed');
  }
}

export { MagazineHyperAV };
export default MagazineHyperAV;