import React, { useState } from "react";
import LoginForm from "./LoginForm";
import UpdateAttributeForm from "./UpdateAttributeForm";
import UpdateParameterForm from "./UpdateParameterForm";
import OutliersForm from "./OutliersForm";
import RecalculateHappinessIndexForm from "./RecalculateHappinessIndexForm";

const AdminPage = () => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // States for UpdateAttributeForm
  const [zipcode, setZipcode] = useState("");
  const [attribute, setAttribute] = useState("population");
  const [attributeValue, setAttributeValue] = useState("");

  const attributeOptions = [
    "population",
    "populationDensity",
    "medianAge",
    "shareOfMarried",
    "avgFamilySize",
    "unemploymentRate",
    "householdMedianIncome",
    "homeOwnershipRate",
    "medianHomeValue",
    "medianRent",
    "shareOfCollegeEducation",
    "avgCommuteTime",
  ];

  const [targetComponentName, setTargetComponentName] = useState(
    "totalHappinessScore",
  );
  const [parameter, setParameter] = useState("populationParam");
  const [parameterValue, setParameterValue] = useState("");

  const targetComponentOptions = [
    "economicWellbeingScore",
    "environmentalAndSocietalWellnessScore",
    "physicalAndMentalWellbeingScore",
    "familyAndRelationshipsScore",
    "totalHappinessScore",
  ];

  const parameterOptions = [
    "populationParam",
    "populationDensityParam",
    "medianAgeParam",
    "shareOfMarriedParam",
    "avgFamilySizeParam",
    "unemploymentRateParam",
    "householdMedianIncomeParam",
    "homeOwnershipRateParam",
    "medianHomeValueParam",
    "medianRentParam",
    "shareOfCollegeEducationParam",
    "avgCommuteTimeParam",
    "intercept",
  ];

  const [happinessResults, setHappinessResults] = useState(null);

  const [outliers, setOutliers] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await fetch("/api/adminlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthorized(true);
        localStorage.setItem("adminToken", data.token);
        alert("Login successful!");
      } else {
        setError("Incorrect password");
        alert("Login failed: Incorrect password.");
      }
    } catch (err) {
      console.error("Error logging in:", err);
      setError("An error occurred. Please try again.");
      alert("Login failed: An error occurred. Please try again.");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/updatefield", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ zipcode, attribute, value: attributeValue }),
      });

      if (response.ok) {
        alert("Field updated successfully!");
      } else {
        alert("Update failed: Could not update the field.");
      }
    } catch (err) {
      console.error("Error updating field:", err);
      alert("Update failed: An error occurred. Please try again.");
    }
  };

  const handleUpdateParam = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/updateParameters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetComponentName,
          parameter,
          value: parameterValue,
        }),
      });

      if (response.ok) {
        alert("Parameter updated successfully!");
      } else {
        alert("Update failed: Could not update the parameter.");
      }
    } catch (err) {
      console.error("Error updating parameter:", err);
      alert("Update failed: An error occurred. Please try again.");
    }
  };

  const handleRecalculate = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("/api/recalculateHappinessIndex", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHappinessResults(data);
        alert("Happiness index recalculated successfully!");
      } else {
        alert(
          "Recalculation failed: Could not recalculate the happiness index.",
        );
      }
    } catch (err) {
      console.error("Error recalculating happiness index:", err);
      alert("Recalculation failed: An error occurred. Please try again.");
    }
  };

  const handleFilterOutliers = async () => {
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
      alert("Outliers filtered successfully!");
    } catch (err) {
      console.error("Error filtering outliers:", err);
      alert("Filtering failed: An error occurred. Please try again.");
    }
  };

  return (
    <div>
      {isAuthorized ? (
        <div>
          <UpdateAttributeForm
            onUpdate={handleUpdate}
            zipcode={zipcode}
            setZipcode={setZipcode}
            attribute={attribute}
            setAttribute={setAttribute}
            value={attributeValue}
            setValue={setAttributeValue}
            attributeOptions={attributeOptions}
          />
          <UpdateParameterForm
            onUpdateParam={handleUpdateParam}
            targetComponentName={targetComponentName}
            setTargetComponentName={setTargetComponentName}
            parameter={parameter}
            setParameter={setParameter}
            value={parameterValue}
            setValue={setParameterValue}
            targetComponentOptions={targetComponentOptions}
            parameterOptions={parameterOptions}
          />
          <RecalculateHappinessIndexForm onRecalculate={handleRecalculate} />
          {happinessResults && (
            <div>
              <h2>Recalculation Results</h2>
              <table border="1">
                <thead>
                  <tr>
                    <th>State Code</th>
                    <th>Zip Code Improved Most</th>
                    <th>Rank Improved From</th>
                    <th>Rank Improved To</th>
                    <th>Rank Improvement</th>
                    <th>Zip Code Dropped Most</th>
                    <th>Rank Dropped From</th>
                    <th>Rank Dropped To</th>
                    <th>Rank Drop</th>
                  </tr>
                </thead>
                <tbody>
                  {happinessResults.map((row, index) => (
                    <tr key={index}>
                      <td>{row.stateCode}</td>
                      <td>{row.zipCodeImprovedMost}</td>
                      <td>{row.rankImprovedFrom}</td>
                      <td>{row.rankImprovedTo}</td>
                      <td>{row.rankImprovement}</td>
                      <td>{row.zipCodeDroppedMost}</td>
                      <td>{row.rankDroppedFrom}</td>
                      <td>{row.rankDroppedTo}</td>
                      <td>{row.rankDrop}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <OutliersForm onFilterOutliers={handleFilterOutliers} />
          {outliers && (
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
      ) : (
        <LoginForm
          onLogin={handleLogin}
          password={password}
          setPassword={setPassword}
          error={error}
        />
      )}
    </div>
  );
};

export default AdminPage;
