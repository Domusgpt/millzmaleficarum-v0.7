/**
 * Integration tests for the module loader system
 */

import { initMillzMaleficarum } from '../../public/js/modules/loader';
import { PortalTransitions, HyperAV, HyperAVAudio } from '../../public/js/modules/index';

// Mock DOM elements and global objects
global.document = {
  createElement: jest.fn(() => ({
    className: '',
    style: {},
    width: 0,
    height: 0,
    textContent: '',
    classList: {
      add: jest.fn(),
      remove: jest.fn()
    },
    appendChild: jest.fn(),
    addEventListener: jest.fn()
  })),
  getElementById: jest.fn(),
  querySelector: jest.fn(() => ({
    querySelectorAll: jest.fn(() => [])
  })),
  querySelectorAll: jest.fn(() => []),
  body: {
    appendChild: jest.fn()
  },
  head: {
    appendChild: jest.fn()
  },
  addEventListener: jest.fn((event, callback) => {
    if (event === 'DOMContentLoaded') {
      callback();
    }
  })
};

// Mock window object
global.window = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  millzSystem: null
};

// Mock navigation objects
global.navigator = {
  mediaDevices: {
    getUserMedia: jest.fn(() => Promise.resolve({ id: 'mock-media-stream' }))
  }
};

// Mock canvas context
const mockCanvasContext = {
  clearRect: jest.fn(),
  createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  beginPath: jest.fn(),
  lineTo: jest.fn(),
  moveTo: jest.fn(),
  stroke: jest.fn(),
  bezierCurveTo: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  fill: jest.fn()
};

// Mock audio nodes
const mockAnalyserNode = {
  fftSize: 0,
  frequencyBinCount: 32,
  smoothingTimeConstant: 0,
  connect: jest.fn(),
  getByteFrequencyData: jest.fn(),
  getByteTimeDomainData: jest.fn()
};

const mockGainNode = {
  gain: { value: 0.5 },
  connect: jest.fn()
};

// Mock audio context
const mockAudioContext = {
  createAnalyser: jest.fn(() => mockAnalyserNode),
  createGain: jest.fn(() => mockGainNode),
  createBufferSource: jest.fn(() => ({
    buffer: null,
    loop: false,
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  })),
  decodeAudioData: jest.fn(() => Promise.resolve({})),
  destination: {},
  currentTime: 0,
  sampleRate: 44100,
  close: jest.fn()
};

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn(function() {
  this.observe = jest.fn();
  this.disconnect = jest.fn();
  return this;
});

// Mock AudioContext
global.AudioContext = jest.fn(() => mockAudioContext);
global.webkitAudioContext = jest.fn(() => mockAudioContext);

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  return setTimeout(() => callback(Date.now()), 0);
});

global.cancelAnimationFrame = jest.fn(id => {
  clearTimeout(id);
});

// Mock console methods
const originalConsoleLog = console.log;
console.log = jest.fn();

describe('Module Loader Integration', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock getElementById to return mock elements
    document.getElementById.mockImplementation((id) => {
      if (id === 'hyperav-background') {
        return {
          appendChild: jest.fn(),
          getBoundingClientRect: jest.fn(() => ({
            width: 1024,
            height: 768
          }))
        };
      }
      if (id === 'magazine-content') {
        return {
          querySelectorAll: jest.fn(() => [])
        };
      }
      return null;
    });
    
    // Mock createElement to return specific mock objects
    document.createElement.mockImplementation((type) => {
      if (type === 'canvas') {
        return {
          width: 0,
          height: 0,
          style: {},
          className: '',
          getContext: jest.fn(() => mockCanvasContext)
        };
      }
      if (type === 'style') {
        return {
          textContent: '',
          appendChild: jest.fn()
        };
      }
      if (type === 'div') {
        return {
          className: '',
          style: {},
          classList: {
            add: jest.fn(),
            remove: jest.fn()
          },
          innerHTML: '',
          appendChild: jest.fn(),
          addEventListener: jest.fn(),
          querySelector: jest.fn(() => ({
            textContent: ''
          })),
          querySelectorAll: jest.fn(() => []),
          remove: jest.fn()
        };
      }
      return {
        className: '',
        style: {},
        appendChild: jest.fn()
      };
    });
    
    // Clear window.millzSystem
    window.millzSystem = null;
  });
  
  afterEach(() => {
    // Restore console.log
    console.log = originalConsoleLog;
  });

  test('exported modules should be properly defined', () => {
    // Check that exported modules are defined
    expect(PortalTransitions).toBeDefined();
    expect(HyperAV).toBeDefined();
    expect(HyperAVAudio).toBeDefined();
    
    // Check that they are constructors
    expect(typeof PortalTransitions).toBe('function');
    expect(typeof HyperAV).toBe('function');
    expect(typeof HyperAVAudio).toBe('function');
  });

  test('initMillzMaleficarum should initialize all system components', () => {
    // Call the init function
    const system = initMillzMaleficarum();
    
    // Check that components were initialized
    expect(system).toBeDefined();
    expect(system.hyperAV).toBeDefined();
    expect(system.hyperAVAudio).toBeDefined();
    expect(system.portalTransitions).toBeDefined();
    
    // Check that global instance was set
    expect(window.millzSystem).toBe(system);
    
    // Check that initialization was logged
    expect(console.log).toHaveBeenCalledWith('MillzMaleficarum Codex v0.6: Starting initialization');
    expect(console.log).toHaveBeenCalledWith('MillzMaleficarum Codex v0.6: Initialization complete');
  });

  test('initialization should use custom options when provided', () => {
    // Custom options
    const customOptions = {
      hyperAV: {
        pattern: 'hypertetrahedra',
        color1: '#ff0000',
        color2: '#0000ff',
        speed: 0.1
      },
      audio: {
        visualFeedback: false,
        reactivityIntensity: 0.5
      },
      portal: {
        portalIntensity: 0.6,
        transitionDuration: 2000
      }
    };
    
    // Call the init function with custom options
    const system = initMillzMaleficarum(customOptions);
    
    // Check that custom options were applied
    expect(system.hyperAV.options.pattern).toBe('hypertetrahedra');
    expect(system.hyperAV.options.color1).toBe('#ff0000');
    expect(system.hyperAV.options.color2).toBe('#0000ff');
    expect(system.hyperAV.options.speed).toBe(0.1);
    
    expect(system.hyperAVAudio.config.visualFeedback).toBe(false);
    expect(system.hyperAVAudio.config.reactivityIntensity).toBe(0.5);
    
    expect(system.portalTransitions.config.portalIntensity).toBe(0.6);
    expect(system.portalTransitions.config.transitionDuration).toBe(2000);
  });
  
  test('auto-initialization should work on DOMContentLoaded', () => {
    // Import the module which will trigger auto-initialization
    jest.isolateModules(() => {
      require('../../public/js/modules/loader');
    });
    
    // Check that millzSystem was set
    expect(window.millzSystem).toBeDefined();
  });
});