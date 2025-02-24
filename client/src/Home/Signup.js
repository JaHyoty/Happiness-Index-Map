import React, { useState } from "react";
import PropTypes from "prop-types";

function SignupModal({ onClose, onSignUp }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
      alert("All fields are required!");
      return;
    }

    // Call the onSignUp callback with the user data
    onSignUp(firstName, lastName, email, password);
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
          width: "600px",
          maxWidth: "90%",
        }}
      >
        <h2 style={{ textAlign: "center" }}>Sign Up</h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ marginBottom: "10px", width: "100%" }}>
            <label
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "5px",
              }}
            >
              First Name:
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              style={{
                display: "block",
                width: "80%",
                margin: "0 auto",
                padding: "8px",
                textAlign: "center",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px", width: "100%" }}>
            <label
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "5px",
              }}
            >
              Last Name:
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              style={{
                display: "block",
                width: "80%",
                margin: "0 auto",
                padding: "8px",
                textAlign: "center",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px", width: "100%" }}>
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
          <div style={{ marginBottom: "10px", width: "100%" }}>
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
              Submit
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

SignupModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSignUp: PropTypes.func.isRequired, // Add onSignUp prop validation
};

export default SignupModal;
