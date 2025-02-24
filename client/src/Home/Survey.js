import React, { useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";

export const surveysubmit = async (surveyData) => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("User is not authenticated.");

  try {
    const response = await axios.post("/api/submitSurvey", surveyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 200) {
      // Successfully submitted the survey
      alert("Survey submitted successfully!");
    } else {
      // Handle non-200 responses
      alert("Error submitting survey.");
    }
  } catch (error) {
    alert("Failed to submit the survey. Please try again.");
  }
};

function SurveyModal({ onClose, onSubmitSurvey }) {
  const [zipcode, setZipcode] = useState("");
  const [rating, setRating] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs
    if (!zipcode || !rating) {
      alert("Please fill in both the ZIP code and rating.");
      return;
    }

    if (zipcode.length !== 5 || isNaN(zipcode)) {
      alert("Please enter a valid 5-digit ZIP code.");
      return;
    }

    if (rating < 1 || rating > 10) {
      alert("Rating must be between 1 and 10.");
      return;
    }

    // Call the parent handler to process the survey
    onSubmitSurvey({ zipcode, rating, comments });

    // Clear form fields
    setZipcode("");
    setRating("");
    setComments("");
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
        <h2 style={{ textAlign: "center" }}>Rate My Neighborhood</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              ZIP Code:
            </label>
            <input
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              placeholder="Enter your ZIP code"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Rating (1 to 10):
            </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Enter a rating"
              min="1"
              max="10"
              style={{
                width: "100%",
                padding: "8px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px" }}>
              Comments (Optional, max 512 characters):
            </label>
            <textarea
              value={comments}
              onChange={(e) => {
                if (e.target.value.length <= 512) setComments(e.target.value);
              }}
              placeholder="Enter your comments"
              style={{
                width: "100%",
                height: "80px",
                padding: "8px",
                fontSize: "16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            ></textarea>
            <small
              style={{ display: "block", marginTop: "5px", color: "#555" }}
            >
              {512 - comments.length} characters remaining
            </small>
          </div>
          <div style={{ textAlign: "right" }}>
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
                border: "none",
                borderRadius: "4px",
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

SurveyModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSubmitSurvey: PropTypes.func.isRequired, // Handles survey submission
};

export default SurveyModal;
