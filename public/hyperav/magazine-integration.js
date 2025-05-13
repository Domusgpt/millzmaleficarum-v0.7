/**
 * HyperAV Magazine Integration
 * Integrates HyperAV 4D visualization system with the digital magazine
 */

// Global state
let hyperav = {
  visualizer: null,
  soundInterface: null,
  container: null,
  isMiniMode: true,
  containerSelector: '#hyperav-container',
  initialized: false,
  sigils: {
    xi: [],    // Dimensional gateways
    omega: [], // Hypercubes
    active: [] // Currently active sigils
  },
  options: {
    autoInitialize: true,
    sigilMarkerDetect: true,
    backgroundEffects: true,
    colorScheme: 'vaporwave'
  }
};

// Color schemes
const COLOR_SCHEMES = {
  vaporwave: {
    primary: [1.0, 0.2, 0.8],   // FF33CC (Hot Pink)
    secondary: [0.2, 1.0, 1.0], // 33FFFF (Cyan)
    background: [0.05, 0.0, 0.2], // 0D0033 (Deep Purple)
    textPrimary: '#ff33cc',
    textSecondary: '#33ffff',
    glowColor: 'rgba(255, 51, 204, 0.5)',
    accentBg: 'rgba(13, 0, 51, 0.7)'
  },
  quantum: {
    primary: [0.0, 1.0, 0.0],   // 00FF00 (Green)
    secondary: [1.0, 1.0, 0.0], // FFFF00 (Yellow)
    background: [0.0, 0.0, 0.1], // 000019 (Very Dark Blue)
    textPrimary: '#00ff00',
    textSecondary: '#ffff00',
    glowColor: 'rgba(0, 255, 0, 0.5)',
    accentBg: 'rgba(0, 0, 25, 0.7)'
  },
  cyber: {
    primary: [1.0, 0.0, 0.4],   // FF0066 (Magenta)
    secondary: [0.0, 1.0, 1.0], // 00FFFF (Cyan)
    background: [0.0, 0.0, 0.0], // 000000 (Black)
    textPrimary: '#ff0066',
    textSecondary: '#00ffff',
    glowColor: 'rgba(0, 255, 255, 0.5)',
    accentBg: 'rgba(0, 0, 0, 0.7)'
  }
};

// Add CSS to the page
function addStyles() {
  // Create stylesheet
  const style = document.createElement('style');
  style.textContent = `
    /* HyperAV Container Styles */
    .hyperav-container {
      position: relative;
      width: 100%;
      max-width: 600px;
      height: 250px;
      margin: 20px auto;
      border-radius: 8px;
      box-shadow: 0 0 20px rgba(255, 51, 204, 0.25);
      overflow: hidden;
      transition: all 0.5s ease-in-out;
    }
    
    .hyperav-container.expanded {
      height: 400px;
      max-width: 800px;
    }
    
    /* Canvas styling */
    .hyperav-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    
    /* Controls */
    .hyperav-controls {
      position: absolute;
      right: 10px;
      bottom: 10px;
      display: flex;
      gap: 5px;
      z-index: 10;
    }
    
    .hyperav-btn {
      background-color: rgba(13, 0, 51, 0.7);
      color: #ff33cc;
      border: 1px solid #ff33cc;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-family: monospace;
      font-size: 14px;
      transition: all 0.3s ease;
      box-shadow: 0 0 10px rgba(255, 51, 204, 0.3);
    }
    
    .hyperav-btn:hover {
      background-color: rgba(255, 51, 204, 0.2);
      box-shadow: 0 0 15px rgba(255, 51, 204, 0.6);
    }
    
    /* Status indicator */
    .hyperav-status {
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 3px 8px;
      background-color: rgba(13, 0, 51, 0.7);
      color: #33ffff;
      border-radius: 12px;
      font-size: 10px;
      font-family: monospace;
      pointer-events: none;
      opacity: 0.6;
      transition: opacity 0.5s ease;
    }
    
    .hyperav-container:hover .hyperav-status {
      opacity: 1;
    }

    /* Background effect container */
    #hyperav-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -10;
      pointer-events: none;
      opacity: 0.15;
    }
    
    /* Sigil markers */
    .sigil-xi, .sigil-omega {
      display: inline-block;
      margin: 0 4px;
      font-weight: bold;
      cursor: pointer;
      position: relative;
      z-index: 5;
      text-decoration: none;
    }
    
    .sigil-xi {
      color: #ff33cc;
      text-shadow: 0 0 5px rgba(255, 51, 204, 0.7);
    }
    
    .sigil-omega {
      color: #33ffff;
      text-shadow: 0 0 5px rgba(51, 255, 255, 0.7);
    }
    
    /* Media queries for responsiveness */
    @media (max-width: 600px) {
      .hyperav-container {
        height: 200px;
      }
      
      .hyperav-container.expanded {
        height: 300px;
      }
    }
  `;
  
  // Add to head
  document.head.appendChild(style);
}

