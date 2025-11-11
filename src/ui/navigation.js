/**
 * Navigation Controller
 * Manages navigation between sections
 */

export class Navigation {
  constructor() {
    this.navItems = document.querySelectorAll(".nav-item");
    this.sections = document.querySelectorAll(".section");
    this.init();
  }

  init() {
    this.navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const targetSection = item.getAttribute("data-section");
        this.navigateTo(targetSection);
      });
    });
  }

  navigateTo(sectionId) {
    console.log(`Navigating to section: ${sectionId}`);

    // Update active nav item
    this.navItems.forEach((nav) => nav.classList.remove("active"));
    const activeNav = document.querySelector(
      `.nav-item[data-section="${sectionId}"]`
    );
    if (activeNav) {
      activeNav.classList.add("active");
    }

    // Update active section
    this.sections.forEach((section) => section.classList.remove("active"));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
      activeSection.classList.add("active");
    }

    // Update URL hash
    window.location.hash = sectionId;
  }

  getCurrentSection() {
    const activeSection = document.querySelector(".section.active");
    return activeSection ? activeSection.id : null;
  }
}
