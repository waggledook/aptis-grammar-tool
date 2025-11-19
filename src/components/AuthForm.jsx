// src/components/AuthForm.jsx
import React, { useState } from "react";
import { doSignIn, doSignUp, lookupEmailByUsername } from "../firebase";

export default function AuthForm({ onSuccess }) {
  const [mode, setMode] = useState("signIn");

  // this field can now be email OR username
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
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
      } else {
        await doSignUp({
          email: identifier.trim(),   // now email field for sign up
          pw: password,
          name: name.trim(),
          username: username.trim(),
        });
      }

      onSuccess?.();
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  };

  const isSignUp = mode === "signUp";

  const switchMode = () => {
    setMode((m) => (m === "signIn" ? "signUp" : "signIn"));
    setError("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        {error && <p className="error-text">{error}</p>}

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
              {isSignUp ? "Email" : "Email or Username"}
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

          <div className="form-row">
            <label>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="actions">
            <button type="submit" className="primary-btn">
              {isSignUp ? "Create Account" : "Sign In"}
            </button>
          </div>
        </form>

        <p className="auth-switch">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button type="button" onClick={switchMode} className="link-btn">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}