// Create UI elements
function createUI() {
  // Create main container if not found
  if (!document.querySelector(hyperav.containerSelector)) {
    // Add container after the first section
    const section = document.querySelector('.section');
    if (section) {
      const container = document.createElement('div');
      container.id = hyperav.containerSelector.substring(1);
      container.className = 'hyperav-container';
      section.parentNode.insertBefore(container, section.nextSibling);
      
      hyperav.container = container;
    } else {
      console.error('No suitable container found for HyperAV');
      return false;
    }
  } else {
    hyperav.container = document.querySelector(hyperav.containerSelector);
  }
  
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.className = 'hyperav-canvas';
  canvas.width = hyperav.container.clientWidth;
  canvas.height = hyperav.container.clientHeight;
  hyperav.container.appendChild(canvas);
  
  // Create controls
  const controls = document.createElement('div');
  controls.className = 'hyperav-controls';
  
  // Expand button
  const expandBtn = document.createElement('div');
  expandBtn.className = 'hyperav-btn';
  expandBtn.innerHTML = '⤢';
  expandBtn.title = 'Expand/Collapse';
  expandBtn.onclick = (e) => {
    e.stopPropagation();
    toggleVisualizerSize();
  };
  
  // Sound toggle button
  const soundBtn = document.createElement('div');
  soundBtn.className = 'hyperav-btn';
  soundBtn.innerHTML = '♫';
  soundBtn.title = 'Toggle sound reactivity';
  soundBtn.onclick = (e) => {
    e.stopPropagation();
    toggleSoundReactivity();
  };
  
  controls.appendChild(expandBtn);
  controls.appendChild(soundBtn);
  hyperav.container.appendChild(controls);
  
  // Status indicator
  const status = document.createElement('div');
  status.className = 'hyperav-status';
  status.textContent = 'HyperAV Initializing...';
  hyperav.container.appendChild(status);
  
  // Create background effect container if enabled
  if (hyperav.options.backgroundEffects) {
    const bgContainer = document.createElement('div');
    bgContainer.id = 'hyperav-background';
    document.body.appendChild(bgContainer);
    
    // Create canvas for background
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    bgContainer.appendChild(bgCanvas);
  }
  
  return canvas;
}

