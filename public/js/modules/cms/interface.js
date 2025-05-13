/**
 * Content Management System UI Interface Module
 * Provides a user interface for managing magazine content
 */

import CMSStorage from './storage';

export class CMSInterface {
  constructor(options = {}) {
    // Default configuration
    this.config = {
      containerId: options.containerId || 'cms-container',
      storageConfig: options.storageConfig || {},
      showSectionPreview: options.showSectionPreview !== false,
      enableRichEditor: options.enableRichEditor !== false,
      autoSave: options.autoSave !== false
    };

    // State
    this.state = {
      storage: null,
      editors: [],
      currentSection: null,
      currentContent: null,
      hasUnsavedChanges: false,
      autoSaveTimeout: null
    };

    // Initialize
    this._initialize();
  }

  /**
   * Initialize the CMS interface
   */
  _initialize() {
    // Create storage instance
    this.state.storage = new CMSStorage(this.config.storageConfig);
    
    // Get container element
    this.container = document.getElementById(this.config.containerId);
    if (!this.container) {
      console.error('CMS Interface: Container element not found');
      return;
    }
    
    // Create UI elements
    this._createInterface();
    
    // Load initial content
    this._loadContent();
    
    console.log('CMS Interface: Initialized');
  }

  /**
   * Create the CMS interface elements
   */
  _createInterface() {
    // Clear container
    this.container.innerHTML = '';
    
    // Create header section
    const header = document.createElement('div');
    header.className = 'cms-header';
    header.innerHTML = `
      <h1>MillzMaleficarum Magazine Editor</h1>
      <div class="cms-controls">
        <button id="cms-save-btn" class="cms-btn cms-btn-primary">Save Changes</button>
        <button id="cms-publish-btn" class="cms-btn cms-btn-highlight">Publish to Server</button>
        <button id="cms-reset-btn" class="cms-btn cms-btn-danger">Reset Changes</button>
      </div>
    `;
    this.container.appendChild(header);
    
    // Create main editor section
    const editorContainer = document.createElement('div');
    editorContainer.className = 'cms-editor-container';
    
    // Create sidebar for section navigation
    const sidebar = document.createElement('div');
    sidebar.className = 'cms-sidebar';
    sidebar.innerHTML = `
      <h3>Magazine Sections</h3>
      <ul id="cms-section-list" class="cms-section-list"></ul>
    `;
    editorContainer.appendChild(sidebar);
    
    // Create main editor area
    const editor = document.createElement('div');
    editor.className = 'cms-editor';
    editor.innerHTML = `
      <div id="cms-editor-header" class="cms-editor-header">
        <h2 id="cms-section-title">Select a section</h2>
      </div>
      <div id="cms-editor-content" class="cms-editor-content">
        <div class="cms-empty-state">
          <p>Select a section from the sidebar to begin editing</p>
        </div>
      </div>
    `;
    editorContainer.appendChild(editor);
    
    // Create preview panel if enabled
    if (this.config.showSectionPreview) {
      const preview = document.createElement('div');
      preview.className = 'cms-preview';
      preview.innerHTML = `
        <h3>Preview</h3>
        <div id="cms-preview-content" class="cms-preview-content">
          <div class="cms-empty-preview">No content selected</div>
        </div>
      `;
      editorContainer.appendChild(preview);
    }
    
    this.container.appendChild(editorContainer);
    
    // Create footer with status
    const footer = document.createElement('div');
    footer.className = 'cms-footer';
    footer.innerHTML = `
      <div id="cms-status" class="cms-status">Ready</div>
      <div class="cms-version">v0.6</div>
    `;
    this.container.appendChild(footer);
    
    // Add event listeners
    this._attachEventListeners();
  }

