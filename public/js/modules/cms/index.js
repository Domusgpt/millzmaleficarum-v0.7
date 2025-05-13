/**
 * Content Management System Module Index
 * Exports all CMS components
 */

import CMSStorage from './storage';
import CMSInterface from './interface';
import { cmsStyles } from './styles';

/**
 * Initialize the CMS system
 * @param {string} containerId - The ID of the container element to mount the CMS
 * @param {Object} options - Configuration options
 * @returns {Object} - The initialized CMS components
 */
export function initCMS(containerId, options = {}) {
  // Add CMS styles to the document
  const styleSheet = document.createElement('style');
  styleSheet.textContent = cmsStyles;
  document.head.appendChild(styleSheet);
  
  // Create storage with options
  const storage = new CMSStorage(options.storage || {});
  
  // Create interface with options
  const interface = new CMSInterface({
    containerId,
    storageConfig: options.storage || {},
    ...options.interface
  });
  
  console.log('CMS System: Initialized');
  
  return {
    storage,
    interface
  };
}

export { CMSStorage, CMSInterface, cmsStyles };
export default initCMS;