/**
 * @fileoverview Simple client-side router with async support and lazy-loaded views.
 * Exposes helpers to create lazy routes, bulk route maps, initialize routing, and navigate.
 */

export function createLazyRoute(viewName, viewPath, functionName = null) {
  const renderFunction = functionName || `render${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
  return async () => {
    const cache = window.moduleCache || new Map();
    if (!cache.has(viewName)) {
      try {
        const module = await import(viewPath);
        cache.set(viewName, module[renderFunction]);
        if (window.moduleCache) {
          window.moduleCache.set(viewName, module[renderFunction]);
        }
      } catch (error) {
        console.error(`Error loading view "${viewName}" from "${viewPath}":`, error);
        throw error;
      }
    }
    return cache.get(viewName)();
  };
}

export function load(viewName, customPath = null) {
  const viewPath = customPath || `./views/${viewName}.js`;
  return createLazyRoute(viewName, viewPath);
}

export function createRoutes(routeDefinitions) {
  const routes = {};
  for (const [routeName, config] of Object.entries(routeDefinitions)) {
    if (typeof config === "string") {
      routes[routeName] = load(config);
    } else if (config.view) {
      routes[routeName] = createLazyRoute(
        config.view,
        config.path || `./views/${config.view}.js`,
        config.function
      );
    }
  }
  return routes;
}

export function initRouter(routes) {
  const initialRoute = window.location.hash.replace("#", "") || "home";
  if (routes[initialRoute]) {
    handleRouteAsync(routes[initialRoute], initialRoute);
  }
  window.addEventListener("popstate", () => {
    const route = window.location.hash.replace("#", "") || "home";
    if (routes[route]) {
      handleRouteAsync(routes[route], route);
    }
  });
}

async function handleRouteAsync(routeHandler, routeName) {
  try {
    showLoadingState();
    await routeHandler();
    updateActiveNav(routeName);
    hideLoadingState();
  } catch (error) {
    console.error(`Error loading route "${routeName}":`, error);
    hideLoadingState();
  }
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

function updateActiveNav(route) {
  document.querySelectorAll(".nav-btn").forEach((buttonElement) => {
    buttonElement.classList.toggle("active", buttonElement.dataset.view === route);
  });
}

export function navigateTo(route) {
  if (window.location.hash.replace("#", "") !== route) {
    window.history.pushState({}, "", `#${route}`);
    window.dispatchEvent(new Event("popstate"));
  }
}
