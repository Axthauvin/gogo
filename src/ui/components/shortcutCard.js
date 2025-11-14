/**
 * Shortcut Card Component
 * Creates and manages shortcut list items
 */

/**
 * Create an SVG icon element
 * @param {string} width
 * @param {string} height
 * @param {string} viewBox
 * @param {Array} paths - Array of path data objects
 * @returns {SVGElement}
 */
function createSvgIcon(width, height, viewBox, paths) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("fill", "none");
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  paths.forEach((pathData) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    Object.keys(pathData).forEach((attr) => {
      path.setAttribute(attr, pathData[attr]);
    });
    svg.appendChild(path);
  });

  return svg;
}

/**
 * Create edit button icon
 * @returns {SVGElement}
 */
function createEditIcon() {
  return createSvgIcon("16px", "16px", "0 0 24 24", [
    {
      d: "M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    {
      d: "M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
  ]);
}

/**
 * Create delete button icon
 * @returns {SVGElement}
 */
function createDeleteIcon() {
  return createSvgIcon("16px", "16px", "0 0 24 24", [
    {
      d: "M3 6.98996C8.81444 4.87965 15.1856 4.87965 21 6.98996",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    {
      d: "M8.00977 5.71997C8.00977 4.6591 8.43119 3.64175 9.18134 2.8916C9.93148 2.14146 10.9489 1.71997 12.0098 1.71997C13.0706 1.71997 14.0881 2.14146 14.8382 2.8916C15.5883 3.64175 16.0098 4.6591 16.0098 5.71997",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    {
      d: "M12 13V18",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    {
      d: "M19 9.98999L18.33 17.99C18.2225 19.071 17.7225 20.0751 16.9246 20.8123C16.1266 21.5494 15.0861 21.9684 14 21.99H10C8.91389 21.9684 7.87336 21.5494 7.07541 20.8123C6.27745 20.0751 5.77745 19.071 5.67001 17.99L5 9.98999",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
  ]);
}

/**
 * Create a shortcut card element
 * @param {Object} shortcut - Shortcut data
 * @param {number} index - Index in the shortcuts array
 * @param {Function} onEdit - Edit callback
 * @param {Function} onDelete - Delete callback
 * @returns {HTMLElement}
 */
export function createShortcutCard(shortcut, index, onEdit, onDelete) {
  const { alias, url } = shortcut;

  const aliasItem = document.createElement("div");
  aliasItem.className = "alias-item";
  aliasItem.setAttribute("data-url", url);

  // Create alias info section
  const aliasInfo = document.createElement("div");
  aliasInfo.className = "alias-info";

  const aliasName = document.createElement("div");
  aliasName.className = "alias-name";
  aliasName.textContent = alias;

  const aliasTarget = document.createElement("div");
  aliasTarget.className = "alias-target";
  aliasTarget.textContent = url;

  aliasInfo.appendChild(aliasName);
  aliasInfo.appendChild(aliasTarget);

  // Create alias actions section
  const aliasActions = document.createElement("div");
  aliasActions.className = "alias-actions";

  // Create edit button
  const editBtn = document.createElement("button");
  editBtn.className = "action-btn edit-btn";
  editBtn.setAttribute("data-index", index);
  editBtn.setAttribute("title", "Edit");
  editBtn.appendChild(createEditIcon());

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn delete-btn";
  deleteBtn.setAttribute("data-index", index);
  deleteBtn.setAttribute("title", "Delete");
  deleteBtn.appendChild(createDeleteIcon());

  // Add event listeners
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    onEdit(index);
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    onDelete(index);
  });

  aliasActions.appendChild(editBtn);
  aliasActions.appendChild(deleteBtn);

  aliasItem.appendChild(aliasInfo);
  aliasItem.appendChild(aliasActions);

  // Add click event to open URL
  aliasItem.addEventListener("click", (e) => {
    if (!e.target.closest(".alias-actions")) {
      window.open(url, "_blank");
    }
  });

  return aliasItem;
}
