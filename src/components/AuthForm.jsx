// src/components/AuthForm.jsx
import React, { useState } from "react";
import {
  doSignIn,
  doSignUp,
  lookupEmailByUsername,
  doPasswordReset,
} from "../firebase";

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState("signIn"); // "signIn" | "signUp" | "reset"

  // identifier can be email OR username (sign-in/reset), email only (sign-up)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isSignUp = mode === "signUp";
  const isReset = mode === "reset";

  const switchMode = () => {
    setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
    setError("");
    setNotice("");
  };

  const goToReset = () => {
    setMode("reset");
    setPassword("");
    setError("");
    setNotice("");
  };

  const goToSignIn = () => {
    setMode("signIn");
    setPassword("");
    setError("");
    setNotice("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    try {
      // --------------------
      // PASSWORD RESET MODE
      // --------------------
      if (isReset) {
        const genericMsg =
          "If an account exists for that email, we’ve sent a password reset link.";

        let emailToUse = identifier.trim();

        // Allow username here too (same behaviour as sign-in)
        if (!emailToUse.includes("@")) {
          const found = await lookupEmailByUsername(emailToUse);
          // IMPORTANT: don’t reveal whether the account exists
          emailToUse = found || emailToUse;
        }

        // Client-side sanity check: only show a specific error if it's clearly not an email
        if (!emailToUse.includes("@")) {
          setError("Please enter your email address (or your username).");
          return;
        }

        const redirectUrl = `${window.location.origin}/login`;

        try {
          await doPasswordReset(emailToUse.toLowerCase(), redirectUrl);
        } catch (err) {
          // IMPORTANT: don’t reveal whether the account exists
          // Only special-case invalid email format if Firebase returns it
          if (err?.code === "auth/invalid-email") {
            setError("Please enter a valid email address.");
            return;
          }
        }

        setNotice(genericMsg);
        return;
      }

      // -----------
      // SIGN IN
      // -----------
      if (mode === "signIn") {
        let emailToUse = identifier.trim();

        // If the user didn't type "@", assume username → lookup email
        if (!emailToUse.includes("@")) {
          const found = await lookupEmailByUsername(emailToUse);
          if (!found) {
            setError("Invalid username or password");
            return;
          }
          emailToUse = found;
        }

        await doSignIn(emailToUse, password);
        onSuccess?.();
        return;
      }

      // -----------
      // SIGN UP
      // -----------
      await doSignUp({
        email: identifier.trim(),
        pw: password,
        name: name.trim(),
        username: username.trim(),
      });

      onSuccess?.();
    } catch (err) {
      setError(err?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {isReset ? "Reset Password" : isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {error && <p className="error-text">{error}</p>}
        {notice && <p className="success-text">{notice}</p>}

        <form onSubmit={submit} className="auth-form">
          {isSignUp && (
            <>
              <div className="form-row">
                <label>Name</label>
                <input
                  className="input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label>Username</label>
                <input
                  className="input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-row">
            <label>
              {isSignUp ? "Email" : isReset ? "Email or Username" : "Email or Username"}
            </label>
            <input
              className="input"
              type={isSignUp ? "email" : "text"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete={isSignUp ? "email" : "username"}
            />
          </div>

          {!isReset && (
            <div className="form-row">
              <label>Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
            </div>
          )}

          {!isSignUp && !isReset && (
            <div className="auth-meta-row">
              <button type="button" onClick={goToReset} className="link-btn">
                Forgotten your password?
              </button>
            </div>
          )}

          <div className="actions">
            <button type="submit" className="primary-btn">
              {isReset ? "Send reset link" : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </div>
        </form>

        {isReset ? (
          <p className="auth-switch">
            Remembered it?{" "}
            <button type="button" onClick={goToSignIn} className="link-btn">
              Back to sign in
            </button>
          </p>
        ) : (
          <p className="auth-switch">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button type="button" onClick={switchMode} className="link-btn">
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
