/**
 * Reality Distortion System - v0.6
 * Advanced reality fracturing effects with quantum distortions and dimensional tears
 * For MillzMaleficarum Codex v0.6
 */

class RealityDistortion {
  constructor(options = {}) {
    this.options = {
      containerSelector: 'body',
      fractureProbability: 0.001, // Chance per frame of spontaneous fracture
      maxFractures: 5, // Maximum number of fracture points at once
      tearProbability: 0.0005, // Chance per frame of dimensional tear
      glitchDuration: 2000, // Duration of glitch effect in ms
      sigilActivation: true, // Special effects for sigils
      dimensionalRifts: true, // Create dimensional rifts
      laserBeams: true, // Create laser beam effects
      reactionToHyperAV: true, // React to HyperAV visualizer intensity
      quantumTagging: true, // Add quantum entanglement effects to random elements
      useSoundEffects: true, // Create sound effects for distortions
      soundVolume: 0.1, // Volume of sound effects (0-1)
      affectImages: true, // Apply effects to images
      affectText: true, // Apply effects to text elements
      debugMode: false, // Output debug info
      ...options
    };
    
    this.container = null;
    this.distortionContainer = null;
    this.distortionOverlay = null;
    this.laserGridOverlay = null;
    this.fractures = [];
    this.tears = [];
    this.rifts = [];
    this.animationFrame = null;
    this.isActive = false;
    this.lastDistortionTime = 0;
    this.cooldownActive = false;
    this.quantum = {
      state: 0,
      entangledElements: [],
      markedSigils: []
    };
    this.audioContext = null;
    this.oscillators = [];
    
    // Initialize if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }
  
  init() {
    console.log('RealityDistortion: Initializing...');
    
    // Get container
    this.container = document.querySelector(this.options.containerSelector);
    if (!this.container) {
      console.error('RealityDistortion: Container not found');
      return;
    }
    
    // Create distortion container
    this.distortionContainer = document.createElement('div');
    this.distortionContainer.className = 'reality-distortion-container';
    this.container.appendChild(this.distortionContainer);
    
    // Create laser grid overlay
    this.laserGridOverlay = document.createElement('div');
    this.laserGridOverlay.className = 'laser-grid-overlay';
    this.distortionContainer.appendChild(this.laserGridOverlay);
    
    // Initialize audio context if sound effects are enabled
    if (this.options.useSoundEffects) {
      this.initAudio();
    }
    
    // Mark sigils for special effects
    if (this.options.sigilActivation) {
      this.markSigils();
    }
    
    // Create quantum entanglement between elements
    if (this.options.quantumTagging) {
      this.createQuantumEntanglement();
    }
    
    // Start the distortion system
    this.start();
    
    // Add click event listeners to cause distortions on interaction
    this.setupInteractionEvents();
    
    console.log('RealityDistortion: Initialized');
  }
  
  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      
      this.audioContext = new AudioContext();
      console.log('RealityDistortion: Audio system initialized');
    } catch (e) {
      console.warn('RealityDistortion: Audio initialization failed', e);
    }
  }
  
  markSigils() {
    // Find all sigil elements by class 
    const sigilClasses = [
      '.sigil-Xi', '.sigil-Theta', '.sigil-Gamma', '.sigil-Pi', '.sigil-Lambda',
      '.sigil-Sigma', '.sigil-Phi', '.sigil-Psi', '.sigil-Omega', '.sigil-Delta',
      '.sigil'
    ];
    
    // Combined selector
    const sigilSelector = sigilClasses.join(', ');
    const sigils = document.querySelectorAll(sigilSelector);
    
    // Mark each sigil
    sigils.forEach(sigil => {
      sigil.dataset.quantumState = Math.random();
      sigil.classList.add('sigil');
      this.quantum.markedSigils.push(sigil);
    });
    
    console.log(`RealityDistortion: Marked ${this.quantum.markedSigils.length} sigils`);
  }
  
  createQuantumEntanglement() {
    // Select random paragraphs, headings, and images to entangle
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
    const paragraphs = Array.from(document.querySelectorAll('p'));
    const images = this.options.affectImages ? Array.from(document.querySelectorAll('img')) : [];
    
    // Combine all potential elements
    const allElements = [...headings, ...paragraphs, ...images];
    
    // Randomly select pairs to entangle (approximately 10% of elements)
    const pairsToEntangle = Math.min(Math.floor(allElements.length * 0.1), 10);
    
    for (let i = 0; i < pairsToEntangle; i++) {
      if (allElements.length < 2) break;
      
      // Pick two random elements
      const index1 = Math.floor(Math.random() * allElements.length);
      const element1 = allElements[index1];
      allElements.splice(index1, 1);
      
      const index2 = Math.floor(Math.random() * allElements.length);
      const element2 = allElements[index2];
      allElements.splice(index2, 1);
      
      // Create entanglement
      const entanglementId = `quantum-pair-${i}`;
      element1.dataset.entangledWith = entanglementId;
      element2.dataset.entangledWith = entanglementId;
      
      // Add special class
      element1.classList.add('quantum-entangled');
      element2.classList.add('quantum-entangled');
      
      // Store entangled pair
      this.quantum.entangledElements.push({
        id: entanglementId,
        elements: [element1, element2],
        state: Math.random()
      });
    }
    
    console.log(`RealityDistortion: Created ${this.quantum.entangledElements.length} quantum entanglements`);
  }
  
  setupInteractionEvents() {
    // Add click event to sigils to cause reality distortion
    this.quantum.markedSigils.forEach(sigil => {
      sigil.addEventListener('click', (e) => {
        this.triggerRealityDistortion({
          x: e.clientX,
          y: e.clientY,
          intensity: 1 + Math.random(),
          type: 'sigil'
        });
        e.stopPropagation();
      });
    });
    
    // Add click event to quantum entangled elements
    this.quantum.entangledElements.forEach(pair => {
      pair.elements.forEach(element => {
        element.addEventListener('click', (e) => {
          // Get the other element in pair
          const otherElement = pair.elements.find(el => el !== element);
          
          // Create a connection effect between the two elements
          this.createQuantumConnection(element, otherElement);
          
          // Trigger minor distortion
          this.triggerRealityDistortion({
            x: e.clientX,
            y: e.clientY,
            intensity: 0.5 + Math.random() * 0.5,
            type: 'quantum'
          });
          
          e.stopPropagation();
        });
      });
    });
    
    // Add rare random distortion on general clicks
    document.addEventListener('click', (e) => {
      if (Math.random() < 0.1 && !this.cooldownActive) {
        this.triggerRealityDistortion({
          x: e.clientX,
          y: e.clientY,
          intensity: 0.3 + Math.random() * 0.3,
          type: 'random'
        });
      }
    });
  }
  
  createQuantumConnection(element1, element2) {
    // Get positions of both elements
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    
    // Calculate center points
    const center1 = {
      x: rect1.left + rect1.width / 2,
      y: rect1.top + rect1.height / 2
    };
    
    const center2 = {
      x: rect2.left + rect2.width / 2,
      y: rect2.top + rect2.height / 2
    };
    
    // Create beam
    const laser = document.createElement('div');
    laser.className = 'laser-beam';
    this.distortionContainer.appendChild(laser);
    
    // Calculate angle and length
    const dx = center2.x - center1.x;
    const dy = center2.y - center1.y;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Position and rotate
    laser.style.left = `${center1.x}px`;
    laser.style.top = `${center1.y}px`;
    laser.style.width = `${length}px`;
    laser.style.transform = `rotate(${angle}deg)`;
    
    // Create sound effect
    this.createLaserSound();
    
    // Apply glitch effect to both elements
    element1.classList.add('glitch-element');
    element2.classList.add('glitch-element');
    
    // Highlight both elements
    element1.style.transition = 'all 0.5s ease';
    element2.style.transition = 'all 0.5s ease';
    
    const originalFilter1 = element1.style.filter;
    const originalFilter2 = element2.style.filter;
    
    element1.style.filter = 'brightness(150%) drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))';
    element2.style.filter = 'brightness(150%) drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))';
    
    // Remove laser and restore elements after animation
    setTimeout(() => {
      if (laser.parentNode) {
        laser.parentNode.removeChild(laser);
      }
      
      element1.classList.remove('glitch-element');
      element2.classList.remove('glitch-element');
      
      // Restore original filters
      setTimeout(() => {
        element1.style.filter = originalFilter1;
        element2.style.filter = originalFilter2;
      }, 1000);
    }, 1000);
  }
  
  createLaserSound() {
    if (!this.audioContext || !this.options.useSoundEffects) return;
    
    try {
      // Create oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Set type and frequency
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.3);
      
      // Set volume
      gainNode.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(this.options.soundVolume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 0.3);
      
      // Connect
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
      
      // Store for cleanup
      this.oscillators.push(oscillator);
      
      // Remove from array when done
      setTimeout(() => {
        const index = this.oscillators.indexOf(oscillator);
        if (index !== -1) {
          this.oscillators.splice(index, 1);
        }
      }, 300);
    } catch (e) {
      console.warn('RealityDistortion: Sound creation failed', e);
    }
  }
  
  createDistortionSound(intensity = 1) {
    if (!this.audioContext || !this.options.useSoundEffects) return;
    
    try {
      // Create multiple oscillators for rich sound
      const osc1 = this.audioContext.createOscillator();
      const osc2 = this.audioContext.createOscillator();
      const osc3 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Set types and frequencies
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(200 + Math.random() * 100, this.audioContext.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + 1.5);
      
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(50 + Math.random() * 50, this.audioContext.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(20, this.audioContext.currentTime + 1.5);
      
      osc3.type = 'sawtooth';
      osc3.frequency.setValueAtTime(800 + Math.random() * 200, this.audioContext.currentTime);
      osc3.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);
      
      // Set volume
      gainNode.gain.setValueAtTime(0.0001, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(this.options.soundVolume * intensity * 0.5, this.audioContext.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 1.5);
      
      // Connect
      osc1.connect(gainNode);
      osc2.connect(gainNode);
      osc3.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Play
      osc1.start();
      osc2.start();
      osc3.start();
      osc1.stop(this.audioContext.currentTime + 1.5);
      osc2.stop(this.audioContext.currentTime + 1.5);
      osc3.stop(this.audioContext.currentTime + 0.5);
      
      // Store for cleanup
      this.oscillators.push(osc1, osc2, osc3);
      
      // Remove from array when done
      setTimeout(() => {
        const indices = [
          this.oscillators.indexOf(osc1),
          this.oscillators.indexOf(osc2),
          this.oscillators.indexOf(osc3)
        ];
        
        indices.forEach(index => {
          if (index !== -1) {
            this.oscillators.splice(index, 1);
          }
        });
      }, 1500);
    } catch (e) {
      console.warn('RealityDistortion: Sound creation failed', e);
    }
  }
  
  triggerRealityDistortion(options = {}) {
    // Default options
    const settings = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      intensity: 1,
      type: 'standard',
      fractures: Math.floor(1 + Math.random() * 3),
      duration: this.options.glitchDuration,
      ...options
    };
    
    // Check cooldown to prevent too frequent distortions
    const now = Date.now();
    if (now - this.lastDistortionTime < 2000 && this.cooldownActive) {
      return;
    }
    
    this.lastDistortionTime = now;
    this.cooldownActive = true;
    
    // Add body class to trigger overall distortion effect
    document.body.classList.add('reality-distortion-active');
    
    // Create sound effect
    this.createDistortionSound(settings.intensity);
    
    // Create fracture points
    for (let i = 0; i < settings.fractures; i++) {
      // Add some randomness to position
      const randomOffset = 50 + Math.random() * 100;
      const angle = Math.random() * Math.PI * 2;
      const x = settings.x + Math.cos(angle) * randomOffset * i;
      const y = settings.y + Math.sin(angle) * randomOffset * i;
      
      this.createFracturePoint(x, y);
    }
    
    // Create dimensional rift if enabled
    if (this.options.dimensionalRifts && Math.random() < 0.5) {
      this.createDimensionalRift(settings.x, settings.y, settings.intensity);
    }
    
    // Create laser beam if enabled
    if (this.options.laserBeams && Math.random() < 0.3) {
      this.createRandomLaserBeam();
    }
    
    // Special effects for sigil activation
    if (settings.type === 'sigil') {
      this.activateAllSigils();
    }
    
    // Remove distortion after duration
    setTimeout(() => {
      document.body.classList.remove('reality-distortion-active');
      this.cooldownActive = false;
    }, settings.duration);
  }
  
  createFracturePoint(x, y) {
    // Create fracture point element
    const fracture = document.createElement('div');
    fracture.className = 'fracture-point';
    fracture.style.left = `${x}px`;
    fracture.style.top = `${y}px`;
    
    // Add to container
    this.distortionContainer.appendChild(fracture);
    
    // Remove after animation
    setTimeout(() => {
      if (fracture.parentNode) {
        fracture.parentNode.removeChild(fracture);
      }
    }, this.options.glitchDuration);
  }
  
  createDimensionalRift(x, y, intensity = 1) {
    // Create dimensional rift element
    const rift = document.createElement('div');
    rift.className = 'dimensional-rift';
    
    // Size based on intensity
    const size = 100 + intensity * 150;
    rift.style.width = `${size}px`;
    rift.style.height = `${size}px`;
    
    // Position
    rift.style.left = `${x - size/2}px`;
    rift.style.top = `${y - size/2}px`;
    
    // Add to container
    this.distortionContainer.appendChild(rift);
    
    // Remove after animation
    setTimeout(() => {
      if (rift.parentNode) {
        rift.parentNode.removeChild(rift);
      }
    }, this.options.glitchDuration);
  }
  
  createRandomLaserBeam() {
    // Create random beam across the screen
    const startX = Math.random() * window.innerWidth;
    const startY = Math.random() * window.innerHeight;
    const endX = Math.random() * window.innerWidth;
    const endY = Math.random() * window.innerHeight;
    
    // Create beam
    const laser = document.createElement('div');
    laser.className = 'laser-beam';
    this.distortionContainer.appendChild(laser);
    
    // Calculate angle and length
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const length = Math.sqrt(dx * dx + dy * dy);
    
    // Position and rotate
    laser.style.left = `${startX}px`;
    laser.style.top = `${startY}px`;
    laser.style.width = `${length}px`;
    laser.style.transform = `rotate(${angle}deg)`;
    
    // Create sound effect
    this.createLaserSound();
    
    // Remove after animation
    setTimeout(() => {
      if (laser.parentNode) {
        laser.parentNode.removeChild(laser);
      }
    }, 1000);
  }
  
  activateAllSigils() {
    // Special effect for all sigils
    this.quantum.markedSigils.forEach(sigil => {
      // Add special animation class if not already present
      if (!sigil.classList.contains('sigil-activate')) {
        sigil.classList.add('sigil-activate');
        
        // Remove class after animation
        setTimeout(() => {
          sigil.classList.remove('sigil-activate');
        }, 3000);
      }
    });
  }
  
  update() {
    if (!this.isActive) return;
    
    // Check for random reality fracture
    if (Math.random() < this.options.fractureProbability && !this.cooldownActive) {
      this.triggerRealityDistortion({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        intensity: 0.5 + Math.random() * 0.5,
        type: 'random',
        fractures: 1
      });
    }
    
    // Check for HyperAV integration
    if (this.options.reactionToHyperAV && window.hyperAV && window.hyperAV.getIntensity) {
      const intensity = window.hyperAV.getIntensity();
      
      // Trigger distortions for high intensity moments
      if (intensity > 0.8 && Math.random() < 0.05 && !this.cooldownActive) {
        this.triggerRealityDistortion({
          intensity: intensity * 1.5,
          type: 'hyperav'
        });
      }
    }
    
    // Continue animation loop
    this.animationFrame = requestAnimationFrame(() => this.update());
  }
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.animationFrame = requestAnimationFrame(() => this.update());
    console.log('RealityDistortion: Started');
  }
  
  stop() {
    if (!this.isActive) return;
    
    this.isActive = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Ignore errors from already stopped oscillators
      }
    });
    this.oscillators = [];
    
    console.log('RealityDistortion: Stopped');
  }
  
  destroy() {
    this.stop();
    
    // Remove distortion container
    if (this.distortionContainer && this.distortionContainer.parentNode) {
      this.distortionContainer.parentNode.removeChild(this.distortionContainer);
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close().catch(e => console.warn('Error closing audio context:', e));
    }
    
    // Remove event listeners from sigils and quantum elements
    this.quantum.markedSigils.forEach(sigil => {
      sigil.replaceWith(sigil.cloneNode(true));
    });
    
    this.quantum.entangledElements.forEach(pair => {
      pair.elements.forEach(element => {
        element.replaceWith(element.cloneNode(true));
      });
    });
    
    console.log('RealityDistortion: Destroyed');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global instance
  window.realityDistortion = new RealityDistortion();
  
  // Connect with v6Enhancements if available
  if (window.v6Enhancements) {
    console.log('RealityDistortion: Connected to v6Enhancements');
  }
});