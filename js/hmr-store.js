// Store system for HMR - Compatible with your h() helper

window.stores = window.stores || {};

export function createPersistentStore(name, initialState) {
  if (window.stores[name]) {
    return window.stores[name];
  }
  const savedState = window.__HMR_STATE__?.stores?.get(name);
  const state = savedState !== undefined ? savedState : initialState;
  let currentState = state;
  const listeners = new Set();
  const store = {
    get: () => currentState,
    set: (next) => {
      const value = typeof next === "function" ? next(currentState) : next;
      if (value === currentState) {
        return;
      }
      currentState = value;
      listeners.forEach((listener) => listener(currentState));
    },
    update: (patch) => {
      const value = typeof patch === "function" ? patch(currentState) : patch;
      currentState = { ...currentState, ...value };
      listeners.forEach((listener) => listener(currentState));
    },
    subscribe: (listener) => {
      const wrappedListener = (state) => {
        try {
          listener(state);
        } catch (error) {
          console.warn("Error in subscription:", error);
        }
      };
      listeners.add(wrappedListener);
      if (window.__HMR_CLEANUP__) {
        const unsubscribe = () => listeners.delete(wrappedListener);
        window.__HMR_CLEANUP__.push(unsubscribe);
        return unsubscribe;
      }
      return () => listeners.delete(wrappedListener);
    },
    _clearListeners: () => {
      listeners.clear();
    },
  };
  window.stores[name] = store;
  return store;
}

export function useStore(storeName, renderFn) {
  const store = window.stores[storeName];
  if (!store) {
    throw new Error(`Store "${storeName}" not found`);
  }
  let forceUpdate = () => {};
  if (renderFn) {
    forceUpdate = () => {
      const newElement = renderFn(store.get());
      if (window.__HMR_UPDATE_COMPONENT__) {
        window.__HMR_UPDATE_COMPONENT__(newElement);
      }
    };
    const unsubscribe = store.subscribe(forceUpdate);
    if (window.__HMR_CLEANUP__) {
      window.__HMR_CLEANUP__.push(unsubscribe);
    }
  }
  return { store, forceUpdate };
}

export class HMRComponent {
  constructor(name, renderFn) {
    this.name = name;
    this.renderFn = renderFn;
    this.element = null;
    this.cleanup = [];
    if (!window.__HMR_COMPONENTS__) {
      window.__HMR_COMPONENTS__ = new Map();
    }
    window.__HMR_COMPONENTS__.set(name, this);
  }

  render(container, props = {}) {
    this.cleanup.forEach((fn) => fn());
    this.cleanup = [];
    this.element = this.renderFn(props);
    if (container) {
      container.innerHTML = "";
      container.appendChild(this.element);
    }
    return this.element;
  }

  update(props = {}) {
    return this.render(null, props);
  }

  destroy() {
    this.cleanup.forEach((fn) => fn());
    this.cleanup = [];
    if (window.__HMR_COMPONENTS__) {
      window.__HMR_COMPONENTS__.delete(this.name);
    }
  }
}

window.__HMR_UPDATE_COMPONENT__ = (newElement) => {
  console.log("Component updated:", newElement);
};

window.__HMR_CLEANUP__ = [];