// Initialize HyperAV visualization
async function initializeHyperAV() {
  if (hyperav.initialized) return true;
  
  try {
    // Add styles
    addStyles();
    
    // Create UI and get canvas
    const canvas = createUI();
    if (!canvas) {
      console.error("Failed to create UI elements");
      return false;
    }
    
    // Set status
    updateStatus("Loading core modules...");
    
    // We need to create necessary geometry manager before initializing WebGL
    let geometryManager, projectionManager, shaderManager, soundInterface;

    // Create the basic managers
    try {
      // Create a canvas for WebGL context
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 100;
      tempCanvas.height = 100;
      const gl = tempCanvas.getContext('webgl');

      if (!gl) {
        throw new Error("WebGL not supported by browser");
      }

      // Create managers
      geometryManager = new GeometryManager();
      projectionManager = new ProjectionManager();

      // Use an alternative variable name to avoid conflicts
      let shaderMgr = new ShaderManager(gl, geometryManager, projectionManager);

      // Try to get SoundInterface
      soundInterface = window.SoundInterface ?
        new SoundInterface() :
        {
          initialize() { return false; },
          isInterfaceActive() { return false; },
          isMicrophoneActive() { return false; },
          pause() { },
          resume() { },
          processAudio(params) { return params; },
          getAnalysisData() { return { volume: 0, normalizedBands: { bass: 0, mid: 0, high: 0 } }; },
          dispose() { }
        };
    } catch (error) {
      console.warn("Initialization error:", error);
      // Create dummy implementations
      soundInterface = {
        initialize() { return false; },
        isInterfaceActive() { return false; },
        isMicrophoneActive() { return false; },
        pause() { },
        resume() { },
        processAudio(params) { return params; },
        getAnalysisData() { return { volume: 0, normalizedBands: { bass: 0, mid: 0, high: 0 } }; },
        dispose() { }
      };
    }
    
    // Get WebGL context
    const gl = canvas.getContext('webgl');
    if (!gl) {
      throw new Error("WebGL not supported by browser");
    }

    // Use existing managers or create new ones if needed
    if (!geometryManager) geometryManager = new GeometryManager();
    if (!projectionManager) projectionManager = new ProjectionManager();

    // Initialize ShaderManager with the canvas WebGL context
    shaderManager = new ShaderManager(gl, geometryManager, projectionManager);
    
    // Get default color scheme
    const colors = COLOR_SCHEMES[hyperav.options.colorScheme] || COLOR_SCHEMES.vaporwave;
    
    // Initialize visualizer
    hyperav.visualizer = new HypercubeCore(canvas, shaderManager, {
      colorScheme: {
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background
      },
      geometryType: 'hypercube',
      projectionMethod: 'perspective',
      lineThickness: 0.03,
      rotationSpeed: 0.15,
      patternIntensity: 0.8,
      callbacks: {
        onRender: (state) => onRenderFrame(state),
        onError: (error) => console.error("HyperAV Error:", error)
      }
    });
    
    // Initialize sound interface
    hyperav.soundInterface = new SoundInterface({
      onStatusUpdate: (message) => updateStatus(message),
      onReactivityChange: (state, message) => onReactivityChange(state, message),
      autoStart: false
    });
    
    // Start visualization
    hyperav.visualizer.start();
    updateStatus("Visualization active");
    
    // Set up background effects if enabled
    if (hyperav.options.backgroundEffects) {
      initializeBackgroundEffects();
    }
    
    // Set up interaction events
    setupInteractionEvents();
    
    // Detect sigil markers if enabled
    if (hyperav.options.sigilMarkerDetect) {
      detectSigilMarkers();
    }
    
    hyperav.initialized = true;
    return true;
  } catch (error) {
    console.error("HyperAV initialization error:", error);
    updateStatus("Init error: " + error.message);
    return false;
  }
}

// Update status message
function updateStatus(message) {
  const statusElem = document.querySelector('.hyperav-status');
  if (statusElem) {
    statusElem.textContent = message;
  }
  console.log("HyperAV:", message);
}

// Handle reactivity state changes
function onReactivityChange(state, message) {
  updateStatus(`Audio: ${state} - ${message}`);
  
  // Update button appearance
  const soundBtn = document.querySelector('.hyperav-controls .hyperav-btn:nth-child(2)');
  if (soundBtn) {
    if (state === 'microphone') {
      soundBtn.innerHTML = '♫';
      soundBtn.style.color = '#33ffff';
    } else if (state === 'simulation') {
      soundBtn.innerHTML = '♪';
      soundBtn.style.color = '#ff33cc';
    } else {
      soundBtn.innerHTML = '♫';
      soundBtn.style.color = '';
    }
  }
  
  // Update container styles
  const container = document.querySelector(hyperav.containerSelector);
  if (container) {
    if (state === 'microphone' || state === 'simulation') {
      container.style.boxShadow = '0 0 25px rgba(51, 255, 255, 0.5)';
    } else {
      container.style.boxShadow = '';
    }
  }
}

// Toggle the size of the visualizer
function toggleVisualizerSize() {
  const container = document.querySelector(hyperav.containerSelector);
  if (!container) return;
  
  container.classList.toggle('expanded');
  
  // Update button text
  const expandBtn = document.querySelector('.hyperav-controls .hyperav-btn:first-child');
  if (expandBtn) {
    expandBtn.innerHTML = container.classList.contains('expanded') ? '⤢' : '⤢';
  }
  
  // Update canvas size
  const canvas = container.querySelector('canvas');
  if (canvas) {
    setTimeout(() => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }, 500); // Wait for transition
  }
}

// Toggle sound reactivity
function toggleSoundReactivity() {
  if (!hyperav.soundInterface) return;
  
  if (hyperav.soundInterface.isInterfaceActive()) {
    // Currently active, deactivate
    hyperav.soundInterface.pause();
    updateStatus("Audio reactivity paused");
  } else {
    // Currently inactive, activate
    if (hyperav.soundInterface.isMicrophoneActive()) {
      hyperav.soundInterface.resume();
    } else {
      hyperav.soundInterface.initialize();
    }
  }
}

