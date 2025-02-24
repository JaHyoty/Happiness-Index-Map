import React, { useState } from "react";
import PropTypes from "prop-types";

const RecalculateHappinessIndexForm = ({ onRecalculate }) => {
  const [loading, setLoading] = useState(false);

  const handleRecalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onRecalculate();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Recalculate Happiness Index</h1>
      <form onSubmit={handleRecalculate}>
        <button type="submit" disabled={loading}>
          {loading ? "Calculating..." : "Recalculate"}
        </button>
      </form>
    </div>
  );
};

RecalculateHappinessIndexForm.propTypes = {
  onRecalculate: PropTypes.func.isRequired,
};

export default RecalculateHappinessIndexForm;
