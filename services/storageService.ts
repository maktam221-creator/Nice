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

/**
 * Formats an ISO date string into a relative time string (e.g., "5 minutes ago").
 * @param isoString The ISO date string to format.
 * @returns A formatted relative time string in Arabic.
 */
export const formatRelativeTime = (isoString: string): string => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
        return isoString; // Fallback for old data or invalid date strings
    }
    
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 10) return "الآن";
    if (seconds < 60) return `قبل ${seconds} ثانية`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        if (minutes === 1) return `قبل دقيقة واحدة`;
        if (minutes === 2) return `قبل دقيقتين`;
        if (minutes > 2 && minutes <= 10) return `قبل ${minutes} دقائق`;
        return `قبل ${minutes} دقيقة`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        if (hours === 1) return `قبل ساعة واحدة`;
        if (hours === 2) return `قبل ساعتين`;
        if (hours > 2 && hours <= 10) return `قبل ${hours} ساعات`;
        return `قبل ${hours} ساعة`;
    }

    const days = Math.floor(hours / 24);
    if (days === 1) return "أمس";
    if (days < 7) {
        if (days === 2) return `قبل يومين`;
        if (days > 2 && days <= 10) return `قبل ${days} أيام`;
        return `قبل ${days} يوم`;
    }
    
    return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });
};
