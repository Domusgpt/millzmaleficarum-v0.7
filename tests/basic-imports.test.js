/**
 * Basic import tests to verify ES6 module structure
 */

// Portal module
import PortalTransitions, { portalStyles } from '../public/js/modules/portal/PortalTransitions.js';

// HyperAV modules
import HyperAV from '../public/js/modules/hyperav/core/HyperAV.js';
import HyperAVAudio, { audioStyles } from '../public/js/modules/hyperav/audio/HyperAVAudio.js';

// CMS modules
import CMSStorage from '../public/js/modules/cms/storage.js';
import CMSInterface from '../public/js/modules/cms/interface.js';
import { cmsStyles } from '../public/js/modules/cms/styles.js';

describe('ES6 Module Structure', () => {
  test('Portal modules are properly exported', () => {
    expect(PortalTransitions).toBeDefined();
    expect(typeof PortalTransitions).toBe('function'); // Class constructor
    expect(portalStyles).toBeDefined();
    expect(typeof portalStyles).toBe('string');
  });

  test('HyperAV modules are properly exported', () => {
    expect(HyperAV).toBeDefined();
    expect(typeof HyperAV).toBe('function'); // Class constructor
    expect(HyperAVAudio).toBeDefined();
    expect(typeof HyperAVAudio).toBe('function'); // Class constructor
    expect(audioStyles).toBeDefined();
    expect(typeof audioStyles).toBe('string');
  });

  test('CMS modules are properly exported', () => {
    expect(CMSStorage).toBeDefined();
    expect(typeof CMSStorage).toBe('function'); // Class constructor
    expect(CMSInterface).toBeDefined();
    expect(typeof CMSInterface).toBe('function'); // Class constructor
    expect(cmsStyles).toBeDefined();
    expect(typeof cmsStyles).toBe('string');
  });
});