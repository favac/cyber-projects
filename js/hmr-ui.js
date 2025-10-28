/**
 * @fileoverview UI helpers to display a simple indicator when HMR (Hot Module Replacement) is active
 * or when a hot update is received during development.
 */

export function showHMRIndicator() {
  const indicator = document.getElementById("hmr-indicator");
  if (indicator) {
    indicator.style.display = "block";
    setTimeout(() => {
      indicator.style.display = "none";
    }, 3000);
  }
}

if (typeof window !== "undefined") {
  const isDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  if (isDev) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showHMRIndicator);
    } else {
      showHMRIndicator();
    }
    if (window.__HMR_STATE__) {
      const originalHandleMessage = window.handleHMRMessage;
      window.handleHMRMessage = function handleHMRMessageOverride(data) {
        showHMRIndicator();
        if (originalHandleMessage) {
          originalHandleMessage(data);
        }
      };
    }
  }
}