// Frame rendering callback
function onRenderFrame(state) {
  if (!hyperav.soundInterface) return;
  
  if (hyperav.soundInterface.isInterfaceActive()) {
    // Process audio into visualization parameters
    const audioParams = hyperav.soundInterface.processAudio({
      universeModifier: state.universeModifier,
      morphFactor: state.morphFactor,
      rotationSpeed: state.rotationSpeed,
      glitchIntensity: state.glitchIntensity,
      colorShift: state.colorShift
    });
    
    // Update visualization with audio-reactive parameters
    hyperav.visualizer.updateParameters({
      universeModifier: audioParams.universeModifier,
      morphFactor: audioParams.morphFactor,
      rotationSpeed: audioParams.rotationSpeed,
      glitchIntensity: audioParams.glitchIntensity,
      colorShift: audioParams.colorShift,
      audioLevels: {
        bass: hyperav.soundInterface.getAnalysisData().normalizedBands?.bass || 0,
        mid: hyperav.soundInterface.getAnalysisData().normalizedBands?.mid || 0,
        high: hyperav.soundInterface.getAnalysisData().normalizedBands?.high || 0
      }
    });
    
    // Update sigil animations if any are active
    if (hyperav.sigils.active.length > 0) {
      animateSigils();
    }
  }
}

// Set up event listeners for interactions
function setupInteractionEvents() {
  // Main canvas interactions
  const canvas = document.querySelector('.hyperav-canvas');
  if (canvas) {
    // Click to toggle sound reactivity
    canvas.addEventListener('click', (e) => {
      // Ignore if clicking on a control button
      if (e.target.classList.contains('hyperav-btn')) return;
      
      toggleSoundReactivity();
    });
    
    // Mouse/touch move to control parameters
    let isDragging = false;
    let lastX = 0, lastY = 0;
    
    // Pointer down
    canvas.addEventListener('pointerdown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    // Pointer move
    canvas.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - lastX;
      const deltaY = e.clientY - lastY;
      
      // Update parameters based on drag direction
      if (hyperav.visualizer) {
        // X-axis controls morphing
        const morphDelta = deltaX * 0.005;
        const currentMorph = hyperav.visualizer.state.morphFactor;
        hyperav.visualizer.updateParameters({
          morphFactor: Math.max(0, Math.min(1, currentMorph + morphDelta))
        });
        
        // Y-axis controls dimension
        const dimDelta = deltaY * 0.01;
        const currentDim = hyperav.visualizer.state.dimensions;
        hyperav.visualizer.updateParameters({
          dimensions: Math.max(3.0, Math.min(4.0, currentDim - dimDelta))
        });
      }
      
      lastX = e.clientX;
      lastY = e.clientY;
    });
    
    // Pointer up/cancel
    canvas.addEventListener('pointerup', () => {
      isDragging = false;
    });
    
    canvas.addEventListener('pointercancel', () => {
      isDragging = false;
    });
    
    // Pointer leave
    canvas.addEventListener('pointerleave', () => {
      isDragging = false;
    });
  }
  
  // Window resize
  window.addEventListener('resize', () => {
    // Resize main canvas
    const canvas = document.querySelector('.hyperav-canvas');
    const container = document.querySelector(hyperav.containerSelector);
    
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }
    
    // Resize background canvas
    if (hyperav.options.backgroundEffects) {
      const bgCanvas = document.querySelector('#hyperav-background canvas');
      if (bgCanvas) {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
      }
    }
  });
}

