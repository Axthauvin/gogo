/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

/**
 * Escape HTML to prevent XSS
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Create an element with class name
 * @param {string} tag
 * @param {string} className
 * @param {string} textContent
 * @returns {HTMLElement}
 */
export function createElement(tag, className = "", textContent = "") {
  const element = document.createElement(tag);
  if (className) {
    element.className = className;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

/**
 * Create an SVG element with namespace
 * @param {string} tag
 * @param {Object} attributes
 * @returns {SVGElement}
 */
export function createSvgElement(tag, attributes = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.keys(attributes).forEach((key) => {
    element.setAttribute(key, attributes[key]);
  });
  return element;
}

/**
 * Toggle class on element
 * @param {HTMLElement} element
 * @param {string} className
 * @param {boolean} force
 */
export function toggleClass(element, className, force) {
  if (force === undefined) {
    element.classList.toggle(className);
  } else {
    element.classList.toggle(className, force);
  }
}

/**
 * Remove all children from an element
 * @param {HTMLElement} element
 */
export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}
