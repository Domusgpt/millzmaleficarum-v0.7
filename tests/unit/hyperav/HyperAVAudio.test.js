/**
 * Unit tests for the HyperAVAudio module
 */

import HyperAVAudio, { audioStyles } from '../../../public/js/modules/hyperav/audio/HyperAVAudio';

// Mock the global document object
global.document = {
  createElement: jest.fn(() => ({
    className: '',
    style: {},
    type: '',
    min: 0,
    max: 0,
    value: 0,
    innerHTML: '',
    textContent: '',
    appendChild: jest.fn(),
    addEventListener: jest.fn(),
    querySelector: jest.fn(() => ({
      textContent: ''
    }))
  })),
  body: {
    appendChild: jest.fn()
  },
  addEventListener: jest.fn()
};

// Mock the window object with hyperAV
global.window = {
  hyperAV: {
    updateOptions: jest.fn()
  },
  AudioContext: jest.fn(),
  webkitAudioContext: jest.fn()
};

// Mock fetch
global.fetch = jest.fn(() => 
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024))
  })
);

// Mock audio nodes
const mockAnalyser = {
  fftSize: 0,
  frequencyBinCount: 32,
  smoothingTimeConstant: 0,
  connect: jest.fn(),
  getByteFrequencyData: jest.fn(array => {
    for (let i = 0; i < array.length; i++) {
      array[i] = 128; // Mid-level value for testing
    }
  }),
  getByteTimeDomainData: jest.fn()
};

const mockGainNode = {
  gain: { value: 0.5 },
  connect: jest.fn()
};

const mockBufferSource = {
  buffer: null,
  loop: false,
  connect: jest.fn(),
  start: jest.fn(),
  stop: jest.fn(),
  disconnect: jest.fn()
};

const mockAudioBuffer = {};

// Mock audio context
const mockAudioContext = {
  createAnalyser: jest.fn(() => mockAnalyser),
  createGain: jest.fn(() => mockGainNode),
  createBufferSource: jest.fn(() => mockBufferSource),
  decodeAudioData: jest.fn(() => Promise.resolve(mockAudioBuffer)),
  createOscillator: jest.fn(() => ({
    type: 'sine',
    frequency: { value: 0, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn(), linearRampToValueAtTime: jest.fn() },
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  createBiquadFilter: jest.fn(() => ({
    type: 'lowpass',
    frequency: { value: 0 },
    Q: { value: 0 },
    connect: jest.fn()
  })),
  createBuffer: jest.fn(() => ({
    getChannelData: jest.fn(() => new Float32Array(1024))
  })),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  close: jest.fn()
};

// Mock navigator.mediaDevices
navigator.mediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve({ id: 'mock-stream' }))
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  return setTimeout(() => callback(Date.now()), 0);
});

global.cancelAnimationFrame = jest.fn(id => {
  clearTimeout(id);
});