// Initialize background effects
function initializeBackgroundEffects() {
  // Get the background canvas
  const bgCanvas = document.querySelector('#hyperav-background canvas');
  if (!bgCanvas) return;
  
  const ctx = bgCanvas.getContext('2d');
  if (!ctx) return;
  
  // Set up background rendering
  let lastTime = 0;
  const particles = [];
  const particleCount = 50;
  
  // Create particles
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * bgCanvas.width,
      y: Math.random() * bgCanvas.height,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 0.5,
      speedY: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5 + 0.1
    });
  }
  
  // Animation loop
  function animateBackground(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear canvas
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    
    // Draw particles
    ctx.fillStyle = 'rgba(255, 51, 204, 0.5)';
    
    // Get audio data for reactivity if available
    let audioLevel = 0;
    if (hyperav.soundInterface && hyperav.soundInterface.isInterfaceActive()) {
      const analysisData = hyperav.soundInterface.getAnalysisData();
      audioLevel = analysisData.volume || 0;
    }
    
    // Update and draw particles
    particles.forEach(p => {
      // Update position
      p.x += p.speedX * (1 + audioLevel * 2);
      p.y += p.speedY * (1 + audioLevel * 2);
      
      // Wrap around edges
      if (p.x < 0) p.x = bgCanvas.width;
      if (p.x > bgCanvas.width) p.x = 0;
      if (p.y < 0) p.y = bgCanvas.height;
      if (p.y > bgCanvas.height) p.y = 0;
      
      // Draw with audio-reactive size
      const size = p.size * (1 + audioLevel * 3);
      
      // Set color based on current scheme
      const colors = COLOR_SCHEMES[hyperav.options.colorScheme] || COLOR_SCHEMES.vaporwave;
      ctx.fillStyle = `rgba(${colors.primary[0] * 255}, ${colors.primary[1] * 255}, ${colors.primary[2] * 255}, ${p.opacity})`;
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw some connecting lines
    ctx.strokeStyle = 'rgba(51, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only connect particles within proximity
        if (distance < 150) {
          const opacity = 0.1 * (1 - distance / 150);
          ctx.strokeStyle = `rgba(51, 255, 255, ${opacity})`;
          
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Continue animation loop
    requestAnimationFrame(animateBackground);
  }
  
  // Start the animation
  requestAnimationFrame(animateBackground);
}

// Detect sigil markers in content
function detectSigilMarkers() {
  const contentElements = document.querySelectorAll('.section-content');
  if (!contentElements.length) {
    console.warn("No section content elements found for sigil detection");
    return;
  }
  
  // Process each content section
  contentElements.forEach((content, index) => {
    const html = content.innerHTML;
    
    // Handle Xi sigil markers
    const xiRegex = /<sigil-Ξ>/g;
    if (xiRegex.test(html)) {
      const sigilId = `sigil-xi-${index}`;
      hyperav.sigils.xi.push(sigilId);
      
      // Replace marker with interactive element
      const newHtml = html.replace(xiRegex, `<span id="${sigilId}" class="sigil-xi">Ξ</span>`);
      content.innerHTML = newHtml;
      
      // Add click handler after HTML update
      setTimeout(() => {
        const sigilElem = document.getElementById(sigilId);
        if (sigilElem) {
          sigilElem.addEventListener('click', () => activateSigil(sigilId, 'xi'));
        }
      }, 100);
    }
    
    // Handle Omega sigil markers
    const omegaRegex = /<sigil-Ω>/g;
    if (omegaRegex.test(html)) {
      const sigilId = `sigil-omega-${index}`;
      hyperav.sigils.omega.push(sigilId);
      
      // Replace marker with interactive element
      const newHtml = content.innerHTML.replace(omegaRegex, `<span id="${sigilId}" class="sigil-omega">Ω</span>`);
      content.innerHTML = newHtml;
      
      // Add click handler after HTML update
      setTimeout(() => {
        const sigilElem = document.getElementById(sigilId);
        if (sigilElem) {
          sigilElem.addEventListener('click', () => activateSigil(sigilId, 'omega'));
        }
      }, 100);
    }
  });
  
  // Log detected sigils
  console.log(`Detected ${hyperav.sigils.xi.length} Xi sigils and ${hyperav.sigils.omega.length} Omega sigils`);
}

// Activate a sigil when clicked
function activateSigil(sigilId, type) {
  // Already active?
  if (hyperav.sigils.active.includes(sigilId)) {
    return;
  }
  
  // Add to active list
  hyperav.sigils.active.push(sigilId);
  
  // Get sigil element
  const sigilElem = document.getElementById(sigilId);
  if (!sigilElem) return;
  
  // Apply activation effect
  sigilElem.style.fontWeight = 'bold';
  
  // Update visualization based on sigil type
  if (type === 'xi') {
    // Dimensional gateway effect
    hyperav.visualizer.updateParameters({
      geometryType: 'hypersphere',
      projectionMethod: 'stereographic',
      rotationSpeed: 0.35,
      patternIntensity: 1.0,
      glitchIntensity: 0.2,
      colorShift: 0.5
    });
  } else if (type === 'omega') {
    // Hypercube effect
    hyperav.visualizer.updateParameters({
      geometryType: 'hypercube',
      projectionMethod: 'perspective',
      rotationSpeed: 0.4,
      patternIntensity: 0.7,
      colorShift: 0.7
    });
  }
  
  // Activate sound reactivity if not already active
  if (hyperav.soundInterface && !hyperav.soundInterface.isInterfaceActive()) {
    hyperav.soundInterface.initialize();
  }
  
  // Deactivate after a timeout
  setTimeout(() => {
    const index = hyperav.sigils.active.indexOf(sigilId);
    if (index !== -1) {
      hyperav.sigils.active.splice(index, 1);
      
      // Restore sigil appearance
      if (sigilElem) {
        sigilElem.style.fontWeight = '';
      }
      
      // Restore default visualization if all sigils inactive
      if (hyperav.sigils.active.length === 0) {
        hyperav.visualizer.updateParameters({
          geometryType: 'hypercube',
          projectionMethod: 'perspective',
          rotationSpeed: 0.15,
          patternIntensity: 0.8,
          glitchIntensity: 0.0,
          colorShift: 0.0
        });
      }
    }
  }, 10000); // 10 second activation
}

// Animate active sigils
function animateSigils() {
  if (!hyperav.soundInterface || !hyperav.soundInterface.isInterfaceActive()) return;
  
  // Get audio data
  const audioData = hyperav.soundInterface.getAnalysisData();
  if (!audioData) return;
  
  // Process each active sigil
  hyperav.sigils.active.forEach(sigilId => {
    const sigilElem = document.getElementById(sigilId);
    if (!sigilElem) return;
    
    // Apply audio-reactive effects
    const bass = audioData.normalizedBands?.bass || 0;
    const mid = audioData.normalizedBands?.mid || 0;
    const high = audioData.normalizedBands?.high || 0;
    
    // Scale based on bass
    const scale = 1 + bass * 0.5;
    sigilElem.style.transform = `scale(${scale})`;
    
    // Brightness based on mids
    const brightness = 100 + mid * 100;
    
    // Color shifting based on highs
    const hueShift = high * 30;
    
    if (sigilElem.classList.contains('sigil-xi')) {
      sigilElem.style.filter = `brightness(${brightness}%) hue-rotate(${hueShift}deg)`;
      sigilElem.style.textShadow = `0 0 ${5 + mid * 10}px rgba(255, 51, 204, ${0.7 + bass * 0.3})`;
    } else {
      sigilElem.style.filter = `brightness(${brightness}%) hue-rotate(${-hueShift}deg)`;
      sigilElem.style.textShadow = `0 0 ${5 + mid * 10}px rgba(51, 255, 255, ${0.7 + bass * 0.3})`;
    }
  });
}

// Update color scheme
function updateColorScheme(scheme) {
  if (!COLOR_SCHEMES[scheme]) {
    console.warn(`Color scheme '${scheme}' not found, using vaporwave`);
    scheme = 'vaporwave';
  }
  
  const colors = COLOR_SCHEMES[scheme];
  
  // Update visualizer colors
  if (hyperav.visualizer) {
    hyperav.visualizer.updateParameters({
      colorScheme: {
        primary: colors.primary,
        secondary: colors.secondary,
        background: colors.background
      }
    });
  }
  
  // Update UI colors
  document.documentElement.style.setProperty('--hyperav-primary', colors.textPrimary);
  document.documentElement.style.setProperty('--hyperav-secondary', colors.textSecondary);
  document.documentElement.style.setProperty('--hyperav-glow', colors.glowColor);
  document.documentElement.style.setProperty('--hyperav-bg', colors.accentBg);
  
  // Store setting
  hyperav.options.colorScheme = scheme;
}

// Cleanup resources
function cleanup() {
  if (hyperav.visualizer) {
    hyperav.visualizer.stop();
    hyperav.visualizer.dispose();
    hyperav.visualizer = null;
  }
  
  if (hyperav.soundInterface) {
    hyperav.soundInterface.dispose();
    hyperav.soundInterface = null;
  }
  
  hyperav.initialized = false;
}

// Auto-initialize after a slight delay to ensure DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (hyperav.options.autoInitialize) {
    setTimeout(() => {
      initializeHyperAV();
    }, 500);
  }
});

// Public API
window.HyperAV = {
  initialize: initializeHyperAV,
  cleanup: cleanup,
  updateColorScheme: updateColorScheme,
  toggleSoundReactivity: toggleSoundReactivity,
  toggleVisualizerSize: toggleVisualizerSize
};