  /**
   * Attach event listeners to UI elements
   */
  _attachEventListeners() {
    // Save button
    const saveBtn = document.getElementById('cms-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this._saveContent());
    }
    
    // Publish button
    const publishBtn = document.getElementById('cms-publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => this._publishContent());
    }
    
    // Reset button
    const resetBtn = document.getElementById('cms-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this._resetContent());
    }
    
    // Handle beforeunload event to warn about unsaved changes
    window.addEventListener('beforeunload', (event) => {
      if (this.state.hasUnsavedChanges) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.returnValue = message;
        return message;
      }
    });
  }

  /**
   * Load content from storage and populate the interface
   */
  async _loadContent() {
    try {
      // Set status
      this._setStatus('Loading content...', 'loading');
      
      // Get content from storage
      const content = await this.state.storage.loadContent();
      this.state.currentContent = content;
      
      // Populate section list
      this._populateSectionList(content);
      
      // Reset unsaved changes flag
      this.state.hasUnsavedChanges = false;
      
      // Set status
      this._setStatus('Content loaded successfully', 'success');
    } catch (error) {
      console.error('CMS Interface: Failed to load content', error);
      this._setStatus('Failed to load content', 'error');
    }
  }

  /**
   * Populate the section list based on current content
   * @param {Object} content - The magazine content
   */
  _populateSectionList(content) {
    const sectionList = document.getElementById('cms-section-list');
    if (!sectionList) return;
    
    // Clear existing list
    sectionList.innerHTML = '';
    
    // Get sections based on content format
    let sections = [];
    
    // Handle rich format
    if (content.sections && typeof content.sections === 'object' && !Array.isArray(content.sections)) {
      sections = Object.keys(content.sections).map(key => ({
        id: key,
        title: this._getSectionTitle(content.sections[key], key)
      }));
    }
    // Handle legacy format
    else if (content.sections && Array.isArray(content.sections)) {
      sections = content.sections.map((section, index) => ({
        id: `section-${index}`,
        title: section.title || `Section ${index + 1}`
      }));
    }
    
    // Add metadata section
    sections.unshift({
      id: 'metadata',
      title: 'Magazine Metadata'
    });
    
    // Create list items
    sections.forEach(section => {
      const item = document.createElement('li');
      item.className = 'cms-section-item';
      item.innerHTML = `
        <span class="cms-section-name">${section.title}</span>
      `;
      item.dataset.sectionId = section.id;
      
      // Add click event
      item.addEventListener('click', () => {
        this._selectSection(section.id);
      });
      
      sectionList.appendChild(item);
    });
  }

  /**
   * Get a user-friendly title for a section
   * @param {Object} sectionData - The section data
   * @param {string} key - The section key
   * @returns {string} - The section title
   */
  _getSectionTitle(sectionData, key) {
    // Try to find a title in the section data
    if (sectionData.title) return sectionData.title;
    if (sectionData.headline) return sectionData.headline;
    
    // Format the key as a title
    return key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  /**
   * Select a section to edit
   * @param {string} sectionId - The ID of the section to select
   */
  _selectSection(sectionId) {
    // Update selected section in UI
    const sectionItems = document.querySelectorAll('.cms-section-item');
    sectionItems.forEach(item => {
      if (item.dataset.sectionId === sectionId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
    
    // Update current section
    this.state.currentSection = sectionId;
    
    // Load section content into editor
    this._loadSectionEditor(sectionId);
  }

  /**
   * Load the editor for a specific section
   * @param {string} sectionId - The ID of the section to edit
   */
  _loadSectionEditor(sectionId) {
    const editorContent = document.getElementById('cms-editor-content');
    const sectionTitle = document.getElementById('cms-section-title');
    
    if (!editorContent || !sectionTitle) return;
    
    // Clear existing editor
    editorContent.innerHTML = '';
    
    // Get section data
    let sectionData = null;
    let title = '';
    
    if (sectionId === 'metadata') {
      // Handle metadata section
      sectionData = {
        title: this.state.currentContent.title || '',
        issue_number: this.state.currentContent.issue_number || '',
        date: this.state.currentContent.date || '',
        theme: this.state.currentContent.theme || ''
      };
      title = 'Magazine Metadata';
    } else {
      // Handle content section
      if (this.state.currentContent.sections) {
        if (typeof this.state.currentContent.sections === 'object' && !Array.isArray(this.state.currentContent.sections)) {
          // Rich format
          sectionData = this.state.currentContent.sections[sectionId];
        } else if (Array.isArray(this.state.currentContent.sections)) {
          // Legacy format
          const index = parseInt(sectionId.replace('section-', ''));
          sectionData = this.state.currentContent.sections[index];
        }
      }
      
      title = this._getSectionTitle(sectionData || {}, sectionId);
    }
    
    // Set section title
    sectionTitle.textContent = title;
    
    // Create editor form
    if (sectionData) {
      const form = document.createElement('form');
      form.className = 'cms-form';
      form.id = `cms-form-${sectionId}`;
      
      // Create form fields based on section data
      Object.keys(sectionData).forEach(key => {
        const value = sectionData[key];
        const formGroup = this._createFormField(key, value);
        form.appendChild(formGroup);
      });
      
      // Add submit handler
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this._updateSectionData(sectionId, form);
      });
      
      // Add input change handlers for auto-save
      if (this.config.autoSave) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
          input.addEventListener('input', () => {
            this._handleAutoSave(sectionId, form);
          });
        });
      }
      
      editorContent.appendChild(form);
    } else {
      // Show empty state
      editorContent.innerHTML = `
        <div class="cms-empty-state">
          <p>No data available for this section</p>
        </div>
      `;
    }
    
    // Update preview if enabled
    if (this.config.showSectionPreview) {
      this._updatePreview(sectionId, sectionData);
    }
  }

  /**
   * Create a form field based on key and value
   * @param {string} key - The field key
   * @param {any} value - The field value
   * @returns {HTMLElement} - The form field element
   */
  _createFormField(key, value) {
    const formGroup = document.createElement('div');
    formGroup.className = 'cms-form-group';
    
    // Create label
    const label = document.createElement('label');
    label.setAttribute('for', `field-${key}`);
    label.textContent = key.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    formGroup.appendChild(label);
    
    // Create input based on value type
    let input;
    
    if (typeof value === 'string' && value.length > 100) {
      // Long text - use textarea
      input = document.createElement('textarea');
      input.rows = 10;
      input.value = value;
    } else if (typeof value === 'string') {
      // Short text - use text input
      input = document.createElement('input');
      input.type = 'text';
      input.value = value;
    } else if (typeof value === 'number') {
      // Number - use number input
      input = document.createElement('input');
      input.type = 'number';
      input.value = value;
    } else if (typeof value === 'boolean') {
      // Boolean - use checkbox
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = value;
    } else if (Array.isArray(value)) {
      // Array - create expandable section
      input = document.createElement('div');
      input.className = 'cms-array-field';
      
      // Add header with count
      const header = document.createElement('div');
      header.className = 'cms-array-header';
      header.innerHTML = `
        <span>${value.length} items</span>
        <button type="button" class="cms-btn cms-btn-small cms-array-expand">Expand</button>
      `;
      input.appendChild(header);
      
      // Add array container
      const arrayContainer = document.createElement('div');
      arrayContainer.className = 'cms-array-container hidden';
      
      // Add array items
      value.forEach((item, index) => {
        const itemContainer = document.createElement('div');
        itemContainer.className = 'cms-array-item';
        
        if (typeof item === 'object') {
          // Object items
          Object.keys(item).forEach(itemKey => {
            const subField = this._createFormField(`${key}[${index}].${itemKey}`, item[itemKey]);
            itemContainer.appendChild(subField);
          });
        } else {
          // Simple items
          const subField = this._createFormField(`${key}[${index}]`, item);
          itemContainer.appendChild(subField);
        }
        
        arrayContainer.appendChild(itemContainer);
      });
      
      input.appendChild(arrayContainer);
      
      // Add expand/collapse handler
      header.querySelector('.cms-array-expand').addEventListener('click', () => {
        arrayContainer.classList.toggle('hidden');
        header.querySelector('.cms-array-expand').textContent = 
          arrayContainer.classList.contains('hidden') ? 'Expand' : 'Collapse';
      });
      
      // Skip the rest of the processing for arrays
      formGroup.appendChild(input);
      return formGroup;
    } else if (typeof value === 'object' && value !== null) {
      // Object - create expandable section
      input = document.createElement('div');
      input.className = 'cms-object-field';
      
      // Add header
      const header = document.createElement('div');
      header.className = 'cms-object-header';
      header.innerHTML = `
        <span>Object</span>
        <button type="button" class="cms-btn cms-btn-small cms-object-expand">Expand</button>
      `;
      input.appendChild(header);
      
      // Add object container
      const objectContainer = document.createElement('div');
      objectContainer.className = 'cms-object-container hidden';
      
      // Add object properties
      Object.keys(value).forEach(propKey => {
        const subField = this._createFormField(`${key}.${propKey}`, value[propKey]);
        objectContainer.appendChild(subField);
      });
      
      input.appendChild(objectContainer);
      
      // Add expand/collapse handler
      header.querySelector('.cms-object-expand').addEventListener('click', () => {
        objectContainer.classList.toggle('hidden');
        header.querySelector('.cms-object-expand').textContent = 
          objectContainer.classList.contains('hidden') ? 'Expand' : 'Collapse';
      });
      
      // Skip the rest of the processing for objects
      formGroup.appendChild(input);
      return formGroup;
    } else {
      // Default - use text input
      input = document.createElement('input');
      input.type = 'text';
      input.value = value !== null && value !== undefined ? String(value) : '';
    }
    
    // Set common attributes
    input.id = `field-${key}`;
    input.name = key;
    input.className = 'cms-input';
    
    // Add input to form group
    formGroup.appendChild(input);
    
    return formGroup;
  }

  /**
   * Update section data from form values
   * @param {string} sectionId - The ID of the section to update
   * @param {HTMLFormElement} form - The form element with updated values
   */
  _updateSectionData(sectionId, form) {
    // Get form values
    const formData = new FormData(form);
    const updatedData = {};
    
    // Convert form data to object
    for (const [key, value] of formData.entries()) {
      // Handle nested properties
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = updatedData;
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          
          // Handle array notation
          if (part.includes('[')) {
            const arrayParts = part.split('[');
            const arrayName = arrayParts[0];
            const index = parseInt(arrayParts[1]);
            
            if (!current[arrayName]) {
              current[arrayName] = [];
            }
            
            if (!current[arrayName][index]) {
              current[arrayName][index] = {};
            }
            
            current = current[arrayName][index];
          } else {
            if (!current[part]) {
              current[part] = {};
            }
            current = current[part];
          }
        }
        
        current[parts[parts.length - 1]] = value;
      } else {
        updatedData[key] = value;
      }
    }
    
    // Update content
    if (sectionId === 'metadata') {
      // Update metadata fields
      Object.keys(updatedData).forEach(key => {
        this.state.currentContent[key] = updatedData[key];
      });
    } else {
      // Update section data
      if (this.state.currentContent.sections) {
        if (typeof this.state.currentContent.sections === 'object' && !Array.isArray(this.state.currentContent.sections)) {
          // Rich format
          this.state.currentContent.sections[sectionId] = {
            ...this.state.currentContent.sections[sectionId],
            ...updatedData
          };
        } else if (Array.isArray(this.state.currentContent.sections)) {
          // Legacy format
          const index = parseInt(sectionId.replace('section-', ''));
          this.state.currentContent.sections[index] = {
            ...this.state.currentContent.sections[index],
            ...updatedData
          };
        }
      }
    }
    
    // Mark as having unsaved changes
    this.state.hasUnsavedChanges = true;
    
    // Update preview
    if (this.config.showSectionPreview) {
      this._updatePreview(sectionId, sectionId === 'metadata' ? updatedData : this.state.currentContent.sections[sectionId]);
    }
    
    // Set status
    this._setStatus('Changes saved to editor', 'pending');
  }

  /**
   * Handle auto-save when form fields change
   * @param {string} sectionId - The ID of the section to update
   * @param {HTMLFormElement} form - The form element with updated values
   */
  _handleAutoSave(sectionId, form) {
    // Clear existing timeout
    if (this.state.autoSaveTimeout) {
      clearTimeout(this.state.autoSaveTimeout);
    }
    
    // Set status
    this._setStatus('Editing...', 'pending');
    
    // Schedule auto-save
    this.state.autoSaveTimeout = setTimeout(() => {
      this._updateSectionData(sectionId, form);
      this._saveContent();
    }, 2000); // 2 second delay
  }

  /**
   * Update the preview panel for the current section
   * @param {string} sectionId - The ID of the section to preview
   * @param {object} sectionData - The section data to preview
   */
  _updatePreview(sectionId, sectionData) {
    const previewContent = document.getElementById('cms-preview-content');
    if (!previewContent) return;
    
    // Clear existing preview
    previewContent.innerHTML = '';
    
    if (!sectionData) {
      previewContent.innerHTML = `<div class="cms-empty-preview">No content to preview</div>`;
      return;
    }
    
    // Create preview based on section type
    if (sectionId === 'metadata') {
      // Metadata preview
      const metadataPreview = document.createElement('div');
      metadataPreview.className = 'cms-metadata-preview';
      metadataPreview.innerHTML = `
        <h4>${sectionData.title || 'Untitled'}</h4>
        <div class="cms-metadata-item">Issue: ${sectionData.issue_number || 'N/A'}</div>
        <div class="cms-metadata-item">Date: ${sectionData.date || 'N/A'}</div>
        <div class="cms-metadata-item">Theme: ${sectionData.theme || 'None'}</div>
      `;
      previewContent.appendChild(metadataPreview);
    } else {
      // Section content preview
      const contentPreview = document.createElement('div');
      contentPreview.className = 'cms-content-preview';
      
      // Title/headline
      if (sectionData.title) {
        const title = document.createElement('h4');
        title.textContent = sectionData.title;
        contentPreview.appendChild(title);
      } else if (sectionData.headline) {
        const headline = document.createElement('h4');
        headline.textContent = sectionData.headline;
        contentPreview.appendChild(headline);
      }
      
      // Content text
      if (sectionData.content) {
        const content = document.createElement('div');
        content.className = 'cms-preview-text';
        content.textContent = sectionData.content.length > 300 
          ? sectionData.content.substring(0, 300) + '...' 
          : sectionData.content;
        contentPreview.appendChild(content);
      } else if (sectionData.body) {
        const body = document.createElement('div');
        body.className = 'cms-preview-text';
        body.textContent = sectionData.body.length > 300 
          ? sectionData.body.substring(0, 300) + '...' 
          : sectionData.body;
        contentPreview.appendChild(body);
      } else if (sectionData.article) {
        const article = document.createElement('div');
        article.className = 'cms-preview-text';
        article.textContent = sectionData.article.length > 300 
          ? sectionData.article.substring(0, 300) + '...' 
          : sectionData.article;
        contentPreview.appendChild(article);
      } else if (sectionData.text) {
        const text = document.createElement('div');
        text.className = 'cms-preview-text';
        text.textContent = sectionData.text.length > 300 
          ? sectionData.text.substring(0, 300) + '...' 
          : sectionData.text;
        contentPreview.appendChild(text);
      }
      
      previewContent.appendChild(contentPreview);
    }
  }

  /**
   * Save content to local storage
   */
  async _saveContent() {
    try {
      // Set status
      this._setStatus('Saving content...', 'loading');
      
      // Save to local storage
      await this.state.storage.saveContent(this.state.currentContent);
      
      // Update status
      this.state.hasUnsavedChanges = false;
      this._setStatus('Content saved locally', 'success');
    } catch (error) {
      console.error('CMS Interface: Failed to save content', error);
      this._setStatus('Failed to save content', 'error');
    }
  }

  /**
   * Publish content to the server
   */
  async _publishContent() {
    try {
      // Set status
      this._setStatus('Publishing to server...', 'loading');
      
      // Save changes locally first
      await this.state.storage.saveContent(this.state.currentContent);
      
      // Push to server
      await this.state.storage.pushToServer(this.state.currentContent);
      
      // Update status
      this.state.hasUnsavedChanges = false;
      this._setStatus('Published to server successfully', 'success');
    } catch (error) {
      console.error('CMS Interface: Failed to publish content', error);
      this._setStatus('Failed to publish to server', 'error');
    }
  }

  /**
   * Reset content to the last saved version
   */
  async _resetContent() {
    if (confirm('Are you sure you want to reset all changes?')) {
      try {
        // Set status
        this._setStatus('Resetting content...', 'loading');
        
        // Reload content from storage
        await this._loadContent();
        
        // If a section is selected, reload it
        if (this.state.currentSection) {
          this._selectSection(this.state.currentSection);
        }
        
        // Update status
        this._setStatus('Content reset successfully', 'success');
      } catch (error) {
        console.error('CMS Interface: Failed to reset content', error);
        this._setStatus('Failed to reset content', 'error');
      }
    }
  }

  /**
   * Set the status message
   * @param {string} message - The status message
   * @param {string} type - The status type (loading, success, error, pending)
   */
  _setStatus(message, type = 'info') {
    const statusElement = document.getElementById('cms-status');
    if (!statusElement) return;
    
    // Remove existing status classes
    statusElement.classList.remove('status-loading', 'status-success', 'status-error', 'status-pending');
    
    // Add new status class
    statusElement.classList.add(`status-${type}`);
    
    // Set message
    statusElement.textContent = message;
    
    // Auto-clear success/error messages after a delay
    if (type === 'success' || type === 'error') {
      setTimeout(() => {
        if (statusElement.textContent === message) {
          statusElement.textContent = type === 'success' ? 'Ready' : 'Error occurred';
          statusElement.classList.remove(`status-${type}`);
        }
      }, 5000);
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    // Clean up storage
    if (this.state.storage) {
      this.state.storage.destroy();
    }
    
    // Clear auto-save timeout
    if (this.state.autoSaveTimeout) {
      clearTimeout(this.state.autoSaveTimeout);
    }
    
    console.log('CMS Interface: Destroyed');
  }
}

export default CMSInterface;