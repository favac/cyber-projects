type StateUpdater<TState> = TState | ((previous: TState) => TState);

type StatePatch<TState> = Partial<TState> | ((previous: TState) => Partial<TState>);

type StoreListener<TState> = (state: TState) => void;

export interface PersistentStore<TState> {
  get(): TState;
  set(updater: StateUpdater<TState>): void;
  update(patch: StatePatch<TState>): void;
  subscribe(listener: StoreListener<TState>): () => void;
}

function readFromStorage<TState>(key: string, fallback: TState): TState {
  if (typeof window === "undefined" || !window.localStorage) {
    return fallback;
  }
  const rawValue = window.localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }
  try {
    return JSON.parse(rawValue) as TState;
  } catch (error) {
    console.warn(`Failed to parse stored state for key "${key}"`, error);
    return fallback;
  }
}

function persistToStorage<TState>(key: string, state: TState): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn(`Failed to persist state for key "${key}"`, error);
  }
}

export function createPersistentStore<TState>(
  key: string,
  initialState: TState
): PersistentStore<TState> {
  let state = readFromStorage(key, initialState);
  const listeners = new Set<StoreListener<TState>>();

  function notify(nextState: TState): void {
    listeners.forEach((listener) => listener(nextState));
  }

  function set(updater: StateUpdater<TState>): void {
    const nextState = typeof updater === "function" ? (updater as (previous: TState) => TState)(state) : updater;
    if (nextState === state) {
      return;
    }
    state = nextState;
    persistToStorage(key, state);
    notify(state);
  }

  function update(patch: StatePatch<TState>): void {
    set((previous) => ({ ...previous, ...(typeof patch === "function" ? patch(previous) : patch) }));
  }

  function subscribe(listener: StoreListener<TState>): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function get(): TState {
    return state;
  }

  return { get, set, update, subscribe };
}
