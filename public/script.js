/**
 * MillzMaleficarum Codex v0.1
 * Main frontend script for the dynamic magazine
 */

document.addEventListener('DOMContentLoaded', function() {
  // Fetch magazine data from server
  fetchMagazineData();
});

/**
 * Fetches magazine data from the server API
 */
async function fetchMagazineData() {
  try {
    const response = await fetch('/api/magazine-data');
    
    if (!response.ok) {
      throw new Error('Failed to fetch magazine data');
    }
    
    const data = await response.json();
    renderMagazine(data);
  } catch (error) {
    console.error('Error fetching magazine data:', error);
    displayErrorMessage('Failed to load magazine content. Please try again later.');
  }
}

/**
 * Renders the magazine content using the fetched data
 * @param {Object} data - The magazine data object
 */
function renderMagazine(data) {
  // Update header information
  document.querySelector('.title').textContent = data.title || 'MillzMaleficarum Codex';
  document.querySelector('.issue').textContent = data.issue || 'v0.1';
  
  // Apply theme if specified
  if (data.theme) {
    document.body.setAttribute('data-theme', data.theme);
  }
  
  // Clear loading indicator
  const contentContainer = document.getElementById('magazine-content');
  contentContainer.innerHTML = '';
  
  // Render each section
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach((section, index) => {
      const sectionElement = createSectionElement(section, index);
      contentContainer.appendChild(sectionElement);
    });
  } else {
    // Handle empty content
    contentContainer.innerHTML = '<div class="section centered">' +
      '<h2 class="section-title">No Content</h2>' +
      '<p class="section-content">The codex appears to be empty.</p>' +
      '</div>';
  }
  
  // Add animation for sections to appear sequentially
  const sections = document.querySelectorAll('.section');
  sections.forEach((section, index) => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    setTimeout(() => {
      section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      section.style.opacity = '1';
      section.style.transform = 'translateY(0)';
    }, 100 * index);
  });
}

/**
 * Creates a DOM element for a magazine section
 * @param {Object} section - The section data
 * @param {Number} index - The section index
 * @returns {HTMLElement} The section DOM element
 */
function createSectionElement(section, index) {
  const sectionElement = document.createElement('div');
  sectionElement.className = `section ${section.style || ''}`;
  sectionElement.setAttribute('data-index', index);
  
  const titleElement = document.createElement('h2');
  titleElement.className = 'section-title';
  titleElement.textContent = section.title || `Section ${index + 1}`;
  
  const contentElement = document.createElement('div');
  contentElement.className = 'section-content';
  contentElement.innerHTML = section.content || '';
  
  sectionElement.appendChild(titleElement);
  sectionElement.appendChild(contentElement);
  
  // Add special effects based on style
  if (section.style === 'glitched') {
    titleElement.classList.add('glitched');
  }
  
  return sectionElement;
}

/**
 * Displays an error message to the user
 * @param {String} message - The error message to display
 */
function displayErrorMessage(message) {
  const contentContainer = document.getElementById('magazine-content');
  contentContainer.innerHTML = `
    <div class="error-message">
      <h2>Error</h2>
      <p>${message}</p>
    </div>
  `;
}