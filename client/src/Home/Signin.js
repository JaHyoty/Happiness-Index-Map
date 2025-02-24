import React, { useState } from "react";
import PropTypes from "prop-types";

function SigninModal({ onClose, onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!email || !password) {
      alert("Please fill in both fields.");
      return;
    }

    // Call the onSignIn callback with email and password
    onSignIn(email, password);
  };

  return (
    <div>
      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
          padding: "20px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          zIndex: 2000,
          borderRadius: "8px",
          width: "400px",
          maxWidth: "90%",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Sign In</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ marginBottom: "15px", width: "100%" }}>
            <label
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "5px",
              }}
            >
              Email:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                display: "block",
                width: "80%",
                margin: "0 auto",
                padding: "8px",
                textAlign: "center",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px", width: "100%" }}>
            <label
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "5px",
              }}
            >
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{
                display: "block",
                width: "80%",
                margin: "0 auto",
                padding: "8px",
                textAlign: "center",
              }}
            />
          </div>
          <div style={{ textAlign: "right", width: "80%" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                backgroundColor: "#007BFF",
                color: "#FFF",
              }}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>

      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1000,
        }}
        onClick={onClose}
      ></div>
    </div>
  );
}

SigninModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSignIn: PropTypes.func.isRequired, // Add onSignIn prop validation
};

export default SigninModal;
