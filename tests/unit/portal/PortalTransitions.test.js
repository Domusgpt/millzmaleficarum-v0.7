/**
 * Unit tests for the PortalTransitions module
 */

import PortalTransitions, { portalStyles } from '../../../public/js/modules/portal/PortalTransitions';

// Mock the DOM elements and browser APIs
beforeAll(() => {
  // Mock document functions
  global.document = {
    createElement: jest.fn(() => ({
      className: '',
      style: {},
      width: 0,
      height: 0,
      appendChild: jest.fn(),
      addEventListener: jest.fn()
    })),
    body: {
      appendChild: jest.fn()
    },
    head: {
      appendChild: jest.fn()
    },
    getElementById: jest.fn(),
    querySelector: jest.fn(() => ({
      querySelectorAll: jest.fn(() => [])
    }))
  };

  // Mock canvas context
  global.mockCanvasContext = {
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
    save: jest.fn(),
    restore: jest.fn(),
    fill: jest.fn(),
    closePath: jest.fn()
  };

  // Mock canvas
  global.mockCanvas = {
    getContext: jest.fn(() => global.mockCanvasContext),
    width: 1024,
    height: 768
  };

  // Mock window
  global.window = {
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: jest.fn(),
    hyperAV: {
      updateOptions: jest.fn()
    }
  };

  // Mock Intersection Observer
  global.IntersectionObserver = jest.fn(function() {
    this.observe = jest.fn();
    this.disconnect = jest.fn();
    return this;
  });

  // Mock AudioContext
  global.mockAudioContext = {
    createBufferSource: jest.fn(() => ({
      buffer: null,
      loop: false,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      disconnect: jest.fn()
    })),
    createGain: jest.fn(() => ({
      gain: { value: 0.5 },
      connect: jest.fn(),
      disconnect: jest.fn()
    })),
    createBuffer: jest.fn(() => ({
      getChannelData: jest.fn(() => new Float32Array(1024))
    })),
    destination: {},
    sampleRate: 44100,
    close: jest.fn()
  };

  global.AudioContext = jest.fn(() => global.mockAudioContext);
  global.webkitAudioContext = jest.fn(() => global.mockAudioContext);

  // Mock requestAnimationFrame
  global.requestAnimationFrame = jest.fn(callback => {
    return setTimeout(() => callback(Date.now()), 0);
  });

  global.cancelAnimationFrame = jest.fn(id => {
    clearTimeout(id);
  });

  // Mock performance.now()
  global.performance = {
    now: jest.fn(() => Date.now())
  };
});

describe('PortalTransitions Module', () => {
  let portalTransitions;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks for this test
    document.createElement.mockImplementation((type) => {
      if (type === 'canvas') {
        return global.mockCanvas;
      }
      return {
        className: '',
        style: {},
        appendChild: jest.fn(),
        addEventListener: jest.fn()
      };
    });
    
    // Create instance
    portalTransitions = new PortalTransitions({
      debugMode: true
    });
  });

  test('should initialize with default options', () => {
    expect(portalTransitions).toBeDefined();
    expect(portalTransitions.config.transitionDuration).toBe(1500);
    expect(portalTransitions.config.useHyperAV).toBe(true);
    expect(portalTransitions.config.portalIntensity).toBe(0.8);
    expect(portalTransitions.config.enableAudio).toBe(true);
  });

  test('should create portal elements during initialization', () => {
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  test('should correctly interpolate between colors', () => {
    const color1 = '#ff0000'; // Red
    const color2 = '#0000ff'; // Blue
    const progress = 0.5;
    
    const result = portalTransitions._interpolateColor(color1, color2, progress);
    
    // Expect a color halfway between red and blue (purple)
    expect(result).toBe('#7f007f');
  });

  test('should correctly shift hue of colors', () => {
    const hexColor = '#ff0000'; // Red
    const degrees = 120; // 120 degrees shift (to green)
    
    const result = portalTransitions._shiftHue(hexColor, degrees);
    
    // Expect a greenish color
    expect(result.startsWith('#')).toBe(true);
    expect(result.length).toBe(7);
  });

  test('should clean up resources when destroyed', () => {
    // Setup mock state
    portalTransitions.state.observer = {
      disconnect: jest.fn()
    };
    portalTransitions.state.portalOverlay = {
      remove: jest.fn()
    };
    portalTransitions.state.audioContext = {
      close: jest.fn()
    };
    portalTransitions.state.portalAnimation = 123;

    // Call destroy
    portalTransitions.destroy();

    // Check cleanup
    expect(cancelAnimationFrame).toHaveBeenCalledWith(123);
    expect(portalTransitions.state.observer.disconnect).toHaveBeenCalled();
    expect(portalTransitions.state.portalOverlay.remove).toHaveBeenCalled();
    expect(portalTransitions.state.audioContext.close).toHaveBeenCalled();
  });

  test('should have proper transition effects', () => {
    // Create mock sections
    const fromSection = {
      id: 'cover',
      style: {}
    };
    const toSection = {
      id: 'editorial',
      style: {}
    };
    
    // Setup portal overlay
    portalTransitions.state.portalOverlay = {
      style: {}
    };
    
    // Mock HyperAV instance
    portalTransitions.state.hyperAVInstance = {
      updateOptions: jest.fn()
    };
    
    // Mock play portal sound
    portalTransitions._playPortalSound = jest.fn();
    
    // Trigger transition
    portalTransitions._triggerPortalTransition(fromSection, toSection);
    
    // Check if overlay is shown
    expect(portalTransitions.state.portalOverlay.style.opacity).toBe('1');
    
    // Check if HyperAV options were updated
    expect(portalTransitions.state.hyperAVInstance.updateOptions).toHaveBeenCalled();
    
    // Check if portal sound was played
    expect(portalTransitions._playPortalSound).toHaveBeenCalledWith('enter');
  });

  test('portalStyles should be exported correctly', () => {
    expect(portalStyles).toBeDefined();
    expect(typeof portalStyles).toBe('string');
    expect(portalStyles.includes('.portal-section')).toBe(true);
  });
});