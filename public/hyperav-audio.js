/**
 * MillzMaleficarum Codex v0.4
 * HyperAV Audio Reactivity Module
 * Connects audio analysis to visual elements for synchronized audio-visual experience
 */

class HyperAVAudio {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      audioSrc: options.audioSrc || null,
      hyperAVInstance: options.hyperAVInstance || (window.hyperAV || null),
      autoplayOnInteraction: options.autoplayOnInteraction !== false,
      ambientMode: options.ambientMode !== false,
      frequencyBands: options.frequencyBands || 32,
      reactivityIntensity: options.reactivityIntensity || 0.7,
      visualFeedback: options.visualFeedback !== false,
      enableMicrophoneInput: options.enableMicrophoneInput || false,
      debugMode: options.debugMode || false
    };

    // State
    this.state = {
      audioContext: null,
      analyser: null,
      audioSource: null,
      audioBuffer: null,
      gainNode: null,
      audioData: null,
      frequencyData: null,
      microphoneSource: null,
      microphoneActive: false,
      isPlaying: false,
      isPaused: false,
      hasInteracted: false,
      loadPromise: null,
      visualizerElements: [],
      animationFrameId: null,
      startTime: 0,
      currentSong: null,
      ambientSounds: [
        { name: 'quantum_hum', volume: 0.3 },
        { name: 'void_whispers', volume: 0.2 },
        { name: 'dimensional_drift', volume: 0.25 }
      ]
    };

    // UI Elements
    this.ui = {
      container: null,
      visualizer: null,
      controls: null,
      playButton: null,
      volumeSlider: null,
      audioFeedback: null
    };

    // Mappings for audio parameters to visual properties
    this.mappings = {
      bass: {
        range: [20, 200],
        properties: ['intensity', 'pulseSpeed', 'scale'],
        influence: 0.8
      },
      mid: {
        range: [200, 2000],
        properties: ['rotation', 'colorShift', 'complexity'],
        influence: 0.6
      },
      high: {
        range: [2000, 16000],
        properties: ['brightness', 'particleSpeed', 'noiseAmount'],
        influence: 0.4
      }
    };

    // Initialize
    this._initialize();
  }

  /**
   * Initialize the audio analysis system
   */
  _initialize() {
    try {
      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.state.audioContext = new AudioContext();
      
      // Create analyzer node
      this.state.analyser = this.state.audioContext.createAnalyser();
      this.state.analyser.fftSize = this.config.frequencyBands * 2;
      this.state.analyser.smoothingTimeConstant = 0.85;
      
      // Create gain node for volume control
      this.state.gainNode = this.state.audioContext.createGain();
      this.state.gainNode.gain.value = 0.5; // Default volume
      
      // Connect nodes
      this.state.analyser.connect(this.state.gainNode);
      this.state.gainNode.connect(this.state.audioContext.destination);
      
      // Prepare data arrays
      this.state.frequencyData = new Uint8Array(this.state.analyser.frequencyBinCount);
      this.state.audioData = new Uint8Array(this.state.analyser.frequencyBinCount);
      
      // Set up user interface if visual feedback is enabled
      if (this.config.visualFeedback) {
        this._setupUI();
      }
      
      // Auto-load audio if source is provided
      if (this.config.audioSrc) {
        this.loadAudio(this.config.audioSrc);
      } else if (this.config.ambientMode) {
        this._setupAmbientSounds();
      }
      
      // Set up event listeners
      this._setupEventListeners();
      
      // Start the analysis loop
      this._startAnalysis();
      
      console.log('HyperAV Audio: Initialized with ' + this.state.analyser.frequencyBinCount + ' frequency bands');
    } catch (error) {
      console.error('HyperAV Audio: Failed to initialize', error);
    }
  }

  /**
   * Set up ambient audio system
   */
  _setupAmbientSounds() {
    // Load ambient sound samples
    Promise.all(
      this.state.ambientSounds.map(sound => 
        this._loadAmbientSound(`/audio/${sound.name}.mp3`, sound.volume)
      )
    ).then(buffers => {
      if (this.config.debugMode) {
        console.log('HyperAV Audio: Ambient sounds loaded');
      }
      
      // Start ambient audio on first user interaction
      if (this.config.autoplayOnInteraction) {
        const startAmbient = () => {
          if (!this.state.isPlaying) {
            this._playAmbientSounds();
            document.removeEventListener('click', startAmbient);
          }
        };
        
        document.addEventListener('click', startAmbient);
      }
    }).catch(error => {
      console.error('HyperAV Audio: Failed to load ambient sounds', error);
    });
  }

  /**
   * Load an ambient sound
   */
  _loadAmbientSound(url, volume = 0.5) {
    return fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => this.state.audioContext.decodeAudioData(buffer))
      .then(audioBuffer => {
        return { buffer: audioBuffer, volume };
      });
  }

  /**
   * Play ambient sounds together
   */
  _playAmbientSounds() {
    if (!this.state.ambientSounds || this.state.isPlaying) return;
    
    this.state.isPlaying = true;
    this.state.ambientSounds.forEach(sound => {
      if (!sound.buffer) return;
      
      // Create source for this sound
      const source = this.state.audioContext.createBufferSource();
      source.buffer = sound.buffer;
      source.loop = true;
      
      // Create gain node for this sound
      const gainNode = this.state.audioContext.createGain();
      gainNode.gain.value = sound.volume;
      
      // Connect
      source.connect(gainNode);
      gainNode.connect(this.state.analyser);
      
      // Start with a random offset for more organic feel
      const offset = Math.random() * source.buffer.duration / 3;
      source.start(0, offset);
      
      // Store reference
      sound.source = source;
      sound.gain = gainNode;
    });
  }

  /**
   * Create UI elements for audio visualization and control
   */
  _setupUI() {
    // Create container for audio UI
    this.ui.container = document.createElement('div');
    this.ui.container.className = 'hyperav-audio-ui';
    document.body.appendChild(this.ui.container);
    
    // Create audio visualizer element
    this.ui.visualizer = document.createElement('div');
    this.ui.visualizer.className = 'audio-visualizer';
    this.ui.container.appendChild(this.ui.visualizer);
    
    // Create bars for frequency visualization
    const barCount = 32;
    for (let i = 0; i < barCount; i++) {
      const bar = document.createElement('div');
      bar.className = 'visualizer-bar';
      this.ui.visualizer.appendChild(bar);
      this.state.visualizerElements.push(bar);
    }
    
    // Create audio controls
    this.ui.controls = document.createElement('div');
    this.ui.controls.className = 'audio-controls';
    this.ui.container.appendChild(this.ui.controls);
    
    // Create play button
    this.ui.playButton = document.createElement('button');
    this.ui.playButton.className = 'audio-play-button';
    this.ui.playButton.textContent = '▶';
    this.ui.playButton.addEventListener('click', this._togglePlayback.bind(this));
    this.ui.controls.appendChild(this.ui.playButton);
    
    // Create volume slider
    this.ui.volumeSlider = document.createElement('input');
    this.ui.volumeSlider.type = 'range';
    this.ui.volumeSlider.min = 0;
    this.ui.volumeSlider.max = 100;
    this.ui.volumeSlider.value = 50;
    this.ui.volumeSlider.className = 'audio-volume-slider';
    this.ui.volumeSlider.addEventListener('input', e => {
      const volume = parseInt(e.target.value, 10) / 100;
      this.setVolume(volume);
    });
    this.ui.controls.appendChild(this.ui.volumeSlider);
    
    // Create microphone button if enabled
    if (this.config.enableMicrophoneInput) {
      const micButton = document.createElement('button');
      micButton.className = 'audio-mic-button';
      micButton.textContent = '🎤';
      micButton.addEventListener('click', this._toggleMicrophone.bind(this));
      this.ui.controls.appendChild(micButton);
    }
    
    // Create audio feedback display
    this.ui.audioFeedback = document.createElement('div');
    this.ui.audioFeedback.className = 'audio-feedback';
    this.ui.audioFeedback.innerHTML = `
      <div class="feedback-value bass">Bass: <span>0</span></div>
      <div class="feedback-value mid">Mid: <span>0</span></div>
      <div class="feedback-value high">High: <span>0</span></div>
    `;
    this.ui.container.appendChild(this.ui.audioFeedback);
    
    // Initially hide the UI until audio is loaded
    this.ui.container.classList.add('hidden');
  }

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    // Auto-resume audio context on user interaction
    const resumeAudioContext = () => {
      if (this.state.audioContext && this.state.audioContext.state === 'suspended') {
        this.state.audioContext.resume();
      }
      
      if (!this.state.hasInteracted) {
        this.state.hasInteracted = true;
        
        // Start audio if autoplay is enabled
        if (this.config.autoplayOnInteraction && this.state.audioBuffer) {
          this.play();
        }
      }
      
      document.removeEventListener('click', resumeAudioContext);
    };
    
    document.addEventListener('click', resumeAudioContext);
    
    // Connect to resize for visualizer scaling
    window.addEventListener('resize', this._updateVisualizerSize.bind(this));
  }

  /**
   * Update the size of the visualizer
   */
  _updateVisualizerSize() {
    if (!this.ui.visualizer) return;
    
    // Adjust visualizer dimensions based on container
    const containerRect = this.ui.container.getBoundingClientRect();
    this.ui.visualizer.style.width = `${containerRect.width}px`;
    this.ui.visualizer.style.height = `${containerRect.height * 0.6}px`;
  }

  /**
   * Toggle microphone input
   */
  async _toggleMicrophone() {
    if (this.state.microphoneActive) {
      // Disconnect mic
      if (this.state.microphoneSource) {
        this.state.microphoneSource.disconnect();
        this.state.microphoneSource = null;
      }
      
      this.state.microphoneActive = false;
      
      // Resume regular audio if it was playing
      if (this.state.isPaused) {
        this.play();
      }
    } else {
      try {
        // Stop current audio
        if (this.state.isPlaying) {
          this.pause();
          this.state.isPaused = true;
        }
        
        // Get microphone access
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Create source from microphone input
        this.state.microphoneSource = this.state.audioContext.createMediaStreamSource(stream);
        this.state.microphoneSource.connect(this.state.analyser);
        
        this.state.microphoneActive = true;
        
        if (this.config.debugMode) {
          console.log('HyperAV Audio: Microphone input active');
        }
      } catch (error) {
        console.error('HyperAV Audio: Failed to access microphone', error);
      }
    }
  }

  /**
   * Toggle audio playback
   */
  _togglePlayback() {
    if (this.state.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Start the audio analysis loop
   */
  _startAnalysis() {
    const analyzeAudio = () => {
      // Get frequency data
      this.state.analyser.getByteFrequencyData(this.state.frequencyData);
      this.state.analyser.getByteTimeDomainData(this.state.audioData);
      
      // Extract frequency bands
      const bands = this._extractFrequencyBands();
      
      // Update the audio visualizer
      if (this.config.visualFeedback) {
        this._updateVisualizer(bands);
      }
      
      // Apply to connected HyperAV
      if (this.config.hyperAVInstance) {
        this._updateHyperAV(bands);
      }
      
      // Continue loop
      this.state.animationFrameId = requestAnimationFrame(analyzeAudio);
    };
    
    // Start the loop
    this.state.animationFrameId = requestAnimationFrame(analyzeAudio);
  }

  /**
   * Extract frequency bands from the frequency data
   */
  _extractFrequencyBands() {
    const frequencyData = this.state.frequencyData;
    const binCount = frequencyData.length;
    
    // Define frequency ranges (approximate for 48kHz sample rate)
    const bassRange = [0, Math.floor(binCount * 0.10)]; // ~0-200Hz
    const midRange = [Math.ceil(binCount * 0.10), Math.floor(binCount * 0.5)]; // ~200-2000Hz
    const highRange = [Math.ceil(binCount * 0.5), binCount - 1]; // ~2000Hz+
    
    // Calculate average values for each range
    const bass = this._calculateRangeAverage(frequencyData, bassRange[0], bassRange[1]);
    const mid = this._calculateRangeAverage(frequencyData, midRange[0], midRange[1]);
    const high = this._calculateRangeAverage(frequencyData, highRange[0], highRange[1]);
    
    // Calculate overall energy
    const overall = (bass + mid + high) / 3;
    
    // Normalized values (0-1)
    return {
      bass: bass / 255,
      mid: mid / 255,
      high: high / 255,
      overall: overall / 255
    };
  }

  /**
   * Calculate average value for a range of frequency data
   */
  _calculateRangeAverage(data, start, end) {
    let sum = 0;
    for (let i = start; i <= end; i++) {
      sum += data[i];
    }
    return sum / (end - start + 1);
  }

  /**
   * Update the audio visualizer with current frequency data
   */
  _updateVisualizer(bands) {
    if (!this.ui.visualizer || !this.state.visualizerElements.length) return;
    
    // Update each bar
    const barCount = this.state.visualizerElements.length;
    
    for (let i = 0; i < barCount; i++) {
      const bar = this.state.visualizerElements[i];
      let value;
      
      // Different frequency distribution across the bars
      if (i < barCount * 0.2) {
        // Bass frequencies (first 20%)
        value = bands.bass * (0.7 + Math.random() * 0.3); // Add some randomness
      } else if (i < barCount * 0.7) {
        // Mid frequencies (next 50%)
        value = bands.mid * (0.7 + Math.random() * 0.3);
      } else {
        // High frequencies (last 30%)
        value = bands.high * (0.7 + Math.random() * 0.3);
      }
      
      // Apply height
      bar.style.height = `${value * 100}%`;
      
      // Apply color based on frequency band
      const hue = 180 + (120 * value); // From cyan to purple
      const saturation = 60 + (40 * value); // More colorful with higher values
      const lightness = 40 + (20 * value); // Brighter with higher values
      
      bar.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      bar.style.opacity = 0.3 + (value * 0.7);
    }
    
    // Update audio feedback display
    if (this.ui.audioFeedback) {
      this.ui.audioFeedback.querySelector('.bass span').textContent = Math.round(bands.bass * 100);
      this.ui.audioFeedback.querySelector('.mid span').textContent = Math.round(bands.mid * 100);
      this.ui.audioFeedback.querySelector('.high span').textContent = Math.round(bands.high * 100);
    }
  }

  /**
   * Update HyperAV visualization based on audio analysis
   */
  _updateHyperAV(bands) {
    const hyperAV = this.config.hyperAVInstance;
    if (!hyperAV || !hyperAV.updateOptions) return;
    
    // Create options object based on audio bands
    const options = {};
    
    // Apply mappings to convert audio bands to visual properties
    
    // Bass influences intensity and scale
    options.intensity = 0.5 + (bands.bass * 0.5 * this.mappings.bass.influence * this.config.reactivityIntensity);
    options.scale = 1 + (bands.bass * 0.3 * this.mappings.bass.influence * this.config.reactivityIntensity);
    
    // Mid influences rotation and complexity
    options.rotation = bands.mid * this.mappings.mid.influence * this.config.reactivityIntensity;
    options.complexity = 0.4 + (bands.mid * 0.6 * this.mappings.mid.influence * this.config.reactivityIntensity);
    
    // High frequencies influence noise and particle speed
    options.noiseAmount = bands.high * this.mappings.high.influence * this.config.reactivityIntensity;
    options.speed = 0.02 + (bands.overall * 0.08 * this.config.reactivityIntensity);
    
    // Color shifts based on a combination
    const hueShift = (bands.mid * 50) + (bands.high * 30);
    const colorIntensity = 0.5 + (bands.overall * 0.5);
    
    // Apply color shift based on a cyan to magenta spectrum
    const hue1 = 180 + hueShift; // Cyan base, shifting toward blue/purple
    const hue2 = 300 - hueShift; // Magenta base, shifting toward purple/blue
    
    options.color1 = `hsl(${hue1}, 80%, ${50 + (bands.bass * 20)}%)`;
    options.color2 = `hsl(${hue2}, 80%, ${50 + (bands.high * 20)}%)`;
    
    // Apply the updates
    hyperAV.updateOptions(options);
    
    if (this.config.debugMode && Math.random() < 0.01) {
      console.log('HyperAV Audio: Applied audio-reactive updates', options);
    }
  }

  /**
   * Load audio from the specified URL
   */
  loadAudio(url) {
    if (this.state.loadPromise) {
      return this.state.loadPromise;
    }
    
    // Show loading state in UI
    if (this.ui.container) {
      this.ui.container.classList.add('loading');
    }
    
    this.state.loadPromise = fetch(url)
      .then(response => response.arrayBuffer())
      .then(buffer => this.state.audioContext.decodeAudioData(buffer))
      .then(audioBuffer => {
        this.state.audioBuffer = audioBuffer;
        this.state.currentSong = url;
        
        if (this.config.debugMode) {
          console.log(`HyperAV Audio: Loaded audio (${Math.round(audioBuffer.duration)}s)`);
        }
        
        // Show UI now that audio is loaded
        if (this.ui.container) {
          this.ui.container.classList.remove('hidden');
          this.ui.container.classList.remove('loading');
        }
        
        // Auto-play if interaction happened
        if (this.config.autoplayOnInteraction && this.state.hasInteracted) {
          this.play();
        }
        
        return audioBuffer;
      })
      .catch(error => {
        console.error('HyperAV Audio: Failed to load audio', error);
        if (this.ui.container) {
          this.ui.container.classList.remove('loading');
        }
        throw error;
      })
      .finally(() => {
        this.state.loadPromise = null;
      });
    
    return this.state.loadPromise;
  }

  /**
   * Play the loaded audio buffer
   */
  play() {
    if (!this.state.audioBuffer || this.state.isPlaying) return;
    
    // Create new audio source
    this.state.audioSource = this.state.audioContext.createBufferSource();
    this.state.audioSource.buffer = this.state.audioBuffer;
    this.state.audioSource.loop = true;
    
    // Connect the audio source
    this.state.audioSource.connect(this.state.analyser);
    
    // Start playback
    this.state.audioSource.start(0);
    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.startTime = this.state.audioContext.currentTime;
    
    // Update UI
    if (this.ui.playButton) {
      this.ui.playButton.textContent = '❚❚';
    }
    
    if (this.config.debugMode) {
      console.log('HyperAV Audio: Playback started');
    }
  }

  /**
   * Pause audio playback
   */
  pause() {
    if (!this.state.isPlaying) return;
    
    // Stop the audio source
    if (this.state.audioSource) {
      this.state.audioSource.stop();
      this.state.audioSource = null;
    }
    
    this.state.isPlaying = false;
    this.state.isPaused = true;
    
    // Update UI
    if (this.ui.playButton) {
      this.ui.playButton.textContent = '▶';
    }
    
    if (this.config.debugMode) {
      console.log('HyperAV Audio: Playback paused');
    }
  }

  /**
   * Set the audio volume
   */
  setVolume(volume) {
    if (!this.state.gainNode) return;
    
    // Clamp volume between 0 and 1
    volume = Math.max(0, Math.min(1, volume));
    
    // Apply to gain node
    this.state.gainNode.gain.value = volume;
    
    if (this.config.debugMode) {
      console.log(`HyperAV Audio: Volume set to ${Math.round(volume * 100)}%`);
    }
  }

  /**
   * Generate synthetic audio based on a pattern
   */
  generateSyntheticAudio(pattern = 'quantum_pulse', duration = 60) {
    // Create an offline audio context to generate the buffer
    const offlineCtx = new OfflineAudioContext(2, this.state.audioContext.sampleRate * duration, this.state.audioContext.sampleRate);
    
    // Create oscillators and effects based on the pattern
    switch (pattern) {
      case 'quantum_pulse':
        this._generateQuantumPulse(offlineCtx, duration);
        break;
      case 'void_hum':
        this._generateVoidHum(offlineCtx, duration);
        break;
      case 'dimensional_rift':
        this._generateDimensionalRift(offlineCtx, duration);
        break;
      default:
        this._generateAmbientDrone(offlineCtx, duration);
    }
    
    // Render the audio
    return offlineCtx.startRendering().then(buffer => {
      // Store the rendered buffer
      this.state.audioBuffer = buffer;
      
      if (this.config.debugMode) {
        console.log(`HyperAV Audio: Generated synthetic audio (${pattern}, ${duration}s)`);
      }
      
      // Show UI
      if (this.ui.container) {
        this.ui.container.classList.remove('hidden');
      }
      
      return buffer;
    });
  }

  /**
   * Generate a quantum pulse sound pattern
   */
  _generateQuantumPulse(ctx, duration) {
    // Base drone oscillator
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 80;
    
    // Modulation oscillator
    const mod = ctx.createOscillator();
    mod.type = 'triangle';
    mod.frequency.value = 0.1;
    
    // Gain nodes
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.4;
    
    const modGain = ctx.createGain();
    modGain.gain.value = 20;
    
    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500;
    filter.Q.value = 5;
    
    // Connect modulation
    mod.connect(modGain);
    modGain.connect(drone.frequency);
    
    // Connect drone through filter
    drone.connect(filter);
    filter.connect(droneGain);
    droneGain.connect(ctx.destination);
    
    // Add random pulse elements
    for (let i = 0; i < 50; i++) {
      const startTime = Math.random() * duration;
      const pulseLength = 0.1 + (Math.random() * 0.3);
      
      const pulse = ctx.createOscillator();
      pulse.type = ['sine', 'triangle', 'sawtooth'][Math.floor(Math.random() * 3)];
      pulse.frequency.value = 200 + (Math.random() * 2000);
      
      const pulseGain = ctx.createGain();
      pulseGain.gain.value = 0;
      
      // Create envelope
      pulseGain.gain.setValueAtTime(0, startTime);
      pulseGain.gain.linearRampToValueAtTime(0.1 + (Math.random() * 0.1), startTime + 0.01);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, startTime + pulseLength);
      
      // Connect and start/stop
      pulse.connect(pulseGain);
      pulseGain.connect(ctx.destination);
      
      pulse.start(startTime);
      pulse.stop(startTime + pulseLength);
    }
    
    // Start the continuous oscillators
    drone.start(0);
    mod.start(0);
    drone.stop(duration);
    mod.stop(duration);
  }

  /**
   * Generate a void hum sound pattern
   */
  _generateVoidHum(ctx, duration) {
    // Deep bass drone
    const bassDrone = ctx.createOscillator();
    bassDrone.type = 'sine';
    bassDrone.frequency.value = 40;
    
    // Mid-range hum
    const midDrone = ctx.createOscillator();
    midDrone.type = 'sine';
    midDrone.frequency.value = 180;
    
    // High harmonics
    const highDrone = ctx.createOscillator();
    highDrone.type = 'triangle';
    highDrone.frequency.value = 1200;
    
    // Slow modulation
    const modulator = ctx.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.value = 0.05;
    
    // Gain nodes
    const bassGain = ctx.createGain();
    bassGain.gain.value = 0.5;
    
    const midGain = ctx.createGain();
    midGain.gain.value = 0.2;
    
    const highGain = ctx.createGain();
    highGain.gain.value = 0.05;
    
    const modGain = ctx.createGain();
    modGain.gain.value = 30;
    
    // Filters
    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.value = 100;
    
    const midFilter = ctx.createBiquadFilter();
    midFilter.type = 'bandpass';
    midFilter.frequency.value = 200;
    midFilter.Q.value = 2;
    
    const highFilter = ctx.createBiquadFilter();
    highFilter.type = 'highpass';
    highFilter.frequency.value = 800;
    
    // Connect modulation
    modulator.connect(modGain);
    modGain.connect(midDrone.frequency);
    modGain.connect(highDrone.frequency);
    
    // Connect drones through filters to gain nodes
    bassDrone.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(ctx.destination);
    
    midDrone.connect(midFilter);
    midFilter.connect(midGain);
    midGain.connect(ctx.destination);
    
    highDrone.connect(highFilter);
    highFilter.connect(highGain);
    highGain.connect(ctx.destination);
    
    // Start oscillators
    bassDrone.start(0);
    midDrone.start(0);
    highDrone.start(0);
    modulator.start(0);
    
    bassDrone.stop(duration);
    midDrone.stop(duration);
    highDrone.stop(duration);
    modulator.stop(duration);
  }

  /**
   * Generate a dimensional rift sound pattern
   */
  _generateDimensionalRift(ctx, duration) {
    // Main noise generator using a noise buffer
    const noiseBuffer = this._createNoiseBuffer(ctx, 2);
    
    // Create noise source
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    // Create filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 3;
    
    // Create filter modulation
    const filterMod = ctx.createOscillator();
    filterMod.type = 'sine';
    filterMod.frequency.value = 0.1;
    
    const filterModGain = ctx.createGain();
    filterModGain.gain.value = 400;
    
    // Connect filter modulation
    filterMod.connect(filterModGain);
    filterModGain.connect(filter.frequency);
    
    // Create main gain
    const mainGain = ctx.createGain();
    mainGain.gain.value = 0.3;
    
    // Connect noise through filter to gain
    noiseSource.connect(filter);
    filter.connect(mainGain);
    mainGain.connect(ctx.destination);
    
    // Create dimensional sweep effect
    for (let i = 0; i < 5; i++) {
      const startTime = i * (duration / 5);
      
      // Sweep oscillator
      const sweep = ctx.createOscillator();
      sweep.type = 'sine';
      sweep.frequency.setValueAtTime(200, startTime);
      sweep.frequency.exponentialRampToValueAtTime(4000, startTime + (duration / 5) * 0.8);
      
      // Sweep gain
      const sweepGain = ctx.createGain();
      sweepGain.gain.setValueAtTime(0, startTime);
      sweepGain.gain.linearRampToValueAtTime(0.2, startTime + 0.1);
      sweepGain.gain.linearRampToValueAtTime(0, startTime + (duration / 5) * 0.9);
      
      // Connect sweep
      sweep.connect(sweepGain);
      sweepGain.connect(ctx.destination);
      
      // Start and stop sweep
      sweep.start(startTime);
      sweep.stop(startTime + (duration / 5));
    }
    
    // Add random digital glitch sounds
    for (let i = 0; i < 40; i++) {
      const startTime = Math.random() * duration;
      const glitchLength = 0.05 + (Math.random() * 0.2);
      
      const glitch = ctx.createOscillator();
      glitch.type = 'sawtooth';
      glitch.frequency.setValueAtTime(2000 + (Math.random() * 3000), startTime);
      glitch.frequency.linearRampToValueAtTime(500 + (Math.random() * 1000), startTime + glitchLength);
      
      const glitchGain = ctx.createGain();
      glitchGain.gain.setValueAtTime(0, startTime);
      glitchGain.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
      glitchGain.gain.linearRampToValueAtTime(0, startTime + glitchLength);
      
      glitch.connect(glitchGain);
      glitchGain.connect(ctx.destination);
      
      glitch.start(startTime);
      glitch.stop(startTime + glitchLength);
    }
    
    // Start main sources
    noiseSource.start(0);
    filterMod.start(0);
    
    noiseSource.stop(duration);
    filterMod.stop(duration);
  }

  /**
   * Generate an ambient drone sound pattern
   */
  _generateAmbientDrone(ctx, duration) {
    // Create several oscillators for harmonics
    const fundamentalFreq = 60;
    const oscillators = [];
    const gains = [];
    
    // Harmonics relative to fundamental frequency
    const harmonics = [1, 2, 3, 5, 8, 13];
    
    // Create oscillators for each harmonic
    harmonics.forEach((harmonic, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = fundamentalFreq * harmonic;
      
      const gain = ctx.createGain();
      gain.gain.value = 0.15 / (i + 1); // Decreasing volume for higher harmonics
      
      // Connect oscillator to gain
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      oscillators.push(osc);
      gains.push(gain);
      
      // Create slow modulation for this harmonic
      if (i > 0) {
        const mod = ctx.createOscillator();
        mod.type = 'sine';
        mod.frequency.value = 0.05 + (Math.random() * 0.1);
        
        const modGain = ctx.createGain();
        modGain.gain.value = fundamentalFreq * harmonic * 0.01;
        
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        
        mod.start(0);
        mod.stop(duration);
      }
      
      // Start oscillator
      osc.start(0);
      osc.stop(duration);
      
      // Create volume envelope
      gain.gain.setValueAtTime(0, 0);
      gain.gain.linearRampToValueAtTime(gain.gain.value, 2);
      gain.gain.setValueAtTime(gain.gain.value, duration - 2);
      gain.gain.linearRampToValueAtTime(0, duration);
    });
  }

  /**
   * Create a buffer of noise for noise generation
   */
  _createNoiseBuffer(context, duration) {
    const sampleRate = context.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = context.createBuffer(1, bufferSize, sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Stop analysis loop
    if (this.state.animationFrameId) {
      cancelAnimationFrame(this.state.animationFrameId);
    }
    
    // Stop audio
    this.pause();
    
    // Disconnect microphone if active
    if (this.state.microphoneSource) {
      this.state.microphoneSource.disconnect();
      this.state.microphoneSource = null;
    }
    
    // Remove UI elements
    if (this.ui.container) {
      this.ui.container.remove();
    }
    
    // Close audio context
    if (this.state.audioContext) {
      this.state.audioContext.close();
    }
    
    console.log('HyperAV Audio: Destroyed');
  }
}

// Add CSS styles for audio visualizer UI
const addStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    .hyperav-audio-ui {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      background-color: rgba(0, 0, 0, 0.7);
      border: 1px solid var(--accent-color, #00ffcc);
      border-radius: 5px;
      padding: 10px;
      color: var(--text-color, #ffffff);
      font-family: var(--mono-font, monospace);
      box-shadow: 0 0 10px rgba(0, 255, 204, 0.5);
      z-index: 1000;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(5px);
    }
    
    .hyperav-audio-ui.hidden {
      opacity: 0;
      pointer-events: none;
    }
    
    .hyperav-audio-ui.loading::after {
      content: "Loading Audio...";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 1;
    }
    
    .audio-visualizer {
      height: 60px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    
    .visualizer-bar {
      flex: 1;
      margin: 0 1px;
      background-color: var(--accent-color, #00ffcc);
      height: 5%;
      min-height: 1px;
      box-shadow: 0 0 5px var(--accent-color, #00ffcc);
      transition: height 0.05s ease-out;
    }
    
    .audio-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    
    .audio-play-button, .audio-mic-button {
      background-color: transparent;
      border: 1px solid var(--accent-color, #00ffcc);
      color: var(--accent-color, #00ffcc);
      border-radius: 3px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .audio-play-button:hover, .audio-mic-button:hover {
      background-color: rgba(0, 255, 204, 0.2);
    }
    
    .audio-volume-slider {
      flex: 1;
      margin: 0 10px;
      height: 3px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.2);
      outline: none;
    }
    
    .audio-volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--accent-color, #00ffcc);
      cursor: pointer;
      box-shadow: 0 0 5px var(--accent-color, #00ffcc);
    }
    
    .audio-feedback {
      font-size: 10px;
      display: flex;
      justify-content: space-between;
    }
    
    .feedback-value {
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .feedback-value.bass {
      color: var(--accent-color, #00ffcc);
    }
    
    .feedback-value.mid {
      color: #ccff00;
    }
    
    .feedback-value.high {
      color: #ff33cc;
    }
  `;
  document.head.appendChild(style);
};

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add styles
  addStyles();
  
  // Create global instance if HyperAV is available
  if (window.hyperAV) {
    window.hyperAVAudio = new HyperAVAudio({
      hyperAVInstance: window.hyperAV,
      autoplayOnInteraction: true,
      ambientMode: true,
      visualFeedback: true,
      enableMicrophoneInput: true
    });
    
    // Generate synthetic audio for ambient mode
    window.hyperAVAudio.generateSyntheticAudio('quantum_pulse', 60);
    
    console.log('HyperAV Audio: Module loaded and connected to HyperAV');
  }
});

// Expose class for modular usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HyperAVAudio;
}