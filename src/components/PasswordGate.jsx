// Centered password modal for the protected shelf. Used two ways:
//   • from Home  — as a pop-over when the locked card is clicked
//   • from ShelfRoute — as a full-screen gate when the URL is opened directly
// It owns the verify + "remember unlock" step; callers just react to onUnlock.
import { useEffect, useState } from "react";
import { Lock, X } from "lucide-react";
import { tryUnlock, isGateConfigured } from "../lib/interviewGate";

export default function PasswordGate({
  title = "Interview Prep",
  accent = "#f5a524",
  onUnlock,
  onClose,
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const configured = isGateConfigured();

  // Keep the fix instructions off the screen — log them for the developer only.
  useEffect(() => {
    if (!configured) {
      console.warn(
        "[Interview Prep gate] Password not configured. Set VITE_INTERVIEW_PREP_PASSWORD " +
          "in .env.local (local) and in the Vercel project's Environment Variables (production), then rebuild."
      );
    }
  }, [configured]);

  const submit = (e) => {
    e.preventDefault();
    if (!configured) return;
    if (tryUnlock(value)) {
      setError("");
      onUnlock?.();
    } else {
      setError("Incorrect password. Try again.");
      setValue("");
    }
  };

  return (
    <div
      className="nb-gate-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} — locked`}
      style={{ "--ac": accent }}
    >
      <div className="nb-gate">
        {onClose && (
          <button
            type="button"
            className="nb-gate-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        )}

        <span className="nb-gate-icon">
          <Lock size={20} />
        </span>
        <h2 className="nb-gate-title">{title}</h2>
        <p className="nb-gate-sub">
          This shelf is protected. Enter the password to continue.
        </p>

        {configured ? (
          <form className="nb-gate-form" onSubmit={submit}>
            <input
              type="password"
              className="nb-gate-input"
              value={value}
              autoFocus
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              placeholder="Password"
              aria-label="Password"
              aria-invalid={error ? "true" : "false"}
            />
            <button type="submit" className="nb-gate-btn">
              Unlock
            </button>
          </form>
        ) : (
          <p className="nb-gate-warn">
            This shelf is temporarily unavailable. Please check back later.
          </p>
        )}

        {error && <p className="nb-gate-error">{error}</p>}
      </div>
    </div>
  );
}
