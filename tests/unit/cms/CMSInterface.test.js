/**
 * Unit tests for the CMS Interface module
 */

import { CMSInterface } from '../../../public/js/modules/cms/interface';
import { CMSStorage } from '../../../public/js/modules/cms/storage';

// Mock CMSStorage
jest.mock('../../../public/js/modules/cms/storage', () => {
  return {
    CMSStorage: jest.fn().mockImplementation(() => ({
      loadContent: jest.fn(() => Promise.resolve({
        title: 'Test Magazine',
        issue_number: 126,
        date: '2025-05-15',
        sections: {
          cover: {
            title: 'Test Cover',
            blurb: 'This is a test cover section'
          },
          editorial: {
            title: 'Test Editorial',
            article: 'This is a test editorial article'
          }
        }
      })),
      saveContent: jest.fn(() => Promise.resolve(true)),
      pushToServer: jest.fn(() => Promise.resolve({ success: true })),
      destroy: jest.fn()
    })),
    __esModule: true,
    default: jest.fn()
  };
});

// Mock DOM elements
const mockElements = {};

// Mock document methods
document.getElementById = jest.fn(id => {
  if (!mockElements[id]) {
    mockElements[id] = createMockElement(id);
  }
  return mockElements[id];
});

document.createElement = jest.fn(tag => {
  const el = createMockElement(`mock-${tag}-${Math.random()}`);
  el.tagName = tag.toUpperCase();
  
  if (tag === 'form') {
    el.addEventListener = jest.fn((event, handler) => {
      el._events = el._events || {};
      el._events[event] = handler;
    });
    el.querySelectorAll = jest.fn(() => []);
  }
  
  return el;
});

document.querySelectorAll = jest.fn(() => []);

// Helper to create mock elements
function createMockElement(id) {
  return {
    id,
    innerHTML: '',
    textContent: '',
    className: '',
    style: {},
    dataset: {},
    classList: {
      add: jest.fn(),
      remove: jest.fn(),
      toggle: jest.fn(),
      contains: jest.fn(() => false)
    },
    appendChild: jest.fn(child => {
      return child;
    }),
    addEventListener: jest.fn(),
    querySelectorAll: jest.fn(() => []),
    querySelector: jest.fn(() => null),
    remove: jest.fn()
  };
}

// Mock window object
global.window = {
  addEventListener: jest.fn()
};

// Mock confirm dialog
global.confirm = jest.fn(() => true);

// Mock console methods
console.error = jest.fn();
console.log = jest.fn();

