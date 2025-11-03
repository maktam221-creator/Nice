/**
 * Loads state from localStorage.
 * @param key The key to load from.
 * @param defaultValue The default value to return if the key doesn't exist or an error occurs.
 * @returns The loaded state or the default value.
 */
export const loadState = <T>(key: string, defaultValue: T): T => {
    try {
        const serializedState = localStorage.getItem(key);
        if (serializedState === null) {
            // No state in localStorage, save the default value for next time.
            saveState(key, defaultValue);
            return defaultValue;
        }
        const state = JSON.parse(serializedState);
        
        // Dates are stringified by JSON.stringify. We need to parse them back.
        if (key === 'maydan_stories' && Array.isArray(state)) {
            return state.map((story: any) => ({
                ...story,
                timestamp: new Date(story.timestamp),
            })) as T;
        }
        return state;
    } catch (err) {
        console.error(`Error loading state from localStorage for key "${key}":`, err);
        return defaultValue;
    }
};

/**
 * Saves state to localStorage.
 * @param key The key to save to.
 * @param state The state to save.
 */
export const saveState = <T>(key: string, state: T): void => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem(key, serializedState);
    } catch (err) {
        console.error(`Error saving state to localStorage for key "${key}":`, err);
    }
};
