/**
 * Unit tests for the HyperAV module
 */

import HyperAV from '../../../public/js/modules/hyperav/core/HyperAV';

// Mock the global document and window objects
global.document = {
  createElement: jest.fn(() => ({
    className: '',
    style: {},
    width: 0,
    height: 0,
    addEventListener: jest.fn()
  })),
  getElementById: jest.fn()
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
  ellipse: jest.fn(),
  lineTo: jest.fn(),
  moveTo: jest.fn(),
  bezierCurveTo: jest.fn(),
  fillRect: jest.fn(),
  stroke: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  fill: jest.fn()
};

// Mock the container element
const mockContainer = {
  appendChild: jest.fn(),
  getBoundingClientRect: jest.fn(() => ({
    width: 800,
    height: 600
  }))
};

// Mock window object
global.window = {
  innerWidth: 800,
  innerHeight: 600,
  addEventListener: jest.fn()
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => {
  return setTimeout(() => callback(Date.now()), 0);
});

global.cancelAnimationFrame = jest.fn(id => {
  clearTimeout(id);
});

// Mock Math.random and Math.sin for deterministic tests
const originalMathRandom = Math.random;
const originalMathSin = Math.sin;

describe('HyperAV Module', () => {
  let hyperAV;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock getElementById to return our mock container
    document.getElementById.mockReturnValue(mockContainer);
    
    // Mock createElement for canvas
    document.createElement.mockImplementation(() => ({
      className: '',
      style: {},
      width: 800,
      height: 600,
      getContext: jest.fn(() => mockCanvasContext)
    }));
    
    // Replace Math.random with deterministic version for testing
    Math.random = jest.fn(() => 0.5);
    
    // Create new instance
    hyperAV = new HyperAV('hyperav-background', {
      pattern: 'tesseract',
      color1: '#00ffcc',
      color2: '#ff33cc',
      speed: 0.05,
      opacity: 0.5,
      autoRotate: true
    });
  });

  afterEach(() => {
    // Restore original Math functions
    Math.random = originalMathRandom;
    Math.sin = originalMathSin;
  });

  test('should initialize with provided options', () => {
    expect(hyperAV).toBeDefined();
    expect(hyperAV.options.pattern).toBe('tesseract');
    expect(hyperAV.options.color1).toBe('#00ffcc');
    expect(hyperAV.options.color2).toBe('#ff33cc');
    expect(hyperAV.options.speed).toBe(0.05);
    expect(hyperAV.options.opacity).toBe(0.5);
  });

  test('should create canvas element during initialization', () => {
    expect(document.createElement).toHaveBeenCalledWith('canvas');
    expect(mockContainer.appendChild).toHaveBeenCalled();
  });

  test('should update canvas size on resize', () => {
    const canvas = {
      width: 0,
      height: 0
    };
    
    // Mock the canvas property
    hyperAV.canvas = canvas;
    
    // Call resize
    hyperAV.resize();
    
    // Verify canvas size was updated
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
    expect(hyperAV.centerX).toBe(400);
    expect(hyperAV.centerY).toBe(300);
    expect(hyperAV.scale).toBe(150); // Math.min(800, 600) / 4
  });

  test('should correctly create tesseract geometry', () => {
    // Force create tesseract
    hyperAV.createTesseract();
    
    // Verify tesseract vertices
    expect(hyperAV.vertices4D.length).toBe(16); // 2^4 vertices
    expect(hyperAV.edges.length).toBeGreaterThan(0);
    
    // Verify first vertex
    expect(hyperAV.vertices4D[0]).toEqual([-1, -1, -1, -1]);
  });

  test('should correctly update options', () => {
    // Original speed
    const originalSpeed = hyperAV.options.speed;
    
    // Update options
    hyperAV.updateOptions({
      speed: 0.1,
      pattern: 'hypertetrahedra',
      opacity: 0.7
    });
    
    // Verify options were updated
    expect(hyperAV.options.speed).toBe(0.1);
    expect(hyperAV.options.pattern).toBe('hypertetrahedra');
    expect(hyperAV.options.opacity).toBe(0.7);
    
    // Verify new pattern was initialized
    expect(hyperAV.vertices4D.length).toBe(5); // 5-cell has 5 vertices
  });

  test('should correctly process 4D rotation', () => {
    // Setup initial vertex
    const vertex = [1, 0, 0, 0];
    
    // Setup rotation matrix with non-zero value
    hyperAV.rotationMatrix.xy = Math.PI / 2; // 90 degrees
    
    // Apply rotation
    const rotated = hyperAV.rotate4D(vertex);
    
    // Verify rotation (90 degrees around XY would turn [1,0,0,0] to approximately [0,1,0,0])
    expect(rotated[0]).toBeCloseTo(0, 1);
    expect(rotated[1]).toBeCloseTo(1, 1);
    expect(rotated[2]).toBeCloseTo(0, 1);
    expect(rotated[3]).toBeCloseTo(0, 1);
  });

  test('should correctly project from 4D to 3D', () => {
    // Setup 4D vertex
    const vertex = [1, 2, 3, 0];
    
    // Apply projection
    const projected = hyperAV.project4Dto3D(vertex);
    
    // Verify projection (with w=0, should be similar to original x,y,z coordinates)
    expect(projected[0]).toBeCloseTo(1/5, 5); // x/(distance-w) = 1/(5-0) = 1/5
    expect(projected[1]).toBeCloseTo(2/5, 5); // y/(distance-w) = 2/(5-0) = 2/5
    expect(projected[2]).toBeCloseTo(3/5, 5); // z/(distance-w) = 3/(5-0) = 3/5
  });

  test('should correctly project from 3D to 2D', () => {
    // Setup 3D vertex
    const vertex = [1, 2, 0];
    
    // Set scale and center
    hyperAV.scale = 100;
    hyperAV.centerX = 400;
    hyperAV.centerY = 300;
    
    // Apply projection
    const projected = hyperAV.project3Dto2D(vertex);
    
    // Verify projection (with z=0)
    expect(projected[0]).toBeCloseTo(400 + 100 * 1/5, 1); // centerX + scale * x/(distance-z)
    expect(projected[1]).toBeCloseTo(300 + 100 * 2/5, 1); // centerY + scale * y/(distance-z)
  });
});