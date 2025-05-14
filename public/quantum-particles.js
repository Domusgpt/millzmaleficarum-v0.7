/**
 * Quantum Particles System - v0.6
 * Creates advanced quantum distortion and reality-fracturing effects
 * For MillzMaleficarum Codex v0.6
 */

class QuantumParticles {
  constructor(options = {}) {
    this.options = {
      containerSelector: 'body',
      quantumCount: 75,
      maxSize: 40,
      minSize: 5,
      primaryColors: ['#ff00aa', '#00eeff', '#9500ff', '#00ff95'],
      secondaryColors: ['#ff33cc', '#33ffff', '#8a2be2', '#33ff99'],
      depthRange: 500,
      distortionRadius: 250,
      distortionIntensity: 0.8,
      gravitationalField: true,
      quantumFluctuation: true,
      fluctuationAmplitude: 20,
      fluctuationFrequency: 0.05,
      evolutionSpeed: 0.2,
      portalConnectionStrength: 0.5,
      realityFractureProbability: 0.01,
      glitchDuration: 500,
      dimensionalStability: 0.7,
      syncWithAudio: true,
      // v0.7 performance enhancements
      performanceMode: 'auto',  // 'high', 'medium', 'low', or 'auto'
      useOffscreenRendering: true, // Use OffscreenCanvas when available
      batchedUpdates: true, // Use batched updates for better performance
      cullingEnabled: true, // Skip rendering particles outside view
      adaptiveParticleCount: true, // Adjust particle count based on performance
      maxFractureParticles: 200, // Maximum particles during fracture events
      canvasQuality: 1.0, // Canvas quality multiplier (0.5 - 1.0)
      ...options
    };
    
    this.quantumParticles = [];
    this.container = null;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    this.isActive = false;
    this.time = 0;
    this.mousePosition = { x: -1000, y: -1000, active: false };
    this.fractures = [];
    this.realityState = { stable: true, fluctuationLevel: 0, dimensionalShift: 0 };
    this.audioData = null;
    
    // Initialize if auto-start is enabled
    this.init();
  }
  
  init() {
    console.log('QuantumParticles: Initializing...');
    
    // Get container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error('QuantumParticles: Container not found');
      return;
    }
    
