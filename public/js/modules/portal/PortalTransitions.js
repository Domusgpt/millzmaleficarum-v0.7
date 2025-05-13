/**
 * MillzMaleficarum Codex v0.6
 * Portal Transitions Module
 * Creates hyperdimensional portal effects when navigating between sections
 */

export default class PortalTransitions {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      transitionDuration: options.transitionDuration || 1500,
      useHyperAV: options.useHyperAV !== false,
      portalIntensity: options.portalIntensity || 0.8,
      sectionSelector: options.sectionSelector || '.cover-section, .editorial-section, .culture-section, .tech-section, .interview-section, .ads-section, .lore-section',
      containerSelector: options.containerSelector || '#magazine-content',
      enableAudio: options.enableAudio !== false,
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
      hyperAVInstance: window.hyperAV || null,
      sections: [],
      sectionColors: {
        'cover': { primary: '#ff00aa', secondary: '#00eeff' },
        'editorial': { primary: '#00eeff', secondary: '#ff00aa' },
        'culture': { primary: '#cc00ff', secondary: '#ffcc00' },
        'tech': { primary: '#00ffcc', secondary: '#ff00aa' },
        'interview': { primary: '#ffcc00', secondary: '#cc00ff' },
        'ads': { primary: '#ff33cc', secondary: '#ccff00' },
        'lore': { primary: '#8a2be2', secondary: '#00eeff' }
      },
      audioContext: null,
      portalSounds: {}
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
    
    // Set up audio if enabled
    if (this.config.enableAudio) {
      this._initAudio();
    }
    
    // Set up intersection observer for section transitions
    this._setupIntersectionObserver();
    
    // Connect to HyperAV if available
    if (this.config.useHyperAV && window.hyperAV) {
      this.state.hyperAVInstance = window.hyperAV;
      console.log('Portal Transitions: Connected to HyperAV instance');
    }
    
    // Add portal style classes to sections
    this._applySectionStyles();
    
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
    
    // Create portal canvas for WebGL effects
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
    
    // Handle window resize
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
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
      // Add some noise
      const noise = Math.random() * 0.1;
      return Math.sin(2 * Math.PI * freq * t) * amp + noise * amp;
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
      // High-pitched ping sound
      const freq1 = 1200;
      const freq2 = 1800;
      const amp = Math.exp(-10 * t) * 0.3;
      return (Math.sin(2 * Math.PI * freq1 * t) + Math.sin(2 * Math.PI * freq2 * t)) * amp;
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
    
    // Connect nodes
    source.connect(gainNode);
    gainNode.connect(this.state.audioContext.destination);
    
    // Start playback
    source.start();
    
    // Return cleanup function
    return () => {
      source.stop();
      source.disconnect();
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
            this._triggerPortalTransition(this.state.previousSection, section);
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
            secondary: '#00ffff'
          };
          
          // Apply theme colors as data attributes
          section.dataset.primaryColor = colors.primary;
          section.dataset.secondaryColor = colors.secondary;
          
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
          
