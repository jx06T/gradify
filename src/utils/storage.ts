export const storage = {
    getItem: (key: string) => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return "";
    },
    setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    removeItem: (key: string) => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
        }
    },
    clear: () => {
        if (typeof window !== 'undefined') {
            localStorage.clear();
        }
    }
};
