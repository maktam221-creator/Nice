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
        
        // Handle date parsing for stories
        if (key === 'maydan_stories') {
            const parsedStories: Record<string, any[]> = {};
            for (const userId in state) {
                if (Object.prototype.hasOwnProperty.call(state, userId)) {
                    parsedStories[userId] = state[userId].map((story: any) => ({
                        ...story,
                        timestamp: new Date(story.timestamp),
                    }));
                }
            }
            return parsedStories as T;
        }

        // Handle date parsing for messages
        if (key === 'maydan_messages' && Array.isArray(state)) {
            return state.map((message: any) => ({
                ...message,
                timestamp: new Date(message.timestamp),
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
