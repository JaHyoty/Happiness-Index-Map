import React, { useState } from "react";

const OutliersForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [outliers, setOutliers] = useState([]);

  const handleFilterOutliers = async () => {
    setLoading(true);
    setError(null);
    setOutliers([]);

    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/filterOutliers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setOutliers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Filter Outliers</h1>
      <button onClick={handleFilterOutliers} disabled={loading}>
        {loading ? "Filtering..." : "Filter Outliers"}
      </button>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {outliers.length > 0 && (
        <div>
          <h2>Outliers</h2>
          <table border="1">
            <thead>
              <tr>
                <th>Zip Code</th>
                <th>State Code</th>
                <th>Normalized Total Happiness</th>
                <th>Normalized Reported Happiness</th>
                <th>Total Happiness Score</th>
                <th>Avg Reported Happiness Score</th>
                <th>Z-Score Difference</th>
              </tr>
            </thead>
            <tbody>
              {outliers.map((row, index) => (
                <tr key={index}>
                  <td>{row.zipCode}</td>
                  <td>{row.stateCode}</td>
                  <td>{row.normalizedTotalHappiness}</td>
                  <td>{row.normalizedReportedHappiness}</td>
                  <td>{row.totalHappinessScore}</td>
                  <td>{row.avgUserReportedHappinessScore}</td>
                  <td>{row.zScoreDifference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OutliersForm;