          // Insert as first child to keep it behind content
          if (section.firstChild) {
            section.insertBefore(portalBorder, section.firstChild);
          } else {
            section.appendChild(portalBorder);
          }
        });
      }
    }, 100);
  }

  /**
   * Trigger portal transition between sections
   */
  _triggerPortalTransition(fromSection, toSection) {
    // Prevent concurrent transitions
    if (this.state.isTransitioning) return;
    this.state.isTransitioning = true;
    
    // Get section IDs
    const fromId = fromSection.id;
    const toId = toSection.id;
    
    // Get section colors
    const fromColors = this.state.sectionColors[fromId] || { primary: '#ff00ff', secondary: '#00ffff' };
    const toColors = this.state.sectionColors[toId] || { primary: '#ff00ff', secondary: '#00ffff' };
    
    // Show the portal overlay
    const overlay = this.state.portalOverlay;
    overlay.style.opacity = '1';
    
    // Play portal enter sound
    if (this.config.enableAudio) {
      this._playPortalSound('enter');
    }
    
    // If HyperAV is available, integrate with the transition
    if (this.state.hyperAVInstance && this.config.useHyperAV) {
      // Update HyperAV parameters to match the transition with more extreme settings
      this.state.hyperAVInstance.updateOptions({
        pattern: 'tesseract_fold',
        color1: fromColors.primary,
        color2: toColors.primary,
        speed: 0.2,      // Double the speed for more dramatic effect
        opacity: 0.95,   // Higher opacity for more visible effect
        complexity: 2.0, // Increased complexity for more dimensional detail
        intensity: 0.9,  // Higher intensity for more dramatic visual impact
        distortion: 0.5, // Add reality distortion effect
        shaderMode: 'hyperdimensional_rift' // Use our custom shader
      });
    }
    
    // Start portal animation
    this._animatePortalTransition(fromColors, toColors, () => {
      // Transition complete
      this.state.isTransitioning = false;
      
      // Hide the portal overlay
      overlay.style.opacity = '0';
      
      // Play complete sound
      if (this.config.enableAudio) {
        this._playPortalSound('complete');
      }
      
      // Reset HyperAV if used, but maintain some enhanced effects
      if (this.state.hyperAVInstance && this.config.useHyperAV) {
        this.state.hyperAVInstance.updateOptions({
          pattern: 'tesseract',
          speed: 0.05,           // Slightly faster than original
          opacity: 0.5,          // More visible
          complexity: 1.2,       // More complex geometry
          intensity: 0.6,        // Higher intensity
          distortion: 0.2,       // Keep slight reality distortion
          shaderMode: 'standard' // Return to standard shader
        });
      }
      
      if (this.config.debugMode) {
        console.log(`Portal transition complete: ${fromId} → ${toId}`);
      }
    });
    
    if (this.config.debugMode) {
      console.log(`Portal transition started: ${fromId} → ${toId}`);
    }
  }

  /**
   * Animate the portal transition effect
   */
  _animatePortalTransition(fromColors, toColors, onComplete) {
    const canvas = this.state.portalCanvas;
    const ctx = this.state.portalContext;
    const startTime = performance.now();
    const duration = this.config.transitionDuration;
    const intensity = this.config.portalIntensity;
    
    // Create portal animation effect
    const animate = (timestamp) => {
      // Calculate progress (0 to 1)
      const progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw portal effect based on progress
      this._drawPortalEffect(ctx, canvas.width, canvas.height, fromColors, toColors, progress, intensity);
      
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
   * Draw enhanced portal effect on canvas with more extreme reality-distortion effects
   */
  _drawPortalEffect(ctx, width, height, fromColors, toColors, progress, intensity) {
    // Center of portal with slight instability
    const instability = Math.sin(progress * Math.PI * 8) * 0.1;
    const centerX = width / 2 + Math.sin(progress * 12) * width * 0.05 * instability;
    const centerY = height / 2 + Math.cos(progress * 15) * height * 0.05 * instability;

    // Enhanced portal size progression for more dramatic effect
    let portalSize;
    if (progress < 0.4) {
      // Growing phase with non-linear acceleration
      portalSize = Math.pow(progress / 0.4, 1.5); // More aggressive growth
    } else if (progress < 0.6) {
      // Chaotic fluctuation phase at peak transition
      const fluctuation = Math.sin(progress * 50) * 0.15; // Rapid size fluctuations
      portalSize = 1 + fluctuation;
    } else {
      // Shrinking phase with lingering tendrils
      portalSize = 1 - Math.pow((progress - 0.6) / 0.4, 0.8); // Slower initial collapse
    }

    // Scale portal size by intensity and screen dimensions - larger than before
    const maxSize = Math.max(width, height) * 1.5;
    const size = portalSize * maxSize * intensity;

    // Add dimensional pulsing that distorts the entire portal
    const dimensionalPulse = Math.sin(progress * Math.PI * 4) * Math.sin(progress * Math.PI * 7);
    const pulseFactor = 1 + dimensionalPulse * 0.2;

    // Enhanced warp factor with more extreme distortion
    const warpFactor = Math.sin(progress * Math.PI) * intensity * 1.5;

    // Draw reality fractures before the main portal
    const maxFractures = 5;
    const activeFractures = Math.floor(progress * maxFractures) + 1;

    for (let i = 0; i < activeFractures; i++) {
      // Calculate fracture angle and distance from center
      const fracAngle = (i / activeFractures) * Math.PI * 2 + progress * Math.PI;
      const fracDist = size * 0.7 * Math.sin(progress * Math.PI * (2 + i * 0.5));

      // Fracture position
      const fracX = centerX + Math.cos(fracAngle) * fracDist;
      const fracY = centerY + Math.sin(fracAngle) * fracDist;

      // Fracture size and angle
      const fracSize = size * 0.2 * (0.5 + Math.sin(progress * Math.PI * 3 + i) * 0.5);
      const fracRotation = progress * Math.PI * (1 + i * 0.2);

      // Draw the reality fracture
      ctx.save();
      ctx.translate(fracX, fracY);
      ctx.rotate(fracRotation);

      // Create gradient for fracture
      const fracGradient = ctx.createRadialGradient(
        0, 0, fracSize * 0.2,
        0, 0, fracSize
      );

      // Interpolate colors with more extreme color shifts
      const fracColor1 = this._interpolateColor(fromColors.primary, toColors.secondary, progress);
      const fracColor2 = this._interpolateColor(fromColors.secondary, toColors.primary, 1 - progress);

      fracGradient.addColorStop(0, `${fracColor1}80`);
      fracGradient.addColorStop(0.7, `${fracColor2}40`);
      fracGradient.addColorStop(1, `${fracColor1}00`);

      // Draw fracture
      ctx.fillStyle = fracGradient;
      ctx.beginPath();

      // Non-circular fractures that tear in jagged patterns
      ctx.moveTo(0, 0);
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        const jaggedness = 0.3 + Math.sin(a * 5 + progress * 10) * 0.2;
        const rad = fracSize * (1 + jaggedness);
        const x = Math.cos(a) * rad;
        const y = Math.sin(a) * rad;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();

      // Add energy tendrils radiating from fractures
      ctx.strokeStyle = fracColor2;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      for (let t = 0; t < 8; t++) {
        const tendrilAngle = (t / 8) * Math.PI * 2 + progress * Math.PI * 3;
        const tendrilLength = fracSize * (1.5 + Math.sin(progress * Math.PI * 5 + t) * 0.5);

        ctx.beginPath();
        ctx.moveTo(0, 0);

        // Bezier curves for more organic-looking energy tendrils
        const ctrl1X = Math.cos(tendrilAngle + 0.2) * tendrilLength * 0.5;
        const ctrl1Y = Math.sin(tendrilAngle + 0.2) * tendrilLength * 0.5;
        const ctrl2X = Math.cos(tendrilAngle - 0.2) * tendrilLength * 0.8;
        const ctrl2Y = Math.sin(tendrilAngle - 0.2) * tendrilLength * 0.8;
        const endX = Math.cos(tendrilAngle) * tendrilLength;
        const endY = Math.sin(tendrilAngle) * tendrilLength;

        ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Main portal with distorted geometry
    ctx.save();

    // Apply non-uniform scaling for dimensional distortion
    ctx.translate(centerX, centerY);
    ctx.scale(pulseFactor, pulseFactor * (1 + instability * 0.5));
    ctx.rotate(progress * Math.PI * 0.5); // Subtle rotation

    // Create multiple layered portal rings with increased complexity
    for (let ring = 0; ring < 3; ring++) {
      const ringSize = size * (1 - ring * 0.15); // Decreasing ring sizes
      const ringOffset = Math.sin(progress * Math.PI * (4 + ring)) * size * 0.05;
      const xOffset = ringOffset * Math.cos(progress * 8);
      const yOffset = ringOffset * Math.sin(progress * 7);

      // Create gradient for portal ring with more complex color interactions
      const ringGradient = ctx.createRadialGradient(
        xOffset, yOffset, ringSize * 0.7,
        xOffset, yOffset, ringSize
      );

      // Interpolate colors based on progress with more extreme shifts
      const primaryColor = this._interpolateColor(fromColors.primary, toColors.primary, progress);
      const secondaryColor = this._interpolateColor(fromColors.secondary, toColors.secondary, progress);

      // Add tertiary color for more complex visual effect
      const tertiaryColor = this._shiftHue(
        this._interpolateColor(fromColors.primary, toColors.primary, progress),
        60
      );

      // Build gradient stops with more complexity
      ringGradient.addColorStop(0, `${ring === 0 ? tertiaryColor : primaryColor}${ring === 0 ? '30' : '00'}`);
      ringGradient.addColorStop(0.7, `${primaryColor}${80 - ring * 20}`);
      ringGradient.addColorStop(0.9, `${secondaryColor}${Math.floor((0.8 - ring * 0.2) * 255).toString(16).padStart(2, '0')}`);
      ringGradient.addColorStop(1, `${tertiaryColor}00`);

      // Draw portal ring with distortion
      ctx.fillStyle = ringGradient;
      ctx.beginPath();

      // Non-circular portal with time-varying distortion
      const segments = 64; // More segments for smoother appearance
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;

        // Calculate distortion for this segment
        const angleDistortion = Math.sin(angle * 5 + progress * Math.PI * 6) * warpFactor * 0.2;
        const radiusDistortion = Math.sin(angle * 3 + progress * Math.PI * 8) * warpFactor * 0.15;

        // Apply distortion to radius
        const radius = ringSize * (1 + radiusDistortion) * (1 + Math.sin(angle * 2) * instability);

        // Calculate point with distortion
        const x = Math.cos(angle + angleDistortion) * radius + xOffset;
        const y = Math.sin(angle + angleDistortion) * radius + yOffset;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.closePath();
      ctx.fill();
    }

    // Draw radial lines with increased complexity and animation
    const numLines = 36; // More lines for richer effect
    const lineLength = size * 0.9;

    ctx.save();
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.7;

    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;

      // Create more complex distortion patterns
      const timeOffset = progress * 10 + i * 0.2;
      const distortion = Math.sin(timeOffset) * Math.cos(timeOffset * 0.7) * warpFactor * 25;
      const secondaryDistortion = Math.cos(timeOffset * 1.5) * warpFactor * 15;

      // Calculate colors with more extreme color shifts
      const lineProgress = (i / numLines + progress) % 1.0;
      const lineColor = this._interpolateColor(
        this._interpolateColor(fromColors.primary, fromColors.secondary, lineProgress),
        this._interpolateColor(toColors.primary, toColors.secondary, lineProgress),
        progress
      );

      ctx.strokeStyle = lineColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);

      // Bezier curves for more organic energy tendrils
      const ctrl1Dist = lineLength * (0.33 + Math.sin(timeOffset * 0.8) * 0.1);
      const ctrl2Dist = lineLength * (0.66 + Math.cos(timeOffset * 0.9) * 0.1);
      const endDist = lineLength + distortion;

      const ctrl1Angle = angle + Math.sin(timeOffset) * 0.2;
      const ctrl2Angle = angle - Math.cos(timeOffset * 0.7) * 0.2;

      const ctrl1X = Math.cos(ctrl1Angle) * ctrl1Dist;
      const ctrl1Y = Math.sin(ctrl1Angle) * ctrl1Dist;

      const ctrl2X = Math.cos(ctrl2Angle) * ctrl2Dist;
      const ctrl2Y = Math.sin(ctrl2Angle) * ctrl2Dist;

      const endX = Math.cos(angle) * endDist + Math.cos(angle + Math.PI/2) * secondaryDistortion;
      const endY = Math.sin(angle) * endDist + Math.sin(angle + Math.PI/2) * secondaryDistortion;

      ctx.bezierCurveTo(ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, endX, endY);
      ctx.stroke();
    }
    ctx.restore();

    // Add central dimensional vortex effect
    ctx.save();
    const vortexGradient = ctx.createRadialGradient(
      0, 0, 0,
      0, 0, size * 0.4
    );

    // Create more vibrant center with tertiary color
    const vortexColor1 = this._shiftHue(this._interpolateColor(fromColors.secondary, toColors.primary, progress), 30);
    const vortexColor2 = this._shiftHue(this._interpolateColor(fromColors.primary, toColors.secondary, progress), -30);

    vortexGradient.addColorStop(0, `${vortexColor1}cc`);
    vortexGradient.addColorStop(0.5, `${vortexColor2}80`);
    vortexGradient.addColorStop(0.8, `${vortexColor1}40`);
    vortexGradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = vortexGradient;
    ctx.globalAlpha = 0.9;

    // Draw vortex pattern with spinning segments
    ctx.beginPath();
    for (let radius = 0; radius < size * 0.4; radius += 4) {
      const spinFactor = 30 * warpFactor * (1 - radius / (size * 0.4));
      const radiusProgress = radius / (size * 0.4);
      const points = 12;

      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 + (progress * spinFactor) + radiusProgress * Math.PI * 4;
        const radiusVariation = 1 + Math.sin(angle * 3 + progress * 10) * 0.1;
        const ptX = Math.cos(angle) * radius * radiusVariation;
        const ptY = Math.sin(angle) * radius * radiusVariation;

        if (i === 0 && radius === 0) {
          ctx.moveTo(ptX, ptY);
        } else {
          ctx.lineTo(ptX, ptY);
        }
      }
    }
    ctx.fill();
    ctx.restore();

    // Add chromatic aberration to entire canvas at peak transition
    if (progress > 0.3 && progress < 0.7) {
      const aberrationIntensity = Math.sin((progress - 0.3) / 0.4 * Math.PI) * intensity;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      // Red channel shift
      ctx.fillStyle = `rgba(255, 0, 0, ${aberrationIntensity * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(
        0, 0,
        size * 0.9, size * 0.9,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      // Blue channel shift
      ctx.fillStyle = `rgba(0, 0, 255, ${aberrationIntensity * 0.3})`;
      ctx.beginPath();
      ctx.ellipse(
        0, 0,
        size * 0.9, size * 0.9,
        0, 0, Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    // Restore context for main canvas
    ctx.restore();

    // Add enhanced glow around entire canvas that expands beyond portal
    const glowIntensity = Math.sin(progress * Math.PI) * 0.9;
    if (glowIntensity > 0.1) {
      ctx.save();

      // Create a glow gradient that extends beyond the canvas
      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, size * 0.5,
        centerX, centerY, Math.max(width, height)
      );

      const glowColor = this._interpolateColor(fromColors.primary, toColors.primary, progress);
      const glowAlpha = Math.floor(glowIntensity * 120).toString(16).padStart(2, '0');

      glowGradient.addColorStop(0, `rgba(0,0,0,0)`);
      glowGradient.addColorStop(0.5, `${glowColor}${glowAlpha}`);
      glowGradient.addColorStop(1, `rgba(0,0,0,0)`);

      ctx.fillStyle = glowGradient;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(0, 0, width, height);

      ctx.restore();
    }
  }

  /**
   * Shift the hue of a color for more dramatic color effects
   */
  _shiftHue(hexColor, degrees) {
    // Convert hex to rgb
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Find max and min values to determine luminance
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    // Calculate luminance and saturation
    const lum = (max + min) / 2;
    let sat = 0;

    if (max !== min) {
      sat = lum <= 0.5 ? (max - min) / (max + min) : (max - min) / (2 - max - min);
    }

    // Calculate hue
    let hue = 0;
    if (max !== min) {
      if (max === r) {
        hue = ((g - b) / (max - min)) % 6;
      } else if (max === g) {
        hue = (b - r) / (max - min) + 2;
      } else {
        hue = (r - g) / (max - min) + 4;
      }

      hue *= 60;
      if (hue < 0) hue += 360;
    }

    // Shift hue by degrees
    hue = (hue + degrees) % 360;
    if (hue < 0) hue += 360;

    // Convert back to RGB using HSL to RGB conversion
    const c = (1 - Math.abs(2 * lum - 1)) * sat;
    const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = lum - c / 2;

    let r1, g1, b1;

    if (hue < 60) {
      [r1, g1, b1] = [c, x, 0];
    } else if (hue < 120) {
      [r1, g1, b1] = [x, c, 0];
    } else if (hue < 180) {
      [r1, g1, b1] = [0, c, x];
    } else if (hue < 240) {
      [r1, g1, b1] = [0, x, c];
    } else if (hue < 300) {
      [r1, g1, b1] = [x, 0, c];
    } else {
      [r1, g1, b1] = [c, 0, x];
    }

    // Convert back to 0-255 range and then to hex
    const rHex = Math.round((r1 + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g1 + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b1 + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  }

  /**
   * Interpolate between two colors based on progress
   */
  _interpolateColor(color1, color2, progress) {
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
  transitionToSection(sectionId) {
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
      this._triggerPortalTransition(this.state.previousSection, section);
    }
    
    // Scroll to the section (will be smooth due to CSS)
    section.scrollIntoView();
    
    return true;
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
    
    console.log('Portal Transitions: Destroyed');
  }
}

// Export CSS styles for portal sections
export const portalStyles = `
  /* Portal section styles */
  .portal-section {
    scroll-snap-align: start;
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    transition: transform 0.5s ease;
    padding: 4rem 2rem 2rem 2rem;
    box-sizing: border-box;
    background-color: rgba(0, 0, 60, 0.4);
  }
  
  /* Ensure each section has proper spacing */
  .portal-section > * {
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
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
  
  /* Section hover effects */
  .portal-section:hover .portal-border {
    box-shadow: inset 0 0 50px var(--accent2);
    animation: portalWarp 3s infinite ease-in-out;
  }
`;