/**
 * MillzMaleficarum Codex v0.4
 * Infinite Scroll with Glitchy Section Transitions
 * Creates a seamless, infinite scrolling experience with unique section transitions
 */

class InfiniteScroll {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      contentContainer: options.contentContainer || '#magazine-content',
      sectionSelector: options.sectionSelector || '.section, .cover-section, .editorial-section, .culture-section, .tech-section, .interview-section, .ads-section, .lore-section',
      transitionDuration: options.transitionDuration || 1200,
      loadThreshold: options.loadThreshold || 0.8, // % of viewport from bottom to trigger load
      maxSectionsInDOM: options.maxSectionsInDOM || 10,
      enableGlitchEffects: options.enableGlitchEffects !== false,
      enableInfiniteLoop: options.enableInfiniteLoop !== false,
      preloadImages: options.preloadImages !== false,
      debugMode: options.debugMode || false
    };

    // State
    this.state = {
      container: null,
      sections: [],
      visibleSections: [],
      visibilityObserver: null,
      loadingMore: false,
      allContentLoaded: false,
      scrollPosition: 0,
      loopCount: 0,
      transitionInProgress: false,
      sectionTypeMap: {
        'cover-section': 'cover',
        'editorial-section': 'editorial',
        'culture-section': 'culture',
        'tech-section': 'tech',
        'interview-section': 'interview',
        'ads-section': 'ads',
        'lore-section': 'lore'
      }
    };

    // Initialize
    this._initialize();
  }

  /**
   * Initialize the infinite scroll system
   */
  _initialize() {
    // Find the content container
    this.state.container = document.querySelector(this.config.contentContainer);
    if (!this.state.container) {
      console.error('Infinite Scroll: Content container not found');
      return;
    }

    // Add special class to container for styling
    this.state.container.classList.add('infinite-scroll-container');

    // Find initial sections
    this.state.sections = Array.from(this.state.container.querySelectorAll(this.config.sectionSelector));
    if (this.state.sections.length === 0) {
      console.warn('Infinite Scroll: No sections found');
      return;
    }

    // Create section type map for each section
    this.state.sections.forEach(section => {
      this._identifySectionType(section);
    });

    // Set up the intersection observer
    this._setupIntersectionObserver();

    // Add scroll event listener
    window.addEventListener('scroll', this._handleScroll.bind(this), { passive: true });

    // Initialize glitch effects if enabled
    if (this.config.enableGlitchEffects) {
      this._setupGlitchEffects();
    }

    console.log(`Infinite Scroll: Initialized with ${this.state.sections.length} sections`);
  }

  /**
   * Identifies and tags section with its type
   */
  _identifySectionType(section) {
    const classList = Array.from(section.classList);
    
    // Find the section type from class name
    for (const className of classList) {
      if (this.state.sectionTypeMap[className]) {
        section.dataset.sectionType = this.state.sectionTypeMap[className];
        return;
      }
    }
    
    // Default to generic if not found
    section.dataset.sectionType = 'generic';
  }

  /**
   * Sets up the intersection observer for tracking visible sections
   */
  _setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      console.warn('Infinite Scroll: IntersectionObserver not supported');
      return;
    }

    this.state.visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const section = entry.target;
        
        if (entry.isIntersecting) {
          // Section is now visible
          if (!this.state.visibleSections.includes(section)) {
            this.state.visibleSections.push(section);
            this._onSectionVisible(section);
          }
          
          // Check if we're near the end and need to load more
          if (entry.target === this.state.sections[this.state.sections.length - 1]) {
            this._loadMoreContent();
          }
        } else {
          // Section is no longer visible
          const index = this.state.visibleSections.indexOf(section);
          if (index > -1) {
            this.state.visibleSections.splice(index, 1);
            this._onSectionHidden(section);
          }
        }
      });
      
      // Clean up DOM if needed
      this._cleanupOffscreenSections();
    }, {
      rootMargin: `0px 0px ${window.innerHeight * this.config.loadThreshold}px 0px`,
      threshold: 0.1
    });

    // Observe all sections
    this.state.sections.forEach(section => {
      this.state.visibilityObserver.observe(section);
    });
  }

  /**
   * Handle scroll events
   */
  _handleScroll() {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - this.state.scrollPosition;
    const scrollingDown = deltaY > 0;
    
    this.state.scrollPosition = currentScrollY;
    
    // Debug output
    if (this.config.debugMode) {
      console.log(`Scroll: ${currentScrollY}, Direction: ${scrollingDown ? 'down' : 'up'}, Visible sections: ${this.state.visibleSections.length}`);
    }
    
    // Trigger random glitch effects occasionally when scrolling fast
    if (this.config.enableGlitchEffects && Math.abs(deltaY) > 60 && Math.random() < 0.1) {
      this._triggerRandomGlitch();
    }
  }

  /**
   * Triggered when a section becomes visible
   */
  _onSectionVisible(section) {
    // Add visible class for CSS hooks
    section.classList.add('is-visible');
    
    // Update URL hash for current section if it has an ID
    if (section.id && !this.state.transitionInProgress) {
      history.replaceState(null, null, `#${section.id}`);
    }
    
    // Trigger section-specific entry animation if no transition is in progress
    if (!this.state.transitionInProgress) {
      this._triggerSectionEntryAnimation(section);
    }
    
    // Log for debugging
    if (this.config.debugMode) {
      console.log(`Section visible: ${section.id || 'unnamed'} (${section.dataset.sectionType})`);
    }
  }

  /**
   * Triggered when a section is no longer visible
   */
  _onSectionHidden(section) {
    // Remove visible class
    section.classList.remove('is-visible');
    
    // Log for debugging
    if (this.config.debugMode) {
      console.log(`Section hidden: ${section.id || 'unnamed'} (${section.dataset.sectionType})`);
    }
  }

  /**
   * Load more content when approaching the end
   */
  _loadMoreContent() {
    // Don't load if already loading or all content loaded
    if (this.state.loadingMore || (this.state.allContentLoaded && !this.config.enableInfiniteLoop)) {
      return;
    }
    
    this.state.loadingMore = true;
    
    // Show loading indicator
    this._showLoadingIndicator();
    
    // If infinite loop is enabled, clone the first few sections
    if (this.config.enableInfiniteLoop) {
      setTimeout(() => {
        this._loopContent();
        this.state.loadingMore = false;
        this._hideLoadingIndicator();
      }, 500); // Simulate loading delay
    } else {
      // Here you could fetch new content from an API
      // For now, we'll just simulate loading and set allContentLoaded
      setTimeout(() => {
        this.state.allContentLoaded = true;
        this.state.loadingMore = false;
        this._hideLoadingIndicator();
        
        // Add "end of content" marker
        this._addEndOfContentMarker();
      }, 1000);
    }
  }

  /**
   * Loop content by cloning sections from the beginning
   */
  _loopContent() {
    // Clone the first few sections
    const sectionsToClone = Math.min(this.state.sections.slice(0, 3));
    const clonedSections = [];
    
    for (let i = 0; i < sectionsToClone; i++) {
      const original = this.state.sections[i];
      const clone = original.cloneNode(true);
      
      // Give it a new ID to prevent duplicates
      if (clone.id) {
        clone.id = `${clone.id}-loop-${this.state.loopCount}`;
      }
      
      // Add a special class for potential styling
      clone.classList.add('infinite-loop-clone');
      clone.dataset.loopGeneration = this.state.loopCount;
      
      // Add randomization to cloned content for variety
      this._randomizeClonedContent(clone);
      
      // Add to DOM and section list
      this.state.container.appendChild(clone);
      this.state.sections.push(clone);
      clonedSections.push(clone);
      
      // Observe the new section
      this.state.visibilityObserver.observe(clone);
    }
    
    // Increment loop counter
    this.state.loopCount++;
    
    // Create transition effect between original and looped content
    this._createLoopTransitionEffect();
    
    if (this.config.debugMode) {
      console.log(`Content loop ${this.state.loopCount}: Cloned ${clonedSections.length} sections`);
    }
  }

  /**
   * Add subtle randomization to cloned content for variety
   */
  _randomizeClonedContent(clonedSection) {
    // Find headings and paragraphs
    const headings = clonedSection.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const paragraphs = clonedSection.querySelectorAll('p');
    
    // Apply subtle text modifications to some paragraphs
    paragraphs.forEach(p => {
      // Random chance to modify
      if (Math.random() < 0.3) {
        const text = p.textContent;
        
        // Replace some words with glitchy alternatives
        const words = text.split(' ');
        for (let i = 0; i < words.length; i++) {
          if (words[i].length > 5 && Math.random() < 0.1) {
            words[i] = this._createGlitchyWord();
          }
        }
        
        p.textContent = words.join(' ');
      }
    });
    
    // Randomize some heading text
    headings.forEach(heading => {
      if (Math.random() < 0.2) {
        const glitchClass = Math.random() < 0.5 ? 'extreme-glitch' : 'subtle-glitch';
        heading.classList.add(glitchClass);
      }
    });
  }

  /**
   * Create a glitchy word replacement
   */
  _createGlitchyWord() {
    const glitchWords = [
      'R̸E̷D̶A̷C̶T̵E̴D̸',
      'V̸̭̕O̶̢̊I̷̳̋D̵̖̊',
      'T̸̨͍̜̹̲̄Ę̵̞̝̱̯̈́̾̓̕̚Ś̴̡͔͠Ṡ̷̟̮̝̪͔͔͋̌͛̐̀͘E̴̡̻̮̥̩̣̓̓͝R̸̺̠̻̱͖̖̀̊A̴̱͇͎͖̭̯̘̔̈́̑̋͗Ć̴̨̹̇̐T̶̤̣̓̈́͂̒͒̒͊',
      'M̴͉͝Į̴͝Ḷ̶̈́L̸͍̈́Z̵͚̔',
      'Ù̸̻n̴̥̎k̷̤̉n̶̞̒o̵̜͌w̵̝̎n̶̫̊',
      'ERROR:///',
      '<REDACTED>',
      '[DATA_EXPUNGED]'
    ];
    
    return glitchWords[Math.floor(Math.random() * glitchWords.length)];
  }

  /**
   * Create transition effect between original and looped content
   */
  _createLoopTransitionEffect() {
    this.state.transitionInProgress = true;
    
    // Create transition overlay
    const overlay = document.createElement('div');
    overlay.className = 'loop-transition-overlay';
    document.body.appendChild(overlay);
    
    // Add glitch animation class
    setTimeout(() => {
      overlay.classList.add('active');
      
      // Remove after transition completes
      setTimeout(() => {
        overlay.classList.remove('active');
        
        setTimeout(() => {
          overlay.remove();
          this.state.transitionInProgress = false;
        }, 500);
      }, this.config.transitionDuration);
    }, 50);
  }

  /**
   * Show loading indicator
   */
  _showLoadingIndicator() {
    let loader = document.querySelector('.infinite-scroll-loader');
    
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'infinite-scroll-loader';
      loader.innerHTML = `
        <div class="loader-text">Transmitting Data</div>
        <div class="loader-animation">
          <div class="loader-symbol"></div>
        </div>
      `;
      this.state.container.appendChild(loader);
    }
    
    loader.classList.add('visible');
  }

  /**
   * Hide loading indicator
   */
  _hideLoadingIndicator() {
    const loader = document.querySelector('.infinite-scroll-loader');
    if (loader) {
      loader.classList.remove('visible');
    }
  }

  /**
   * Add "end of content" marker
   */
  _addEndOfContentMarker() {
    const marker = document.createElement('div');
    marker.className = 'end-of-content-marker';
    marker.innerHTML = `
      <div class="eoc-symbol">◊</div>
      <div class="eoc-text">End of Transmission</div>
      <div class="eoc-symbol">◊</div>
    `;
    this.state.container.appendChild(marker);
  }

  /**
   * Remove elements that are far off-screen to preserve memory
   */
  _cleanupOffscreenSections() {
    // Skip if fewer than the max limit
    if (this.state.sections.length <= this.config.maxSectionsInDOM) {
      return;
    }
    
    // Find sections to potentially remove
    const offscreenSections = this.state.sections.filter(section => 
      !this.state.visibleSections.includes(section)
    );
    
    // Ensure we keep at least a few sections before and after visible ones
    if (offscreenSections.length > 3) {
      // Get indices of first and last visible sections
      const visibleIndices = this.state.visibleSections.map(section => 
        this.state.sections.indexOf(section)
      );
      
      const firstVisibleIndex = Math.min(...visibleIndices);
      const lastVisibleIndex = Math.max(...visibleIndices);
      
      // Find sections that are far from visible range
      const sectionsToRemove = [];
      
      this.state.sections.forEach((section, index) => {
        // Keep sections within buffer range of visible sections
        const bufferSize = 2;
        if (index < firstVisibleIndex - bufferSize || index > lastVisibleIndex + bufferSize) {
          // Only remove cloned sections
          if (section.classList.contains('infinite-loop-clone') && !this.state.visibleSections.includes(section)) {
            sectionsToRemove.push(section);
          }
        }
      });
      
      // Don't remove too many at once
      const maxToRemove = 5;
      const removeBatch = sectionsToRemove.slice(0, maxToRemove);
      
      if (removeBatch.length > 0 && this.config.debugMode) {
        console.log(`Cleaning up ${removeBatch.length} offscreen sections`);
      }
      
      // Remove from DOM and unobserve
      removeBatch.forEach(section => {
        // Get index in sections array
        const index = this.state.sections.indexOf(section);
        if (index > -1) {
          // Remove from sections array
          this.state.sections.splice(index, 1);
          
          // Unobserve
          this.state.visibilityObserver.unobserve(section);
          
          // Remove from DOM
          section.remove();
        }
      });
    }
  }

  /**
   * Set up glitch effects system
   */
  _setupGlitchEffects() {
    // Add glitch stylesheet for transitions and effects
    const style = document.createElement('style');
    style.textContent = this._getGlitchCSS();
    document.head.appendChild(style);
    
    // Add global glitch container
    const glitchContainer = document.createElement('div');
    glitchContainer.className = 'global-glitch-container';
    document.body.appendChild(glitchContainer);
  }

  /**
   * Trigger section-specific entry animation
   */
  _triggerSectionEntryAnimation(section) {
    const sectionType = section.dataset.sectionType || 'generic';
    
    // Add entry animation class specific to section type
    section.classList.add(`${sectionType}-entry-animation`);
    
    // Remove the class after animation completes
    setTimeout(() => {
      section.classList.remove(`${sectionType}-entry-animation`);
    }, this.config.transitionDuration);
    
    // Create section-specific transition effect
    this._createSectionTransition(sectionType, section);
  }

  /**
   * Create section transition effect
   */
  _createSectionTransition(sectionType, section) {
    const transition = document.createElement('div');
    transition.className = `section-transition ${sectionType}-transition`;
    
    // Position the transition element
    const rect = section.getBoundingClientRect();
    transition.style.top = `${rect.top + window.scrollY}px`;
    transition.style.height = `${rect.height}px`;
    transition.style.width = '100%';
    
    // Add to DOM
    document.querySelector('.global-glitch-container').appendChild(transition);
    
    // Add specific transition elements based on section type
    switch(sectionType) {
      case 'editorial':
        this._createTextScrambleTransition(transition);
        break;
      case 'culture':
        this._createPixelationTransition(transition);
        break;
      case 'tech':
        this._createScanlineTransition(transition);
        break;
      case 'interview':
        this._createFragmentationTransition(transition);
        break;
      case 'lore':
        this._createRealityTearTransition(transition);
        break;
      default:
        this._createDefaultTransition(transition);
    }
    
    // Activate the transition
    setTimeout(() => {
      transition.classList.add('active');
      
      // Remove after transition completes
      setTimeout(() => {
        transition.classList.remove('active');
        
        setTimeout(() => {
          transition.remove();
        }, 500);
      }, this.config.transitionDuration * 0.8);
    }, 50);
  }

  /**
   * Create text scramble transition
   */
  _createTextScrambleTransition(transition) {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+{}|:<>?";
    const fragments = 20;
    
    for (let i = 0; i < fragments; i++) {
      const fragment = document.createElement('div');
      fragment.className = 'scramble-fragment';
      
      // Random position and delay
      fragment.style.left = `${Math.random() * 100}%`;
      fragment.style.top = `${Math.random() * 100}%`;
      fragment.style.animationDelay = `${Math.random() * 0.5}s`;
      
      // Random text
      const length = 3 + Math.floor(Math.random() * 8);
      let text = '';
      for (let j = 0; j < length; j++) {
        text += letters[Math.floor(Math.random() * letters.length)];
      }
      fragment.textContent = text;
      
      transition.appendChild(fragment);
    }
  }

  /**
   * Create pixelation transition
   */
  _createPixelationTransition(transition) {
    const pixels = 15;
    const pixelContainer = document.createElement('div');
    pixelContainer.className = 'pixel-container';
    
    for (let y = 0; y < pixels; y++) {
      for (let x = 0; x < pixels; x++) {
        const pixel = document.createElement('div');
        pixel.className = 'transition-pixel';
        pixel.style.top = `${(y / pixels) * 100}%`;
        pixel.style.left = `${(x / pixels) * 100}%`;
        pixel.style.width = `${100 / pixels}%`;
        pixel.style.height = `${100 / pixels}%`;
        
        // Random delay for dissolve effect
        pixel.style.animationDelay = `${Math.random() * 0.5}s`;
        
        pixelContainer.appendChild(pixel);
      }
    }
    
    transition.appendChild(pixelContainer);
  }

  /**
   * Create scanline transition
   */
  _createScanlineTransition(transition) {
    const scanlines = 15;
    
    for (let i = 0; i < scanlines; i++) {
      const scanline = document.createElement('div');
      scanline.className = 'transition-scanline';
      scanline.style.top = `${(i / scanlines) * 100}%`;
      scanline.style.animationDelay = `${(i / scanlines) * 0.3}s`;
      
      transition.appendChild(scanline);
    }
  }

  /**
   * Create fragmentation transition
   */
  _createFragmentationTransition(transition) {
    const fragments = 10;
    
    for (let i = 0; i < fragments; i++) {
      const fragment = document.createElement('div');
      fragment.className = 'fragment-piece';
      
      // Randomize position, size, and animation
      fragment.style.top = `${Math.random() * 100}%`;
      fragment.style.left = `${Math.random() * 100}%`;
      fragment.style.width = `${10 + Math.random() * 40}%`;
      fragment.style.height = `${5 + Math.random() * 20}%`;
      fragment.style.animationDelay = `${Math.random() * 0.5}s`;
      fragment.style.transform = `rotate(${Math.random() * 40 - 20}deg) scale(${0.8 + Math.random() * 0.4})`;
      
      transition.appendChild(fragment);
    }
  }

  /**
   * Create reality tear transition
   */
  _createRealityTearTransition(transition) {
    const tear = document.createElement('div');
    tear.className = 'reality-tear';
    
    // Add inner elements for the tear effect
    const inner1 = document.createElement('div');
    inner1.className = 'tear-inner tear-inner-1';
    
    const inner2 = document.createElement('div');
    inner2.className = 'tear-inner tear-inner-2';
    
    tear.appendChild(inner1);
    tear.appendChild(inner2);
    transition.appendChild(tear);
  }

  /**
   * Create default transition
   */
  _createDefaultTransition(transition) {
    const flash = document.createElement('div');
    flash.className = 'transition-flash';
    transition.appendChild(flash);
  }

  /**
   * Trigger a random glitch effect
   */
  _triggerRandomGlitch() {
    const glitchTypes = [
      'screen-shake',
      'color-shift',
      'signal-noise',
      'pixel-displace',
      'brief-flash'
    ];
    
    const glitchType = glitchTypes[Math.floor(Math.random() * glitchTypes.length)];
    const container = document.querySelector('.global-glitch-container');
    
    // Create glitch element
    const glitch = document.createElement('div');
    glitch.className = `global-glitch ${glitchType}`;
    container.appendChild(glitch);
    
    // Remove after animation
    setTimeout(() => {
      glitch.remove();
    }, 1000);
  }

  /**
   * Get CSS for glitch effects
   */
  _getGlitchCSS() {
    return `
      /* Infinite Scroll Styles */
      .infinite-scroll-container {
        position: relative;
      }
      
      /* Loading indicator */
      .infinite-scroll-loader {
        position: relative;
        height: 100px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        margin: 40px 0;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .infinite-scroll-loader.visible {
        opacity: 1;
      }
      
      .loader-text {
        font-size: 1.2rem;
        margin-bottom: 15px;
        color: var(--text-color, #f0f0f0);
        font-family: var(--mono-font, monospace);
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .loader-animation {
        position: relative;
        width: 60px;
        height: 60px;
      }
      
      .loader-symbol {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border: 3px solid transparent;
        border-top-color: var(--accent-color, #00ffcc);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      
      .loader-symbol:before {
        content: "";
        position: absolute;
        top: 5px;
        left: 5px;
        right: 5px;
        bottom: 5px;
        border: 3px solid transparent;
        border-top-color: var(--secondary-accent, #ff33cc);
        border-radius: 50%;
        animation: spin 2s linear infinite;
      }
      
      /* End of content marker */
      .end-of-content-marker {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 0;
        color: var(--text-color, #f0f0f0);
        font-family: var(--mono-font, monospace);
        opacity: 0;
        animation: fadeIn 1s forwards;
      }
      
      .eoc-text {
        font-size: 1.1rem;
        text-transform: uppercase;
        letter-spacing: 3px;
        margin: 0 15px;
      }
      
      .eoc-symbol {
        font-size: 2rem;
        opacity: 0.6;
      }
      
      /* Global Glitch Container */
      .global-glitch-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
      }
      
      /* Section Transitions */
      .section-transition {
        position: absolute;
        left: 0;
        width: 100%;
        pointer-events: none;
        z-index: 100;
        overflow: hidden;
        opacity: 0;
      }
      
      .section-transition.active {
        opacity: 1;
      }
      
      /* Text Scramble Effect */
      .scramble-fragment {
        position: absolute;
        color: var(--accent-color, #00ffcc);
        font-family: var(--mono-font, monospace);
        opacity: 0;
        animation: fadeInOut 1s ease-in-out;
        transform: scale(0);
      }
      
      .section-transition.active .scramble-fragment {
        opacity: 0.7;
        transform: scale(1);
      }
      
      /* Pixelation Effect */
      .pixel-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      
      .transition-pixel {
        position: absolute;
        background-color: var(--accent-color, #00ffcc);
        opacity: 0;
        transform: scale(0);
        animation: pixelFadeInOut 0.8s ease-in-out;
      }
      
      .section-transition.active .transition-pixel {
        opacity: 0.5;
        transform: scale(1);
      }
      
      /* Scanline Effect */
      .transition-scanline {
        position: absolute;
        width: 100%;
        height: 5px;
        background-color: var(--accent-color, #00ffcc);
        opacity: 0;
        transform: scaleX(0);
        animation: scanlineMove 0.8s ease-in-out;
      }
      
      .section-transition.active .transition-scanline {
        opacity: 0.7;
        transform: scaleX(1);
      }
      
      /* Fragmentation Effect */
      .fragment-piece {
        position: absolute;
        background-color: var(--bg-color, #121212);
        border: 1px solid var(--accent-color, #00ffcc);
        box-shadow: 0 0 10px var(--accent-color, #00ffcc);
        opacity: 0;
        animation: fragmentMove 1s ease-in-out;
      }
      
      .section-transition.active .fragment-piece {
        opacity: 0.8;
      }
      
      /* Reality Tear Effect */
      .reality-tear {
        position: absolute;
        width: 100%;
        height: 0;
        left: 0;
        top: 50%;
        background-color: white;
        animation: tearOpen 1s ease-in-out;
      }
      
      .section-transition.active .reality-tear {
        height: 5px;
      }
      
      .tear-inner {
        position: absolute;
        width: 100%;
        height: 2px;
        left: 0;
      }
      
      .tear-inner-1 {
        top: -5px;
        background-color: var(--accent-color, #00ffcc);
        box-shadow: 0 0 20px var(--accent-color, #00ffcc);
      }
      
      .tear-inner-2 {
        bottom: -5px;
        background-color: var(--secondary-accent, #ff33cc);
        box-shadow: 0 0 20px var(--secondary-accent, #ff33cc);
      }
      
      /* Default Flash Effect */
      .transition-flash {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: white;
        opacity: 0;
        animation: flash 0.5s ease-in-out;
      }
      
      .section-transition.active .transition-flash {
        opacity: 0.3;
      }
      
      /* Loop Transition */
      .loop-transition-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: black;
        z-index: 9999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
      }
      
      .loop-transition-overlay.active {
        opacity: 0.8;
        animation: loopTransition 1.2s ease-in-out;
      }
      
      /* Random Glitch Effects */
      .global-glitch {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1001;
      }
      
      .global-glitch.screen-shake {
        animation: screenShake 0.5s ease-in-out;
      }
      
      .global-glitch.color-shift {
        background-color: rgba(255, 0, 255, 0.1);
        animation: colorShift 0.7s ease-in-out;
      }
      
      .global-glitch.signal-noise::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AoVFioeA0XRCQAAANJJREFUaN7t2NEKwyAMBdB7tf//y9oXwZexbk0w0+qDMLY2J9dKja0xf6b+PWKVspKzspW8x/OyGHkUhv2EM4wFQq5BmCMIfS7COYhYgJiDoPV/dHj0XaI9QB7yj6zX9/Y/evBauQPwtgDLIbYAWglxBFBLiKOAGkIcCYwmxNHACEJMAYYSYhowpBBTgS8hLgE4QlwG9BB4BBROgBMCW4DjBDAQ0FKAYQQYQkCrN4RtPKAWQG4BmCUANUMQrQTSlgJac0Dby9i2TLrVV9BFCFvNQ5j22eO/5wMl9MbIwCHxKwAAAABJRU5ErkJggg==');
        opacity: 0.2;
        animation: noise 0.4s steps(2) infinite;
      }
      
      .global-glitch.pixel-displace {
        backdrop-filter: blur(2px);
        animation: pixelDisplace 0.6s steps(2);
      }
      
      .global-glitch.brief-flash {
        background-color: white;
        animation: quickFlash 0.2s ease-in-out;
      }
      
      /* Section Entry Animations */
      .editorial-entry-animation {
        animation: textEntryGlitch 1s ease-in-out;
      }
      
      .culture-entry-animation {
        animation: fadeInDisplace 1s ease-in-out;
      }
      
      .tech-entry-animation {
        animation: scanReveal 1s ease-in-out;
      }
      
      .interview-entry-animation {
        animation: fragmentAssemble 1s ease-in-out;
      }
      
      .lore-entry-animation {
        animation: dimensionalShift 1.2s ease-in-out;
      }
      
      /* Animation Keyframes */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @keyframes fadeInOut {
        0% { opacity: 0; transform: scale(0); }
        50% { opacity: 0.7; transform: scale(1.2); }
        100% { opacity: 0; transform: scale(0); }
      }
      
      @keyframes pixelFadeInOut {
        0% { opacity: 0; transform: scale(0) rotate(0deg); }
        50% { opacity: 0.5; transform: scale(1.2) rotate(20deg); }
        100% { opacity: 0; transform: scale(0) rotate(0deg); }
      }
      
      @keyframes scanlineMove {
        0% { transform: scaleX(0); opacity: 0; }
        50% { transform: scaleX(1); opacity: 0.7; }
        100% { transform: scaleX(0); opacity: 0; }
      }
      
      @keyframes fragmentMove {
        0% { transform: translate(0, 0) rotate(0deg) scale(0); opacity: 0; }
        50% { transform: translate(20px, 10px) rotate(20deg) scale(1); opacity: 0.8; }
        100% { transform: translate(40px, 20px) rotate(40deg) scale(0); opacity: 0; }
      }
      
      @keyframes tearOpen {
        0% { height: 0; }
        50% { height: 5px; }
        100% { height: 0; }
      }
      
      @keyframes flash {
        0% { opacity: 0; }
        50% { opacity: 0.3; }
        100% { opacity: 0; }
      }
      
      @keyframes loopTransition {
        0% { background-color: black; opacity: 0; }
        10% { background-color: black; opacity: 1; }
        40% { background-color: #330033; opacity: 0.8; }
        60% { background-color: #330033; opacity: 0.8; }
        90% { background-color: black; opacity: 1; }
        100% { background-color: black; opacity: 0; }
      }
      
      @keyframes screenShake {
        0% { transform: translate(0); }
        10% { transform: translate(-5px, 5px); }
        20% { transform: translate(5px, -5px); }
        30% { transform: translate(-7px, -5px); }
        40% { transform: translate(5px, 7px); }
        50% { transform: translate(-5px, 5px); }
        60% { transform: translate(3px, -3px); }
        70% { transform: translate(-3px, -3px); }
        80% { transform: translate(1px, 1px); }
        90% { transform: translate(-1px, -1px); }
        100% { transform: translate(0); }
      }
      
      @keyframes colorShift {
        0% { background-color: rgba(255, 0, 255, 0); }
        20% { background-color: rgba(255, 0, 255, 0.1); }
        40% { background-color: rgba(0, 255, 255, 0.1); }
        60% { background-color: rgba(255, 255, 0, 0.1); }
        80% { background-color: rgba(255, 0, 255, 0.1); }
        100% { background-color: rgba(255, 0, 255, 0); }
      }
      
      @keyframes noise {
        0% { transform: translate(0, 0); }
        10% { transform: translate(-2%, 2%); }
        20% { transform: translate(2%, -2%); }
        30% { transform: translate(-1%, -1%); }
        40% { transform: translate(3%, 3%); }
        50% { transform: translate(-3%, 2%); }
        60% { transform: translate(2%, -3%); }
        70% { transform: translate(-2%, 2%); }
        80% { transform: translate(1%, -1%); }
        90% { transform: translate(-1%, 1%); }
        100% { transform: translate(0, 0); }
      }
      
      @keyframes pixelDisplace {
        0% { backdrop-filter: blur(0); }
        25% { backdrop-filter: blur(2px); }
        50% { backdrop-filter: blur(0); }
        75% { backdrop-filter: blur(4px); }
        100% { backdrop-filter: blur(0); }
      }
      
      @keyframes quickFlash {
        0% { opacity: 0; }
        50% { opacity: 0.7; }
        100% { opacity: 0; }
      }
      
      @keyframes textEntryGlitch {
        0% { opacity: 0; transform: translateY(20px); filter: blur(5px); }
        20% { opacity: 0.2; transform: translateY(15px); filter: blur(4px); }
        40% { opacity: 0; transform: translateY(10px); filter: blur(0); }
        60% { opacity: 0.8; transform: translateY(5px); filter: blur(3px); }
        80% { opacity: 0.5; transform: translateY(2px); filter: blur(0); }
        100% { opacity: 1; transform: translateY(0); filter: blur(0); }
      }
      
      @keyframes fadeInDisplace {
        0% { opacity: 0; transform: translateX(-20px); }
        25% { opacity: 0.3; transform: translateX(10px); }
        50% { opacity: 0.5; transform: translateX(-5px); }
        75% { opacity: 0.8; transform: translateX(2px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      
      @keyframes scanReveal {
        0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
        100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
      }
      
      @keyframes fragmentAssemble {
        0% { opacity: 0; transform: scale(0.8); filter: blur(10px); }
        50% { opacity: 0.5; transform: scale(1.05); filter: blur(5px); }
        100% { opacity: 1; transform: scale(1); filter: blur(0); }
      }
      
      @keyframes dimensionalShift {
        0% { opacity: 0; transform: perspective(1000px) rotateX(30deg); }
        50% { opacity: 0.7; transform: perspective(1000px) rotateX(-10deg); }
        100% { opacity: 1; transform: perspective(1000px) rotateX(0); }
      }
    `;
  }

  /**
   * Destroys the infinite scroll system
   */
  destroy() {
    // Disconnect observer
    if (this.state.visibilityObserver) {
      this.state.visibilityObserver.disconnect();
    }
    
    // Remove event listeners
    window.removeEventListener('scroll', this._handleScroll);
    
    // Remove classes from container
    if (this.state.container) {
      this.state.container.classList.remove('infinite-scroll-container');
    }
    
    // Remove any loading indicators
    const loader = document.querySelector('.infinite-scroll-loader');
    if (loader) {
      loader.remove();
    }
    
    // Remove glitch container
    const glitchContainer = document.querySelector('.global-glitch-container');
    if (glitchContainer) {
      glitchContainer.remove();
    }
    
    console.log('Infinite Scroll: Destroyed');
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.infiniteScroll = new InfiniteScroll({
    contentContainer: '#magazine-content',
    enableGlitchEffects: true,
    enableInfiniteLoop: true,
    debugMode: false
  });
  
  console.log('Infinite Scroll: Module loaded');
});

// Expose class for modular usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InfiniteScroll;
}