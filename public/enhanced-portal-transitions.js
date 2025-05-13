/**
 * MillzMaleficarum Codex v0.5
 * Enhanced Portal Transitions Module
 * Creates hyperdimensional portal effects when navigating between sections
 * With advanced HyperAV integration and 4D visualization effects
 */

class PortalTransitions {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      transitionDuration: options.transitionDuration || 1500,
      useHyperAV: options.useHyperAV !== false,
      portalIntensity: options.portalIntensity || 0.8,
      sectionSelector: options.sectionSelector || '.cover-section, .editorial-section, .culture-section, .tech-section, .interview-section, .ads-section, .lore-section',
      containerSelector: options.containerSelector || '#magazine-content',
      enableAudio: options.enableAudio !== false,
      enable4DEffects: options.enable4DEffects !== false,
      debugMode: options.debugMode || false
    };

    // State
    this.state = {
      currentSection: null,
      previousSection: null,
      isTransitioning: false,
      observer: null,
      portalCanvas: null,
      portalContext: null,
      portalOverlay: null,
      portalAnimation: null,
      dimension4DCanvas: null, // For 4D visualization
      dimension4DContext: null,
      hyperAVInstance: window.hyperAV || null,
      sections: [],
      sectionIndices: {}, // Maps section IDs to their position index
      sectionColors: {
        'cover': { primary: '#ff00aa', secondary: '#00eeff', accent: '#ff33ff' },
        'editorial': { primary: '#00eeff', secondary: '#ff00aa', accent: '#33ffcc' },
        'culture': { primary: '#cc00ff', secondary: '#ffcc00', accent: '#aa33ff' },
        'tech': { primary: '#00ffcc', secondary: '#ff00aa', accent: '#33ffdd' },
        'interview': { primary: '#ffcc00', secondary: '#cc00ff', accent: '#ffaa33' },
        'ads': { primary: '#ff33cc', secondary: '#ccff00', accent: '#ff00aa' },
        'lore': { primary: '#8a2be2', secondary: '#00eeff', accent: '#cc33ff' }
      },
      audioContext: null,
      portalSounds: {},
      originalHyperAVSettings: null,
      tesseractVertices: [], // For 4D visualization
      tesseractEdges: [],
      rotationMatrix: {
        xy: 0, xz: 0, xw: 0,
        yz: 0, yw: 0, zw: 0
      },
      isMouseControlActive: false,
      mousePosition: { x: 0, y: 0 }
    };

    // Initialize
    this._initialize();
  }

  /**
   * Initialize the portal transitions system
   */
  _initialize() {
    // Create portal overlay and canvas
    this._createPortalElements();
    
    // Initialize 4D visualization
    if (this.config.enable4DEffects) {
      this._initialize4DVisualization();
    }
    
    // Set up audio if enabled
    if (this.config.enableAudio) {
      this._initAudio();
    }
    
    // Set up intersection observer for section transitions
    this._setupIntersectionObserver();
    
    // Connect to HyperAV if available
    if (this.config.useHyperAV && window.hyperAV) {
      this.state.hyperAVInstance = window.hyperAV;
      // Store original settings
      this.state.originalHyperAVSettings = {
        pattern: window.hyperAV.options.pattern || 'tesseract',
        color1: window.hyperAV.options.color1 || '#00ffcc',
        color2: window.hyperAV.options.color2 || '#ff33cc',
        speed: window.hyperAV.options.speed || 0.03,
        opacity: window.hyperAV.options.opacity || 0.4
      };
      console.log('Portal Transitions: Connected to HyperAV instance');
    }
    
    // Add portal style classes to sections
    this._applySectionStyles();
    
    // Add keyboard navigation for section transition
    this._setupKeyboardNavigation();
    
    // Add mouse control
    this._setupMouseControl();
    
    console.log('Portal Transitions: Initialized');
  }

  /**
   * Create portal overlay elements
   */
  _createPortalElements() {
    // Create main portal overlay
    const overlay = document.createElement('div');
    overlay.className = 'portal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '1000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    
    // Create portal canvas for 2D effects
    const canvas = document.createElement('canvas');
    canvas.className = 'portal-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    // Add canvas to overlay
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
    
    // Store references
    this.state.portalOverlay = overlay;
    this.state.portalCanvas = canvas;
    this.state.portalContext = canvas.getContext('2d');
    
    // Create 4D visualization canvas
    if (this.config.enable4DEffects) {
      const canvas4D = document.createElement('canvas');
      canvas4D.className = 'portal-4d-canvas';
      canvas4D.width = window.innerWidth;
      canvas4D.height = window.innerHeight;
      canvas4D.style.width = '100%';
      canvas4D.style.height = '100%';
      canvas4D.style.position = 'absolute';
      canvas4D.style.top = '0';
      canvas4D.style.left = '0';
      canvas4D.style.pointerEvents = 'none';
      
      // Add to overlay
      overlay.appendChild(canvas4D);
      
      // Store references
      this.state.dimension4DCanvas = canvas4D;
      this.state.dimension4DContext = canvas4D.getContext('2d');
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      if (this.state.dimension4DCanvas) {
        this.state.dimension4DCanvas.width = window.innerWidth;
        this.state.dimension4DCanvas.height = window.innerHeight;
      }
    });
  }
  
  /**
   * Initialize 4D visualization
   */
  _initialize4DVisualization() {
    // Create tesseract vertices
    this.state.tesseractVertices = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            this.state.tesseractVertices.push([x, y, z, w]);
          }
        }
      }
    }
    
    // Create edges
    this.state.tesseractEdges = [];
    for (let i = 0; i < this.state.tesseractVertices.length; i++) {
      for (let j = i + 1; j < this.state.tesseractVertices.length; j++) {
        let diffCount = 0;
        for (let k = 0; k < 4; k++) {
          if (this.state.tesseractVertices[i][k] !== this.state.tesseractVertices[j][k]) {
            diffCount++;
          }
        }
        if (diffCount === 1) {
          this.state.tesseractEdges.push([i, j]);
        }
      }
    }
  }

  /**
   * Set up audio for portal transitions
   */
  _initAudio() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.state.audioContext = new AudioContext();
      
      // Generate portal sound effects
      this._generatePortalSounds();
      
      if (this.config.debugMode) {
        console.log('Portal Transitions: Audio initialized');
      }
    } catch (error) {
      console.error('Portal Transitions: Failed to initialize audio', error);
    }
  }

  /**
   * Generate various portal sound effects
   */
  _generatePortalSounds() {
    // Only generate if we have an audio context
    if (!this.state.audioContext) return;
    
    const ctx = this.state.audioContext;
    const sounds = {};
    
    // Portal enter sound (whoosh with rising pitch)
    sounds.enter = this._createAudioBuffer(ctx, 2, (t) => {
      // Whoosh sound with rising pitch
      const freq = 100 + t * 900;
      const amp = Math.exp(-2 * t) * 0.5;
      // Add some noise and harmonics
      const noise = Math.random() * 0.1;
      const harmonic = Math.sin(2 * Math.PI * freq * 2 * t) * 0.2;
      return Math.sin(2 * Math.PI * freq * t) * amp + noise * amp + harmonic * amp;
    });
    
    // Portal exit sound (reverse whoosh)
    sounds.exit = this._createAudioBuffer(ctx, 2, (t) => {
      // Reverse whoosh with falling pitch
      const freq = 1000 - t * 800;
      const amp = Math.exp(-(2 - t*2) * (2 - t*2)) * 0.5;
      // Add some noise
      const noise = Math.random() * 0.1;
      return Math.sin(2 * Math.PI * freq * t) * amp + noise * amp;
    });
    
    // Transition complete sound (arrival ping)
    sounds.complete = this._createAudioBuffer(ctx, 1, (t) => {
      // High-pitched ping sound with harmonics
      const freq1 = 1200;
      const freq2 = 1800;
      const freq3 = 2400;
      const amp = Math.exp(-10 * t) * 0.3;
      return (Math.sin(2 * Math.PI * freq1 * t) + 
              Math.sin(2 * Math.PI * freq2 * t) * 0.7 + 
              Math.sin(2 * Math.PI * freq3 * t) * 0.4) * amp;
    });
    
    // Dimensional warp sound
    sounds.dimensionWarp = this._createAudioBuffer(ctx, 3, (t) => {
      // Complex sound with frequency modulation
      const modFreq = 0.5 + Math.sin(2 * Math.PI * 2 * t) * 0.2;
      const carrier = 220 + Math.sin(2 * Math.PI * 0.5 * t) * 100;
      const amp = Math.min(1, t * 2) * Math.max(0, 1 - (t - 1.5) * 2) * 0.4;
      
      return Math.sin(2 * Math.PI * carrier * t + 
             Math.sin(2 * Math.PI * modFreq * t) * 10) * amp;
    });
    
    this.state.portalSounds = sounds;
  }

  /**
   * Create audio buffer with custom waveform
   */
  _createAudioBuffer(context, duration, waveformFn) {
    const sampleRate = context.sampleRate;
    const buffer = context.createBuffer(1, sampleRate * duration, sampleRate);
    const channel = buffer.getChannelData(0);
    
    for (let i = 0; i < channel.length; i++) {
      const t = i / sampleRate;
      channel[i] = waveformFn(t);
    }
    
    return buffer;
  }

  /**
   * Play a portal sound effect
   */
  _playPortalSound(soundName) {
    if (!this.state.audioContext || !this.state.portalSounds[soundName]) return;
    
    // Create source node
    const source = this.state.audioContext.createBufferSource();
    source.buffer = this.state.portalSounds[soundName];
    
    // Create gain node for volume control
    const gainNode = this.state.audioContext.createGain();
    gainNode.gain.value = 0.5;
    
    // Add some audio effects
    const filterNode = this.state.audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 3000;
    filterNode.Q.value = 1;
    
    // Connect nodes
    source.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(this.state.audioContext.destination);
    
    // Add some automation
    gainNode.gain.setValueAtTime(0, this.state.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, this.state.audioContext.currentTime + 0.1);
    
    if (soundName === 'enter' || soundName === 'exit') {
      filterNode.frequency.setValueAtTime(800, this.state.audioContext.currentTime);
      filterNode.frequency.exponentialRampToValueAtTime(
        8000, 
        this.state.audioContext.currentTime + (source.buffer.duration * 0.7)
      );
    }
    
    // Start playback
    source.start();
    
    // Return cleanup function
    return () => {
      source.stop();
      source.disconnect();
      filterNode.disconnect();
      gainNode.disconnect();
    };
  }

  /**
   * Set up intersection observer to detect section changes
   */
  _setupIntersectionObserver() {
    // Get all sections
    const container = document.querySelector(this.config.containerSelector);
    if (!container) {
      console.error('Portal Transitions: Container not found');
      return;
    }
    
    // Wait for sections to be created
    const checkForSections = () => {
      const sections = container.querySelectorAll(this.config.sectionSelector);
      if (sections.length > 0) {
        this.state.sections = Array.from(sections);
        this._observeSections();
      } else {
        // Try again after a delay
        setTimeout(checkForSections, 500);
      }
    };
    
    checkForSections();
  }

  /**
   * Observe sections for visibility changes
   */
  _observeSections() {
    // Only create observer if we have sections
    if (this.state.sections.length === 0) return;
    
    // Index sections
    this.state.sections.forEach((section, index) => {
      if (section.id) {
        this.state.sectionIndices[section.id] = index;
      }
    });
    
    // Create observer
    this.state.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const section = entry.target;
          
          // Skip if we're already on this section or transitioning
          if (this.state.currentSection === section || this.state.isTransitioning) return;
          
          // Store previous section
          this.state.previousSection = this.state.currentSection;
          this.state.currentSection = section;
          
          // Trigger portal transition
          if (this.state.previousSection) {
            // Determine direction for transition effect
            const prevIndex = this.state.sectionIndices[this.state.previousSection.id] || 0;
            const currentIndex = this.state.sectionIndices[section.id] || 0;
            const direction = currentIndex > prevIndex ? 'forward' : 'backward';
            
            this._triggerPortalTransition(this.state.previousSection, section, direction);
          }
        }
      });
    }, {
      threshold: 0.5,
      rootMargin: '0px'
    });
    
    // Observe all sections
    this.state.sections.forEach(section => {
      this.state.observer.observe(section);
      
      // Make sure sections have proper snap properties
      section.style.scrollSnapAlign = 'start';
      section.style.height = '100vh';
      section.style.width = '100%';
      section.style.position = 'relative';
      section.style.overflow = 'hidden';
      
      // Set initial section if none is set
      if (!this.state.currentSection) {
        this.state.currentSection = section;
      }
    });
    
    if (this.config.debugMode) {
      console.log(`Portal Transitions: Observing ${this.state.sections.length} sections`);
    }
  }

  /**
   * Apply portal styling to sections
   */
  _applySectionStyles() {
    // Wait for sections to be available
    const waitForSections = setInterval(() => {
      const sections = document.querySelectorAll(this.config.sectionSelector);
      if (sections.length > 0) {
        clearInterval(waitForSections);
        
        // Apply styles to each section
        sections.forEach(section => {
          // Get section ID
          const sectionId = section.id;
          
          // Skip if no ID
          if (!sectionId) return;
          
          // Get section colors
          const colors = this.state.sectionColors[sectionId] || {
            primary: '#ff00ff',
            secondary: '#00ffff',
            accent: '#cc33ff'
          };
          
          // Apply theme colors as data attributes
          section.dataset.primaryColor = colors.primary;
          section.dataset.secondaryColor = colors.secondary;
          section.dataset.accentColor = colors.accent;
          
          // Add portal style class
          section.classList.add('portal-section');
          
          // Add custom portal border
          const portalBorder = document.createElement('div');
          portalBorder.className = 'portal-border';
          portalBorder.style.position = 'absolute';
          portalBorder.style.top = '0';
          portalBorder.style.left = '0';
          portalBorder.style.right = '0';
          portalBorder.style.bottom = '0';
          portalBorder.style.pointerEvents = 'none';
          portalBorder.style.boxShadow = `inset 0 0 30px ${colors.primary}80`;
          portalBorder.style.border = `1px solid ${colors.primary}`;
          portalBorder.style.borderRadius = '0';
          portalBorder.style.transition = 'box-shadow 0.8s ease, border 0.8s ease, border-radius 0.8s ease';
          
          // Insert as first child to keep it behind content
          if (section.firstChild) {
            section.insertBefore(portalBorder, section.firstChild);
          } else {
            section.appendChild(portalBorder);
          }
          
          // Add corner ornaments to create a portal frame
          const cornerSize = '40px';
          const cornerStyles = `
            position: absolute;
            width: ${cornerSize};
            height: ${cornerSize};
            border: 2px solid ${colors.accent};
            pointer-events: none;
            transition: all 0.5s ease;
          `;
          
          // Top left corner
          const topLeftCorner = document.createElement('div');
          topLeftCorner.className = 'portal-corner top-left';
          topLeftCorner.style = cornerStyles;
          topLeftCorner.style.top = '10px';
          topLeftCorner.style.left = '10px';
          topLeftCorner.style.borderRight = 'none';
          topLeftCorner.style.borderBottom = 'none';
          
          // Top right corner
          const topRightCorner = document.createElement('div');
          topRightCorner.className = 'portal-corner top-right';
          topRightCorner.style = cornerStyles;
          topRightCorner.style.top = '10px';
          topRightCorner.style.right = '10px';
          topRightCorner.style.borderLeft = 'none';
          topRightCorner.style.borderBottom = 'none';
          
          // Bottom left corner
          const bottomLeftCorner = document.createElement('div');
          bottomLeftCorner.className = 'portal-corner bottom-left';
          bottomLeftCorner.style = cornerStyles;
          bottomLeftCorner.style.bottom = '10px';
          bottomLeftCorner.style.left = '10px';
          bottomLeftCorner.style.borderRight = 'none';
          bottomLeftCorner.style.borderTop = 'none';
          
          // Bottom right corner
          const bottomRightCorner = document.createElement('div');
          bottomRightCorner.className = 'portal-corner bottom-right';
          bottomRightCorner.style = cornerStyles;
          bottomRightCorner.style.bottom = '10px';
          bottomRightCorner.style.right = '10px';
          bottomRightCorner.style.borderLeft = 'none';
          bottomRightCorner.style.borderTop = 'none';
          
          // Add corners to section
          section.appendChild(topLeftCorner);
          section.appendChild(topRightCorner);
          section.appendChild(bottomLeftCorner);
          section.appendChild(bottomRightCorner);
        });
      }
    }, 100);
  }

  /**
   * Setup keyboard navigation between sections
   */
  _setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Skip if transitioning
      if (this.state.isTransitioning) return;
      
      // Get current section index
      const currentIndex = this.state.sections.indexOf(this.state.currentSection);
      if (currentIndex === -1) return;
      
      let targetIndex = -1;
      
      // Handle arrow keys for navigation
      switch (e.key) {
        case 'ArrowDown':
        case 'PageDown':
          targetIndex = Math.min(currentIndex + 1, this.state.sections.length - 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          targetIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          targetIndex = 0;
          break;
        case 'End':
          targetIndex = this.state.sections.length - 1;
          break;
        default:
          return; // Not a navigation key
      }
      
      // Navigate if index changed
      if (targetIndex !== -1 && targetIndex !== currentIndex) {
        const targetSection = this.state.sections[targetIndex];
        this.transitionToSection(targetSection.id, targetIndex > currentIndex ? 'forward' : 'backward');
        e.preventDefault();
      }
    });
  }
  
  /**
   * Setup mouse control for portal effects
   */
  _setupMouseControl() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.state.mousePosition = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
      
      // Only apply effects if not transitioning
      if (!this.state.isTransitioning && this.state.isMouseControlActive) {
        this._applyMouseInfluence();
      }
    });
    
    // Toggle mouse control state
    document.addEventListener('mousedown', () => {
      if (!this.state.isTransitioning) {
        this.state.isMouseControlActive = true;
      }
    });
    
    document.addEventListener('mouseup', () => {
      this.state.isMouseControlActive = false;
      
      // Reset any portal effects
      if (!this.state.isTransitioning) {
        this._resetMouseInfluence();
      }
    });
  }
  
  /**
   * Apply mouse influence to portal effects
   */
  _applyMouseInfluence() {
    if (!this.state.currentSection) return;
    
    // Get portal borders
    const portalBorder = this.state.currentSection.querySelector('.portal-border');
    if (!portalBorder) return;
    
    // Get section colors
    const sectionId = this.state.currentSection.id;
    const colors = this.state.sectionColors[sectionId] || {
      primary: '#ff00ff',
      secondary: '#00ffff'
    };
    
    // Calculate intensity based on mouse distance from center
    const centerDistance = Math.sqrt(
      Math.pow(this.state.mousePosition.x - 0.5, 2) +
      Math.pow(this.state.mousePosition.y - 0.5, 2)
    ) * 2; // 0 at center, 1 at corners
    
    // Apply subtle portal effect based on mouse position
    const glowSize = 20 + centerDistance * 30;
    const glowOpacity = 0.5 + centerDistance * 0.3;
    
    portalBorder.style.boxShadow = `inset 0 0 ${glowSize}px ${colors.primary}${Math.floor(glowOpacity * 255).toString(16).padStart(2, '0')}`;
    portalBorder.style.borderRadius = `${centerDistance * 20}px`;
    
    // If HyperAV is available, subtly influence it
    if (this.state.hyperAVInstance && this.config.useHyperAV) {
      // Calculate subtle speed change based on mouse movement
      const speedFactor = 0.03 + centerDistance * 0.02;
      
      this.state.hyperAVInstance.updateOptions({
        speed: speedFactor,
        opacity: 0.4 + centerDistance * 0.2
      });
    }
    
    // Apply effect to corner ornaments
    const corners = this.state.currentSection.querySelectorAll('.portal-corner');
    corners.forEach(corner => {
      corner.style.borderColor = colors.accent;
      const size = 40 + centerDistance * 20;
      corner.style.width = `${size}px`;
      corner.style.height = `${size}px`;
    });
  }
  
  /**
   * Reset mouse influence effects
   */
  _resetMouseInfluence() {
    if (!this.state.currentSection) return;
    
    // Get portal borders
    const portalBorder = this.state.currentSection.querySelector('.portal-border');
    if (!portalBorder) return;
    
    // Get section colors
    const sectionId = this.state.currentSection.id;
    const colors = this.state.sectionColors[sectionId] || {
      primary: '#ff00ff',
      secondary: '#00ffff'
    };
    
    // Reset portal effect
    portalBorder.style.boxShadow = `inset 0 0 30px ${colors.primary}80`;
    portalBorder.style.borderRadius = '0';
    
    // Reset HyperAV 
    if (this.state.hyperAVInstance && this.config.useHyperAV && this.state.originalHyperAVSettings) {
      this.state.hyperAVInstance.updateOptions({
        speed: this.state.originalHyperAVSettings.speed,
        opacity: this.state.originalHyperAVSettings.opacity
      });
    }
    
    // Reset corner ornaments
    const corners = this.state.currentSection.querySelectorAll('.portal-corner');
    corners.forEach(corner => {
      corner.style.width = '40px';
      corner.style.height = '40px';
    });
  }

  /**
   * Trigger portal transition between sections
   */
  _triggerPortalTransition(fromSection, toSection, direction = 'forward') {
    // Prevent concurrent transitions
    if (this.state.isTransitioning) return;
    this.state.isTransitioning = true;
    
    // Get section IDs
    const fromId = fromSection.id;
    const toId = toSection.id;
    
    // Get section colors
    const fromColors = this.state.sectionColors[fromId] || { 
      primary: '#ff00ff', 
      secondary: '#00ffff', 
      accent: '#cc33ff' 
    };
    const toColors = this.state.sectionColors[toId] || { 
      primary: '#ff00ff', 
      secondary: '#00ffff',
      accent: '#cc33ff'
    };
    
    // Show the portal overlay
    const overlay = this.state.portalOverlay;
    overlay.style.opacity = '1';
    
    // Play portal enter sound
    if (this.config.enableAudio) {
      this._playPortalSound('enter');
      
      // Also play dimension warp sound for longer transitions
      setTimeout(() => {
        if (this.state.isTransitioning) {
          this._playPortalSound('dimensionWarp');
        }
      }, 300);
    }
    
    // If HyperAV is available, integrate with the transition
    if (this.state.hyperAVInstance && this.config.useHyperAV) {
      // Update HyperAV parameters to match the transition
      this.state.hyperAVInstance.updateOptions({
        pattern: 'tesseract_fold',
        color1: fromColors.primary,
        color2: toColors.primary,
        speed: 0.2,
        opacity: 0.8
      });
    }
    
    // Initialize 4D transition effect
    if (this.config.enable4DEffects) {
      // Reset rotation matrix values
      Object.keys(this.state.rotationMatrix).forEach(key => {
        this.state.rotationMatrix[key] = 0;
      });
      
      // Start 4D animation
      this._start4DAnimation();
    }
    
    // Add page transition class to the sections
    const transitionClass = direction === 'forward' ? 'exit-to-back' : 'exit-to-front';
    fromSection.classList.add(transitionClass);
    
    // Start portal animation
    this._animatePortalTransition(fromColors, toColors, direction, () => {
      // Transition complete
      this.state.isTransitioning = false;
      
      // Hide the portal overlay
      overlay.style.opacity = '0';
      
      // Stop 4D animation
      if (this.config.enable4DEffects) {
        this._stop4DAnimation();
      }
      
      // Remove transition classes
      fromSection.classList.remove(transitionClass);
      
      // Play complete sound
      if (this.config.enableAudio) {
        this._playPortalSound('complete');
      }
      
      // Reset HyperAV if used
      if (this.state.hyperAVInstance && this.config.useHyperAV && this.state.originalHyperAVSettings) {
        this.state.hyperAVInstance.updateOptions({
          pattern: this.state.originalHyperAVSettings.pattern,
          color1: this.state.originalHyperAVSettings.color1,
          color2: this.state.originalHyperAVSettings.color2,
          speed: this.state.originalHyperAVSettings.speed,
          opacity: this.state.originalHyperAVSettings.opacity
        });
      }
      
      if (this.config.debugMode) {
        console.log(`Portal transition complete: ${fromId} → ${toId} (${direction})`);
      }
    });
    
    if (this.config.debugMode) {
      console.log(`Portal transition started: ${fromId} → ${toId} (${direction})`);
    }
  }

  /**
   * Start 4D animation
   */
  _start4DAnimation() {
    if (!this.state.dimension4DCanvas || !this.config.enable4DEffects) return;
    
    // Animation frame reference
    this.state.animation4D = requestAnimationFrame(timestamp => this._animate4D(timestamp));
  }
  
  /**
   * Stop 4D animation
   */
  _stop4DAnimation() {
    if (this.state.animation4D) {
      cancelAnimationFrame(this.state.animation4D);
      this.state.animation4D = null;
      
      // Clear 4D canvas
      if (this.state.dimension4DContext) {
        this.state.dimension4DContext.clearRect(
          0, 0, 
          this.state.dimension4DCanvas.width, 
          this.state.dimension4DCanvas.height
        );
      }
    }
  }
  
  /**
   * Animate 4D tesseract
   */
  _animate4D(timestamp) {
    if (!this.state.isTransitioning || !this.state.dimension4DContext) {
      this._stop4DAnimation();
      return;
    }
    
    // Get canvas dimensions
    const canvas = this.state.dimension4DCanvas;
    const ctx = this.state.dimension4DContext;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate center
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Update rotation angles
    this.state.rotationMatrix.xy += 0.01;
    this.state.rotationMatrix.xz += 0.02;
    this.state.rotationMatrix.xw += 0.03;
    this.state.rotationMatrix.yz += 0.02;
    this.state.rotationMatrix.yw += 0.01;
    this.state.rotationMatrix.zw += 0.02;
    
    // Get colors from current transition
    let primaryColor = '#ff00ff';
    let secondaryColor = '#00ffff';
    
    if (this.state.previousSection && this.state.currentSection) {
      const fromId = this.state.previousSection.id;
      const toId = this.state.currentSection.id;
      
      const fromColors = this.state.sectionColors[fromId] || { primary: '#ff00ff', secondary: '#00ffff' };
      const toColors = this.state.sectionColors[toId] || { primary: '#ff00ff', secondary: '#00ffff' };
      
      // Use current transition progress to interpolate colors
      const progress = (timestamp - this.state.transitionStartTime) / this.config.transitionDuration;
      primaryColor = this._interpolateColor(fromColors.primary, toColors.primary, progress);
      secondaryColor = this._interpolateColor(fromColors.secondary, toColors.secondary, progress);
    }
    
    // Draw 4D tesseract
    this._draw4DTesseract(
      ctx, centerX, centerY, Math.min(width, height) / 4,
      primaryColor, secondaryColor
    );
    
    // Continue animation
    this.state.animation4D = requestAnimationFrame(timestamp => this._animate4D(timestamp));
  }
  
  /**
   * Draw 4D tesseract
   */
  _draw4DTesseract(ctx, centerX, centerY, scale, color1, color2) {
    // Project vertices from 4D to 2D
    const vertices2D = this.state.tesseractVertices.map(vertex => {
      const rotated = this._rotate4D(vertex);
      return this._project4DTo2D(rotated, centerX, centerY, scale);
    });
    
    // Draw edges
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.7;
    
    // Create gradient
    const gradient = ctx.createLinearGradient(
      centerX - scale, centerY - scale,
      centerX + scale, centerY + scale
    );
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    
    ctx.strokeStyle = gradient;
    ctx.beginPath();
    
    for (const [i, j] of this.state.tesseractEdges) {
      // Skip some edges randomly for an ethereal effect
      if (Math.random() < 0.2) continue;
      
      const [x1, y1] = vertices2D[i];
      const [x2, y2] = vertices2D[j];
      
      // Calculate edge alpha based on 4D position
      const w1 = this.state.tesseractVertices[i][3];
      const w2 = this.state.tesseractVertices[j][3];
      const edgeAlpha = Math.min(1, Math.max(0.1, (w1 + w2 + 2) / 4));
      
      ctx.globalAlpha = edgeAlpha * 0.8;
      
      // Draw the edge
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    
    ctx.stroke();
    
    // Draw vertices
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = color2;
    
    for (let i = 0; i < vertices2D.length; i++) {
      const [x, y] = vertices2D[i];
      const w = this.state.tesseractVertices[i][3];
      const vertexSize = 3 + (w + 1) * 2; // Size varies by 4D position
      
      ctx.beginPath();
      ctx.arc(x, y, vertexSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Reset alpha
    ctx.globalAlpha = 1;
  }
  
  /**
   * Rotate vertex in 4D space
   */
  _rotate4D(vertex) {
    const [x, y, z, w] = vertex;
    const { xy, xz, xw, yz, yw, zw } = this.state.rotationMatrix;
    
    // XY rotation
    let x1 = x * Math.cos(xy) - y * Math.sin(xy);
    let y1 = x * Math.sin(xy) + y * Math.cos(xy);
    let z1 = z;
    let w1 = w;
    
    // XZ rotation
    let x2 = x1 * Math.cos(xz) - z1 * Math.sin(xz);
    let y2 = y1;
    let z2 = x1 * Math.sin(xz) + z1 * Math.cos(xz);
    let w2 = w1;
    
    // XW rotation
    let x3 = x2 * Math.cos(xw) - w2 * Math.sin(xw);
    let y3 = y2;
    let z3 = z2;
    let w3 = x2 * Math.sin(xw) + w2 * Math.cos(xw);
    
    // YZ rotation
    let x4 = x3;
    let y4 = y3 * Math.cos(yz) - z3 * Math.sin(yz);
    let z4 = y3 * Math.sin(yz) + z3 * Math.cos(yz);
    let w4 = w3;
    
    // YW rotation
    let x5 = x4;
    let y5 = y4 * Math.cos(yw) - w4 * Math.sin(yw);
    let z5 = z4;
    let w5 = y4 * Math.sin(yw) + w4 * Math.cos(yw);
    
    // ZW rotation
    let x6 = x5;
    let y6 = y5;
    let z6 = z5 * Math.cos(zw) - w5 * Math.sin(zw);
    let w6 = z5 * Math.sin(zw) + w5 * Math.cos(zw);
    
    return [x6, y6, z6, w6];
  }
  
  /**
   * Project 4D point to 2D
   */
  _project4DTo2D(vertex, centerX, centerY, scale) {
    // Simple perspective projection from 4D to 3D
    const [x, y, z, w] = vertex;
    const distance = 5;
    
    // Project 4D to 3D
    const w_factor = 1 / (distance - w);
    const x3 = x * w_factor;
    const y3 = y * w_factor;
    const z3 = z * w_factor;
    
    // Project 3D to 2D
    const z_factor = 1 / (distance - z3);
    const x2 = x3 * z_factor * scale + centerX;
    const y2 = y3 * z_factor * scale + centerY;
    
    return [x2, y2];
  }

  /**
   * Animate the portal transition effect
   */
  _animatePortalTransition(fromColors, toColors, direction, onComplete) {
    const canvas = this.state.portalCanvas;
    const ctx = this.state.portalContext;
    const startTime = performance.now();
    this.state.transitionStartTime = startTime; // Store for 4D animation
    const duration = this.config.transitionDuration;
    const intensity = this.config.portalIntensity;
    
    // Create portal animation effect
    const animate = (timestamp) => {
      // Calculate progress (0 to 1)
      const progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw portal effect based on progress and direction
      this._drawPortalEffect(ctx, canvas.width, canvas.height, fromColors, toColors, progress, intensity, direction);
      
      // Continue animation if not complete
      if (progress < 1) {
        this.state.portalAnimation = requestAnimationFrame(animate);
      } else {
        // Animation complete
        cancelAnimationFrame(this.state.portalAnimation);
        this.state.portalAnimation = null;
        
        // Run completion callback
        if (onComplete) onComplete();
      }
    };
    
    // Start animation
    this.state.portalAnimation = requestAnimationFrame(animate);
  }

  /**
   * Draw portal effect on canvas
   */
  _drawPortalEffect(ctx, width, height, fromColors, toColors, progress, intensity, direction) {
    // Center of portal
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Portal size and shape varies based on direction
    let portalSize, portalShape;
    
    if (direction === 'forward') {
      // Forward: growing tunnel effect then shrinking exit
      if (progress < 0.5) {
        // First half: tunnel grows and user moves in
        portalSize = progress * 2; // 0 to 1
        portalShape = 1.0 - progress * 0.5; // Starts round, becomes more square
      } else {
        // Second half: tunnel shrinks behind as user exits
        portalSize = 1 - ((progress - 0.5) * 2); // 1 to 0
        portalShape = 0.5 + (progress - 0.5) * 1.0; // Becomes round again at end
      }
    } else {
      // Backward: swirling wormhole effect
      if (progress < 0.5) {
        // First half: wormhole opens
        portalSize = progress * 2; // 0 to 1
        portalShape = 0.7; // More elliptical
      } else {
        // Second half: wormhole closes
        portalSize = 1 - ((progress - 0.5) * 2); // 1 to 0
        portalShape = 0.7 + (progress - 0.5) * 0.6; // Becomes rounder
      }
    }
    
    // Scale portal size by intensity and screen dimensions
    const maxSize = Math.max(width, height) * 1.2;
    const size = portalSize * maxSize * intensity;
    
    // Calculate warp factor (increases in middle of transition)
    const warpFactor = Math.sin(progress * Math.PI) * intensity;
    
    // Calculate distortion based on direction
    const distortion = direction === 'forward' ? 
      Math.sin(progress * Math.PI * 2) * 0.2 : 
      Math.sin(progress * Math.PI * 3) * 0.3;
    
    // Modify portal shape based on direction
    const outerRingShape = direction === 'forward' ? 
      [size * (1 + distortion * 0.1), size * portalShape] : 
      [size * portalShape, size * (1 + distortion * 0.1)];
    
    // Create gradient for portal ring
    const ringGradient = ctx.createRadialGradient(
      centerX, centerY, size * 0.7,
      centerX + distortion * 50, centerY, size
    );
    
    // Interpolate colors based on progress
    const primaryColor = this._interpolateColor(fromColors.primary, toColors.primary, progress);
    const secondaryColor = this._interpolateColor(fromColors.secondary, toColors.secondary, progress);
    const accentColor = this._interpolateColor(
      fromColors.accent || fromColors.primary, 
      toColors.accent || toColors.primary, 
      progress
    );
    
    // Build gradient stops
    ringGradient.addColorStop(0, `${primaryColor}00`); // Transparent inner
    ringGradient.addColorStop(0.7, `${primaryColor}80`); // Semi-transparent middle
    ringGradient.addColorStop(0.9, `${secondaryColor}A0`); // Colored outer
    ringGradient.addColorStop(1, `${primaryColor}00`); // Transparent edge
    
    // Draw portal ring - use elliptical arc for directional effect
    ctx.beginPath();
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(progress * (direction === 'forward' ? 0.5 : -0.8));
    ctx.scale(outerRingShape[0] / size, outerRingShape[1] / size);
    ctx.fillStyle = ringGradient;
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.restore();
    ctx.fill();
    
    // Draw radial lines emanating from center (more for forward, fewer for backward)
    const numLines = direction === 'forward' ? 24 : 16;
    const lineLength = size * 0.9;
    
    ctx.save();
    ctx.strokeStyle = secondaryColor;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.5;
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2 + (direction === 'forward' ? progress * 1 : -progress * 2);
      const lineDistortion = Math.sin((progress * (direction === 'forward' ? 5 : 3)) + i) * warpFactor * 20;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      
      // Calculate end point with distortion - elliptical for direction
      const stretchFactor = direction === 'forward' ? [1, portalShape] : [portalShape, 1];
      const endX = centerX + Math.cos(angle) * (lineLength + lineDistortion) * stretchFactor[0];
      const endY = centerY + Math.sin(angle) * (lineLength + lineDistortion) * stretchFactor[1];
      
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    ctx.restore();
    
    // Draw swirl effect in center - direction changes rotation
    ctx.save();
    const swirlGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, size * 0.7
    );
    
    swirlGradient.addColorStop(0, `${accentColor}80`);
    swirlGradient.addColorStop(0.5, `${primaryColor}40`);
    swirlGradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    ctx.fillStyle = swirlGradient;
    ctx.globalAlpha = 0.8;
    
    // Create more complex swirl for backward direction
    const swirlSteps = direction === 'forward' ? 5 : 8;
    const rotationDir = direction === 'forward' ? 1 : -1;
    
    ctx.beginPath();
    for (let radius = 0; radius < size * 0.7; radius += swirlSteps) {
      const innerProgress = radius / (size * 0.7);
      const spinFactor = (1 - innerProgress) * (direction === 'forward' ? 20 : 30) * warpFactor;
      const points = direction === 'forward' ? 12 : 16;
      
      ctx.beginPath();
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 + (progress * spinFactor * rotationDir);
        
        // Add spiral effect for backward direction
        const spiralFactor = direction === 'backward' ? innerProgress * progress * 30 : 0;
        const radiusOffset = direction === 'backward' ? 
          Math.sin(innerProgress * Math.PI * 8 + progress * 10) * 10 * warpFactor : 0;
        
        const ptRadius = radius + radiusOffset;
        const ptX = centerX + Math.cos(angle + spiralFactor) * ptRadius;
        const ptY = centerY + Math.sin(angle + spiralFactor) * ptRadius;
        
        if (i === 0) {
          ctx.moveTo(ptX, ptY);
        } else {
          ctx.lineTo(ptX, ptY);
        }
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    
    // Add subtle glow around entire canvas at peak transition
    const glowIntensity = Math.sin(progress * Math.PI) * 0.7;
    if (glowIntensity > 0.2) {
      ctx.save();
      ctx.fillStyle = `${accentColor}${Math.floor(glowIntensity * 255).toString(16).padStart(2, '0')}`;
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
    
    // Add dimensional fractal edges (only at peak of transition)
    if (progress > 0.3 && progress < 0.7) {
      const fractalOpacity = Math.sin((progress - 0.3) * Math.PI / 0.4) * 0.6;
      this._drawFractalEdges(ctx, centerX, centerY, size * 0.8, primaryColor, secondaryColor, accentColor, fractalOpacity, direction);
    }
  }
  
  /**
   * Draw fractal portal edges for extra dimensional effect
   */
  _drawFractalEdges(ctx, x, y, size, color1, color2, color3, opacity, direction) {
    ctx.save();
    ctx.globalAlpha = opacity;
    
    const baseAngle = direction === 'forward' ? 0 : Math.PI / 4;
    const iterations = 5; // More iterations = more complex fractals
    
    // Draw a recursive fractal pattern around the portal edge
    const drawFractal = (x, y, size, angle, depth) => {
      if (depth <= 0) return;
      
      const colorIndex = depth % 3;
      const color = colorIndex === 0 ? color1 : (colorIndex === 1 ? color2 : color3);
      
      // Draw branch
      const endX = x + Math.cos(angle) * size;
      const endY = y + Math.sin(angle) * size;
      
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = depth * 0.5;
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Draw sub-branches
      const newSize = size * 0.6;
      const angleOffset = (Math.PI / 4) * (direction === 'forward' ? 1 : 1.5);
      
      drawFractal(endX, endY, newSize, angle + angleOffset, depth - 1);
      drawFractal(endX, endY, newSize, angle - angleOffset, depth - 1);
    };
    
    // Draw multiple fractals around the portal
    const numFractals = 8;
    for (let i = 0; i < numFractals; i++) {
      const angle = baseAngle + (i / numFractals) * Math.PI * 2;
      const startX = x + Math.cos(angle) * size;
      const startY = y + Math.sin(angle) * size;
      
      drawFractal(startX, startY, size * 0.2, angle + Math.PI, iterations);
    }
    
    ctx.restore();
  }

  /**
   * Interpolate between two colors based on progress
   */
  _interpolateColor(color1, color2, progress) {
    // Handle null or undefined colors
    if (!color1) color1 = '#ff00ff';
    if (!color2) color2 = '#00ffff';
    
    // Convert hex colors to RGB
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    // Interpolate RGB values
    const r = Math.round(r1 + (r2 - r1) * progress);
    const g = Math.round(g1 + (g2 - g1) * progress);
    const b = Math.round(b1 + (b2 - b1) * progress);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  /**
   * Manually trigger a transition to a specific section
   */
  transitionToSection(sectionId, direction = 'forward') {
    // Find section by ID
    const section = document.getElementById(sectionId);
    if (!section) {
      console.error(`Portal Transitions: Section "${sectionId}" not found`);
      return false;
    }
    
    // Skip if we're already on this section or transitioning
    if (this.state.currentSection === section || this.state.isTransitioning) {
      return false;
    }
    
    // Store previous section
    this.state.previousSection = this.state.currentSection;
    this.state.currentSection = section;
    
    // Trigger portal transition
    if (this.state.previousSection) {
      this._triggerPortalTransition(this.state.previousSection, section, direction);
    }
    
    // Scroll to the section (will be smooth due to CSS)
    section.scrollIntoView();
    
    return true;
  }

  /**
   * Update configuration options
   * @param {Object} options - New configuration options
   */
  updateOptions(options) {
    // Update configuration with new options
    this.config = { ...this.config, ...options };
    
    console.log('Portal Transitions: Configuration updated', this.config);
    
    // Re-initialize any components that depend on the updated options
    if (options.enableAudio !== undefined && options.enableAudio !== null) {
      if (options.enableAudio && !this.state.audioContext) {
        this._initAudio();
      } else if (!options.enableAudio && this.state.audioContext) {
        if (this.state.audioContext) {
          this.state.audioContext.close();
          this.state.audioContext = null;
          this.state.portalSounds = {};
        }
      }
    }
    
    // Re-initialize 4D visualization if the option changed
    if (options.enable4DEffects !== undefined && options.enable4DEffects !== null) {
      if (options.enable4DEffects && !this.state.dimension4DCanvas) {
        this._initialize4DVisualization();
      } else if (!options.enable4DEffects && this.state.dimension4DCanvas) {
        if (this.state.animation4D) {
          cancelAnimationFrame(this.state.animation4D);
          this.state.animation4D = null;
        }
        
        if (this.state.dimension4DCanvas) {
          this.state.dimension4DCanvas.remove();
          this.state.dimension4DCanvas = null;
          this.state.dimension4DContext = null;
        }
      }
    }
    
    // Apply styles based on new settings
    if (this.state.portalOverlay) {
      // Update portal intensity if specified
      if (options.portalIntensity !== undefined && options.portalIntensity !== null) {
        this.state.portalOverlay.style.setProperty('--portal-intensity', options.portalIntensity);
      }
    }
  }
  
  /**
   * Update section colors
   * @param {Object} colors - Section color configuration
   */
  updateSectionColors(colors) {
    if (!colors) return;
    
    // Update internal state
    Object.keys(colors).forEach(sectionId => {
      this.state.sectionColors[sectionId] = colors[sectionId];
    });
    
    // Update section styles if they exist
    Object.keys(colors).forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) {
        const portalBorder = section.querySelector('.portal-border');
        if (portalBorder) {
          const colorConfig = colors[sectionId];
          portalBorder.style.boxShadow = `inset 0 0 30px ${colorConfig.primary}80`;
          portalBorder.style.border = `1px solid ${colorConfig.primary}`;
        }
        
        // Update data attributes
        section.dataset.primaryColor = colors[sectionId].primary;
        section.dataset.secondaryColor = colors[sectionId].secondary;
        if (colors[sectionId].accent) {
          section.dataset.accentColor = colors[sectionId].accent;
        }
        
        // Update corner colors
        const corners = section.querySelectorAll('.portal-corner');
        corners.forEach(corner => {
          if (colors[sectionId].accent) {
            corner.style.borderColor = colors[sectionId].accent;
          } else {
            corner.style.borderColor = colors[sectionId].primary;
          }
        });
      }
    });
    
    console.log('Portal Transitions: Section colors updated');
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Cancel any active animations
    if (this.state.portalAnimation) {
      cancelAnimationFrame(this.state.portalAnimation);
      this.state.portalAnimation = null;
    }
    
    if (this.state.animation4D) {
      cancelAnimationFrame(this.state.animation4D);
      this.state.animation4D = null;
    }
    
    // Disconnect observer
    if (this.state.observer) {
      this.state.observer.disconnect();
      this.state.observer = null;
    }
    
    // Remove portal overlay
    if (this.state.portalOverlay) {
      this.state.portalOverlay.remove();
      this.state.portalOverlay = null;
    }
    
    // Close audio context
    if (this.state.audioContext) {
      this.state.audioContext.close();
      this.state.audioContext = null;
    }
    
    // Reset HyperAV
    if (this.state.hyperAVInstance && this.config.useHyperAV && this.state.originalHyperAVSettings) {
      this.state.hyperAVInstance.updateOptions(this.state.originalHyperAVSettings);
    }
    
    console.log('Portal Transitions: Destroyed');
  }
}

// Add CSS for portal sections
const addPortalStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    /* Portal section styles */
    .portal-section {
      scroll-snap-align: start;
      min-height: 100vh;
      width: 100%;
      position: relative;
      overflow: hidden;
      transition: transform 0.5s ease, border-radius 0.5s ease;
      padding: 4rem 2rem 2rem 2rem;
      box-sizing: border-box;
      background-color: rgba(0, 0, 60, 0.4);
      transform-style: preserve-3d;
    }
    
    /* Ensure each section has proper spacing */
    .portal-section > * {
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      position: relative;
      z-index: 2;
    }
    
    /* Section exit transitions */
    .portal-section.exit-to-back {
      animation: exitToBack 1.5s ease-in-out;
    }
    
    .portal-section.exit-to-front {
      animation: exitToFront 1.5s ease-in-out;
    }
    
    @keyframes exitToBack {
      0% { transform: scale(1) translateZ(0); }
      50% { transform: scale(0.9) translateZ(-100px); }
      100% { transform: scale(1) translateZ(0); }
    }
    
    @keyframes exitToFront {
      0% { transform: scale(1) translateZ(0); }
      50% { transform: scale(1.1) translateZ(100px); }
      100% { transform: scale(1) translateZ(0); }
    }
    
    /* General content container style */
    #magazine-content {
      width: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-snap-type: y mandatory;
      height: 100vh;
    }
    
    /* Portal transition animation */
    @keyframes portalWarp {
      0% { transform: scale(1) rotate(0deg); }
      50% { transform: scale(1.1) rotate(2deg); }
      100% { transform: scale(1) rotate(0deg); }
    }
    
    /* Portal border pulse animation */
    @keyframes portalBorderPulse {
      0% { box-shadow: inset 0 0 30px var(--accent2); }
      50% { box-shadow: inset 0 0 50px var(--accent2); }
      100% { box-shadow: inset 0 0 30px var(--accent2); }
    }
    
    /* Animated corner ornaments */
    @keyframes cornerPulse {
      0% { width: 40px; height: 40px; border-width: 2px; }
      50% { width: 50px; height: 50px; border-width: 3px; }
      100% { width: 40px; height: 40px; border-width: 2px; }
    }
    
    /* Section hover effects */
    .portal-section:hover .portal-border {
      box-shadow: inset 0 0 50px var(--accent2);
      animation: portalBorderPulse 3s infinite ease-in-out;
    }
    
    .portal-section:hover .portal-corner {
      animation: cornerPulse 3s infinite ease-in-out;
    }
  `;
  document.head.appendChild(style);
};

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add portal styles
  addPortalStyles();
  
  // Create global instance
  window.portalTransitions = new PortalTransitions({
    useHyperAV: true,
    enableAudio: true,
    enable4DEffects: true
  });
  
  console.log('Enhanced Portal Transitions: Module loaded');
});

// Expose class for modular usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PortalTransitions;
}