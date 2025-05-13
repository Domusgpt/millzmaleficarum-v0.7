// Quantum Field Visualization HyperAV Template
// Add this to your project to create a quantum field visualization

class QuantumField {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      width: options.width || this.container.clientWidth,
      height: options.height || this.container.clientHeight,
      gridSize: options.gridSize || 40,
      particleCount: options.particleCount || 200,
      waveSpeed: options.waveSpeed || 0.03,
      interactionStrength: options.interactionStrength || 0.8,
      colorScheme: options.colorScheme || 'quantum',
      ...options
    };
    
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.wavePhase = 0;
    this.hoveredPosition = null;
    
    this.initialize();
  }
  
  initialize() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Initialize particles
    this.createParticles();
    
    // Add event listeners
    this.addEventListeners();
    
    // Start animation loop
    this.animate();
  }
  
  createParticles() {
    for (let i = 0; i < this.options.particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.options.width,
        y: Math.random() * this.options.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        radius: Math.random() * 3 + 1,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  
  addEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.hoveredPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredPosition = null;
    });
  }
  
  getColorScheme() {
    const schemes = {
      quantum: {
        background: 'rgba(0, 0, 40, 0.05)',
        grid: 'rgba(0, 255, 0, 0.2)',
        gridActive: 'rgba(0, 255, 100, 0.4)',
        particle: 'rgba(0, 255, 180, 0.7)',
        wave: 'rgba(255, 255, 0, 0.3)'
      },
      vaporwave: {
        background: 'rgba(45, 0, 247, 0.05)',
        grid: 'rgba(255, 113, 206, 0.2)',
        gridActive: 'rgba(255, 113, 206, 0.5)',
        particle: 'rgba(1, 205, 254, 0.7)',
        wave: 'rgba(185, 103, 255, 0.3)'
      },
      cyber: {
        background: 'rgba(0, 0, 0, 0.05)',
        grid: 'rgba(0, 255, 255, 0.15)',
        gridActive: 'rgba(0, 255, 255, 0.4)',
        particle: 'rgba(255, 0, 128, 0.7)',
        wave: 'rgba(0, 255, 255, 0.2)'
      }
    };
    
    return schemes[this.options.colorScheme] || schemes.quantum;
  }
  
  drawGrid() {
    const colors = this.getColorScheme();
    const cellSize = this.options.gridSize;
    const rows = Math.ceil(this.options.height / cellSize);
    const cols = Math.ceil(this.options.width / cellSize);
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const centerX = x * cellSize + cellSize / 2;
        const centerY = y * cellSize + cellSize / 2;
        
        // Calculate distance to hovered position
        let interactionFactor = 0;
        if (this.hoveredPosition) {
          const dx = this.hoveredPosition.x - centerX;
          const dy = this.hoveredPosition.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          interactionFactor = Math.max(0, 1 - distance / (cellSize * 5)) * this.options.interactionStrength;
        }
        
        // Wave effect
        const waveEffect = Math.sin(this.wavePhase + (x + y) * 0.2) * 0.5 + 0.5;
        
        // Draw cell
        this.ctx.strokeStyle = interactionFactor > 0.1 ? colors.gridActive : colors.grid;
        this.ctx.lineWidth = 1 + waveEffect * 2 + interactionFactor * 3;
        
        this.ctx.beginPath();
        this.ctx.rect(
          x * cellSize, 
          y * cellSize, 
          cellSize, 
          cellSize
        );
        this.ctx.stroke();
        
        // Draw wave effect
        if (interactionFactor > 0.05 || waveEffect > 0.7) {
          this.ctx.fillStyle = colors.wave;
          this.ctx.beginPath();
          this.ctx.arc(
            centerX, 
            centerY, 
            cellSize / 4 * waveEffect * (1 + interactionFactor), 
            0, 
            Math.PI * 2
          );
          this.ctx.fill();
        }
      }
    }
  }
  
  updateParticles() {
    const colors = this.getColorScheme();
    
    this.particles.forEach(p => {
      // Update position
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off edges
      if (p.x < 0 || p.x > this.options.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.options.height) p.vy *= -1;
      
      // Apply quantum effects
      p.phase += this.options.waveSpeed;
      const phaseEffect = Math.sin(p.phase) * 0.5 + 0.5;
      
      // Draw particle
      this.ctx.fillStyle = colors.particle;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * (1 + phaseEffect), 0, Math.PI * 2);
      this.ctx.fill();
    });
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Clear canvas with semi-transparent background for trail effect
    this.ctx.fillStyle = this.getColorScheme().background;
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);
    
    // Update wave phase
    this.wavePhase += this.options.waveSpeed;
    
    // Draw grid
    this.drawGrid();
    
    // Update and draw particles
    this.updateParticles();
  }
}
