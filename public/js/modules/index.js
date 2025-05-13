/**
 * MillzMaleficarum Codex v0.6
 * Main module index that exports all module components
 */

// Export Portal Transitions module
import PortalTransitions, { portalStyles } from './portal/index.js';

// Export HyperAV modules
import HyperAV from './hyperav/core/index.js';
import HyperAVAudio, { audioStyles } from './hyperav/audio/index.js';
import initHyperAVSystem from './hyperav/loader.js';

// Export CMS modules
import CMSStorage from './cms/storage.js';
import CMSInterface from './cms/interface.js';
import { cmsStyles } from './cms/styles.js';
import initCMS from './cms/index.js';

// Export all modules
export {
  // Portal module
  PortalTransitions,
  portalStyles,
  
  // HyperAV modules
  HyperAV,
  HyperAVAudio,
  audioStyles,
  initHyperAVSystem,
  
  // CMS modules
  CMSStorage,
  CMSInterface,
  cmsStyles,
  initCMS
};

// Export default object containing all modules
export default {
  Portal: {
    PortalTransitions,
    portalStyles
  },
  HyperAV: {
    Core: HyperAV,
    Audio: HyperAVAudio,
    audioStyles,
    initSystem: initHyperAVSystem
  },
  CMS: {
    Storage: CMSStorage,
    Interface: CMSInterface,
    styles: cmsStyles,
    init: initCMS
  }
};