/**
 * HyperAV Module Index - v0.8
 * Hyperdimensional Audio-Visual Engine with Enhanced Visualization System
 */

// Import core components
import HyperAV from './core/index.js';
import HyperAVAudio, { audioStyles } from './audio/index.js';

// Import enhanced components
import { EnhancedHyperAV, createEnhancedHyperAV } from './enhanced-hyperav.js';
import { MagazineHyperAV } from './magazine-integration.js';

// Re-export everything
export { 
  HyperAV, 
  HyperAVAudio, 
  audioStyles,
  EnhancedHyperAV,
  createEnhancedHyperAV,
  MagazineHyperAV
};

// Export a comprehensive default object
export default {
  HyperAV,
  HyperAVAudio,
  audioStyles,
  EnhancedHyperAV,
  createEnhancedHyperAV,
  MagazineHyperAV
};