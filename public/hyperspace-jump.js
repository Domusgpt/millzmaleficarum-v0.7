/**
 * Hyperspace Jump Effect - v0.6
 * Creates stunning hyperspace jump transitions between sections
 * For MillzMaleficarum Codex v0.6
 * 
 * Secret feature triggered by special key combinations or gestures
 */

class HyperspaceJump {
  constructor(options = {}) {
    this.options = {
      particleCount: 2000,
      starfieldLayers: 5,
      jumpDuration: 3000,
      cooldownTime: 5000,
      minStarSize: 1,
      maxStarSize: 4,
      starColors: ['#ffffff', '#ffffdd', '#ddddff', '#ccffff', '#ffccff', '#aaaaff'],
      tunnelColors: ['#ff33cc', '#33ffff', '#9500ff', '#00ff95', '#ff00ff', '#00eeff'],
      enableKeyboardTrigger: true,
      enableScrollTrigger: true,
      triggerKeys: ['h', 'y', 'p', 'e', 'r'],
      useAudio: true,
      audioVolume: 0.15,
      soundFrequency: 440,
      portalParticles: 300,
      ...options
    };
    
    this.elements = {
      container: null,
      canvas: null,
      portalCanvas: null,
      audioBtn: null
    };
    
    this.ctx = null;
    this.portalCtx = null;
    this.stars = [];
    this.portalParticles = [];
    this.keySequence = [];
    this.animationFrame = null;
    this.isActive = false;
    this.isJumping = false;
    this.jumpProgress = 0;
    this.lastJumpTime = 0;
    this.audioContext = null;
    this.jumpSound = null;
    this.destination = null;
    this.scrollPosition = 0;
    this.keyboardState = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    };
    
    // Initialize if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  init() {
    console.log('HyperspaceJump: Initializing...');
    
    // Create canvas container
    this.elements.container = document.createElement('div');
    this.elements.container.className = 'hyperspace-container';
    this.elements.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10000;
      pointer-events: none;
      display: none;
      perspective: 1000px;
      transform-style: preserve-3d;
    `;
    
    document.body.appendChild(this.elements.container);
    
    // Create main starfield canvas
    this.elements.canvas = document.createElement('canvas');
    this.elements.canvas.className = 'hyperspace-canvas';
    this.elements.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    `;
    
    this.elements.container.appendChild(this.elements.canvas);
    this.ctx = this.elements.canvas.getContext('2d');
    
    // Create portal particles canvas
    this.elements.portalCanvas = document.createElement('canvas');
    this.elements.portalCanvas.className = 'hyperspace-portal-canvas';
    this.elements.portalCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    `;
    
    this.elements.container.appendChild(this.elements.portalCanvas);
    this.portalCtx = this.elements.portalCanvas.getContext('2d');
    
    // Create audio toggle button
    this.elements.audioBtn = document.createElement('button');
    this.elements.audioBtn.className = 'hyperspace-audio-toggle';
    this.elements.audioBtn.textContent = '🔊';
    this.elements.audioBtn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.5);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      font-size: 18px;
      z-index: 10001;
      display: none;
      transition: all 0.3s ease;
    `;
    
    document.body.appendChild(this.elements.audioBtn);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize audio if enabled
    if (this.options.useAudio) {
      this.initAudio();
    }
    
    // Resize canvas
    this.resizeCanvas();
    
    // Generate starfield
    this.generateStars();
    this.generatePortalParticles();
    
