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
    this.ctx = this.canvas.getContext('2d');
    
    // Set canvas size
    this.resizeCanvas();
    
    // Create particles
    this.createQuantumParticles();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start animation
    this.start();
    
    // Schedule reality fractures
    this.scheduleRealityFractures();
    
    console.log(`QuantumParticles: Initialized with ${this.quantumParticles.length} particles`);
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
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
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
  
  createFractureSound() {
    try {
      if (!window.AudioContext) return;
      
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw reality fractures
    this.renderFractures();
    
    // Sort particles by z-depth for proper rendering
    const sortedParticles = [...this.quantumParticles].sort((a, b) => a.z - b.z);
    
    // Draw particles
    sortedParticles.forEach(particle => {
      // Calculate perspective scale based on z-position
      const scale = this.calculatePerspectiveScale(particle.z);
      const scaledSize = particle.size * scale;
      
      // Calculate opacity based on z position (further = more transparent)
      const depth = (particle.z + this.options.depthRange / 2) / this.options.depthRange;
      const opacity = 0.2 + depth * 0.8;
      
      // Calculate position with perspective
      const perspectiveX = this.canvas.width / 2 + (particle.x - this.canvas.width / 2) * scale;
      const perspectiveY = this.canvas.height / 2 + (particle.y - this.canvas.height / 2) * scale;
      
      // Store last render properties for quantum effects
      particle.lastRender = {
        x: perspectiveX,
        y: perspectiveY,
        size: scaledSize,
        opacity
      };
      
      // Draw glow effect (quantum blur)
      const gradient = this.ctx.createRadialGradient(
        perspectiveX, perspectiveY, 0,
        perspectiveX, perspectiveY, scaledSize * 2
      );
      
      // Calculate color based on quantum state
      const color = this.calculateQuantumColor(particle);
      const secondaryColor = this.calculateSecondaryQuantumColor(particle);
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, this.adjustColorOpacity(secondaryColor, 0.5));
      gradient.addColorStop(1, this.adjustColorOpacity(color, 0));
      
      this.ctx.globalAlpha = opacity;
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(perspectiveX, perspectiveY, scaledSize * 2, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw entanglement connections
      if (particle.entangledWith !== null) {
        const entangled = this.quantumParticles[particle.entangledWith];
        this.drawEntanglementConnection(particle, entangled);
      }
    });
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }
  
  renderFractures() {
    this.fractures.forEach(fracture => {
      // Create reality fracture effect using gradients
      const gradient = this.ctx.createRadialGradient(
        fracture.x, fracture.y, 0,
        fracture.x, fracture.y, fracture.radius
      );
      
      gradient.addColorStop(0, this.adjustColorOpacity(fracture.color, 0.8));
      gradient.addColorStop(0.5, this.adjustColorOpacity(fracture.secondaryColor, 0.5));
      gradient.addColorStop(1, this.adjustColorOpacity(fracture.color, 0));
      
      // Draw main fracture glow
      this.ctx.globalAlpha = 0.7;
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(fracture.x, fracture.y, fracture.radius, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Draw fracture shockwaves
      this.ctx.globalAlpha = 0.3;
      this.ctx.strokeStyle = fracture.secondaryColor;
      this.ctx.lineWidth = 2;
      
      // Draw multiple distortion rings
      for (let i = 0; i < 3; i++) {
        const ringRadius = fracture.radius * (0.6 + i * 0.2);
        const wobble = 5 * Math.sin(this.time * 5 + i * Math.PI / 3);
        
        this.ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
          const wobbleAmount = wobble * (1 + 0.5 * Math.sin(angle * 5 + this.time));
          const x = fracture.x + (ringRadius + wobbleAmount) * Math.cos(angle + fracture.rotation);
          const y = fracture.y + (ringRadius + wobbleAmount) * Math.sin(angle + fracture.rotation);
          
          if (angle === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        this.ctx.closePath();
        this.ctx.stroke();
      }
    });
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }
  
  drawEntanglementConnection(particle1, particle2) {
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
      const gradient = this.ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, this.adjustColorOpacity(particle1.color, 0.3 * connectionStrength));
      gradient.addColorStop(1, this.adjustColorOpacity(particle2.color, 0.3 * connectionStrength));
      
      this.ctx.strokeStyle = gradient;
      this.ctx.lineWidth = 2 * connectionStrength;
      
      // Draw wavy connection line
      this.ctx.beginPath();
      
      // Calculate midpoint
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      
      // Calculate perpendicular offset for curve control point
      const dx = x2 - x1;
      const dy = y2 - y1;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Skip if too far away
      if (distance > this.canvas.width / 2) return;
      
      const perpX = -dy / distance;
      const perpY = dx / distance;
      
      // Fluctuate the curve based on time and quantum states
      const curveAmplitude = 30 * connectionStrength * (Math.sin(this.time + particle1.quantumState * Math.PI * 2) * 0.5 + 0.5);
      
      const ctrlX = midX + perpX * curveAmplitude;
      const ctrlY = midY + perpY * curveAmplitude;
      
      // Draw quadratic curve
      this.ctx.moveTo(x1, y1);
      this.ctx.quadraticCurveTo(ctrlX, ctrlY, x2, y2);
      this.ctx.stroke();
      
      // Add pulsing glow effect at midpoint of connection
      const pulseSize = 5 + 5 * connectionStrength * Math.sin(this.time * 3 + particle1.phaseShift);
      
      const glowGradient = this.ctx.createRadialGradient(
        ctrlX, ctrlY, 0,
        ctrlX, ctrlY, pulseSize * 2
      );
      
      // Use mixed color of both particles
      const mixedColor = this.mixColors(particle1.color, particle2.color);
      
      glowGradient.addColorStop(0, this.adjustColorOpacity(mixedColor, 0.7 * connectionStrength));
      glowGradient.addColorStop(1, this.adjustColorOpacity(mixedColor, 0));
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.beginPath();
      this.ctx.arc(ctrlX, ctrlY, pulseSize * 2, 0, Math.PI * 2);
      this.ctx.fill();
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
    
    // Update particle positions and states
    this.updateQuantumParticles();
    
    // Update reality fractures
    this.updateFractures();
    
    // Render everything
    this.renderQuantumParticles();
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.animate());
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