describe('HyperAVAudio Module', () => {
  let hyperAVAudio;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup mock AudioContext
    window.AudioContext = jest.fn(() => mockAudioContext);
    
    // Setup mock document.createElement
    document.createElement.mockImplementation((type) => {
      if (type === 'div') {
        return {
          className: '',
          style: {},
          innerHTML: '',
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          },
          appendChild: jest.fn(),
          querySelector: jest.fn(() => ({
            textContent: ''
          })),
          querySelectorAll: jest.fn(() => []),
          remove: jest.fn()
        };
      }
      if (type === 'button') {
        return {
          className: '',
          textContent: '',
          addEventListener: jest.fn()
        };
      }
      if (type === 'input') {
        return {
          type: '',
          min: 0,
          max: 0,
          value: 0,
          className: '',
          addEventListener: jest.fn()
        };
      }
      return {
        className: '',
        appendChild: jest.fn()
      };
    });
    
    // Create new instance with visual feedback disabled
    hyperAVAudio = new HyperAVAudio({
      hyperAVInstance: window.hyperAV,
      visualFeedback: false,
      enableMicrophoneInput: true,
      debugMode: true
    });
  });

  test('should initialize with default configuration', () => {
    expect(hyperAVAudio).toBeDefined();
    expect(hyperAVAudio.config.frequencyBands).toBe(32);
    expect(hyperAVAudio.config.reactivityIntensity).toBe(0.7);
    expect(hyperAVAudio.config.hyperAVInstance).toBe(window.hyperAV);
  });

  test('should create audio context and analyzer during initialization', () => {
    expect(window.AudioContext).toHaveBeenCalled();
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    expect(mockAudioContext.createGain).toHaveBeenCalled();
    expect(mockAnalyser.connect).toHaveBeenCalledWith(mockGainNode);
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAudioContext.destination);
  });

  test('should extract frequency bands correctly', () => {
    // Mock frequency data
    const testArray = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      // Fill with increasing values 
      testArray[i] = i * 8; // 0, 8, 16, ..., 248
    }
    
    // Replace mock implementation for this test
    mockAnalyser.getByteFrequencyData.mockImplementationOnce(array => {
      for (let i = 0; i < array.length; i++) {
        array[i] = testArray[i];
      }
    });
    
    // Set state
    hyperAVAudio.state.frequencyData = testArray;
    
    // Extract bands
    const bands = hyperAVAudio._extractFrequencyBands();
    
    // Check bands - values should be normalized to 0-1
    expect(bands).toBeDefined();
    expect(bands.bass).toBeGreaterThan(0);
    expect(bands.bass).toBeLessThan(1);
    expect(bands.mid).toBeGreaterThan(0);
    expect(bands.mid).toBeLessThan(1);
    expect(bands.high).toBeGreaterThan(0);
    expect(bands.high).toBeLessThan(1);
    expect(bands.overall).toBeGreaterThan(0);
    expect(bands.overall).toBeLessThan(1);
  });

  test('should update HyperAV options based on audio analysis', () => {
    // Mock bands data
    const bands = {
      bass: 0.8,
      mid: 0.6,
      high: 0.4,
      overall: 0.6
    };
    
    // Update HyperAV
    hyperAVAudio._updateHyperAV(bands);
    
    // Check if HyperAV updateOptions was called
    expect(window.hyperAV.updateOptions).toHaveBeenCalled();
    
    // Get called options
    const options = window.hyperAV.updateOptions.mock.calls[0][0];
    
    // Verify options reflect audio bands
    expect(options.intensity).toBeGreaterThan(0.5); // Base + bass influence
    expect(options.complexity).toBeGreaterThan(0.4); // Base + mid influence
    expect(options.speed).toBeGreaterThan(0.02); // Base + overall influence
    expect(options.color1).toBeDefined(); // Should be an HSL color string
    expect(options.color2).toBeDefined(); // Should be an HSL color string
  });

  test('should load audio from URL', async () => {
    // Call loadAudio
    const promise = hyperAVAudio.loadAudio('test-audio.mp3');
    
    // Check that fetch was called with the URL
    expect(fetch).toHaveBeenCalledWith('test-audio.mp3');
    
    // Wait for promise to resolve
    await promise;
    
    // Check that decodeAudioData was called
    expect(mockAudioContext.decodeAudioData).toHaveBeenCalled();
    
    // Check that audioBuffer was set
    expect(hyperAVAudio.state.audioBuffer).toBe(mockAudioBuffer);
    expect(hyperAVAudio.state.currentSong).toBe('test-audio.mp3');
  });

  test('should toggle audio playback', () => {
    // Set up initial state
    hyperAVAudio.state.audioBuffer = mockAudioBuffer;
    hyperAVAudio.state.isPlaying = false;
    
    // Call play
    hyperAVAudio.play();
    
    // Verify play state
    expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    expect(mockBufferSource.buffer).toBe(mockAudioBuffer);
    expect(mockBufferSource.loop).toBe(true);
    expect(mockBufferSource.connect).toHaveBeenCalledWith(mockAnalyser);
    expect(mockBufferSource.start).toHaveBeenCalled();
    expect(hyperAVAudio.state.isPlaying).toBe(true);
    
    // Call pause
    hyperAVAudio.pause();
    
    // Verify pause state
    expect(mockBufferSource.stop).toHaveBeenCalled();
    expect(hyperAVAudio.state.isPlaying).toBe(false);
    expect(hyperAVAudio.state.isPaused).toBe(true);
  });

  test('should set volume correctly', () => {
    // Set up initial gain
    mockGainNode.gain.value = 0.5;
    
    // Set volume to 0.8
    hyperAVAudio.setVolume(0.8);
    
    // Verify gain was set
    expect(mockGainNode.gain.value).toBe(0.8);
    
    // Test value clamping for out of range values
    hyperAVAudio.setVolume(1.5); // Above 1
    expect(mockGainNode.gain.value).toBe(1);
    
    hyperAVAudio.setVolume(-0.2); // Below 0
    expect(mockGainNode.gain.value).toBe(0);
  });

  test('audioStyles should be exported correctly', () => {
    expect(audioStyles).toBeDefined();
    expect(typeof audioStyles).toBe('string');
    expect(audioStyles.includes('.hyperav-audio-ui')).toBe(true);
  });
});