    console.log('HyperspaceJump: Initialized');
  }
  
  setupEventListeners() {
    // Track key presses for the secret hyperspace activation sequence
    if (this.options.enableKeyboardTrigger) {
      document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }
    
    // Handle resize events
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Audio button toggle
    this.elements.audioBtn.addEventListener('click', () => this.toggleAudio());
    
    // Track special key combinations
    document.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.keyboardState[e.key] = true;
        
        // Check for special combo (up+up+down+down+left+right+left+right)
        if (this.keyboardState.ArrowUp && 
            this.keyboardState.ArrowDown && 
            this.keyboardState.ArrowLeft && 
            this.keyboardState.ArrowRight) {
          // Trigger hyperspace jump to a random section
          this.jumpToRandomSection();
        }
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.keyboardState[e.key] = false;
      }
    });
    
    // Track rapid scroll for potential jump trigger
    if (this.options.enableScrollTrigger) {
      let lastScrollTime = 0;
      let scrollCount = 0;
      let scrollDir = 0; // 1 for down, -1 for up
      
      document.addEventListener('wheel', (e) => {
        const now = Date.now();
        const timeDiff = now - lastScrollTime;
        
        // Detect rapid scrolling
        if (timeDiff < 100) {
          // Check for direction change (up to down or down to up)
          const currentDir = Math.sign(e.deltaY);
          
          if (currentDir !== 0 && scrollDir !== 0 && currentDir !== scrollDir) {
            scrollCount++;
            
            // Trigger jump after 5 rapid direction changes
            if (scrollCount >= 5 && !this.isJumping) {
              this.jumpToRandomSection();
              scrollCount = 0;
            }
          }
          
          scrollDir = currentDir;
        } else {
          // Reset count after pause
          scrollCount = 0;
        }
        
        lastScrollTime = now;
      });
    }
  }
  
  handleKeyDown(e) {
    // Add key to sequence
    this.keySequence.push(e.key.toLowerCase());
    
    // Limit sequence length
    if (this.keySequence.length > this.options.triggerKeys.length) {
      this.keySequence.shift();
    }
    
    // Check if sequence matches trigger
    const matchesPattern = this.options.triggerKeys.every(
      (key, i) => this.keySequence[i] === key
    );
    
    if (matchesPattern && !this.isJumping) {
      this.jumpToRandomSection();
    }
  }
  
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      this.audioContext = new AudioContext();
      
      // Show audio toggle button
      this.elements.audioBtn.style.display = 'block';
      
      console.log('HyperspaceJump: Audio system initialized');
    } catch (e) {
      console.warn('HyperspaceJump: Audio initialization failed', e);
    }
  }
  
  toggleAudio() {
    if (!this.audioContext) return;
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      this.elements.audioBtn.textContent = '🔊';
      this.options.useAudio = true;
    } else {
      this.audioContext.suspend();
      this.elements.audioBtn.textContent = '🔇';
      this.options.useAudio = false;
    }
  }
  
  resizeCanvas() {
    const updateCanvas = (canvas) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };
    
    updateCanvas(this.elements.canvas);
    updateCanvas(this.elements.portalCanvas);
  }
  
  generateStars() {
    this.stars = [];
    
    // Create stars with varied depths
    for (let i = 0; i < this.options.particleCount; i++) {
      const layerIndex = Math.floor(Math.random() * this.options.starfieldLayers);
      const speedFactor = 1 + layerIndex * 0.5; // Stars in deeper layers move faster
      
      const star = {
        x: Math.random() * this.elements.canvas.width,
        y: Math.random() * this.elements.canvas.height,
        z: Math.random() * 1000, // Depth in 3D space
        size: this.options.minStarSize + Math.random() * (this.options.maxStarSize - this.options.minStarSize),
        color: this.options.starColors[Math.floor(Math.random() * this.options.starColors.length)],
        speed: (Math.random() * 10 + 5) * speedFactor,
        layer: layerIndex
      };
      
      this.stars.push(star);
    }
  }
  
  generatePortalParticles() {
    this.portalParticles = [];
    
    for (let i = 0; i < this.options.portalParticles; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 300;
      
      const particle = {
        x: 0, // Will be set relative to center during animation
        y: 0, // Will be set relative to center during animation
        size: 1 + Math.random() * 4,
        angle: angle,
        distance: distance,
        color: this.options.tunnelColors[Math.floor(Math.random() * this.options.tunnelColors.length)],
        speed: 0.5 + Math.random() * 1.5,
        opacity: 0.7 + Math.random() * 0.3,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 0.02
      };
      
      this.portalParticles.push(particle);
    }
  }
  
  jumpToRandomSection() {
    // Get all sections
    const sections = document.querySelectorAll('.section, section, article, .portal-section');
    
    if (sections.length === 0) return;
    
    // Cooldown check
    const now = Date.now();
    if (now - this.lastJumpTime < this.options.cooldownTime) {
      return;
    }
    
    this.lastJumpTime = now;
    
    // Pick a random section that's different from current view
    let targetSection;
    let attempts = 0;
    
    do {
      targetSection = sections[Math.floor(Math.random() * sections.length)];
      attempts++;
    } while (this.isElementInViewport(targetSection) && attempts < 5);
    
    // Store destination for scroll after jump
    this.destination = targetSection;
    
    // Start jump animation
    this.startJump();
  }
  
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }
  
  startJump() {
    if (this.isJumping) return;
    
    console.log('HyperspaceJump: Jump started');
    
    // Show container
    this.elements.container.style.display = 'block';
    
    // Store current scroll position to restore if needed
    this.scrollPosition = window.scrollY;
    
    // Initialize jump
    this.isJumping = true;
    this.jumpProgress = 0;
    
    // Create jump sound
    if (this.options.useAudio && this.audioContext) {
      this.createJumpSound();
    }
    
    // Start animation
    if (!this.isActive) {
      this.isActive = true;
      this.animate();
    }
    
    // Set timeout to complete jump
    setTimeout(() => {
      this.completeJump();
    }, this.options.jumpDuration);
  }
  
  completeJump() {
    if (!this.isJumping) return;
    
    // Scroll to destination if valid
    if (this.destination) {
      this.destination.scrollIntoView({ behavior: 'auto' });
    }
    
    // Add some visual effects to the target section
    if (this.destination) {
      // Add temporary highlight class
      this.destination.classList.add('hyperspace-arrival');
      
      // Remove class after animation
      setTimeout(() => {
        this.destination.classList.remove('hyperspace-arrival');
      }, 1000);
    }
    
    // Hide container with a fade
    this.elements.container.style.opacity = '0';
    setTimeout(() => {
      this.elements.container.style.display = 'none';
      this.elements.container.style.opacity = '1';
      this.isJumping = false;
      this.jumpProgress = 0;
      
      // Stop animation if no longer jumping
      if (!this.isJumping) {
        this.isActive = false;
        if (this.animationFrame) {
          cancelAnimationFrame(this.animationFrame);
          this.animationFrame = null;
        }
      }
    }, 500);
    
    console.log('HyperspaceJump: Jump completed');
  }
  
  createJumpSound() {
    try {
      // Main oscillator for hyperspace effect
      const mainOsc = this.audioContext.createOscillator();
      const sweepOsc = this.audioContext.createOscillator();
      const pulseOsc = this.audioContext.createOscillator();
      
      // Gain nodes
      const mainGain = this.audioContext.createGain();
      const sweepGain = this.audioContext.createGain();
      const pulseGain = this.audioContext.createGain();
      const masterGain = this.audioContext.createGain();
      
      // Set types
      mainOsc.type = 'sawtooth';
      sweepOsc.type = 'sine';
      pulseOsc.type = 'square';
      
      // Set frequencies
      mainOsc.frequency.setValueAtTime(this.options.soundFrequency, this.audioContext.currentTime);
      mainOsc.frequency.exponentialRampToValueAtTime(
        this.options.soundFrequency * 2, 
        this.audioContext.currentTime + this.options.jumpDuration / 1000
      );
      
      sweepOsc.frequency.setValueAtTime(this.options.soundFrequency / 4, this.audioContext.currentTime);
      sweepOsc.frequency.exponentialRampToValueAtTime(
        this.options.soundFrequency * 4, 
        this.audioContext.currentTime + this.options.jumpDuration / 1000
      );
      
      pulseOsc.frequency.setValueAtTime(4, this.audioContext.currentTime);
      
      // Set gains
      mainGain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      mainGain.gain.exponentialRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
      mainGain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + this.options.jumpDuration / 1000 - 0.5);
      mainGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + this.options.jumpDuration / 1000);
      
      sweepGain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      sweepGain.gain.exponentialRampToValueAtTime(0.2, this.audioContext.currentTime + 0.2);
      sweepGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + this.options.jumpDuration / 1000);
      
      pulseGain.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      pulseGain.gain.exponentialRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
      pulseGain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + this.options.jumpDuration / 1000 - 0.5);
      pulseGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + this.options.jumpDuration / 1000);
      
      masterGain.gain.setValueAtTime(this.options.audioVolume, this.audioContext.currentTime);
      
      // Connect oscillators to gains
      mainOsc.connect(mainGain);
      sweepOsc.connect(sweepGain);
      pulseOsc.connect(pulseGain);
      
      // Connect gains to master gain
      mainGain.connect(masterGain);
      sweepGain.connect(masterGain);
      pulseGain.connect(masterGain);
      
      // Connect master gain to output
      masterGain.connect(this.audioContext.destination);
      
      // Start oscillators
      mainOsc.start();
      sweepOsc.start();
      pulseOsc.start();
      
      // Stop oscillators after jump
      mainOsc.stop(this.audioContext.currentTime + this.options.jumpDuration / 1000 + 0.1);
      sweepOsc.stop(this.audioContext.currentTime + this.options.jumpDuration / 1000 + 0.1);
      pulseOsc.stop(this.audioContext.currentTime + this.options.jumpDuration / 1000 + 0.1);
      
      // Save reference for cleanup
      this.jumpSound = {
        oscillators: [mainOsc, sweepOsc, pulseOsc],
        gains: [mainGain, sweepGain, pulseGain, masterGain]
      };
    } catch (e) {
      console.warn('HyperspaceJump: Sound creation failed', e);
    }
  }
  
  animate() {
    if (!this.isActive) return;
    
    // Clear both canvases
    this.ctx.clearRect(0, 0, this.elements.canvas.width, this.elements.canvas.height);
    this.portalCtx.clearRect(0, 0, this.elements.portalCanvas.width, this.elements.portalCanvas.height);
    
    // Update jump progress
    if (this.isJumping) {
      this.jumpProgress += 1 / (this.options.jumpDuration / 16.67); // Approx 60fps
      this.jumpProgress = Math.min(this.jumpProgress, 1);
    }
    
    // Render starfield
    this.renderStarfield();
    
    // Render portal effect
    this.renderPortal();
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
  
  renderStarfield() {
    // Set center point
    const centerX = this.elements.canvas.width / 2;
    const centerY = this.elements.canvas.height / 2;
    
    // Progress affects star movement
    const progressFactor = this.isJumping ? 1 + this.jumpProgress * 10 : 1;
    
    // Update and draw stars
    this.ctx.save();
    
    for (const star of this.stars) {
      // Move stars based on jump progress
      if (this.isJumping) {
        // Z position moves toward viewer during jump
        star.z -= star.speed * progressFactor;
        
        // Wrap around when star passes viewer
        if (star.z < 1) {
          star.z = 1000;
          star.x = Math.random() * this.elements.canvas.width;
          star.y = Math.random() * this.elements.canvas.height;
        }
        
        // Calculate projected position (3D to 2D)
        const scaleFactor = 1000 / Math.max(1, star.z);
        const projectedX = centerX + (star.x - centerX) * scaleFactor;
        const projectedY = centerY + (star.y - centerY) * scaleFactor;
        
        // Calculate star size based on z-position
        const sizeScale = scaleFactor * (1 + this.jumpProgress);
        const finalSize = star.size * sizeScale;
        
        // Calculate alpha based on speed
        const starSpeed = star.speed * progressFactor;
        const alphaBase = Math.min(1, starSpeed / 50);
        const alpha = 0.2 + alphaBase * 0.8;
        
        // Draw star as stretched line when at high speed
        const stretchFactor = Math.min(20, progressFactor * star.speed / 10);
        
        // Calculate direction from center
        const dx = projectedX - centerX;
        const dy = projectedY - centerY;
        const angle = Math.atan2(dy, dx);
        
        // Calculate stretch endpoints
        const stretchX = Math.cos(angle) * finalSize * stretchFactor;
        const stretchY = Math.sin(angle) * finalSize * stretchFactor;
        
        // Set star color with alpha
        const color = this.hexToRgba(star.color, alpha);
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = finalSize;
        
        // Draw stretched star
        this.ctx.beginPath();
        this.ctx.moveTo(projectedX - stretchX, projectedY - stretchY);
        this.ctx.lineTo(projectedX, projectedY);
        this.ctx.stroke();
        
        // Add glow effect for brighter stars
        if (finalSize > 1.5) {
          this.ctx.shadowBlur = finalSize * 3;
          this.ctx.shadowColor = star.color;
          
          // Draw star point with glow
          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(projectedX, projectedY, finalSize, 0, Math.PI * 2);
          this.ctx.fill();
          
          this.ctx.shadowBlur = 0;
        }
      }
    }
    
    this.ctx.restore();
  }
  
  renderPortal() {
    if (!this.isJumping) return;
    
    const centerX = this.elements.portalCanvas.width / 2;
    const centerY = this.elements.portalCanvas.height / 2;
    
    // Draw portal background glow
    const portalRadius = 100 + this.jumpProgress * 400;
    const glow = this.portalCtx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, portalRadius
    );
    
    glow.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    glow.addColorStop(0.2, 'rgba(0, 238, 255, 0.5)');
    glow.addColorStop(0.6, 'rgba(255, 0, 255, 0.3)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    this.portalCtx.fillStyle = glow;
    this.portalCtx.beginPath();
    this.portalCtx.arc(centerX, centerY, portalRadius, 0, Math.PI * 2);
    this.portalCtx.fill();
    
    // Draw swirling portal particles
    this.portalCtx.save();
    
    for (const particle of this.portalParticles) {
      // Update rotation
      particle.rotation += particle.rotationSpeed;
      
      // Calculate position based on angle, distance and jump progress
      const progressEffect = 1 - this.jumpProgress * 0.5; // Particles move inward as jump progresses
      const distance = particle.distance * progressEffect;
      const angle = particle.angle + this.jumpProgress * particle.speed * 2;
      
      particle.x = centerX + Math.cos(angle) * distance;
      particle.y = centerY + Math.sin(angle) * distance;
      
      // Draw particle
      this.portalCtx.save();
      
      // Set particle color with opacity
      this.portalCtx.fillStyle = this.hexToRgba(particle.color, particle.opacity);
      
      // Add glow effect
      this.portalCtx.shadowBlur = particle.size * 3;
      this.portalCtx.shadowColor = particle.color;
      
      // Draw at calculated position with rotation
      this.portalCtx.translate(particle.x, particle.y);
      this.portalCtx.rotate(particle.rotation);
      
      // Size grows with jump progress
      const size = particle.size * (1 + this.jumpProgress);
      
      // Draw as square for more interesting effect
      this.portalCtx.fillRect(-size/2, -size/2, size, size);
      
      this.portalCtx.restore();
    }
    
    this.portalCtx.restore();
    
    // Draw spiraling light effect
    this.portalCtx.save();
    
    const spiralSegments = 6;
    for (let i = 0; i < spiralSegments; i++) {
      const baseAngle = (i / spiralSegments) * Math.PI * 2;
      const color = this.options.tunnelColors[i % this.options.tunnelColors.length];
      
      const spiralPoints = 50;
      this.portalCtx.beginPath();
      
      for (let j = 0; j < spiralPoints; j++) {
        const progress = j / spiralPoints;
        const spiralRadius = progress * portalRadius;
        const angle = baseAngle + progress * Math.PI * 4 + this.jumpProgress * Math.PI * 8;
        
        const x = centerX + Math.cos(angle) * spiralRadius;
        const y = centerY + Math.sin(angle) * spiralRadius;
        
        if (j === 0) {
          this.portalCtx.moveTo(x, y);
        } else {
          this.portalCtx.lineTo(x, y);
        }
      }
      
      this.portalCtx.strokeStyle = color;
      this.portalCtx.lineWidth = 2 + this.jumpProgress * 3;
      this.portalCtx.stroke();
    }
    
    this.portalCtx.restore();
    
    // Draw pulsing ring
    this.portalCtx.save();
    
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
      const ringProgress = (this.jumpProgress + i/ringCount) % 1;
      const ringRadius = ringProgress * portalRadius;
      const ringOpacity = (1 - ringProgress) * 0.7;
      
      this.portalCtx.strokeStyle = `rgba(255, 255, 255, ${ringOpacity})`;
      this.portalCtx.lineWidth = 2;
      
      this.portalCtx.beginPath();
      this.portalCtx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
      this.portalCtx.stroke();
    }
    
    this.portalCtx.restore();
  }
  
  hexToRgba(hex, alpha) {
    // Convert hex color to rgba
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Stop jump sound
    if (this.jumpSound) {
      try {
        this.jumpSound.oscillators.forEach(osc => osc.stop());
      } catch (e) {
        // Ignore already stopped oscillators
      }
      this.jumpSound = null;
    }
    
    console.log('HyperspaceJump: Stopped');
  }
  
  destroy() {
    this.stop();
    
    // Remove elements
    if (this.elements.container && this.elements.container.parentNode) {
      this.elements.container.parentNode.removeChild(this.elements.container);
    }
    
    if (this.elements.audioBtn && this.elements.audioBtn.parentNode) {
      this.elements.audioBtn.parentNode.removeChild(this.elements.audioBtn);
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(e => console.warn('Error closing audio context:', e));
    }
    
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeyDown);
    
    console.log('HyperspaceJump: Destroyed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.hyperspaceJump = new HyperspaceJump();
  
  // Create a subtle hint about the feature
  setTimeout(() => {
    const hintElement = document.createElement('div');
    hintElement.className = 'hyperspace-hint';
    hintElement.textContent = 'Try typing "HYPER"';
    hintElement.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.5);
      color: rgba(255, 255, 255, 0.6);
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 10001;
      opacity: 0;
      transition: opacity 0.5s ease;
    `;
    
    document.body.appendChild(hintElement);
    
    // Show hint briefly after 10 seconds
    setTimeout(() => {
      hintElement.style.opacity = '1';
      setTimeout(() => {
        hintElement.style.opacity = '0';
        setTimeout(() => {
          if (hintElement.parentNode) {
            hintElement.parentNode.removeChild(hintElement);
          }
        }, 500);
      }, 5000);
    }, 10000);
  }, 10000);
});