describe('CMSInterface Module', () => {
  let cmsInterface;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset mock elements
    for (const key in mockElements) {
      delete mockElements[key];
    }
    
    // Create test container
    mockElements['cms-container'] = createMockElement('cms-container');
    
    // Create instance
    cmsInterface = new CMSInterface({
      containerId: 'cms-container',
      showSectionPreview: true,
      enableRichEditor: true,
      autoSave: false
    });
  });

  test('should initialize with default configuration', () => {
    expect(cmsInterface).toBeDefined();
    expect(cmsInterface.config.containerId).toBe('cms-container');
    expect(cmsInterface.config.showSectionPreview).toBe(true);
    expect(cmsInterface.config.enableRichEditor).toBe(true);
    expect(cmsInterface.config.autoSave).toBe(false);
  });

  test('should create storage instance during initialization', () => {
    expect(CMSStorage).toHaveBeenCalled();
    expect(cmsInterface.state.storage).toBeDefined();
  });

  test('should create interface elements during initialization', () => {
    expect(document.getElementById).toHaveBeenCalledWith('cms-container');
    expect(mockElements['cms-container'].innerHTML).toBe('');
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(mockElements['cms-container'].appendChild).toHaveBeenCalled();
  });

  test('should load content during initialization', () => {
    expect(cmsInterface.state.storage.loadContent).toHaveBeenCalled();
  });

  test('should populate section list when content is loaded', async () => {
    // Mock section list element
    mockElements['cms-section-list'] = createMockElement('cms-section-list');
    
    // Mock current content
    cmsInterface.state.currentContent = {
      title: 'Test Magazine',
      issue_number: 126,
      date: '2025-05-15',
      sections: {
        cover: {
          title: 'Test Cover',
          blurb: 'This is a test cover section'
        },
        editorial: {
          title: 'Test Editorial',
          article: 'This is a test editorial article'
        }
      }
    };
    
    // Call populate method
    cmsInterface._populateSectionList(cmsInterface.state.currentContent);
    
    // Check that section list was cleared
    expect(mockElements['cms-section-list'].innerHTML).toBe('');
    
    // Check that document.createElement was called for list items
    expect(document.createElement).toHaveBeenCalledWith('li');
  });

  test('should select a section when requested', () => {
    // Mock selected section
    const mockSection = createMockElement('section1');
    mockSection.dataset.sectionId = 'cover';
    
    // Mock section list items
    document.querySelectorAll.mockReturnValueOnce([
      mockSection,
      createMockElement('section2')
    ]);
    
    // Mock editor elements
    mockElements['cms-editor-content'] = createMockElement('cms-editor-content');
    mockElements['cms-section-title'] = createMockElement('cms-section-title');
    
    // Mock current content
    cmsInterface.state.currentContent = {
      sections: {
        cover: {
          title: 'Test Cover',
          blurb: 'This is a test cover section'
        }
      }
    };
    
    // Select section
    cmsInterface._selectSection('cover');
    
    // Check that the section was selected
    expect(cmsInterface.state.currentSection).toBe('cover');
    expect(mockSection.classList.add).toHaveBeenCalledWith('selected');
    
    // Check that editor title was updated
    expect(mockElements['cms-section-title'].textContent).toBe('Test Cover');
  });

  test('should update section data from form', () => {
    // Mock form with data
    const mockForm = {
      id: 'mock-form',
      tagName: 'FORM'
    };
    
    // Add FormData mock
    const formData = new Map();
    formData.set('title', 'Updated Title');
    formData.set('blurb', 'Updated blurb text');
    
    global.FormData = jest.fn(() => ({
      entries: () => formData.entries()
    }));
    
    // Mock current content
    cmsInterface.state.currentContent = {
      sections: {
        cover: {
          title: 'Test Cover',
          blurb: 'This is a test cover section'
        }
      }
    };
    
    // Update section data
    cmsInterface._updateSectionData('cover', mockForm);
    
    // Check that content was updated
    expect(cmsInterface.state.currentContent.sections.cover.title).toBe('Updated Title');
    expect(cmsInterface.state.currentContent.sections.cover.blurb).toBe('Updated blurb text');
    
    // Check that unsaved changes flag is set
    expect(cmsInterface.state.hasUnsavedChanges).toBe(true);
  });

  test('should save content when requested', async () => {
    // Mock status element
    mockElements['cms-status'] = createMockElement('cms-status');
    
    // Set current content
    cmsInterface.state.currentContent = {
      title: 'Test Magazine',
      sections: {}
    };
    
    // Call save method
    await cmsInterface._saveContent();
    
    // Check that storage save was called
    expect(cmsInterface.state.storage.saveContent).toHaveBeenCalledWith(cmsInterface.state.currentContent);
    
    // Check that unsaved changes flag is reset
    expect(cmsInterface.state.hasUnsavedChanges).toBe(false);
    
    // Check that status was updated
    expect(mockElements['cms-status'].textContent).toBe('Content saved locally');
    expect(mockElements['cms-status'].classList.add).toHaveBeenCalledWith('status-success');
  });

  test('should publish content to server when requested', async () => {
    // Mock status element
    mockElements['cms-status'] = createMockElement('cms-status');
    
    // Set current content
    cmsInterface.state.currentContent = {
      title: 'Test Magazine',
      sections: {}
    };
    
    // Call publish method
    await cmsInterface._publishContent();
    
    // Check that storage save was called
    expect(cmsInterface.state.storage.saveContent).toHaveBeenCalledWith(cmsInterface.state.currentContent);
    
    // Check that storage push was called
    expect(cmsInterface.state.storage.pushToServer).toHaveBeenCalledWith(cmsInterface.state.currentContent);
    
    // Check that unsaved changes flag is reset
    expect(cmsInterface.state.hasUnsavedChanges).toBe(false);
    
    // Check that status was updated
    expect(mockElements['cms-status'].textContent).toBe('Published to server successfully');
    expect(mockElements['cms-status'].classList.add).toHaveBeenCalledWith('status-success');
  });

  test('should reset content when requested', async () => {
    // Mock status element
    mockElements['cms-status'] = createMockElement('cms-status');
    
    // Mock loadContent method
    cmsInterface._loadContent = jest.fn();
    cmsInterface._selectSection = jest.fn();
    
    // Set current section
    cmsInterface.state.currentSection = 'cover';
    
    // Call reset method
    await cmsInterface._resetContent();
    
    // Check that confirm dialog was shown
    expect(global.confirm).toHaveBeenCalled();
    
    // Check that content was reloaded
    expect(cmsInterface._loadContent).toHaveBeenCalled();
    
    // Check that section was reselected
    expect(cmsInterface._selectSection).toHaveBeenCalledWith('cover');
    
    // Check that status was updated
    expect(mockElements['cms-status'].textContent).toBe('Content reset successfully');
    expect(mockElements['cms-status'].classList.add).toHaveBeenCalledWith('status-success');
  });

  test('should clean up resources when destroyed', () => {
    // Call destroy
    cmsInterface.destroy();
    
    // Check that storage was destroyed
    expect(cmsInterface.state.storage.destroy).toHaveBeenCalled();
    
    // Check that it was logged
    expect(console.log).toHaveBeenCalledWith('CMS Interface: Destroyed');
  });
});