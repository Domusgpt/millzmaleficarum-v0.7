/**
 * HyperAV Core Module - 4D Visualization Engine
 * Provides a lightweight implementation of higher-dimensional visualization
 * as a background effect for the magazine interface
 */

export default class HyperAV {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error('HyperAV: Container element not found');
      return;
    }

    this.options = {
      pattern: options.pattern || 'tesseract',
      color1: options.color1 || '#00ffcc',
      color2: options.color2 || '#ff33cc',
      speed: options.speed || 0.03,
      opacity: options.opacity || 0.4,
      autoRotate: options.autoRotate !== undefined ? options.autoRotate : true,
      complexity: options.complexity || 1.0,
      intensity: options.intensity || 0.5,
      distortion: options.distortion || 0.0,
      shaderMode: options.shaderMode || 'standard'
    };

    this.initialize();
  }

  initialize() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'hyperav-canvas';
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    // Set canvas size
    this.resize();
    
    // Create resize listener
    window.addEventListener('resize', () => this.resize());
    
    // Initialize 4D vertices and edges based on pattern
    this.initializeGeometry();
    
    // Start animation loop
    this.lastTime = 0;
    this.rotationMatrix = this.createRotationMatrix();
    requestAnimationFrame(time => this.animate(time));
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.centerX = rect.width / 2;
    this.centerY = rect.height / 2;
    this.scale = Math.min(rect.width, rect.height) / 4;
  }

  initializeGeometry() {
    switch (this.options.pattern) {
      case 'tesseract':
        this.createTesseract();
        break;
      case 'hypertetrahedra':
        this.createHyperTetrahedron();
        break;
      case 'tesseract_fold':
        this.createTesseractFold();
        break;
      default:
        this.createTesseract();
    }
  }

  createTesseract() {
    // 4D vertices of a tesseract
    this.vertices4D = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            this.vertices4D.push([x, y, z, w]);
          }
        }
      }
    }

    // Generate edges connecting vertices that differ in exactly one coordinate
    this.edges = [];
    for (let i = 0; i < this.vertices4D.length; i++) {
      for (let j = i + 1; j < this.vertices4D.length; j++) {
        let diffCount = 0;
        for (let k = 0; k < 4; k++) {
          if (this.vertices4D[i][k] !== this.vertices4D[j][k]) {
            diffCount++;
          }
        }
        if (diffCount === 1) {
          this.edges.push([i, j]);
        }
      }
    }
  }

  createHyperTetrahedron() {
    // 5-cell (5-vertex 4D simplex)
    this.vertices4D = [
      [0, 0, 0, -1],
      [1, 1, 1, 1],
      [1, -1, -1, 1],
      [-1, 1, -1, 1],
      [-1, -1, 1, 1]
    ];
    
    // Connect all vertices to each other (complete graph)
    this.edges = [];
    for (let i = 0; i < this.vertices4D.length; i++) {
      for (let j = i + 1; j < this.vertices4D.length; j++) {
        this.edges.push([i, j]);
      }
    }
  }

  createTesseractFold() {
    // Tesseract in a folded state (more complex visualization)
    this.vertices4D = [];
    
    // Create 16 vertices of a tesseract with variable 4D positioning
    let factor = 0.7;
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            // Warp the 4D coordinates for a "folded" effect
            let wx = x * (1 + factor * w * 0.2);
            let wy = y * (1 + factor * w * 0.2);
            let wz = z * (1 + factor * w * 0.2);
            this.vertices4D.push([wx, wy, wz, w]);
          }
        }
      }
    }
    
    // Same edge connectivity as tesseract
    this.edges = [];
    for (let i = 0; i < this.vertices4D.length; i++) {
      for (let j = i + 1; j < this.vertices4D.length; j++) {
        let diffCount = 0;
        let baseDiffCount = 0;
        
        // Check the base coordinates
        for (let k = 0; k < 4; k++) {
          const v1 = this.vertices4D[i][k];
          const v2 = this.vertices4D[j][k];
          
          if (Math.abs(v1 - v2) > 0.1) {
            diffCount++;
          }
          
          // Special rule for fourth dimension
          if (k === 3 && Math.abs(v1 - v2) > 1.5) {
            baseDiffCount++;
          }
        }
        
        if (diffCount === 1 || baseDiffCount === 1) {
          this.edges.push([i, j]);
        }
      }
    }
  }

  createRotationMatrix() {
    // Initialize 6 rotation angles (one for each plane in 4D)
    return {
      xy: 0,
      xz: 0,
      xw: 0,
      yz: 0,
      yw: 0,
      zw: 0
    };
  }

  rotate4D(vertex) {
    const [x, y, z, w] = vertex;
    const { xy, xz, xw, yz, yw, zw } = this.rotationMatrix;
    
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

  project4Dto3D(vertex) {
    // Simple perspective projection from 4D to 3D
    const [x, y, z, w] = vertex;
    const distance = 5;
    const w_factor = 1 / (distance - w);
    
    return [
      x * w_factor,
      y * w_factor,
      z * w_factor
    ];
  }

  project3Dto2D(vertex) {
    // Simple perspective projection from 3D to 2D
    const [x, y, z] = vertex;
    const distance = 5;
    const z_factor = 1 / (distance - z);
    
    return [
      x * z_factor * this.scale + this.centerX,
      y * z_factor * this.scale + this.centerY
    ];
  }

  animate(time) {
    const dt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    
    // Update rotation angles
    if (this.options.autoRotate) {
      this.rotationMatrix.xy += this.options.speed * 0.3 * dt;
      this.rotationMatrix.xz += this.options.speed * 0.2 * dt;
      this.rotationMatrix.xw += this.options.speed * 0.7 * dt;
      this.rotationMatrix.yz += this.options.speed * 0.4 * dt;
      this.rotationMatrix.yw += this.options.speed * 0.5 * dt;
      this.rotationMatrix.zw += this.options.speed * 0.6 * dt;
    }
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw edges
    this.drawEdges();
    
    // Continue animation loop
    requestAnimationFrame(time => this.animate(time));
  }

  drawEdges() {
    // Apply distortion effect if enabled
    const distortion = this.options.distortion;
    
    // Project vertices from 4D to 2D
    const vertices2D = this.vertices4D.map(v => {
      // Apply distortion to the vertex if distortion is enabled
      let rotated = this.rotate4D(v);
      
      if (distortion > 0) {
        // Add non-linear distortion to the rotated coordinates
        rotated = rotated.map((coord, i) => {
          const noise = Math.sin(coord * 5 + this.rotationMatrix.xy * 3) * distortion * 0.3;
          return coord + noise;
        });
      }
      
      const projected3D = this.project4Dto3D(rotated);
      return this.project3Dto2D(projected3D);
    });
    
    // Create gradient based on options
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, this.options.color1);
    gradient.addColorStop(1, this.options.color2);
    
    // Set global alpha
    this.ctx.globalAlpha = this.options.opacity;
    
    // Draw edges with intensity and complexity scaling
    this.ctx.lineWidth = 2 * this.options.intensity;
    this.ctx.strokeStyle = gradient;
    this.ctx.beginPath();
    
    for (const [i, j] of this.edges) {
      const [x1, y1] = vertices2D[i];
      const [x2, y2] = vertices2D[j];
      
      // Calculate edge alpha based on 4D position
      const w1 = this.vertices4D[i][3];
      const w2 = this.vertices4D[j][3];
      const edgeAlpha = Math.min(1, Math.max(0.1, (w1 + w2 + 2) / 4));
      
      // Apply intensity and complexity modifiers
      const edgeVisibility = edgeAlpha * this.options.intensity;
      
      // Skip some edges for reduced complexity if complexity is low
      if (this.options.complexity < 1.0 && Math.random() > this.options.complexity) {
        continue;
      }
      
      // Apply edge distortion if in hyperdimensional_rift mode
      if (this.options.shaderMode === 'hyperdimensional_rift') {
        // Create bezier curve instead of straight line for distortion effect
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        
        // Calculate displacement for control points
        const displacement = 30 * this.options.distortion;
        const angle = Math.atan2(y2 - y1, x2 - x1) + Math.PI/2;
        const dx = Math.cos(angle) * displacement;
        const dy = Math.sin(angle) * displacement;
        
        // Add oscillation based on time
        const timeFactor = this.rotationMatrix.xy * 10;
        const oscFactor = Math.sin(timeFactor + (i + j) * 0.5) * displacement;
        
        // Draw bezier curve
        this.ctx.moveTo(x1, y1);
        this.ctx.bezierCurveTo(
          midX + dx + oscFactor, midY + dy + oscFactor,
          midX - dx - oscFactor, midY - dy - oscFactor,
          x2, y2
        );
      } else {
        // Draw normal straight line
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
      }
    }
    
    this.ctx.stroke();
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
    
    // Add additional visualization effects based on shaderMode
    if (this.options.shaderMode === 'hyperdimensional_rift') {
      this._applyRiftEffect(vertices2D);
    }
  }
  
  _applyRiftEffect(vertices2D) {
    // Create a central dimensional rift effect
    const intensity = this.options.intensity;
    
    // Create a radial gradient for the rift
    const gradient = this.ctx.createRadialGradient(
      this.centerX, this.centerY, 0,
      this.centerX, this.centerY, this.scale * 2
    );
    
    // Use the main colors with transparency
    gradient.addColorStop(0, `${this.options.color1}80`);
    gradient.addColorStop(0.5, `${this.options.color2}40`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.globalAlpha = 0.3 * intensity;
    
    // Draw the rift as a series of concentric distorted circles
    const rifts = 5;
    const time = this.rotationMatrix.xy * 10;
    
    for (let r = 0; r < rifts; r++) {
      const radius = (r + 1) * this.scale * 0.3 * intensity;
      const segments = 36;
      
      this.ctx.beginPath();
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        
        // Calculate distortion
        const distortionFactor = this.options.distortion * 0.5;
        const distortion = Math.sin(angle * 3 + time + r) * radius * distortionFactor;
        
        // Add point on distorted circle
        const x = this.centerX + Math.cos(angle) * (radius + distortion);
        const y = this.centerY + Math.sin(angle) * (radius + distortion);
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.closePath();
      this.ctx.fill();
    }
    
    // Reset global alpha
    this.ctx.globalAlpha = 1;
  }

  // Public API to update options
  updateOptions(options) {
    this.options = { ...this.options, ...options };
    if (options.pattern) {
      this.initializeGeometry();
    }
  }
}