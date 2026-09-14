// Soft, frontend-only gate for the "Interview Prep" shelf.
//
// The password ships inside the client bundle (Vite inlines VITE_* env vars at
// build time), so this is deliberately *soft* protection for a personal study
// resource: it keeps the shelf out of casual view, it is NOT real access
// control. Anyone determined can read the bundle or hit the static note URLs
// directly. That trade-off is intentional and understood.
//
// Set the password in `.env.local` for local dev and in the Vercel project's
// Environment Variables (VITE_INTERVIEW_PREP_PASSWORD) for production.

// Matches the shelf auto-generated from public/Interview_Prep_Notes/.
export const PROTECTED_SHELF_ID = "interview-prep";

const STORAGE_KEY = "nb-interview-unlocked";

// Configured password. `undefined` when the env var isn't set at build time.
const GATE_PASSWORD = import.meta.env.VITE_INTERVIEW_PREP_PASSWORD;

export const isGateConfigured = () =>
  typeof GATE_PASSWORD === "string" && GATE_PASSWORD.length > 0;

export const isProtectedShelf = (id) => id === PROTECTED_SHELF_ID;

// The first path segment is the top-level shelf id, e.g.
// ["interview-prep"] or ["interview-prep", "01-some-note"].
export const isProtectedPath = (segments) =>
  segments.length > 0 && segments[0] === PROTECTED_SHELF_ID;

export const isUnlocked = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

const persistUnlocked = () => {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* storage blocked (private mode, etc.) — unlock lasts for this page load */
  }
};

// Clears the remembered unlock (handy from the console: interviewGate.lock()).
export const lock = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
};

// Returns true and remembers the unlock when the password matches.
export const tryUnlock = (input) => {
  if (!isGateConfigured()) return false;
  if (input === GATE_PASSWORD) {
    persistUnlocked();
    return true;
  }
  return false;
};
