/**
 * HyperAV Integration - Simplified 4D Visualizer for MillzMaleficarum Codex
 * This script provides a lightweight implementation of higher-dimensional visualization
 * as a background effect for the magazine interface
 */

class HyperAV {
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
      autoRotate: options.autoRotate !== undefined ? options.autoRotate : true
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
    // Project vertices from 4D to 2D
    const vertices2D = this.vertices4D.map(v => {
      const rotated = this.rotate4D(v);
      const projected3D = this.project4Dto3D(rotated);
      return this.project3Dto2D(projected3D);
    });
    
    // Create gradient based on options
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, this.options.color1);
    gradient.addColorStop(1, this.options.color2);
    
    // Set global alpha
    this.ctx.globalAlpha = this.options.opacity;
    
    // Draw edges
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = gradient;
    this.ctx.beginPath();
    
    for (const [i, j] of this.edges) {
      const [x1, y1] = vertices2D[i];
      const [x2, y2] = vertices2D[j];
      
      // Calculate edge alpha based on 4D position
      const w1 = this.vertices4D[i][3];
      const w2 = this.vertices4D[j][3];
      const edgeAlpha = Math.min(1, Math.max(0.1, (w1 + w2 + 2) / 4));
      
      // Draw the edge
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }
    
    this.ctx.stroke();
    
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

// Initialize HyperAV when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with default settings, will be updated from JSON data
  window.hyperAV = new HyperAV('hyperav-background', {
    opacity: 0.3
  });
});