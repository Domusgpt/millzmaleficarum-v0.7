/**
 * Unit tests for the Content Management System storage module
 */

import { CMSStorage } from '../../../public/js/modules/cms/storage';

// Mock localStorage
const mockLocalStorage = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    _getStore: () => store
  };
})();

// Mock fetch
global.fetch = jest.fn();

// Assign mock localStorage to global
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('CMSStorage Module', () => {
  const cmsStorage = new CMSStorage({
    apiEndpoint: '/api/magazine-data',
    localStorageKey: 'millz_cms_content',
    enableLocalBackup: true
  });

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    mockLocalStorage.clear();
    
    // Setup default success fetch response
    global.fetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ success: true, data: { title: 'Test Magazine' } })
      })
    );
  });

  test('should initialize with default options', () => {
    // Create with defaults
    const defaultStorage = new CMSStorage();
    
    expect(defaultStorage.config.apiEndpoint).toBe('/api/magazine-data');
    expect(defaultStorage.config.localStorageKey).toBe('millz_cms_data');
    expect(defaultStorage.config.enableLocalBackup).toBe(true);
    expect(defaultStorage.config.autoSyncInterval).toBe(60000);
  });

  test('should save content to localStorage when enabled', async () => {
    const content = { title: 'Test Content', sections: [] };
    
    await cmsStorage.saveContent(content);
    
    // Check localStorage was called with correct key and serialized content
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'millz_cms_content', 
      JSON.stringify(content)
    );
  });

  test('should load content from localStorage when available', async () => {
    // Setup mock data in localStorage
    const mockContent = { title: 'Local Content', sections: [] };
    mockLocalStorage.setItem('millz_cms_content', JSON.stringify(mockContent));
    
    const result = await cmsStorage.loadContent();
    
    // Check localStorage was read
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('millz_cms_content');
    
    // Check correct content was returned
    expect(result).toEqual(mockContent);
  });

  test('should load content from API when localStorage is empty', async () => {
    // Setup API response
    const mockApiContent = { title: 'API Content', sections: [] };
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockApiContent)
      })
    );
    
    const result = await cmsStorage.loadContent();
    
    // Check fetch was called with correct URL
    expect(fetch).toHaveBeenCalledWith('/api/magazine-data');
    
    // Check correct content was returned
    expect(result).toEqual(mockApiContent);
    
    // Check content was saved to localStorage
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'millz_cms_content', 
      JSON.stringify(mockApiContent)
    );
  });

  test('should push content to API', async () => {
    const content = { title: 'New Content', sections: [] };
    
    await cmsStorage.pushToServer(content);
    
    // Check fetch was called with correct options
    expect(fetch).toHaveBeenCalledWith('/api/magazine-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(content)
    });
  });

  test('should handle API errors gracefully', async () => {
    // Setup API error response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })
    );
    
    // Attempt to push content
    const content = { title: 'Error Content', sections: [] };
    
    // Should throw an error
    await expect(cmsStorage.pushToServer(content)).rejects.toThrow('Failed to push content to server');
  });

  test('should auto-sync content at intervals when enabled', () => {
    // Mock setInterval
    jest.useFakeTimers();
    const originalSetInterval = global.setInterval;
    global.setInterval = jest.fn();
    
    // Create storage with auto-sync enabled
    const autoSyncStorage = new CMSStorage({
      enableAutoSync: true,
      autoSyncInterval: 30000 // 30 seconds
    });
    
    // Check that setInterval was called
    expect(global.setInterval).toHaveBeenCalled();
    expect(global.setInterval.mock.calls[0][1]).toBe(30000);
    
    // Restore original setInterval
    global.setInterval = originalSetInterval;
    jest.useRealTimers();
  });
});