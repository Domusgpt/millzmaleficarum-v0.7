/**
 * Content Management System Styles
 * CSS styles for the CMS interface
 */

export const cmsStyles = `
  :root {
    --cms-primary: #00e6ff;
    --cms-secondary: #ff2a6d;
    --cms-background: #111;
    --cms-card-bg: #1a1a1a;
    --cms-text: #fff;
    --cms-text-subtle: #aaa;
    --cms-border: #333;
    --cms-success: #00cc66;
    --cms-error: #ff3366;
    --cms-warning: #ffcc00;
    --cms-pending: #cc66ff;
    --cms-panel-width: 300px;
    --cms-mono-font: 'Courier New', Courier, monospace;
  }
  
  .cms-container {
    font-family: var(--cms-mono-font);
    color: var(--cms-text);
    background-color: var(--cms-background);
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: 100vw;
    overflow-x: hidden;
  }
  
  .cms-header {
    background-color: var(--cms-card-bg);
    border-bottom: 1px solid var(--cms-border);
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .cms-header h1 {
    margin: 0;
    font-size: 1.8rem;
    color: var(--cms-primary);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  
  .cms-controls {
    display: flex;
    gap: 0.5rem;
  }
  
  .cms-btn {
    background: transparent;
    border: 1px solid var(--cms-primary);
    color: var(--cms-primary);
    padding: 0.5rem 1rem;
    border-radius: 3px;
    cursor: pointer;
    font-family: var(--cms-mono-font);
    transition: all 0.2s ease;
  }
  
  .cms-btn:hover {
    background-color: rgba(0, 230, 255, 0.1);
  }
  
  .cms-btn-primary {
    background-color: var(--cms-primary);
    color: var(--cms-background);
  }
  
  .cms-btn-primary:hover {
    background-color: rgba(0, 230, 255, 0.8);
  }
  
  .cms-btn-highlight {
    border-color: var(--cms-secondary);
    color: var(--cms-secondary);
  }
  
  .cms-btn-highlight:hover {
    background-color: rgba(255, 42, 109, 0.1);
  }
  
  .cms-btn-danger {
    border-color: var(--cms-error);
    color: var(--cms-error);
  }
  
  .cms-btn-danger:hover {
    background-color: rgba(255, 51, 102, 0.1);
  }
  
  .cms-btn-small {
    padding: 0.2rem 0.5rem;
    font-size: 0.8rem;
  }
  
  .cms-editor-container {
    display: flex;
    flex: 1;
    overflow: hidden;
  }
  
  .cms-sidebar {
    width: var(--cms-panel-width);
    background-color: var(--cms-card-bg);
    border-right: 1px solid var(--cms-border);
    padding: 1rem;
    overflow-y: auto;
  }
  
  .cms-sidebar h3 {
    margin-top: 0;
    color: var(--cms-primary);
    font-size: 1.2rem;
    border-bottom: 1px solid var(--cms-border);
    padding-bottom: 0.5rem;
  }
  
  .cms-section-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .cms-section-item {
    padding: 0.75rem;
    border-bottom: 1px solid var(--cms-border);
    cursor: pointer;
    transition: background-color 0.2s ease;
  }
  
  .cms-section-item:hover {
    background-color: rgba(0, 230, 255, 0.05);
  }
  
  .cms-section-item.selected {
    background-color: rgba(0, 230, 255, 0.1);
    border-left: 3px solid var(--cms-primary);
  }
  
  .cms-section-name {
    font-weight: bold;
  }
  
  .cms-editor {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    min-width: 0;
  }
  
  .cms-editor-header {
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--cms-border);
    padding-bottom: 0.5rem;
  }
  
  .cms-editor-header h2 {
    margin: 0;
    color: var(--cms-primary);
  }
  
  .cms-editor-content {
    padding-bottom: 2rem;
  }
  
  .cms-empty-state {
    text-align: center;
    padding: 2rem;
    color: var(--cms-text-subtle);
    border: 1px dashed var(--cms-border);
    border-radius: 5px;
    margin: 2rem 0;
  }
  
  .cms-preview {
    width: var(--cms-panel-width);
    background-color: var(--cms-card-bg);
    border-left: 1px solid var(--cms-border);
    padding: 1rem;
    overflow-y: auto;
  }
  
  .cms-preview h3 {
    margin-top: 0;
    color: var(--cms-primary);
    font-size: 1.2rem;
    border-bottom: 1px solid var(--cms-border);
    padding-bottom: 0.5rem;
  }
  
  .cms-preview-content {
    padding: 1rem;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 5px;
    min-height: 300px;
  }
  
  .cms-empty-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 300px;
    color: var(--cms-text-subtle);
  }
  
  .cms-footer {
    background-color: var(--cms-card-bg);
    border-top: 1px solid var(--cms-border);
    padding: 0.75rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .cms-status {
    color: var(--cms-text-subtle);
  }
  
  .status-loading {
    color: var(--cms-primary);
  }
  
  .status-success {
    color: var(--cms-success);
  }
  
  .status-error {
    color: var(--cms-error);
  }
  
  .status-pending {
    color: var(--cms-pending);
  }
  
  .cms-version {
    color: var(--cms-text-subtle);
    font-size: 0.8rem;
  }
  
  .cms-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .cms-form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .cms-form-group label {
    font-weight: bold;
    color: var(--cms-primary);
  }
  
  .cms-input {
    background-color: var(--cms-background);
    border: 1px solid var(--cms-border);
    color: var(--cms-text);
    padding: 0.75rem;
    border-radius: 3px;
    font-family: var(--cms-mono-font);
  }
  
  .cms-input:focus {
    outline: none;
    border-color: var(--cms-primary);
    box-shadow: 0 0 0 1px var(--cms-primary);
  }
  
  textarea.cms-input {
    min-height: 150px;
    resize: vertical;
  }
  
  .cms-array-field,
  .cms-object-field {
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--cms-border);
    border-radius: 3px;
    overflow: hidden;
  }
  
  .cms-array-header,
  .cms-object-header {
    background-color: rgba(0, 0, 0, 0.3);
    padding: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .cms-array-container,
  .cms-object-container {
    padding: 1rem;
  }
  
  .cms-array-container.hidden,
  .cms-object-container.hidden {
    display: none;
  }
  
  .cms-array-item {
    border-bottom: 1px dashed var(--cms-border);
    padding-bottom: 1rem;
    margin-bottom: 1rem;
  }
  
  .cms-array-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0;
  }
  
  .cms-metadata-preview,
  .cms-content-preview {
    color: var(--cms-text);
  }
  
  .cms-metadata-preview h4,
  .cms-content-preview h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--cms-primary);
  }
  
  .cms-metadata-item {
    margin-bottom: 0.5rem;
  }
  
  .cms-preview-text {
    line-height: 1.6;
    max-height: 400px;
    overflow-y: auto;
  }
  
  @media (max-width: 1200px) {
    .cms-editor-container {
      flex-direction: column;
    }
    
    .cms-sidebar,
    .cms-preview {
      width: 100%;
      max-height: 300px;
      border: none;
      border-bottom: 1px solid var(--cms-border);
    }
    
    .cms-preview {
      border-top: 1px solid var(--cms-border);
      border-bottom: none;
    }
  }
`;

export default cmsStyles;