    // Auto-detect performance mode if set to auto
    if (this.options.performanceMode === 'auto') {
      this._detectPerformance();
    }
    
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'quantum-particles-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      opacity: 0.8;
    `;
    
    this.container.appendChild(this.canvas);
    
    // Try to use OffscreenCanvas for better performance if supported and enabled
    if (this.options.useOffscreenRendering && window.OffscreenCanvas && this.options.performanceMode === 'high') {
      try {
        this.offscreenCanvas = new OffscreenCanvas(window.innerWidth, window.innerHeight);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.ctx = this.canvas.getContext('2d');
        this.useOffscreen = true;
        console.log('QuantumParticles: Using OffscreenCanvas for rendering');
      } catch (e) {
        console.log('QuantumParticles: OffscreenCanvas not supported, falling back to standard rendering');
        this.ctx = this.canvas.getContext('2d');
        this.useOffscreen = false;
      }
    } else {
      // Standard rendering
      this.ctx = this.canvas.getContext('2d');
      this.useOffscreen = false;
    }
    
    // Set canvas size (with quality adjustment)
    this.resizeCanvas();
    
    // Create performance monitoring
    this.performanceStats = {
      frameTime: [],
      frameTimeAvg: 0,
      lastFrameTime: 0,
      framesProcessed: 0,
      lastParticleAdjustment: 0,
      throttled: false
    };
    
    // Create particles
    this.createQuantumParticles();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start animation
    this.start();
    
    // Schedule reality fractures
    this.scheduleRealityFractures();
    
    console.log(`QuantumParticles: Initialized with ${this.quantumParticles.length} particles in ${this.options.performanceMode} mode`);
  }
  
  createQuantumParticles() {
    // Create quantum particles
    for (let i = 0; i < this.options.quantumCount; i++) {
      const particle = {
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        z: Math.random() * this.options.depthRange - (this.options.depthRange / 2),
        size: Math.random() * (this.options.maxSize - this.options.minSize) + this.options.minSize,
        color: this.options.primaryColors[Math.floor(Math.random() * this.options.primaryColors.length)],
        secondaryColor: this.options.secondaryColors[Math.floor(Math.random() * this.options.secondaryColors.length)],
        speedX: (Math.random() - 0.5) * this.options.evolutionSpeed,
        speedY: (Math.random() - 0.5) * this.options.evolutionSpeed,
        speedZ: (Math.random() - 0.5) * this.options.evolutionSpeed * 0.5,
        phaseShift: Math.random() * Math.PI * 2,
        quantumState: Math.random(),
        entangledWith: null,
        distortionFactor: Math.random() * 0.5 + 0.5,
        lastRender: { x: 0, y: 0, size: 0, opacity: 0 }
      };
      
      this.quantumParticles.push(particle);
    }
    
    // Create quantum entanglement between particles
    for (let i = 0; i < this.quantumParticles.length; i++) {
      if (Math.random() > 0.5 && !this.quantumParticles[i].entangledWith) {
        const entangleWith = Math.floor(Math.random() * this.quantumParticles.length);
        if (i !== entangleWith && !this.quantumParticles[entangleWith].entangledWith) {
          this.quantumParticles[i].entangledWith = entangleWith;
          this.quantumParticles[entangleWith].entangledWith = i;
        }
      }
    }
  }
  
  setupEventListeners() {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
      this.mousePosition.active = true;
    });
    
    // Reset mouse position when mouse leaves
    document.addEventListener('mouseleave', () => {
      this.mousePosition.active = false;
    });
    
    // Handle window resize
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  
  resizeCanvas() {
    // Set canvas dimensions with quality adjustment
    const quality = this.options.canvasQuality;
    const width = Math.floor(window.innerWidth * quality);
    const height = Math.floor(window.innerHeight * quality);
    
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Maintain visual size at 100% using CSS
    if (quality < 1.0) {
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
    }
    
    // Also resize offscreen canvas if used
    if (this.useOffscreen && this.offscreenCanvas) {
      this.offscreenCanvas.width = width;
      this.offscreenCanvas.height = height;
    }
    
    // Reset canvas opacity based on performance mode
    this.canvas.style.opacity = this.options.performanceMode === 'low' ? '0.6' : '0.8';
  }
  
  /**
   * Detect performance capabilities and adjust settings
   */
  _detectPerformance() {
    // Start with a base score
    let score = 5;
    
    // Check for high-end indicators
    if (window.navigator.hardwareConcurrency) {
      // More CPU cores = better performance
      score += Math.min(window.navigator.hardwareConcurrency / 2, 3);
    }
    
    // Check memory if available (Chrome only)
    if (window.navigator.deviceMemory) {
      score += Math.min(window.navigator.deviceMemory / 2, 2);
    }
    
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      score -= 2; // Mobile devices typically have lower performance
    }
    
    // Detect if user has reduced motion preferences
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      score -= 2;
    }
    
    // Set performance mode based on score
    if (score >= 7) {
      this.options.performanceMode = 'high';
      this.options.canvasQuality = 1.0;
      this.options.quantumCount = Math.min(this.options.quantumCount, 75);
    } else if (score >= 4) {
      this.options.performanceMode = 'medium';
      this.options.canvasQuality = 0.8;
      this.options.quantumCount = Math.min(this.options.quantumCount, 50);
      // Reduce effects
      this.options.fluctuationAmplitude *= 0.8;
      this.options.realityFractureProbability *= 0.7;
    } else {
      this.options.performanceMode = 'low';
      this.options.canvasQuality = 0.6;
      this.options.quantumCount = Math.min(this.options.quantumCount, 30);
      // Significantly reduce effects
      this.options.fluctuationAmplitude *= 0.6;
      this.options.realityFractureProbability *= 0.5;
      this.options.maxFractureParticles = 100;
    }
    
    console.log(`QuantumParticles: Detected performance score ${score}, setting mode to ${this.options.performanceMode}`);
  }
  
  scheduleRealityFractures() {
    // Randomly schedule reality fractures
    const scheduleNext = () => {
      const delay = 10000 + Math.random() * 30000; // 10-40 seconds
      setTimeout(() => {
        this.createRealityFracture();
        scheduleNext();
      }, delay);
    };
    
    scheduleNext();
  }
  
  createRealityFracture() {
    // Only create fracture if reality is stable
    if (!this.realityState.stable) return;
    
    const fracture = {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      radius: 10,
      maxRadius: 50 + Math.random() * 150,
      growthRate: 1 + Math.random() * 2,
      decayRate: 0.95 + Math.random() * 0.04,
      color: this.options.primaryColors[Math.floor(Math.random() * this.options.primaryColors.length)],
      secondaryColor: this.options.secondaryColors[Math.floor(Math.random() * this.options.secondaryColors.length)],
      phase: 'growing', // growing, stable, decaying
      stabilityDuration: 50 + Math.random() * 100,
      currentStabilityTime: 0,
      distortionIntensity: 0.5 + Math.random() * 0.5,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
      rotation: 0
    };
    
    this.fractures.push(fracture);
    
    // Trigger reality instability
    this.realityState.stable = false;
    this.realityState.fluctuationLevel = fracture.distortionIntensity;
    
    // Add glitch effect to the entire page
    document.body.classList.add('reality-distortion-active');
    setTimeout(() => {
      document.body.classList.remove('reality-distortion-active');
    }, this.options.glitchDuration);
    
    // Create a dimensional shift
    this.realityState.dimensionalShift = (Math.random() - 0.5) * 0.3;
    
    // Create a cool sound effect if Web Audio is available
    this.createFractureSound();
    
    // Schedule reality stabilization
    setTimeout(() => {
      this.realityState.stable = true;
      this.realityState.fluctuationLevel = 0;
      this.realityState.dimensionalShift = 0;
    }, 3000 + Math.random() * 2000); // 3-5 seconds of instability
  }
  
  // Create lazy audio context that initializes on first user interaction
  getAudioContext() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // If context is suspended (due to browser autoplay policy), we'll resume it
        // on the first user interaction
        if (this.audioContext.state === 'suspended') {
          const resumeAudio = () => {
            this.audioContext.resume();
            
            // Remove event listeners once audio is resumed
            ['mousedown', 'touchstart', 'keydown'].forEach(event => {
              document.removeEventListener(event, resumeAudio);
            });
            
            console.log('QuantumParticles: AudioContext resumed after user interaction');
          };
          
          // Add event listeners for common user interactions
          ['mousedown', 'touchstart', 'keydown'].forEach(event => {
            document.addEventListener(event, resumeAudio);
          });
          
          console.log('QuantumParticles: AudioContext created but suspended - waiting for user interaction');
        }
      } catch (e) {
        console.warn('QuantumParticles: Failed to create AudioContext', e);
        return null;
      }
    }
    
    return this.audioContext;
  }
  
  createFractureSound() {
    // Get audio context (may be null if not initialized yet)
    const audioCtx = this.getAudioContext();
    if (!audioCtx) return;
    
    // Check if context is running
    if (audioCtx.state !== 'running') {
      console.log('QuantumParticles: AudioContext not running yet - sound will be enabled after user interaction');
      return;
    }
    
    try {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 1.5);
      
      gainNode.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
      console.warn('QuantumParticles: Audio creation failed', e);
    }
  }
  
  updateQuantumParticles() {
    this.time += this.options.fluctuationFrequency;
    
    this.quantumParticles.forEach((particle, index) => {
      // Apply quantum fluctuation if enabled
      if (this.options.quantumFluctuation) {
        // Fluctuate based on sine wave with particle's unique phase shift
        const fluctX = Math.sin(this.time + particle.phaseShift) * this.options.fluctuationAmplitude;
        const fluctY = Math.cos(this.time + particle.phaseShift) * this.options.fluctuationAmplitude;
        
        // Apply fluctuation to position
        particle.x += fluctX * 0.02;
        particle.y += fluctY * 0.02;
      }
      
      // Standard movement
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.z += particle.speedZ;
      
      // Apply gravitational pull toward center if enabled
      if (this.options.gravitationalField) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Apply gravitational force (inverse square law)
        if (distance > 10) {
          const force = 0.1 / distance;
          particle.speedX += dx * force * 0.01;
          particle.speedY += dy * force * 0.01;
        }
      }
      
      // Apply mouse interaction if active
      if (this.mousePosition.active) {
        const dx = particle.x - this.mousePosition.x;
        const dy = particle.y - this.mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.options.distortionRadius) {
          // Calculate influence (closer = stronger)
          const influence = 1 - (distance / this.options.distortionRadius);
          
          // Apply distortion force
          const distortionForce = influence * this.options.distortionIntensity * particle.distortionFactor;
          particle.speedX -= dx * distortionForce * 0.01;
          particle.speedY -= dy * distortionForce * 0.01;
          
          // Increase quantum state fluctuation
          particle.quantumState = (particle.quantumState + distortionForce * 0.1) % 1;
        }
      }
      
      // Apply influence from reality fractures
      this.fractures.forEach(fracture => {
        const dx = particle.x - fracture.x;
        const dy = particle.y - fracture.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < fracture.radius * 2) {
          // Calculate influence
          const influence = 1 - (distance / (fracture.radius * 2));
          
          // Apply fracture force - swirl around the fracture
          const angle = Math.atan2(dy, dx);
          const swirl = fracture.distortionIntensity * influence;
          
          particle.speedX += Math.sin(angle) * swirl * 0.3;
          particle.speedY -= Math.cos(angle) * swirl * 0.3;
          
          // Increase quantum state fluctuation
          particle.quantumState = (particle.quantumState + influence * 0.2) % 1;
        }
      });
      
      // Apply reality state distortions
      if (!this.realityState.stable) {
        particle.speedX += (Math.random() - 0.5) * this.realityState.fluctuationLevel * 0.1;
        particle.speedY += (Math.random() - 0.5) * this.realityState.fluctuationLevel * 0.1;
        particle.z += (Math.random() - 0.5) * this.realityState.fluctuationLevel * 5;
      }
      
      // Apply quantum entanglement effects
      if (particle.entangledWith !== null) {
        const entangled = this.quantumParticles[particle.entangledWith];
        
        // Synchronize quantum states with slight delay
        entangled.quantumState = (particle.quantumState + 0.5) % 1;
        
        // Create subtle connection between particles
        if (Math.random() < this.options.portalConnectionStrength) {
          // Slightly pull entangled particles toward each other
          const dx = entangled.x - particle.x;
          const dy = entangled.y - particle.y;
          const dz = entangled.z - particle.z;
          
          particle.speedX += dx * 0.0001;
          particle.speedY += dy * 0.0001;
          particle.speedZ += dz * 0.0001;
        }
      }
      
      // Apply dimensional stability constraints
      const stability = this.options.dimensionalStability;
      particle.speedX *= stability;
      particle.speedY *= stability;
      particle.speedZ *= stability;
      
      // Sync with audio if enabled and available
      if (this.options.syncWithAudio && this.audioData && window.v6Enhancements) {
        // Get frequency bin for this particle
        const bin = Math.floor(index / this.quantumParticles.length * this.audioData.length);
        if (bin < this.audioData.length) {
          // Normalize value (0-1)
          const audioValue = this.audioData[bin] / 255;
          
          // Apply audio influence
          const audioPush = (audioValue - 0.5) * 2; // -1 to 1
          particle.size += audioPush * 3;
          particle.speedX += audioPush * 0.1;
          particle.speedY += audioPush * 0.1;
        }
      }
      
      // Boundary wrapping - wrap particles around the screen edges
      if (particle.x < -particle.size) particle.x = this.canvas.width + particle.size;
      if (particle.x > this.canvas.width + particle.size) particle.x = -particle.size;
      if (particle.y < -particle.size) particle.y = this.canvas.height + particle.size;
      if (particle.y > this.canvas.height + particle.size) particle.y = -particle.size;
      
      // Depth constraints
      if (Math.abs(particle.z) > this.options.depthRange / 2) {
        particle.speedZ *= -0.5; // Bounce back with reduced speed
        particle.z = Math.sign(particle.z) * this.options.depthRange / 2;
      }
      
      // Ensure particle size stays within bounds
      particle.size = Math.max(this.options.minSize, Math.min(this.options.maxSize, particle.size));
    });
  }
  
  updateFractures() {
    // Update all reality fractures
    for (let i = this.fractures.length - 1; i >= 0; i--) {
      const fracture = this.fractures[i];
      
      fracture.rotation += fracture.rotationSpeed;
      
      switch(fracture.phase) {
        case 'growing':
          fracture.radius += fracture.growthRate;
          if (fracture.radius >= fracture.maxRadius) {
            fracture.phase = 'stable';
          }
          break;
          
        case 'stable':
          fracture.currentStabilityTime++;
          if (fracture.currentStabilityTime >= fracture.stabilityDuration) {
            fracture.phase = 'decaying';
          }
          break;
          
        case 'decaying':
          fracture.radius *= fracture.decayRate;
          if (fracture.radius < 1) {
            // Remove fracture when it's too small
            this.fractures.splice(i, 1);
          }
          break;
      }
    }
    
    // Randomly create new fractures
    if (this.realityState.stable && Math.random() < this.options.realityFractureProbability) {
      this.createRealityFracture();
    }
  }
  
  renderQuantumParticles() {
    // Get context based on rendering mode
    const renderCtx = this.useOffscreen ? this.offscreenCtx : this.ctx;
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    
    // Clear canvas
    renderCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Draw reality fractures
    this.renderFractures(renderCtx);
    
    // Performance optimization: Only sort if needed
    // For low performance mode, skip sorting every other frame
    const skipSorting = this.options.performanceMode === 'low' && (this.performanceStats.framesProcessed % 2 === 1);
    
    // Sort particles by z-depth for proper rendering (or use cached sort)
    const sortedParticles = skipSorting ? this.quantumParticles : 
                          [...this.quantumParticles].sort((a, b) => a.z - b.z);
    
    // Visible area with margin for culling
    const visibleMargin = 100; // px margin around screen
    const visibleMinX = -visibleMargin;
    const visibleMaxX = canvasWidth + visibleMargin;
    const visibleMinY = -visibleMargin;
    const visibleMaxY = canvasHeight + visibleMargin;
    
    // Draw particles
    for (let i = 0; i < sortedParticles.length; i++) {
      const particle = sortedParticles[i];
      
      // Calculate perspective scale based on z-position
      const scale = this.calculatePerspectiveScale(particle.z);
      const scaledSize = particle.size * scale;
      
      // Calculate position with perspective
      const perspectiveX = canvasWidth / 2 + (particle.x - canvasWidth / 2) * scale;
      const perspectiveY = canvasHeight / 2 + (particle.y - canvasHeight / 2) * scale;
      
      // Performance optimization: Skip particles outside visible area if culling is enabled
      if (this.options.cullingEnabled && (
          perspectiveX + scaledSize * 2 < visibleMinX ||
          perspectiveX - scaledSize * 2 > visibleMaxX ||
          perspectiveY + scaledSize * 2 < visibleMinY ||
          perspectiveY - scaledSize * 2 > visibleMaxY
      )) {
        continue;
      }
      
      // Calculate opacity based on z position (further = more transparent)
      const depth = (particle.z + this.options.depthRange / 2) / this.options.depthRange;
      const opacity = 0.2 + depth * 0.8;
      
      // Store last render properties for quantum effects
      particle.lastRender = {
        x: perspectiveX,
        y: perspectiveY,
        size: scaledSize,
        opacity
      };
      
      // Performance optimization: Use simpler rendering for low performance mode
      if (this.options.performanceMode === 'low') {
        renderCtx.globalAlpha = opacity;
        // Skip gradient for low performance mode
        const color = this.calculateQuantumColor(particle);
        renderCtx.fillStyle = color;
        renderCtx.beginPath();
        renderCtx.arc(perspectiveX, perspectiveY, scaledSize * 1.5, 0, Math.PI * 2);
        renderCtx.fill();
      } else {
        // Draw glow effect (quantum blur) with gradient
        const gradient = renderCtx.createRadialGradient(
          perspectiveX, perspectiveY, 0,
          perspectiveX, perspectiveY, scaledSize * 2
        );
        
        // Calculate color based on quantum state
        const color = this.calculateQuantumColor(particle);
        const secondaryColor = this.calculateSecondaryQuantumColor(particle);
        
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, this.adjustColorOpacity(secondaryColor, 0.5));
        gradient.addColorStop(1, this.adjustColorOpacity(color, 0));
        
        renderCtx.globalAlpha = opacity;
        renderCtx.fillStyle = gradient;
        renderCtx.beginPath();
        renderCtx.arc(perspectiveX, perspectiveY, scaledSize * 2, 0, Math.PI * 2);
        renderCtx.fill();
      }
      
      // Draw entanglement connections (only in medium/high modes)
      if (particle.entangledWith !== null && this.options.performanceMode !== 'low') {
        const entangled = this.quantumParticles[particle.entangledWith];
        this.drawEntanglementConnection(particle, entangled, renderCtx);
      }
    }
    
    // Reset global alpha
    renderCtx.globalAlpha = 1;
    
    // If using offscreen canvas, copy to visible canvas
    if (this.useOffscreen) {
      this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      this.ctx.drawImage(this.offscreenCanvas, 0, 0);
    }
  }
  
  renderFractures(renderCtx) {
    // Use provided context or default to main ctx
    const ctx = renderCtx || this.ctx;
    
    // Get fracture rendering detail based on performance mode
    const fractureLOD = this.options.performanceMode === 'high' ? 'high' : 
                       this.options.performanceMode === 'medium' ? 'medium' : 'low';
    
    this.fractures.forEach(fracture => {
      // Create reality fracture effect using gradients
      const gradient = ctx.createRadialGradient(
        fracture.x, fracture.y, 0,
        fracture.x, fracture.y, fracture.radius
      );
      
      gradient.addColorStop(0, this.adjustColorOpacity(fracture.color, 0.8));
      gradient.addColorStop(0.5, this.adjustColorOpacity(fracture.secondaryColor, 0.5));
      gradient.addColorStop(1, this.adjustColorOpacity(fracture.color, 0));
      
      // Draw main fracture glow
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(fracture.x, fracture.y, fracture.radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw fracture shockwaves (skip in low performance mode)
      if (fractureLOD !== 'low') {
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = fracture.secondaryColor;
        ctx.lineWidth = fractureLOD === 'high' ? 2 : 1;
        
        // Number of rings and angular step based on LOD
        const ringCount = fractureLOD === 'high' ? 3 : 2;
        const angleStep = fractureLOD === 'high' ? 0.1 : 0.2;
        
        // Draw multiple distortion rings
        for (let i = 0; i < ringCount; i++) {
          const ringRadius = fracture.radius * (0.6 + i * 0.2);
          const wobble = 5 * Math.sin(this.time * 5 + i * Math.PI / 3);
          
          ctx.beginPath();
          for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
            const wobbleAmount = wobble * (1 + 0.5 * Math.sin(angle * 5 + this.time));
            const x = fracture.x + (ringRadius + wobbleAmount) * Math.cos(angle + fracture.rotation);
            const y = fracture.y + (ringRadius + wobbleAmount) * Math.sin(angle + fracture.rotation);
            
            if (angle === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
    });
    
    // Reset global alpha
    ctx.globalAlpha = 1;
  }
  
  drawEntanglementConnection(particle1, particle2, renderCtx) {
    // Use provided context or default to main ctx
    const ctx = renderCtx || this.ctx;
    
    // Draw quantum entanglement connection between particles
    const x1 = particle1.lastRender.x;
    const y1 = particle1.lastRender.y;
    const x2 = particle2.lastRender.x;
    const y2 = particle2.lastRender.y;
    
    // Calculate connection opacity based on quantum state synchronization
    const stateDifference = Math.abs(particle1.quantumState - particle2.quantumState);
    const connectionStrength = 1 - stateDifference;
    
    // Only draw connection if strong enough
    if (connectionStrength > 0.3) {
      // Calculate distance between particles
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Skip if too far away or offscreen (performance optimization)
      if (distance > this.canvas.width / 2) return;
      
      // Simplified rendering for medium performance mode
      if (this.options.performanceMode === 'medium') {
        // Use a single color instead of gradient
        const mixedColor = this.mixColors(particle1.color, particle2.color);
        ctx.strokeStyle = this.adjustColorOpacity(mixedColor, 0.3 * connectionStrength);
        ctx.lineWidth = 2 * connectionStrength;
        
        // Draw simple curve
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const perpX = -dy / distance;
        const perpY = dx / distance;
        const curveAmplitude = 20 * connectionStrength * (Math.sin(this.time + particle1.quantumState * Math.PI * 2) * 0.5 + 0.5);
        const ctrlX = midX + perpX * curveAmplitude;
        const ctrlY = midY + perpY * curveAmplitude;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
        ctx.stroke();
        
        // Skip glow effect for medium performance mode
        return;
      }
      
      // Full quality rendering for high performance mode
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, this.adjustColorOpacity(particle1.color, 0.3 * connectionStrength));
      gradient.addColorStop(1, this.adjustColorOpacity(particle2.color, 0.3 * connectionStrength));
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2 * connectionStrength;
      
      // Draw wavy connection line
      ctx.beginPath();
      
      // Calculate midpoint
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      // Calculate perpendicular offset for curve control point
      const perpX = -dy / distance;
      const perpY = dx / distance;
      
      // Fluctuate the curve based on time and quantum states
      const curveAmplitude = 30 * connectionStrength * (Math.sin(this.time + particle1.quantumState * Math.PI * 2) * 0.5 + 0.5);
      
      const ctrlX = midX + perpX * curveAmplitude;
      const ctrlY = midY + perpY * curveAmplitude;
      
      // Draw quadratic curve
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
      ctx.stroke();
      
      // Add pulsing glow effect at midpoint of connection
      const pulseSize = 5 + 5 * connectionStrength * Math.sin(this.time * 3 + particle1.phaseShift);
      
      const glowGradient = ctx.createRadialGradient(
        ctrlX, ctrlY, 0,
        ctrlX, ctrlY, pulseSize * 2
      );
      
      // Use mixed color of both particles
      const mixedColor = this.mixColors(particle1.color, particle2.color);
      
      glowGradient.addColorStop(0, this.adjustColorOpacity(mixedColor, 0.7 * connectionStrength));
      glowGradient.addColorStop(1, this.adjustColorOpacity(mixedColor, 0));
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(ctrlX, ctrlY, pulseSize * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  calculatePerspectiveScale(z) {
    // Calculate perspective scale factor based on z position
    const depth = this.options.depthRange;
    const perspectiveFactor = 1000; // Higher = less extreme perspective
    
    return perspectiveFactor / (perspectiveFactor + z + depth / 2);
  }
  
  calculateQuantumColor(particle) {
    // Calculate color based on quantum state
    const state = particle.quantumState;
    
    // Interpolate between colors based on quantum state
    if (state < 0.25) {
      return this.interpolateColor(
        particle.color, 
        particle.secondaryColor, 
        state * 4
      );
    } else if (state < 0.5) {
      return this.interpolateColor(
        particle.secondaryColor, 
        this.shiftHue(particle.color, 30), 
        (state - 0.25) * 4
      );
    } else if (state < 0.75) {
      return this.interpolateColor(
        this.shiftHue(particle.color, 30), 
        this.shiftHue(particle.secondaryColor, 60), 
        (state - 0.5) * 4
      );
    } else {
      return this.interpolateColor(
        this.shiftHue(particle.secondaryColor, 60), 
        particle.color, 
        (state - 0.75) * 4
      );
    }
  }
  
  calculateSecondaryQuantumColor(particle) {
    // Calculate secondary color (for gradient) based on quantum state
    return this.shiftHue(this.calculateQuantumColor(particle), 180);
  }
  
  shiftHue(color, amount) {
    // Convert hex to HSL, shift hue, convert back to hex
    const rgb = this.hexToRgb(color);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    
    // Shift hue (0-360)
    hsl.h = (hsl.h + amount) % 360;
    if (hsl.h < 0) hsl.h += 360;
    
    const shiftedRgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);
    return this.rgbToHex(shiftedRgb.r, shiftedRgb.g, shiftedRgb.b);
  }
  
  hexToRgb(hex) {
    // Expand shorthand hex
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : {r: 0, g: 0, b: 0};
  }
  
  rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }
  
  rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return { h: h * 360, s, l };
  }
  
  hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }
  
  interpolateColor(color1, color2, factor) {
    // Simple linear interpolation between two colors
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
    
    return this.rgbToHex(r, g, b);
  }
  
  mixColors(color1, color2) {
    // Mix two colors equally
    return this.interpolateColor(color1, color2, 0.5);
  }
  
  adjustColorOpacity(color, opacity) {
    // Add opacity to color
    const rgb = this.hexToRgb(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
  }
  
  setAudioData(data) {
    // Update audio data for reactivity
    this.audioData = data;
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Track frame time for performance monitoring
    const now = performance.now();
    const frameDelta = now - this.performanceStats.lastFrameTime;
    this.performanceStats.lastFrameTime = now;
    
    // Skip frames if performance is suffering
    if (this.performanceStats.throttled && this.performanceStats.framesProcessed % 2 !== 0) {
      this.performanceStats.framesProcessed++;
      this.animationFrame = requestAnimationFrame(() => this.animate());
      return;
    }
    
    // Update performance stats
    if (frameDelta > 0) { // Avoid division by zero
      this.performanceStats.frameTime.push(frameDelta);
      // Keep only the last 60 frames for stats
      if (this.performanceStats.frameTime.length > 60) {
        this.performanceStats.frameTime.shift();
      }
      
      // Calculate moving average
      const sum = this.performanceStats.frameTime.reduce((a, b) => a + b, 0);
      this.performanceStats.frameTimeAvg = sum / this.performanceStats.frameTime.length;
    }
    
    // Check for performance issues and adjust if needed
    if (this.options.adaptiveParticleCount && 
        now - this.performanceStats.lastParticleAdjustment > 5000) { // Check every 5 seconds
      
      this.performanceStats.lastParticleAdjustment = now;
      
      // If average frame time is too high, reduce particles
      if (this.performanceStats.frameTimeAvg > 33) { // Targeting 30fps minimum
        // Reduce particle count by 10%
        const reduction = Math.max(1, Math.floor(this.quantumParticles.length * 0.1));
        if (this.quantumParticles.length > 10) { // Keep at least 10 particles
          this.quantumParticles.splice(0, reduction);
          console.log(`QuantumParticles: Performance optimization - reduced ${reduction} particles`);
        }
        
        // Enable throttling if still struggling
        if (this.performanceStats.frameTimeAvg > 50) {
          this.performanceStats.throttled = true;
        }
      } 
      // If frame time is good and we're throttled, try unthrottling
      else if (this.performanceStats.throttled && this.performanceStats.frameTimeAvg < 25) {
        this.performanceStats.throttled = false;
        console.log('QuantumParticles: Performance improved - disabled throttling');
      }
    }
    
    // Update particle positions and states using batching for better performance
    if (this.options.batchedUpdates) {
      this.updateQuantumParticlesBatched();
    } else {
      this.updateQuantumParticles();
    }
    
    // Update reality fractures
    this.updateFractures();
    
    // Render everything
    this.renderQuantumParticles();
    
    this.performanceStats.framesProcessed++;
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  /**
   * Optimized batched update for quantum particles
   * Processes particles in chunks for better performance
   */
  updateQuantumParticlesBatched() {
    this.time += this.options.fluctuationFrequency;
    
    // Constants used in calculations to avoid repeated property lookups
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const depthRange = this.options.depthRange;
    const gravitationalEnabled = this.options.gravitationalField;
    const fluctuationEnabled = this.options.quantumFluctuation;
    const stability = this.options.dimensionalStability;
    const mouseActive = this.mousePosition.active;
    const mouseX = this.mousePosition.x;
    const mouseY = this.mousePosition.y;
    const distortionRadius = this.options.distortionRadius;
    const distortionIntensity = this.options.distortionIntensity;
    const time = this.time;
    const fluctAmp = this.options.fluctuationAmplitude;
    const realityUnstable = !this.realityState.stable;
    const realityFluctLevel = realityUnstable ? this.realityState.fluctuationLevel : 0;
    
    // Process particles in batches
    const batchSize = 10; // Process 10 particles per batch
    const particleCount = this.quantumParticles.length;
    
    for (let i = 0; i < particleCount; i += batchSize) {
      const endIdx = Math.min(i + batchSize, particleCount);
      
      for (let j = i; j < endIdx; j++) {
        const particle = this.quantumParticles[j];
        
        // Apply quantum fluctuation if enabled (using cached constants)
        if (fluctuationEnabled) {
          // Fluctuate based on sine wave with particle's unique phase shift
          const fluctX = Math.sin(time + particle.phaseShift) * fluctAmp;
          const fluctY = Math.cos(time + particle.phaseShift) * fluctAmp;
          
          // Apply fluctuation to position
          particle.x += fluctX * 0.02;
          particle.y += fluctY * 0.02;
        }
        
        // Standard movement
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.z += particle.speedZ;
        
        // Apply gravitational pull toward center if enabled
        if (gravitationalEnabled) {
          const dx = centerX - particle.x;
          const dy = centerY - particle.y;
          const distance = Math.hypot(dx, dy); // More efficient than Math.sqrt(dx*dx + dy*dy)
          
          // Apply gravitational force (inverse square law)
          if (distance > 10) {
            const force = 0.1 / distance;
            particle.speedX += dx * force * 0.01;
            particle.speedY += dy * force * 0.01;
          }
        }
        
        // Apply mouse interaction if active
        if (mouseActive) {
          const dx = particle.x - mouseX;
          const dy = particle.y - mouseY;
          const distance = Math.hypot(dx, dy);
          
          if (distance < distortionRadius) {
            // Calculate influence (closer = stronger)
            const influence = 1 - (distance / distortionRadius);
            
            // Apply distortion force
            const distortionForce = influence * distortionIntensity * particle.distortionFactor;
            particle.speedX -= dx * distortionForce * 0.01;
            particle.speedY -= dy * distortionForce * 0.01;
            
            // Increase quantum state fluctuation
            particle.quantumState = (particle.quantumState + distortionForce * 0.1) % 1;
          }
        }
        
        // Apply reality state distortions
        if (realityUnstable) {
          particle.speedX += (Math.random() - 0.5) * realityFluctLevel * 0.1;
          particle.speedY += (Math.random() - 0.5) * realityFluctLevel * 0.1;
          particle.z += (Math.random() - 0.5) * realityFluctLevel * 5;
        }
        
        // Apply dimensional stability constraints
        particle.speedX *= stability;
        particle.speedY *= stability;
        particle.speedZ *= stability;
        
        // Boundary wrapping - wrap particles around the screen edges
        if (particle.x < -particle.size) particle.x = canvasWidth + particle.size;
        else if (particle.x > canvasWidth + particle.size) particle.x = -particle.size;
        if (particle.y < -particle.size) particle.y = canvasHeight + particle.size;
        else if (particle.y > canvasHeight + particle.size) particle.y = -particle.size;
        
        // Depth constraints
        if (Math.abs(particle.z) > depthRange / 2) {
          particle.speedZ *= -0.5; // Bounce back with reduced speed
          particle.z = Math.sign(particle.z) * depthRange / 2;
        }
        
        // Ensure particle size stays within bounds
        particle.size = Math.max(this.options.minSize, Math.min(this.options.maxSize, particle.size));
      }
      
      // Process particle influences - separate loop to avoid n² complexity
      for (let j = i; j < endIdx; j++) {
        const particle = this.quantumParticles[j];
        
        // Apply influence from reality fractures
        // Only process for visible particles and in high/medium performance modes
        if (this.options.performanceMode !== 'low') {
          this._applyFractureInfluences(particle);
        }
        
        // Apply quantum entanglement effects
        if (particle.entangledWith !== null) {
          this._applyEntanglementEffects(particle, this.quantumParticles[particle.entangledWith]);
        }
      }
    }
  }
  
  /**
   * Apply fracture influences to a particle
   * Extracted as a separate method for better performance profiling
   */
  _applyFractureInfluences(particle) {
    for (let i = 0; i < this.fractures.length; i++) {
      const fracture = this.fractures[i];
      const dx = particle.x - fracture.x;
      const dy = particle.y - fracture.y;
      const distance = Math.hypot(dx, dy);
      
      if (distance < fracture.radius * 2) {
        // Calculate influence
        const influence = 1 - (distance / (fracture.radius * 2));
        
        // Apply fracture force - swirl around the fracture
        const angle = Math.atan2(dy, dx);
        const swirl = fracture.distortionIntensity * influence;
        
        particle.speedX += Math.sin(angle) * swirl * 0.3;
        particle.speedY -= Math.cos(angle) * swirl * 0.3;
        
        // Increase quantum state fluctuation
        particle.quantumState = (particle.quantumState + influence * 0.2) % 1;
      }
    }
  }
  
  /**
   * Apply entanglement effects between two particles
   * Extracted as a separate method for better organization
   */
  _applyEntanglementEffects(particle, entangled) {
    // Synchronize quantum states with slight delay
    entangled.quantumState = (particle.quantumState + 0.5) % 1;
    
    // Create subtle connection between particles
    if (Math.random() < this.options.portalConnectionStrength) {
      // Slightly pull entangled particles toward each other
      const dx = entangled.x - particle.x;
      const dy = entangled.y - particle.y;
      const dz = entangled.z - particle.z;
      
      particle.speedX += dx * 0.0001;
      particle.speedY += dy * 0.0001;
      particle.speedZ += dz * 0.0001;
    }
  }
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.animationFrame = requestAnimationFrame(() => this.animate());
    console.log('QuantumParticles: Animation started');
  }
  
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    console.log('QuantumParticles: Animation stopped');
  }
  
  destroy() {
    this.stop();
    
    // Remove canvas
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    
    // Remove event listeners
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('resize', this.handleResize);
    
    console.log('QuantumParticles: Destroyed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.quantumParticles = new QuantumParticles();
  
  // Connect with v6Enhancements if available
  if (window.v6Enhancements) {
    // Set up audio data sharing for reactivity
    const checkAudioInterval = setInterval(() => {
      if (window.v6Enhancements.state && window.v6Enhancements.state.audioData) {
        clearInterval(checkAudioInterval);
        
        // Set up periodic audio data updates
        setInterval(() => {
          window.quantumParticles.setAudioData(window.v6Enhancements.state.audioData);
        }, 50);
      }
    }, 500);
  }
});