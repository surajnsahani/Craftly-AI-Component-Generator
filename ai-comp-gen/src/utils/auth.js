// src/utils/auth.js

const USER_KEY = "craftly_user";        // stored account details
const SESSION_KEY = "craftly_session";  // logged-in flag
const HISTORY_KEY = "craftly_history";
const PENDING_KEY = "craftly_pending";

/**
 * Save user object to localStorage.
 * user should be a plain object { name, email, password, ... }
 * Also marks the user as logged in (session).
 */
export function saveUser(user) {
    try {
        if (!user || typeof user !== "object") return false;
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        // mark session as logged in
        localStorage.setItem(SESSION_KEY, "1");
        // notify app that user changed
        window.dispatchEvent(new Event("user:change"));
        return true;
    } catch (err) {
        console.error("saveUser error:", err);
        return false;
    }
}

/** Return stored account object or null */
export function getUser() {
    try {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (err) {
        console.error("getUser parse error:", err);
        return null;
    }
}

/** Mark current session as logged-in (used after successful login) */
export function setSessionLoggedIn() {
    try {
        localStorage.setItem(SESSION_KEY, "1");
        window.dispatchEvent(new Event("user:change"));
        return true;
    } catch (err) {
        console.error("setSessionLoggedIn error:", err);
        return false;
    }
}

/** Log out user: only clear session flag, keep account in localStorage */
export function logoutUser() {
    try {
        localStorage.removeItem(SESSION_KEY);
        window.dispatchEvent(new Event("user:change"));
        return true;
    } catch (err) {
        console.error("logoutUser error:", err);
        return false;
    }
}

/** Delete account completely: removes account + session */
export function deleteAccount() {
    try {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(SESSION_KEY);
        window.dispatchEvent(new Event("user:change"));
        return true;
    } catch (err) {
        console.error("deleteAccount error:", err);
        return false;
    }
}

/** boolean: is the user currently logged in (session-based) */
export function isLoggedIn() {
    try {
        return localStorage.getItem(SESSION_KEY) === "1";
    } catch {
        return false;
    }
}

/* -------------------------
   Helpers for saving history/pending generated components
   (same as before)
   ------------------------- */

/** push component object to history array in localStorage */
export function saveToHistory(componentObj) {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        arr.unshift({ ...componentObj, savedAt: new Date().toISOString() });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(arr));
        window.dispatchEvent(new Event("history:change"));
        return true;
    } catch (err) {
        console.error("saveToHistory error:", err);
        return false;
    }
}

/** read history array */
export function getHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (err) {
        console.error("getHistory parse error:", err);
        return [];
    }
}

/** save a pending item that should be saved after signup/login */
export function savePending(componentObj) {
    try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(componentObj));
        return true;
    } catch (err) {
        console.error("savePending error:", err);
        return false;
    }
}

/** flush pending into history (call after saveUser) */
export function flushPendingToHistory() {
    try {
        const raw = localStorage.getItem(PENDING_KEY);
        if (!raw) return false;
        const obj = JSON.parse(raw);
        saveToHistory(obj);
        localStorage.removeItem(PENDING_KEY);
        return true;
    } catch (err) {
        console.error("flushPendingToHistory error:", err);
        return false;
    }
}
