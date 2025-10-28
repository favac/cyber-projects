// Main application module - Compatible with HMR
import { initRouter, load } from "./router.js";
import { closeModal, showModal } from "./utils/modal.js";
import { createPersistentStore } from "./hmr-store.js";
import { showHMRIndicator } from "./hmr-ui.js";

const moduleCache = new Map();
window.moduleCache = moduleCache;

const routes = {
  home: load("home"),
  about: load("about"),
  tasks: load("tasks"),
  "": load("home"),
};

window.routes = routes;

export const appStore = createPersistentStore("app", {
  currentView: "home",
  modalOpen: false,
  count: 0,
});

function initApp() {
  console.log("🚀 Initializing application...");
  initRouter(routes);
  const closeBtn = document.querySelector(".close-btn");
  const modal = document.getElementById("modal");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }
  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal();
      }
    });
  }
  document.querySelectorAll(".nav-btn").forEach((buttonElement) => {
    buttonElement.addEventListener("click", async () => {
      const view = buttonElement.dataset.view;
      window.history.pushState({}, "", `#${view}`);
      appStore.set((state) => ({ ...state, currentView: view }));
      try {
        showLoadingState();
        await routes[view]();
        updateActiveNav(buttonElement);
        hideLoadingState();
      } catch (error) {
        console.error(`Error loading view "${view}":`, error);
        hideLoadingState();
      }
    });
  });
  appStore.subscribe((state) => {
    console.log("📊 State updated:", state);
  });
  showHMRIndicator();
}

function showLoadingState() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = "block";
  }
}

function hideLoadingState() {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.style.display = "none";
  }
}

function updateActiveNav(activeButtonElement) {
  document.querySelectorAll(".nav-btn").forEach((buttonElement) => {
    buttonElement.classList.toggle("active", buttonElement === activeButtonElement);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  initApp();
}

window.showModal = showModal;
window.closeModal = closeModal;
