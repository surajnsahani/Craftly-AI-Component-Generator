// src/utils/storage.js
export const HISTORY_KEY = "craftly_history";
export const PENDING_KEY = "craftly_pending";

// save a generated item to history (latest first)
export const saveGenerated = (item) => {
    const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    current.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(current));
};

// get saved history array
export const getHistory = () => {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
};

export const deleteHistoryItem = (index) => {
    const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    arr.splice(index, 1);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
};

export const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
};

// --- pending item (single) ---
export const savePending = (item) => {
    localStorage.setItem(PENDING_KEY, JSON.stringify(item));
};

export const getPending = () => {
    const d = localStorage.getItem(PENDING_KEY);
    return d ? JSON.parse(d) : null;
};

export const clearPending = () => {
    localStorage.removeItem(PENDING_KEY);
};

// flush pending into history (if exists) and return true if flushed
export const flushPendingToHistory = () => {
    const pending = getPending();
    if (pending) {
        saveGenerated(pending);
        clearPending();
        return true;
    }
    return false;
};
