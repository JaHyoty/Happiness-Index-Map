import React, { useState } from "react";
import PropTypes from "prop-types";
import { fetchNewsByZipCode, fetchNewsByCity } from "./NewsService";

function ZipCodeNewsSearchModal({ onClose }) {
  const [searchType, setSearchType] = useState("zip"); // 'zip' or 'city'
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [newsArticles, setNewsArticles] = useState([]);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setNewsArticles([]);

      if (searchType === "zip") {
        if (!zipCode || zipCode.length !== 5 || isNaN(zipCode)) {
          alert("Please enter a valid 5-digit ZIP Code.");
          return;
        }
        const articles = await fetchNewsByZipCode(zipCode);
        setNewsArticles(articles);
      } else if (searchType === "city") {
        if (!city || city.trim() === "") {
          alert("Please enter a valid city name.");
          return;
        }
        const articles = await fetchNewsByCity(city.trim());
        setNewsArticles(articles);
      }
    } catch (err) {
      setError(err.message);
      setNewsArticles([]);
    }
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
        <h2 style={{ textAlign: "center" }}>News Search</h2>

        {/* Search Type Toggle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <button
            onClick={() => setSearchType("zip")}
            style={{
              padding: "10px 20px",
              marginRight: "10px",
              borderRadius: "5px",
              backgroundColor: searchType === "zip" ? "#007BFF" : "#f0f0f0",
              color: searchType === "zip" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Search by ZIP Code
          </button>
          <button
            onClick={() => setSearchType("city")}
            style={{
              padding: "10px 20px",
              borderRadius: "5px",
              backgroundColor: searchType === "city" ? "#007BFF" : "#f0f0f0",
              color: searchType === "city" ? "#fff" : "#000",
              border: "none",
              cursor: "pointer",
            }}
          >
            Search by City
          </button>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ textAlign: "center" }}>
          {searchType === "zip" && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                ZIP Code:
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Enter ZIP Code"
                style={{
                  padding: "8px",
                  width: "80%",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}

          {searchType === "city" && (
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>
                City:
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City Name"
                style={{
                  padding: "8px",
                  width: "80%",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}

          <div style={{ textAlign: "right", marginTop: "10px" }}>
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
                borderRadius: "5px",
                border: "none",
              }}
            >
              Search
            </button>
          </div>
        </form>

        {/* Display Results */}
        {newsArticles.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              maxHeight: "300px", // Add max height
              overflowY: "auto", // Enable scrolling
              border: "1px solid #ddd", // Optional: Add a border
              padding: "10px", // Optional: Add padding for clarity
              borderRadius: "5px", // Optional: Add rounded corners
              backgroundColor: "#f9f9f9", // Optional: Add a subtle background color
            }}
          >
            <h3>News Articles:</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {newsArticles.map((article, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    backgroundColor: "#FFF",
                    borderRadius: "5px",
                  }}
                >
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#007BFF",
                      textDecoration: "none",
                    }}
                  >
                    {article.title}
                  </a>
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: "14px",
                      color: "#555",
                    }}
                  >
                    {article.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
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

ZipCodeNewsSearchModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default ZipCodeNewsSearchModal;
