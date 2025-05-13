// Hypercube Visualization HyperAV Template
// Add this to your project to create a 4D hypercube visualization

class Hypercube {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = {
      size: options.size || 100,
      rotationSpeed4D: options.rotationSpeed4D || 0.003,
      projectionDistance: options.projectionDistance || 500,
      colorScheme: options.colorScheme || 'vaporwave',
      lineWidth: options.lineWidth || 2,
      ...options
    };
    
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.vertices4D = [];
    this.edges = [];
    this.projectedVertices = [];
    this.rotation4D = {
      xy: 0, xz: 0, xw: 0,
      yz: 0, yw: 0, zw: 0
    };
    
    this.initialize();
  }
  
  initialize() {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75, 
      this.container.clientWidth / this.container.clientHeight, 
      0.1, 
      1000
    );
    this.camera.position.z = 300;
    
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);
    
    // Create 4D hypercube vertices
    this.createHypercube();
    
    // Start animation loop
    this.animate();
  }
  
  createHypercube() {
    const s = this.options.size;
    
    // Generate 4D vertices (16 vertices for a hypercube)
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            this.vertices4D.push({
              x: x * s, y: y * s, z: z * s, w: w * s
            });
          }
        }
      }
    }
    
    // Define edges (connections between vertices)
    for (let i = 0; i < this.vertices4D.length; i++) {
      for (let j = i + 1; j < this.vertices4D.length; j++) {
        // Connect vertices that differ in exactly one coordinate
        let diffCount = 0;
        if (Math.abs(this.vertices4D[i].x - this.vertices4D[j].x) === 2 * s) diffCount++;
        if (Math.abs(this.vertices4D[i].y - this.vertices4D[j].y) === 2 * s) diffCount++;
        if (Math.abs(this.vertices4D[i].z - this.vertices4D[j].z) === 2 * s) diffCount++;
        if (Math.abs(this.vertices4D[i].w - this.vertices4D[j].w) === 2 * s) diffCount++;
        
        if (diffCount === 1) {
          this.edges.push([i, j]);
        }
      }
    }
    
    // Create materials and initialize projected vertices
    this.lineMaterial = new THREE.LineBasicMaterial({
      color: this.getColorScheme().lines,
      linewidth: this.options.lineWidth
    });
    
    this.projectedVertices = Array(this.vertices4D.length).fill().map(() => new THREE.Vector3());
  }
  
  project4DTo3D() {
    // Project 4D vertices to 3D based on current 4D rotation
    const cos = {
      xy: Math.cos(this.rotation4D.xy), xz: Math.cos(this.rotation4D.xz), 
      xw: Math.cos(this.rotation4D.xw), yz: Math.cos(this.rotation4D.yz),
      yw: Math.cos(this.rotation4D.yw), zw: Math.cos(this.rotation4D.zw)
    };
    
    const sin = {
      xy: Math.sin(this.rotation4D.xy), xz: Math.sin(this.rotation4D.xz),
      xw: Math.sin(this.rotation4D.xw), yz: Math.sin(this.rotation4D.yz),
      yw: Math.sin(this.rotation4D.yw), zw: Math.sin(this.rotation4D.zw)
    };
    
    for (let i = 0; i < this.vertices4D.length; i++) {
      const v = this.vertices4D[i];
      
      // Apply 4D rotations (6 rotational planes in 4D)
      let x = v.x, y = v.y, z = v.z, w = v.w;
      
      // XY rotation
      [x, y] = [
        x * cos.xy - y * sin.xy,
        x * sin.xy + y * cos.xy
      ];
      
      // XZ rotation
      [x, z] = [
        x * cos.xz - z * sin.xz,
        x * sin.xz + z * cos.xz
      ];
      
      // XW rotation
      [x, w] = [
        x * cos.xw - w * sin.xw,
        x * sin.xw + w * cos.xw
      ];
      
      // YZ rotation
      [y, z] = [
        y * cos.yz - z * sin.yz,
        y * sin.yz + z * cos.yz
      ];
      
      // YW rotation
      [y, w] = [
        y * cos.yw - w * sin.yw,
        y * sin.yw + w * cos.yw
      ];
      
      // ZW rotation
      [z, w] = [
        z * cos.zw - w * sin.zw,
        z * sin.zw + w * cos.zw
      ];
      
      // Project from 4D to 3D using perspective projection
      const d = this.options.projectionDistance;
      const factor = d / (d + w);
      
      this.projectedVertices[i].set(
        x * factor,
        y * factor,
        z * factor
      );
    }
  }
  
  getColorScheme() {
    const schemes = {
      vaporwave: {
        lines: 0xff71ce,
        background: 0x2d00f7
      },
      quantum: {
        lines: 0x00ff00,
        background: 0x000033
      },
      cyber: {
        lines: 0x00ffff,
        background: 0x000000
      }
    };
    
    return schemes[this.options.colorScheme] || schemes.vaporwave;
  }
  
  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update 4D rotation
    this.rotation4D.xy += this.options.rotationSpeed4D;
    this.rotation4D.xz += this.options.rotationSpeed4D * 0.7;
    this.rotation4D.xw += this.options.rotationSpeed4D * 1.3;
    this.rotation4D.yz += this.options.rotationSpeed4D * 0.9;
    this.rotation4D.yw += this.options.rotationSpeed4D * 1.1;
    this.rotation4D.zw += this.options.rotationSpeed4D * 0.8;
    
    // Project 4D vertices to 3D space
    this.project4DTo3D();
    
    // Clear previous frame
    this.scene.clear();
    
    // Draw edges
    for (const [i, j] of this.edges) {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        this.projectedVertices[i],
        this.projectedVertices[j]
      ]);
      const line = new THREE.Line(geometry, this.lineMaterial);
      this.scene.add(line);
    }
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
}
