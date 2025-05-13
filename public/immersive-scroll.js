/**
 * MillzMaleficarum Codex v0.6
 * Immersive Scroll System
 * Enhanced scroll-based interactions with depth perception and reality distortion
 */

class ImmersiveScroll {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      containerSelector: options.containerSelector || '#magazine-content',
      sectionSelector: options.sectionSelector || '.section',
      depthFactor: options.depthFactor || 0.7,
      parallaxLayers: options.parallaxLayers || 3,
      scrollSpeedFactor: options.scrollSpeedFactor || 1.0,
      distortionIntensity: options.distortionIntensity || 0.5,
      reducedMotion: options.reducedMotion || false,
      glitchProbability: options.glitchProbability || 0.02,
      enableKeyboardNav: options.enableKeyboardNav !== false,
      useSnapScroll: options.useSnapScroll !== false,
      useHoverEffects: options.useHoverEffects !== false,
      thresholds: options.thresholds || [0.1, 0.25, 0.5, 0.75, 0.9],
      enableTextDistortion: options.enableTextDistortion !== false,
      transitionDuration: options.transitionDuration || 1.2,
      transitionEasing: options.transitionEasing || 'cubic-bezier(0.23, 1, 0.32, 1)',
      useActiveClass: options.useActiveClass !== false,
      useFrameClass: options.useFrameClass !== false,
      addCorners: options.addCorners !== false,
      cornerClass: options.cornerClass || 'portal-corner'
    };

    // State
    this.state = {
      container: null,
      sections: [],
      currentSection: 0,
      lastScrollY: 0,
      scrollDirection: 'down',
      scrollSpeed: 0,
      scrollAcceleration: 0,
      ticking: false,
      observers: [],
      depthLayers: [],
      glitchTimeouts: [],
      isScrolling: false,
      hasIntersectionSupport: 'IntersectionObserver' in window,
      hasPerspectiveSupport: this._checkPerspectiveSupport(),
      scrollStartTime: 0,
      scrollEndTimeout: null,
      dimensionalTearActive: false,
      lastMoveEvent: null,
      mousePosition: { x: 0, y: 0 },
      windowCenter: { x: 0, y: 0 }
    };

    // Initialize the immersive scroll
    this._initialize();
  }

  /**
   * Initialize the immersive scroll system
   */
  _initialize() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this._setup());
    } else {
      this._setup();
    }
  }

  /**
   * Check if browser supports perspective CSS property
   */
  _checkPerspectiveSupport() {
    const prefixes = ['', 'webkit', 'moz', 'ms', 'o'];
    const testDiv = document.createElement('div');
    
    for (const prefix of prefixes) {
      const propName = prefix ? `${prefix}Perspective` : 'perspective';
      if (testDiv.style[propName] !== undefined) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Setup the immersive scroll system
   */
  _setup() {
    // Get container
    this.state.container = document.querySelector(this.config.containerSelector);
    if (!this.state.container) {
      console.error('Immersive Scroll: Container not found');
      return;
    }

    // Apply container styles
    this._applyContainerStyles();
    
    // Get sections
    const sections = this.state.container.querySelectorAll(this.config.sectionSelector);
    if (sections.length === 0) {
      console.error('Immersive Scroll: No sections found');
      return;
    }

    // Store sections and apply styles
    this.state.sections = Array.from(sections).map((element, index) => {
      // Add portal frame if needed
      if (this.config.useFrameClass) {
        this._addPortalFrame(element);
      }
      
      return {
        element,
        index,
        rect: element.getBoundingClientRect(),
        depth: 0
      };
    });
    
    // Apply section styles
    this._applySectionStyles();
    
    // Create depth layers for each section
    this._createDepthLayers();
    
    // Add scroll event listeners
    this._setupScrollListeners();
    
    // Setup intersection observers if supported
    if (this.state.hasIntersectionSupport) {
      this._setupIntersectionObservers();
    }
    
    // Setup keyboard navigation if enabled
    if (this.config.enableKeyboardNav) {
      this._setupKeyboardNavigation();
    }
    
    // Setup mouse move handlers for parallax effects
    if (this.config.useHoverEffects) {
      this._setupMouseMoveHandlers();
    }
    
    // Add text distortion glitches
    if (this.config.enableTextDistortion) {
      this._setupTextDistortion();
    }
    
    // Check for reduced motion preference
    this._checkReducedMotionPreference();
    
    // Update window center
    this._updateWindowCenter();
    
    // Add resize listener
    window.addEventListener('resize', this._handleResize.bind(this));
    
    // Add layout style
    this._addStyles();
    
    console.log('Immersive Scroll: Initialized with', this.state.sections.length, 'sections');
  }

  /**
   * Add portal frame to section
   */
  _addPortalFrame(element) {
    // Add portal frame element
    const frame = document.createElement('div');
    frame.className = 'portal-frame';
    element.appendChild(frame);
    
    // Add corners if needed
    if (this.config.addCorners) {
      // Top left corner
      const topLeft = document.createElement('div');
      topLeft.className = `${this.config.cornerClass} top-left`;
      element.appendChild(topLeft);
      
      // Top right corner
      const topRight = document.createElement('div');
      topRight.className = `${this.config.cornerClass} top-right`;
      element.appendChild(topRight);
      
      // Bottom left corner
      const bottomLeft = document.createElement('div');
      bottomLeft.className = `${this.config.cornerClass} bottom-left`;
      element.appendChild(bottomLeft);
      
      // Bottom right corner
      const bottomRight = document.createElement('div');
      bottomRight.className = `${this.config.cornerClass} bottom-right`;
      element.appendChild(bottomRight);
    }
  }

  /**
   * Apply styles to the container
   */
  _applyContainerStyles() {
    const container = this.state.container;
    
    // Only apply if we have perspective support and snap scroll is enabled
    if (this.state.hasPerspectiveSupport && this.config.useSnapScroll) {
      container.style.perspective = '1000px';
      container.style.perspectiveOrigin = 'center center';
      container.style.scrollSnapType = 'y mandatory';
      container.style.overflowY = 'auto';
      container.style.overflowX = 'hidden';
      container.style.height = '100vh';
      container.style.position = 'relative';
    }
    
    // Add class for CSS targeting
    container.classList.add('immersive-scroll-container');
  }

  /**
   * Apply styles to each section
   */
  _applySectionStyles() {
    this.state.sections.forEach(section => {
      const element = section.element;
      
      // Add data attribute for identification
      element.dataset.immersiveIndex = section.index;
      
      // Apply styles for snap scrolling
      if (this.config.useSnapScroll) {
        element.style.scrollSnapAlign = 'start';
        element.style.scrollSnapStop = 'always';
      }
      
      element.style.position = 'relative';
      element.style.minHeight = '100vh';
      element.style.width = '100%';
      element.style.overflow = 'hidden';
      
      // Add transition styles
      element.style.transition = `transform ${this.config.transitionDuration}s ${this.config.transitionEasing},
                                 box-shadow ${this.config.transitionDuration}s ${this.config.transitionEasing},
                                 filter ${this.config.transitionDuration}s ${this.config.transitionEasing}`;
      
      // Add transform style for 3D if supported
      if (this.state.hasPerspectiveSupport) {
        element.style.transformStyle = 'preserve-3d';
      }
      
      // Add class for CSS targeting
      element.classList.add('immersive-section');
      
      // Add glitch effect containers
      this._addGlitchEffects(section.element);
    });
  }

  /**
   * Create 3D depth layers for each section
   */
  _createDepthLayers() {
    this.state.sections.forEach((section, sectionIndex) => {
      const sectionLayers = [];
      
      // Skip if perspective not supported
      if (!this.state.hasPerspectiveSupport) return;
      
      // Create multiple depth layers for content
      const layerCount = this.config.parallaxLayers;
      
      // Get section content to distribute across layers
      const headings = Array.from(section.element.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const paragraphs = Array.from(section.element.querySelectorAll('p'));
      const images = Array.from(section.element.querySelectorAll('img'));
      const otherElements = Array.from(section.element.querySelectorAll('div, ul, ol, blockquote'))
        .filter(el => el.parentElement === section.element); // Only direct children
      
      // Create wrapper div around original content
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'immersive-content-wrapper';
      contentWrapper.style.position = 'relative';
      contentWrapper.style.zIndex = '1';
      
      // Clone all existing content to the wrapper
      Array.from(section.element.children).forEach(child => {
        // Skip elements we added (portal frame, corners, etc.)
        if (child.classList.contains('portal-frame') || 
            child.classList.contains(this.config.cornerClass)) {
          return;
        }
        
        contentWrapper.appendChild(child.cloneNode(true));
      });
      
      // Remove original content (except our portal elements)
      Array.from(section.element.children).forEach(child => {
        // Don't remove portal elements
        if (child.classList.contains('portal-frame') || 
            child.classList.contains(this.config.cornerClass)) {
          return;
        }
        
        section.element.removeChild(child);
      });
      
      // Add the wrapper back to the section
      section.element.appendChild(contentWrapper);
      
      // Create layers
      for (let i = 0; i < layerCount; i++) {
        const zIndex = i === 0 ? 1 : -i; // First layer is content, others are background
        const layer = document.createElement('div');
        layer.className = `immersive-depth-layer layer-${i}`;
        layer.style.position = 'absolute';
        layer.style.top = '0';
        layer.style.left = '0';
        layer.style.right = '0';
        layer.style.bottom = '0';
        layer.style.zIndex = zIndex;
        layer.style.pointerEvents = i === 0 ? 'auto' : 'none';
        
        // Generate layer content based on depth
        if (i === 0) {
          // Main content layer - leave empty, we'll use the contentWrapper
        } else if (i === 1) {
          // Secondary layer - decorative elements
          this._createDecorativeElements(layer, sectionIndex, i);
        } else {
          // Background layers - visual effects
          this._createBackgroundEffects(layer, sectionIndex, i);
        }
        
        // Add layer to section if not main content layer (which is already there as contentWrapper)
        if (i !== 0) {
          section.element.appendChild(layer);
        }
        
        sectionLayers.push(layer);
      }
      
      // Store layers reference
      this.state.depthLayers[sectionIndex] = sectionLayers;
    });
  }

  /**
   * Create decorative elements for a layer
   */
  _createDecorativeElements(layer, sectionIndex, layerIndex) {
    // Create decorative elements based on section theme/style
    const section = this.state.sections[sectionIndex];
    const sectionTheme = section.element.dataset.theme || '';
    
    // Number of decorative elements to add
    const elementCount = 3 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < elementCount; i++) {
      const element = document.createElement('div');
      element.className = 'decorative-element';
      
      // Position randomly within the layer
      const posX = 5 + Math.random() * 90; // 5-95%
      const posY = 5 + Math.random() * 90; // 5-95%
      
      // Size randomly
      const size = 50 + Math.random() * 150; // 50-200px
      
      // Style based on section theme
      element.style.position = 'absolute';
      element.style.left = `${posX}%`;
      element.style.top = `${posY}%`;
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.transform = `translateZ(${-80 - Math.random() * 100}px)`;
      element.style.opacity = '0.15';
      element.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      
      // Rotate randomly
      const rotation = Math.random() * 360;
      element.style.transform += ` rotate(${rotation}deg)`;
      
      // Color based on section
      const hue = sectionIndex * 60 % 360;
      element.style.background = `hsla(${hue}, 100%, 70%, 0.1)`;
      element.style.boxShadow = `0 0 20px hsla(${hue}, 100%, 70%, 0.2)`;
      
      // Add to layer
      layer.appendChild(element);
    }
  }

  /**
   * Create background effects for a layer
   */
  _createBackgroundEffects(layer, sectionIndex, layerIndex) {
    // How far back this layer should appear
    const depth = layerIndex * 150;
    
    // Create a canvas for the background effect
    const canvas = document.createElement('canvas');
    canvas.className = 'background-effect-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.transform = `translateZ(-${depth}px)`;
    canvas.style.opacity = '0.1';
    
    // Add to layer
    layer.appendChild(canvas);
    
    // Draw effect on canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Choose effect based on layer and section
    const effectType = (sectionIndex + layerIndex) % 3;
    
    switch (effectType) {
      case 0:
        this._drawGridEffect(ctx, canvas.width, canvas.height, sectionIndex);
        break;
      case 1:
        this._drawOrganicEffect(ctx, canvas.width, canvas.height, sectionIndex);
        break;
      case 2:
        this._drawNoiseEffect(ctx, canvas.width, canvas.height, sectionIndex);
        break;
    }
  }

  /**
   * Draw grid effect on canvas
   */
  _drawGridEffect(ctx, width, height, sectionIndex) {
    // Base hue on section index
    const hue = sectionIndex * 60 % 360;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Grid properties
    const cellSize = 50;
    const lineWidth = 1;
    
    // Draw grid
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.3)`;
    ctx.lineWidth = lineWidth;
    
    // Vertical lines
    for (let x = 0; x <= width; x += cellSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Add some accent points
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.5)`;
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = 2 + Math.random() * 4;
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /**
   * Draw organic shapes effect on canvas
   */
  _drawOrganicEffect(ctx, width, height, sectionIndex) {
    // Base hue on section index
    const hue = sectionIndex * 60 % 360;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Draw organic blob shapes
    const blobCount = 5 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < blobCount; i++) {
      // Center position for the blob
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      
      // Blob size
      const size = 100 + Math.random() * 200;
      
      // Number of points
      const points = 5 + Math.floor(Math.random() * 4);
      
      // Draw blob
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.1)`;
      ctx.beginPath();
      
      for (let j = 0; j < points; j++) {
        const angle = (j / points) * Math.PI * 2;
        const radiusVariation = 0.5 + Math.random();
        const radius = size * radiusVariation;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use bezier curves for smoother shapes
          const prevAngle = ((j - 1) / points) * Math.PI * 2;
          const prevX = centerX + Math.cos(prevAngle) * radius;
          const prevY = centerY + Math.sin(prevAngle) * radius;
          
          const cp1x = prevX + Math.cos(prevAngle + Math.PI/2) * radius * 0.4;
          const cp1y = prevY + Math.sin(prevAngle + Math.PI/2) * radius * 0.4;
          const cp2x = x + Math.cos(angle - Math.PI/2) * radius * 0.4;
          const cp2y = y + Math.sin(angle - Math.PI/2) * radius * 0.4;
          
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();
      
      // Add subtle stroke
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.2)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /**
   * Draw noise effect on canvas
   */
  _drawNoiseEffect(ctx, width, height, sectionIndex) {
    // Base hue on section index
    const hue = sectionIndex * 60 % 360;
    
    // Clear
    ctx.clearRect(0, 0, width, height);
    
    // Create noise using small rectangles
    const rectSize = 3;
    
    for (let x = 0; x < width; x += rectSize) {
      for (let y = 0; y < height; y += rectSize) {
        if (Math.random() > 0.85) {
          const colorVariation = Math.floor(Math.random() * 30);
          ctx.fillStyle = `hsla(${hue + colorVariation}, 100%, 70%, ${Math.random() * 0.1})`;
          ctx.fillRect(x, y, rectSize, rectSize);
        }
      }
    }
    
    // Add some larger "noise" blocks
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const size = 5 + Math.random() * 20;
      
      ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${Math.random() * 0.05})`;
      ctx.fillRect(x, y, size, size);
    }
  }

  /**
   * Add glitch effect elements to a section
   */
  _addGlitchEffects(section) {
    // Create glitch overlay
    const glitchOverlay = document.createElement('div');
    glitchOverlay.className = 'glitch-overlay';
    glitchOverlay.style.position = 'absolute';
    glitchOverlay.style.top = '0';
    glitchOverlay.style.left = '0';
    glitchOverlay.style.width = '100%';
    glitchOverlay.style.height = '100%';
    glitchOverlay.style.pointerEvents = 'none';
    glitchOverlay.style.zIndex = '10';
    glitchOverlay.style.opacity = '0';
    
    // Add to section
    section.appendChild(glitchOverlay);
    
    // Create dimensional tear element (rarely shown)
    const dimensionalTear = document.createElement('div');
    dimensionalTear.className = 'dimensional-tear';
    dimensionalTear.style.position = 'absolute';
    dimensionalTear.style.pointerEvents = 'none';
    dimensionalTear.style.zIndex = '11';
    dimensionalTear.style.display = 'none';
    
    // Add to section
    section.appendChild(dimensionalTear);
  }

  /**
   * Setup text distortion effects
   */
  _setupTextDistortion() {
    // Find all text elements in sections
    this.state.sections.forEach(section => {
      const textElements = section.element.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
      
      textElements.forEach(element => {
        // Add class for targeting with CSS
        element.classList.add('glitchable-text');
        
        // Random chance to add initial distortion classes
        if (Math.random() < 0.2) {
          setTimeout(() => {
            this._triggerTextGlitch(element);
          }, 1000 + Math.random() * 5000);
        }
      });
    });
  }

  /**
   * Trigger text glitch effect on an element
   */
  _triggerTextGlitch(element) {
    // Skip if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    // Clone text for different layers
    const originalText = element.textContent;
    const originalHTML = element.innerHTML;
    
    // Only glitch text with actual content
    if (!originalText.trim()) return;
    
    // Add glitch class
    element.classList.add('text-glitching');
    
    // Create slight distortion of the original text (character replacement)
    const distortedText = this._createDistortedText(originalText);
    
    // Create layers for the glitch effect
    let html = `
      <span class="glitch-layer original">${originalHTML}</span>
      <span class="glitch-layer distorted" aria-hidden="true">${distortedText}</span>
      <span class="glitch-layer shifted" aria-hidden="true">${originalHTML}</span>
    `;
    
    // Replace content with glitch layers
    element.innerHTML = html;
    
    // Remove effect after a short time
    setTimeout(() => {
      element.innerHTML = originalHTML;
      element.classList.remove('text-glitching');
      
      // Schedule next glitch with low probability
      if (Math.random() < this.config.glitchProbability) {
        const nextGlitchTime = 5000 + Math.random() * 20000;
        const timeout = setTimeout(() => {
          this._triggerTextGlitch(element);
        }, nextGlitchTime);
        
        this.state.glitchTimeouts.push(timeout);
      }
    }, 700 + Math.random() * 1000);
  }

  /**
   * Create distorted version of text for glitch effect
   */
  _createDistortedText(text) {
    const glitchChars = '!@#$%^&*()_+-={}[]|\\:;"\'<>,.?/';
    
    // Replace ~5% of characters with glitch characters
    let distorted = '';
    for (let i = 0; i < text.length; i++) {
      if (Math.random() < 0.05) {
        distorted += glitchChars.charAt(Math.floor(Math.random() * glitchChars.length));
      } else {
        distorted += text.charAt(i);
      }
    }
    
    return distorted;
  }

  /**
   * Setup scroll event listeners
   */
  _setupScrollListeners() {
    // Debounced scroll handler
    const handleScroll = () => {
      if (!this.state.ticking) {
        requestAnimationFrame(() => {
          this._onScroll();
          this.state.ticking = false;
        });
        this.state.ticking = true;
      }
    };
    
    // Add scroll listener to container
    this.state.container.addEventListener('scroll', handleScroll);
    
    // Track scroll start and end
    this.state.container.addEventListener('scroll', () => {
      // If not already scrolling, this is the start
      if (!this.state.isScrolling) {
        this.state.isScrolling = true;
        this.state.scrollStartTime = Date.now();
        
        // Trigger start of scroll effects
        this._onScrollStart();
      }
      
      // Clear any existing timeout
      if (this.state.scrollEndTimeout) {
        clearTimeout(this.state.scrollEndTimeout);
      }
      
      // Set a timeout to detect when scrolling ends
      this.state.scrollEndTimeout = setTimeout(() => {
        this.state.isScrolling = false;
        
        // Trigger end of scroll effects
        this._onScrollEnd();
      }, 150); // Wait for 150ms of no scroll events
    });
  }

  /**
   * Handle scroll start
   */
  _onScrollStart() {
    // Skip effects if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    // Trigger random glitch effect with low probability
    if (Math.random() < 0.3) {
      this._triggerGlitchEffect();
    }
  }

  /**
   * Handle scroll end
   */
  _onScrollEnd() {
    // Skip effects if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    // Calculate scroll duration
    const scrollDuration = Date.now() - this.state.scrollStartTime;
    
    // If very fast scroll, trigger glitch with higher probability
    if (scrollDuration < 500 && Math.random() < 0.6) {
      setTimeout(() => {
        this._triggerGlitchEffect();
      }, 200); // Slight delay after scroll stops
    }
    
    // Maybe trigger a dimensional tear
    if (Math.random() < 0.02) {
      this._triggerDimensionalTear();
    }
    
    // Determine current section
    this._determineCurrentSection();
  }

  /**
   * Handle scrolling
   */
  _onScroll() {
    // Get current scroll position
    const scrollY = this.state.container.scrollTop;
    
    // Determine scroll direction
    this.state.scrollDirection = scrollY > this.state.lastScrollY ? 'down' : 'up';
    
    // Calculate scroll speed
    const scrollDelta = scrollY - this.state.lastScrollY;
    
    // Update last scroll position
    this.state.lastScrollY = scrollY;
    
    // Skip the rest if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    // Apply scroll parallax effects
    this._applyScrollParallax(scrollY, scrollDelta);
  }

  /**
   * Determine which section is currently in view
   */
  _determineCurrentSection() {
    // Find section closest to viewport center
    const viewportCenter = window.innerHeight / 2;
    let closestSection = null;
    let closestDistance = Infinity;
    
    this.state.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      const sectionCenter = rect.top + rect.height / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestSection = section;
      }
    });
    
    if (closestSection && closestSection !== this.state.currentSection) {
      // Update current section
      this.state.currentSection = closestSection.index;
      
      // Apply active class if enabled
      if (this.config.useActiveClass) {
        this.state.sections.forEach(section => {
          if (section.index === this.state.currentSection) {
            section.element.classList.add('active');
          } else {
            section.element.classList.remove('active');
          }
        });
      }
      
      // Apply portal effect for section change
      this._applyPortalEffect(this.state.sections[this.state.currentSection].element);
    }
  }

  /**
   * Apply portal transition effect
   */
  _applyPortalEffect(element) {
    // Skip if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    element.classList.add('portal-enter');
    setTimeout(() => {
      element.classList.remove('portal-enter');
    }, this.config.transitionDuration * 1000);
  }

  /**
   * Apply parallax effects based on scroll position
   */
  _applyScrollParallax(scrollY, scrollDelta) {
    const scrollProgress = scrollY / (this.state.container.scrollHeight - this.state.container.clientHeight);
    
    this.state.sections.forEach(section => {
      // Get section position
      const rect = section.element.getBoundingClientRect();
      
      // Skip if not near viewport
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      
      // Calculate section visibility percent (0-1)
      const visible = Math.min(1, Math.max(0, 
        (window.innerHeight - Math.max(0, rect.top) - Math.max(0, window.innerHeight - rect.bottom)) / window.innerHeight
      ));
      
      // Skip if not visible
      if (visible <= 0) return;
      
      // Calculate how far this section is from the viewport center
      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const distanceFromCenter = (sectionCenter - viewportCenter) / viewportCenter;
      
      // Apply depth transform based on distance
      const depth = -distanceFromCenter * this.config.depthFactor * 100;
      const scale = Math.max(0.95, 1 - Math.abs(distanceFromCenter) * 0.05);
      
      // Store section depth for mouse parallax
      section.depth = depth;
      
      // Apply transform
      section.element.style.transform = `translateZ(${depth}px) scale(${scale})`;
      
      // Add blur and brightness for distant sections
      const blurAmount = Math.abs(distanceFromCenter) * 5;
      const brightness = 1 - Math.abs(distanceFromCenter) * 0.1;
      section.element.style.filter = `blur(${blurAmount}px) brightness(${brightness})`;
      
      // Apply parallax to the depth layers of this section
      const layers = this.state.depthLayers[section.index] || [];
      
      layers.forEach((layer, layerIndex) => {
        // First layer is the content, don't parallax it
        if (layerIndex === 0) return;
        
        // Calculate parallax effect - deeper layers move faster
        const parallaxStrength = layerIndex * this.config.depthFactor * 0.2;
        const parallaxOffset = scrollDelta * parallaxStrength;
        
        // Apply transform
        const currentTransform = layer.style.transform || '';
        
        // Only apply translateY parallax to certain layers
        if (currentTransform.includes('translateZ')) {
          // Extract current translateZ value
          const match = currentTransform.match(/translateZ\(([^)]+)\)/);
          const currentZ = match ? parseFloat(match[1]) : 0;
          
          // Apply movement in Y direction
          layer.style.transform = currentTransform + ` translateY(${parallaxOffset}px)`;
        }
      });
    });
  }

  /**
   * Setup intersection observers for section transitions
   */
  _setupIntersectionObservers() {
    // Create observer for each threshold
    this.config.thresholds.forEach(threshold => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const section = this._getSectionByElement(entry.target);
          if (!section) return;
          
          if (entry.isIntersecting) {
            // Section has reached this visibility threshold
            this._onSectionThresholdReached(section, threshold, true);
          } else {
            // Section has left this visibility threshold
            this._onSectionThresholdReached(section, threshold, false);
          }
        });
      }, {
        threshold: threshold
      });
      
      // Observe all sections
      this.state.sections.forEach(section => {
        observer.observe(section.element);
      });
      
      // Store observer for cleanup
      this.state.observers.push(observer);
    });
  }

  /**
   * Handle section reaching a visibility threshold
   */
  _onSectionThresholdReached(section, threshold, isIntersecting) {
    // Add/remove threshold class
    const thresholdClass = `threshold-${Math.floor(threshold * 100)}`;
    if (isIntersecting) {
      section.element.classList.add(thresholdClass);
    } else {
      section.element.classList.remove(thresholdClass);
    }
    
    // Major thresholds for section transitions
    if (threshold === 0.5 && isIntersecting) {
      // Section is the currently focused section
      this.state.currentSection = section.index;
      section.element.classList.add('current-section');
      
      // Remove from other sections
      this.state.sections.forEach(s => {
        if (s.index !== section.index) {
          s.element.classList.remove('current-section');
        }
      });
      
      // Skip effects if reduced motion is enabled
      if (this.config.reducedMotion) return;
      
      // Trigger random effects with low probability
      if (Math.random() < 0.3) {
        setTimeout(() => {
          this._triggerGlitchEffect(section.element);
        }, 300);
      }
      
      // Trigger text glitches on this section
      const textElements = section.element.querySelectorAll('.glitchable-text');
      textElements.forEach(element => {
        if (Math.random() < 0.3) {
          setTimeout(() => {
            this._triggerTextGlitch(element);
          }, 500 + Math.random() * 2000);
        }
      });
    }
  }

  /**
   * Get section by DOM element
   */
  _getSectionByElement(element) {
    return this.state.sections.find(section => section.element === element);
  }

  /**
   * Trigger a glitch visual effect
   */
  _triggerGlitchEffect(targetElement = null) {
    // Skip if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    // Get all visible sections or just the target
    const sections = targetElement ? 
        [this._getSectionByElement(targetElement)] :
        this.state.sections.filter(s => {
          const rect = s.element.getBoundingClientRect();
          return rect.top < window.innerHeight && rect.bottom > 0;
        });
    
    // Skip if no sections
    if (!sections.length || sections[0] === null) return;
    
    // Select a random section if multiple
    const section = sections[Math.floor(Math.random() * sections.length)];
    
    // Get glitch overlay
    const glitchOverlay = section.element.querySelector('.glitch-overlay');
    if (!glitchOverlay) return;
    
    // Create glitch effect
    const distortionStyles = [
      'filter: hue-rotate(90deg) contrast(1.5) blur(1px); transform: translateX(3px);',
      'filter: invert(0.1) brightness(1.2); transform: translateX(-3px) skewX(2deg);',
      'filter: saturate(2) brightness(0.8); transform: translateY(2px) scale(1.01);',
      'filter: contrast(1.3) brightness(1.3); transform: translateY(-2px) scaleY(1.02);',
      'filter: hue-rotate(-30deg) brightness(0.9); transform: translateX(1px) translateY(-1px);'
    ];
    
    // Apply random distortion
    glitchOverlay.style.cssText = distortionStyles[Math.floor(Math.random() * distortionStyles.length)];
    glitchOverlay.style.display = 'block';
    glitchOverlay.style.backgroundImage = `url("${this._createGlitchOverlayDataURL()}")`;
    glitchOverlay.style.backgroundSize = 'cover';
    glitchOverlay.style.backgroundPosition = 'center';
    glitchOverlay.style.mixBlendMode = 'exclusion';
    glitchOverlay.style.opacity = '0.7';
    
    // Remove after short duration
    setTimeout(() => {
      glitchOverlay.style.opacity = '0';
      
      // Cleanup after transition
      setTimeout(() => {
        glitchOverlay.style.display = 'none';
        glitchOverlay.style.backgroundImage = 'none';
      }, 300);
    }, 100 + Math.random() * 200);
  }

  /**
   * Create data URL for glitch overlay
   */
  _createGlitchOverlayDataURL() {
    // Create a small canvas for the noise texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Draw random noise
    for (let x = 0; x < canvas.width; x++) {
      for (let y = 0; y < canvas.height; y++) {
        const value = Math.random() > 0.5 ? 255 : 0;
        ctx.fillStyle = `rgba(${value}, ${value}, ${value}, 0.1)`;
        ctx.fillRect(x, y, 1, 1);
      }
    }
    
    // Add some larger blocks of color
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * canvas.width);
      const y = Math.floor(Math.random() * canvas.height);
      const w = Math.floor(Math.random() * 10) + 5;
      const h = Math.floor(Math.random() * 10) + 5;
      
      const r = Math.floor(Math.random() * 255);
      const g = Math.floor(Math.random() * 255);
      const b = Math.floor(Math.random() * 255);
      
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      ctx.fillRect(x, y, w, h);
    }
    
    // Convert to data URL
    return canvas.toDataURL('image/png');
  }

  /**
   * Trigger a dimensional tear effect
   */
  _triggerDimensionalTear() {
    // Skip if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    // Skip if already active
    if (this.state.dimensionalTearActive) return;
    
    // Set active
    this.state.dimensionalTearActive = true;
    
    // Get currently visible section
    const visibleSections = this.state.sections.filter(s => {
      const rect = s.element.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    
    if (visibleSections.length === 0) {
      this.state.dimensionalTearActive = false;
      return;
    }
    
    // Select random section
    const section = visibleSections[Math.floor(Math.random() * visibleSections.length)];
    
    // Get dimensional tear element
    const tear = section.element.querySelector('.dimensional-tear');
    if (!tear) {
      this.state.dimensionalTearActive = false;
      return;
    }
    
    // Position randomly within the section
    const x = 20 + Math.random() * 60; // 20-80%
    const y = 20 + Math.random() * 60; // 20-80%
    
    // Size randomly
    const width = 100 + Math.random() * 200; // 100-300px
    const height = 50 + Math.random() * 100; // 50-150px
    
    // Set style
    tear.style.left = `${x}%`;
    tear.style.top = `${y}%`;
    tear.style.width = `${width}px`;
    tear.style.height = `${height}px`;
    tear.style.background = 'rgba(255, 0, 255, 0.2)';
    tear.style.boxShadow = '0 0 50px rgba(0, 255, 255, 0.8), inset 0 0 30px rgba(255, 0, 255, 0.4)';
    tear.style.backdropFilter = 'invert(0.5) hue-rotate(90deg)';
    tear.style.border = '1px solid rgba(0, 255, 255, 0.5)';
    tear.style.borderRadius = Math.random() > 0.5 ? '0' : '50%';
    
    // Show
    tear.style.display = 'block';
    tear.style.opacity = '0';
    
    // Animate in
    setTimeout(() => {
      tear.style.transition = 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';
      tear.style.opacity = '1';
      tear.style.transform = 'scale(1.2) rotate(' + (Math.random() * 40 - 20) + 'deg)';
    }, 50);
    
    // Trigger glitch
    this._triggerGlitchEffect(section.element);
    
    // Animate out after a delay
    setTimeout(() => {
      tear.style.opacity = '0';
      tear.style.transform = 'scale(0.8)';
      
      // Cleanup after transition
      setTimeout(() => {
        tear.style.display = 'none';
        this.state.dimensionalTearActive = false;
      }, 300);
    }, 1500 + Math.random() * 1000);
  }

  /**
   * Setup keyboard navigation
   */
  _setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Arrow up/down or Page up/down
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        this._navigateToSection(this.state.currentSection + 1);
        e.preventDefault();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        this._navigateToSection(this.state.currentSection - 1);
        e.preventDefault();
      }
    });
  }

  /**
   * Navigate to a specific section by index
   */
  _navigateToSection(index) {
    // Validate index
    index = Math.max(0, Math.min(this.state.sections.length - 1, index));
    
    // Get section
    const section = this.state.sections[index];
    if (!section) return;
    
    // Scroll to section
    section.element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Update current section
    this.state.currentSection = index;
  }

  /**
   * Setup mouse move handlers for hover effects
   */
  _setupMouseMoveHandlers() {
    // Skip if reduced motion is enabled
    if (this.config.reducedMotion) return;
    
    // Add mouse move listener to container
    document.addEventListener('mousemove', (e) => {
      this.state.mousePosition.x = e.clientX;
      this.state.mousePosition.y = e.clientY;
      
      this.state.lastMoveEvent = e;
      
      if (!this.state.ticking) {
        requestAnimationFrame(() => {
          this._onMouseMove(e);
          this.state.ticking = false;
        });
        this.state.ticking = true;
      }
    });
  }

  /**
   * Handle mouse movement for parallax effects
   */
  _onMouseMove(e) {
    // Skip if perspective not supported
    if (!this.state.hasPerspectiveSupport) return;
    
    // Skip if currently scrolling
    if (this.state.isScrolling) return;
    
    // Calculate mouse position relative to viewport
    const mouseXFromCenter = (this.state.mousePosition.x - this.state.windowCenter.x) / this.state.windowCenter.x;
    const mouseYFromCenter = (this.state.mousePosition.y - this.state.windowCenter.y) / this.state.windowCenter.y;
    
    // Apply subtle parallax to all visible sections, more pronounced on current
    this.state.sections.forEach(section => {
      // Skip if not visible
      const rect = section.element.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      
      const isCurrent = section.index === this.state.currentSection;
      const factor = isCurrent ? 0.1 : 0.05;
      
      // Calculate parallax offsets
      const xOffset = mouseXFromCenter * -factor * 30;
      const yOffset = mouseYFromCenter * -factor * 30;
      const rotateX = mouseYFromCenter * factor * 5;
      const rotateY = mouseXFromCenter * -factor * 5;
      
      // Apply transform
      section.element.style.transform = `
        translateZ(${section.depth}px)
        translateX(${xOffset}px)
        translateY(${yOffset}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale(${isCurrent ? 1 : Math.max(0.95, 1 - Math.abs(section.depth / 1000) * 0.05)})
      `;
      
      // Apply to layer elements
      const layers = this.state.depthLayers[section.index] || [];
      layers.forEach((layer, layerIndex) => {
        if (layerIndex === 0) return; // Skip content layer
        
        // Calculate effect strength based on layer depth
        const layerFactor = factor * (layerIndex + 1);
        const moveX = mouseXFromCenter * -layerFactor * 50;
        const moveY = mouseYFromCenter * -layerFactor * 50;
        
        // Add to existing transform or create new
        const currentTransform = layer.style.transform || '';
        if (currentTransform.includes('translateZ')) {
          // Extract current translateZ
          const match = currentTransform.match(/translateZ\(([^)]+)\)/);
          const zValue = match ? match[1] : '0px';
          
          // Replace existing transform
          layer.style.transform = `translateZ(${zValue}) translateX(${moveX}px) translateY(${moveY}px)`;
        }
      });
    });
    
    // Trigger rare reality glitch on mouse quick movement
    if (this.state.lastMoveEvent && e.timeStamp - this.state.lastMoveEvent.timeStamp < 50) {
      const deltaX = Math.abs(e.clientX - this.state.lastMoveEvent.clientX);
      const deltaY = Math.abs(e.clientY - this.state.lastMoveEvent.clientY);
      
      if (deltaX + deltaY > 50 && Math.random() < 0.1) {
        const currentSection = this.state.sections[this.state.currentSection];
        if (currentSection) {
          this._triggerGlitchEffect(currentSection.element);
        }
      }
    }
  }

  /**
   * Update window center for parallax calculations
   */
  _updateWindowCenter() {
    this.state.windowCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    };
  }

  /**
   * Handle window resize
   */
  _handleResize() {
    // Update window center
    this._updateWindowCenter();
    
    // Update any canvas sizes in background layers
    this.state.sections.forEach((section, sectionIndex) => {
      const layers = this.state.depthLayers[sectionIndex] || [];
      layers.forEach(layer => {
        const canvas = layer.querySelector('canvas');
        if (canvas) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          
          // Redraw effect
          const ctx = canvas.getContext('2d');
          if (ctx) {
            if (canvas.classList.contains('background-effect-canvas')) {
              // Determine effect type based on canvas data attributes or position
              const effectType = (sectionIndex + layers.indexOf(layer)) % 3;
              
              switch (effectType) {
                case 0:
                  this._drawGridEffect(ctx, canvas.width, canvas.height, sectionIndex);
                  break;
                case 1:
                  this._drawOrganicEffect(ctx, canvas.width, canvas.height, sectionIndex);
                  break;
                case 2:
                  this._drawNoiseEffect(ctx, canvas.width, canvas.height, sectionIndex);
                  break;
              }
            }
          }
        }
      });
    });
  }

  /**
   * Check for reduced motion preference
   */
  _checkReducedMotionPreference() {
    // Check for prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.config.reducedMotion = reducedMotion;
    
    // Add listener for preference changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
      this.config.reducedMotion = e.matches;
    });
    
    // Add class to container if reduced motion
    if (reducedMotion) {
      this.state.container.classList.add('reduced-motion');
    }
  }

  /**
   * Add CSS styles to page
   */
  _addStyles() {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      /* Immersive scroll container */
      .immersive-scroll-container {
        scroll-behavior: smooth;
      }
      
      /* Individual sections */
      .immersive-section {
        transition: transform 0.3s ease;
      }
      
      /* Portal frame styling */
      .portal-frame {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        border: 1px solid rgba(0, 255, 204, 0.3);
        box-shadow: inset 0 0 30px rgba(0, 255, 204, 0.1);
        z-index: 0;
      }
      
      /* Portal corner styling */
      .portal-corner {
        position: absolute;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(0, 255, 204, 0.7);
        pointer-events: none;
        z-index: 2;
      }
      
      .portal-corner.top-left {
        top: 10px;
        left: 10px;
        border-right: none;
        border-bottom: none;
      }
      
      .portal-corner.top-right {
        top: 10px;
        right: 10px;
        border-left: none;
        border-bottom: none;
      }
      
      .portal-corner.bottom-left {
        bottom: 10px;
        left: 10px;
        border-right: none;
        border-top: none;
      }
      
      .portal-corner.bottom-right {
        bottom: 10px;
        right: 10px;
        border-left: none;
        border-top: none;
      }
      
      /* Portal effect classes */
      .portal-enter {
        animation: portal-enter-effect ${this.config.transitionDuration}s cubic-bezier(0.19, 1, 0.22, 1);
      }
      
      .portal-exit {
        animation: portal-exit-effect ${this.config.transitionDuration}s cubic-bezier(0.19, 1, 0.22, 1);
      }
      
      @keyframes portal-enter-effect {
        0% { 
          transform: translateZ(-100px) scale(0.9);
          filter: brightness(0.7) blur(5px);
        }
        50% {
          transform: translateZ(50px) scale(1.02);
          filter: brightness(1.1) blur(0);
        }
        100% {
          transform: translateZ(0) scale(1);
          filter: brightness(1) blur(0);
        }
      }
      
      @keyframes portal-exit-effect {
        0% {
          transform: translateZ(0) scale(1);
          filter: brightness(1) blur(0);
        }
        100% {
          transform: translateZ(-150px) scale(0.9);
          filter: brightness(0.7) blur(10px);
        }
      }
      
      /* Text glitch effect */
      .text-glitching {
        position: relative;
        display: inline-block;
      }
      
      .glitch-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
      
      .glitch-layer.original {
        position: relative;
        z-index: 3;
      }
      
      .glitch-layer.distorted {
        z-index: 2;
        color: #00ffff;
        transform: translateX(-3px) translateY(2px);
        opacity: 0.8;
        clip-path: polygon(0 20%, 100% 0, 100% 80%, 0 100%);
      }
      
      .glitch-layer.shifted {
        z-index: 1;
        color: #ff00ff;
        transform: translateX(3px) translateY(-2px);
        opacity: 0.8;
        clip-path: polygon(0 0, 100% 20%, 100% 100%, 0 80%);
      }
      
      /* Active section */
      .immersive-section.active {
        z-index: 5;
      }
      
      /* Depth layer effects */
      .immersive-content-wrapper {
        transform-style: preserve-3d;
        position: relative;
        z-index: 1;
      }
      
      /* Reduced motion */
      .reduced-motion .immersive-section {
        transform: none !important;
        transition: none !important;
      }
      
      .reduced-motion .immersive-depth-layer {
        transform: none !important;
        transition: none !important;
      }
    `;
    
    // Add to document
    document.head.appendChild(style);
  }

  /**
   * Public method to navigate to a section by index
   */
  goToSection(index) {
    this._navigateToSection(index);
  }

  /**
   * Public method to navigate to next section
   */
  goToNextSection() {
    this._navigateToSection(this.state.currentSection + 1);
  }

  /**
   * Public method to navigate to previous section
   */
  goToPrevSection() {
    this._navigateToSection(this.state.currentSection - 1);
  }

  /**
   * Public method to update configuration
   */
  updateConfig(newConfig) {
    // Update config
    this.config = { ...this.config, ...newConfig };
    
    // Apply changes
    this._checkReducedMotionPreference();
  }

  /**
   * Public method to force a glitch effect
   */
  triggerGlitch() {
    const currentSection = this.state.sections[this.state.currentSection];
    if (currentSection) {
      this._triggerGlitchEffect(currentSection.element);
    }
  }

  /**
   * Public method to force a dimensional tear
   */
  triggerDimensionalTear() {
    this._triggerDimensionalTear();
  }

  /**
   * Clean up all resources
   */
  destroy() {
    // Disconnect observers
    this.state.observers.forEach(observer => {
      observer.disconnect();
    });
    
    // Clear any timeouts
    if (this.state.scrollEndTimeout) {
      clearTimeout(this.state.scrollEndTimeout);
    }
    
    this.state.glitchTimeouts.forEach(timeout => {
      clearTimeout(timeout);
    });
    
    // Remove classes and inline styles
    this.state.sections.forEach(section => {
      section.element.classList.remove('immersive-section', 'current-section', 'active');
      section.element.style.transform = '';
      section.element.style.transition = '';
      section.element.style.filter = '';
      
      // Remove added elements
      const glitchOverlay = section.element.querySelector('.glitch-overlay');
      if (glitchOverlay) glitchOverlay.remove();
      
      const dimensionalTear = section.element.querySelector('.dimensional-tear');
      if (dimensionalTear) dimensionalTear.remove();
      
      // Remove portal frame and corners
      const frame = section.element.querySelector('.portal-frame');
      if (frame) frame.remove();
      
      const corners = section.element.querySelectorAll(`.${this.config.cornerClass}`);
      corners.forEach(corner => corner.remove());
    });
    
    // Reset container styles
    if (this.state.container) {
      this.state.container.classList.remove('immersive-scroll-container', 'reduced-motion');
      this.state.container.style.perspective = '';
      this.state.container.style.perspectiveOrigin = '';
      this.state.container.style.scrollSnapType = '';
    }
    
    console.log('Immersive Scroll: Destroyed');
  }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Check for global settings
  const settings = window.enhancementSettings || {};
  
  // Create global instance
  window.immersiveScroll = new ImmersiveScroll({
    reducedMotion: settings.reducedMotion || false,
    depthFactor: 0.7,
    enableTextDistortion: true
  });
  
  console.log('Immersive Scroll: Module loaded');
});