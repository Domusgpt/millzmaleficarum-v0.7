/**
 * Content Management System Storage Module
 * Handles saving and loading magazine content between server and client
 */

export class CMSStorage {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      apiEndpoint: options.apiEndpoint || '/api/magazine-data',
      localStorageKey: options.localStorageKey || 'millz_cms_data',
      enableLocalBackup: options.enableLocalBackup !== false,
      enableAutoSync: options.enableAutoSync || false,
      autoSyncInterval: options.autoSyncInterval || 60000, // 1 minute
      useRichFormat: options.useRichFormat !== false
    };

    // State
    this.state = {
      lastSyncTime: null,
      syncInterval: null,
      currentContent: null
    };

    // Initialize
    this._initialize();
  }

  /**
   * Initialize the storage system
   */
  _initialize() {
    // Set up auto-sync if enabled
    if (this.config.enableAutoSync) {
      this.state.syncInterval = setInterval(() => {
        this._autoSync();
      }, this.config.autoSyncInterval);
      
      console.log(`CMS Storage: Auto-sync enabled (${this.config.autoSyncInterval / 1000}s interval)`);
    }
  }

  /**
   * Perform an automatic sync with the server
   */
  async _autoSync() {
    try {
      // Only sync if we have current content
      if (this.state.currentContent) {
        await this.pushToServer(this.state.currentContent);
        this.state.lastSyncTime = Date.now();
        console.log('CMS Storage: Auto-sync completed successfully');
      }
    } catch (error) {
      console.error('CMS Storage: Auto-sync failed', error);
    }
  }

  /**
   * Save content to local storage
   * @param {Object} content - The magazine content to save
   * @returns {Promise<boolean>} - True if save was successful
   */
  async saveContent(content) {
    try {
      // Update current content
      this.state.currentContent = content;
      
      // Save to localStorage if enabled
      if (this.config.enableLocalBackup) {
        localStorage.setItem(this.config.localStorageKey, JSON.stringify(content));
      }
      
      return true;
    } catch (error) {
      console.error('CMS Storage: Failed to save content locally', error);
      return false;
    }
  }

  /**
   * Load content from local storage or fetch from API if not available
   * @returns {Promise<Object>} - The loaded magazine content
   */
  async loadContent() {
    try {
      // First try to load from localStorage if enabled
      if (this.config.enableLocalBackup) {
        const localData = localStorage.getItem(this.config.localStorageKey);
        
        if (localData) {
          const parsedData = JSON.parse(localData);
          this.state.currentContent = parsedData;
          console.log('CMS Storage: Loaded content from local storage');
          return parsedData;
        }
      }
      
      // If not in localStorage or local backup disabled, fetch from API
      const fetchedData = await this.fetchFromServer();
      
      // Save fetched data to localStorage
      if (this.config.enableLocalBackup) {
        localStorage.setItem(this.config.localStorageKey, JSON.stringify(fetchedData));
      }
      
      // Update current content
      this.state.currentContent = fetchedData;
      console.log('CMS Storage: Loaded content from server');
      
      return fetchedData;
    } catch (error) {
      console.error('CMS Storage: Failed to load content', error);
      throw new Error('Failed to load magazine content');
    }
  }

  /**
   * Fetch content from the server API
   * @returns {Promise<Object>} - The fetched magazine content
   */
  async fetchFromServer() {
    try {
      // Construct URL with format parameter if using rich format
      let url = this.config.apiEndpoint;
      if (this.config.useRichFormat) {
        url += '?format=rich';
      }
      
      // Fetch data from API
      const response = await fetch(url);
      
      // Check response status
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Parse response JSON
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CMS Storage: Failed to fetch content from server', error);
      throw new Error('Failed to fetch magazine content from server');
    }
  }

  /**
   * Push content to the server API
   * @param {Object} content - The magazine content to push
   * @returns {Promise<Object>} - The server response
   */
  async pushToServer(content) {
    try {
      // Send POST request to API
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(content)
      });
      
      // Check response status
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Parse response JSON
      const data = await response.json();
      
      // Update last sync time
      this.state.lastSyncTime = Date.now();
      
      return data;
    } catch (error) {
      console.error('CMS Storage: Failed to push content to server', error);
      throw new Error('Failed to push content to server');
    }
  }

  /**
   * Clear all locally stored content
   * @returns {Promise<boolean>} - True if clear was successful
   */
  async clearLocalContent() {
    try {
      if (this.config.enableLocalBackup) {
        localStorage.removeItem(this.config.localStorageKey);
      }
      
      this.state.currentContent = null;
      return true;
    } catch (error) {
      console.error('CMS Storage: Failed to clear local content', error);
      return false;
    }
  }

  /**
   * Get the timestamp of the last successful sync
   * @returns {number|null} - Timestamp or null if never synced
   */
  getLastSyncTime() {
    return this.state.lastSyncTime;
  }

  /**
   * Stop auto-sync and clean up resources
   */
  destroy() {
    if (this.state.syncInterval) {
      clearInterval(this.state.syncInterval);
      this.state.syncInterval = null;
    }
    
    console.log('CMS Storage: Destroyed');
  }
}

export default CMSStorage;