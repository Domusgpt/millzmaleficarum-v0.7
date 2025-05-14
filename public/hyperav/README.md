# HyperAV Visualization System v0.8

An advanced 4D hyperdimensional visualization system with audio reactivity and multi-world transitions.

## Overview

The HyperAV system renders immersive, audio-reactive 4D visualizations that can be used as background elements or full-screen experiences. The system supports multiple visualization modes (called "worlds") and smooth transitions between them.

## Features

- **Multi-World System**: Switch between different visualization modes with smooth transitions
- **Enhanced Audio Reactivity**: Visualizations react to audio input with spectrum analysis
- **Beat Detection**: Automatic detection of beats for synchronized visual effects
- **5 Core Visualization Types**:
  - **Lattice**: 4D hypercube wireframe visualizations
  - **Quantum Field**: Energetic quantum particle system
  - **Vortex**: Swirling spiral patterns
  - **Nebula**: Gaseous cloud-like formations
  - **Circuit**: Digital circuit patterns
- **Mouse Interactivity**: Smooth mouse tracking with momentum for user interaction
- **Performance Optimization**: Adaptive quality settings for different devices
- **Customizable Color Schemes**: Multiple predefined color schemes and custom options

## Quick Start

### Basic Integration

```html
<!-- Include the required scripts -->
<script src="hyperav/core/GeometryManager.js"></script>
<script src="hyperav/core/HypercubeCore.js"></script>
<script src="hyperav/core/ProjectionManager.js"></script>
<script src="hyperav/core/ShaderManager.js"></script>
<script src="hyperav/sound/modules/AnalysisModule.js"></script>
<script src="hyperav/sound/modules/EffectsModule.js"></script>
<script src="hyperav/sound/SoundInterface.js"></script>
<script src="hyperav/UniversalHyperAV.js"></script>

<script>
// Initialize the HyperAV system
const hyperAV = new UniversalHyperAV({
    containerId: 'hyperav-container',  // Optional, will create if not exists
    colorScheme: 'vaporwave',
    intensity: 1.0,
    audioReactive: true,
    renderMode: 'background'
});

// Switch between worlds
hyperAV.activateWorld('quantum_field');

// Update world parameters
hyperAV.updateCurrentWorld({
    colorScheme: 'neon',
    intensity: 1.2
});
</script>
```

## Configuration Options

When initializing the UniversalHyperAV class, you can provide the following options:

```javascript
const hyperAV = new UniversalHyperAV({
    // Container
    containerId: 'hyperav-container',  // ID of container element (created if not exists)
    zIndex: -1,                        // CSS z-index for container
    
    // Visual Parameters
    colorScheme: 'vaporwave',          // Base color scheme
    density: 0.7,                      // Element density
    intensity: 0.8,                    // Visual intensity
    dimensionality: 4.0,               // 4D dimensionality factor
    renderMode: 'background',          // 'background' or 'fullscreen'
    
    // Audio Settings
    audioReactive: true,               // Enable audio reactivity
    
    // Effects
    dynamicLighting: true,             // Enable dynamic lighting effects
    
    // World Configuration
    activeWorld: 'default',            // Initial world to activate
    transitionDuration: 1500,          // Duration of world transitions in ms
    worldConfigs: {                    // Custom world configurations
        myWorld: {
            name: 'myWorld',
            colorScheme: 'cyber',
            dimensionality: 4.2,
            // See World Configuration section for more options
        }
    },
    
    // Callbacks
    onWorldChange: (worldName, config) => {},  // Called when world changes
    onTransitionStart: (fromWorld, toWorld) => {}, // Called at transition start
    onTransitionEnd: (fromWorld, toWorld) => {}, // Called at transition end
    onError: (error) => {},            // Called on errors
    
    // Initialization
    autoInit: true                     // Auto-initialize on creation
});
```

## World Configuration

Each world can have the following configuration options:

```javascript
{
    name: 'myWorld',               // World name
    colorScheme: 'vaporwave',      // Color scheme (see available schemes)
    dimensionality: 4.0,           // 4D dimensionality factor (3.5-5.0)
    intensity: 1.0,                // Overall intensity of effects
    rotationSpeed: 0.2,            // Base rotation speed
    universeModifier: 1.0,         // Universe spatial distortion factor
    patternIntensity: 0.8,         // Pattern/detail intensity
    gridDensity: 8.0,              // Grid line density
    worldBlend: 0.5,               // Visualization mode blend factor (0-1)
    worldIntensity: 1.0,           // World effect strength
    morphFactor: 0.5               // Shape morphing factor (0-1.5)
}
```

### Available Color Schemes

- **Original schemes**: `vaporwave`, `quantum`, `cyber`, `cosmic`, `editorial`, `culture`, `tech`, `interview`, `lore`
- **World-specific schemes**: `lattice`, `quantum_field`, `vortex`, `nebula`, `circuit`
- **High contrast schemes**: `neon`, `eclipse`, `sunrise`, `digital`, `ocean`

## API Reference

### Methods

- `initialize()`: Initialize the system (called automatically if autoInit is true)
- `addWorld(worldName, worldConfig)`: Add a new world configuration
- `activateWorld(worldName)`: Switch to a different world with transition
- `updateCurrentWorld(params)`: Update parameters of the current world
- `dispose()`: Clean up resources

## Performance Considerations

- The visualization quality automatically adjusts based on the device's performance
- For low-end devices, you may want to:
  - Reduce `density` and `intensity` values
  - Set smaller canvas dimensions
  - Disable `audioReactive` if not needed
  - Use simpler worlds like `lattice_world` or `circuit_world`

## Audio Integration

The system will automatically connect to audio input if available, or use simulated audio data if permission is not granted. For best results, play music in the background or grant microphone access.

## Browser Compatibility

- Works in all modern browsers that support WebGL
- Best performance in Chrome and Firefox
- Mobile support is limited based on GPU capabilities

## Examples

See `public/hyperav-demo.html` for a complete example of how to use the HyperAV system with various configurations and world types.