/**
 * Empty State Component
 * Displays when there are no shortcuts
 */

/**
 * Create an empty state element
 * @param {boolean} isSearching - Whether user is currently searching
 * @param {Function} onCreateClick - Callback when create button is clicked
 * @returns {HTMLElement}
 */
export function createEmptyState(isSearching = false, onCreateClick = null) {
  const emptyState = document.createElement("div");
  emptyState.className = "empty-state";

  // Create icon
  const emptyIcon = document.createElement("div");
  const emptySVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );
  emptySVG.setAttribute("width", "80");
  emptySVG.setAttribute("height", "80");
  emptySVG.setAttribute("viewBox", "0 0 24 24");
  emptySVG.setAttribute("fill", "none");

  const emptyPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  emptyPath.setAttribute(
    "d",
    "M8 6.00067L21 6.00139M8 12.0007L21 12.0015M8 18.0007L21 18.0015M3.5 6H3.51M3.5 12H3.51M3.5 18H3.51M4 6C4 6.27614 3.77614 6.5 3.5 6.5C3.22386 6.5 3 6.27614 3 6C3 5.72386 3.22386 5.5 3.5 5.5C3.77614 5.5 4 5.72386 4 6ZM4 12C4 12.2761 3.77614 12.5 3.5 12.5C3.22386 12.5 3 12.2761 3 12C3 11.7239 3.22386 11.5 3.5 11.5C3.77614 11.5 4 11.7239 4 12ZM4 18C4 18.2761 3.77614 18.5 3.5 18.5C3.22386 18.5 3 18.2761 3 18C3 17.7239 3.22386 17.5 3.5 17.5C3.77614 17.5 4 17.7239 4 18Z"
  );

  emptyPath.setAttribute("stroke", "currentColor");
  emptyPath.setAttribute("stroke-width", "2");
  emptyPath.setAttribute("stroke-linecap", "round");
  emptyPath.setAttribute("stroke-linejoin", "round");
  emptyPath.setAttribute("fill", "currentColor");
  emptySVG.appendChild(emptyPath);
  emptyIcon.className = "empty-icon";
  emptyIcon.appendChild(emptySVG);

  // Create text
  const emptyText = document.createElement("div");
  emptyText.className = "empty-text";
  emptyText.textContent = isSearching
    ? "No shortcuts found"
    : "No shortcuts yet";

  // Create subtext
  const emptySubtext = document.createElement("div");
  emptySubtext.className = "empty-subtext";
  emptySubtext.textContent = isSearching
    ? "Try adjusting your search terms to find what you're looking for."
    : "Create your first shortcut to quickly jump to your favorite websites.";

  emptyState.appendChild(emptyIcon);
  emptyState.appendChild(emptyText);
  emptyState.appendChild(emptySubtext);

  // Add create button if not searching
  if (!isSearching && onCreateClick) {
    const button = document.createElement("button");
    button.className = "empty-action";
    button.id = "create-first-shortcut";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M12 5V19M5 12H19");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");

    svg.appendChild(path);
    button.appendChild(svg);
    button.appendChild(document.createTextNode(" Create Your First Shortcut"));

    button.addEventListener("click", onCreateClick);

    emptyState.appendChild(button);
  }

  return emptyState;
}
