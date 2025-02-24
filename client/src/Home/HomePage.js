import React, { useEffect, useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import Header from "./Header";
import SignupModal from "./Signup";
import SigninModal from "./Signin";
import SurveyModal from "./Survey";
import { signin, signup, signout, deleteUser } from "./AuthService";
import { surveysubmit } from "./Survey";
import MapComponent from "./Map";
import Sidebar from "./Sidebar";
import ZipCodeSearchModal from "./ZipCodeSearchModal";

function HomePage() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showSigninModal, setShowSigninModal] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [username, setUsername] = useState(null);
  const [useremail, setUseremail] = useState(null);
  const [selectedZip, setSelectedZip] = useState(null);
  const [sidebarData, setSidebarData] = useState({});
  const [showZipCodeModal, setShowZipCodeModal] = useState(false);

  useEffect(() => {
    fetch("/api/geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setGeoData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was a problem when fetching Zip Zones:", error);
        setLoading(false);
      });
  }, []);

  // Restore Login State on Page Load
  useEffect(() => {
    const storedToken = localStorage.getItem("userToken"); // Retrieve token from localStorage
    const storedUsername =
      localStorage.getItem("firstName") && localStorage.getItem("lastName"); // Retrieve username
    const storedUseremail = localStorage.getItem("useremail"); // Retrieve user email

    if (storedToken && storedUsername && storedUseremail) {
      setUsername(
        `${localStorage.getItem("firstName")} ${localStorage.getItem("lastName")}`,
      );
      setUseremail(storedUseremail);
    }
  }, []);

  const handleSignIn = async (email, password) => {
    try {
      const { firstName, lastName } = await signin(email, password);
      const user = `${firstName} ${lastName}`;
      setUsername(user);
      setUseremail(email);
      setShowSigninModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignUp = async (firstName, lastName, email, password) => {
    try {
      const {} = await signup(firstName, lastName, email, password);
      const username = `${firstName} ${lastName}`;
      setUsername(username);
      setUseremail(email);
      setShowSignupModal(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signout();
      setUsername(null);
      setUseremail(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDeleteUser = async () => {
    const confirmation = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );

    if (!confirmation) return;

    try {
      await deleteUser(); // Use deleteUser function
      setUsername(null); // Clear username state
      setUseremail(null); // Clear useremail state
      alert("Your account has been deleted successfully.");
    } catch (error) {
      alert(error.message); // Display error message
    }
  };

  // Handle Survey Submission
  const handleSurveySubmit = (
    zipCode,
    userReportedHappinessScore,
    userComment,
  ) => {
    const surveyData = {
      useremail: useremail, // User's email
      zipCode: zipCode, // User's zip code (now a string)
      ratingg: userReportedHappinessScore, // User's happiness score (rating)
      comments: userComment, // User's comment
    };

    surveysubmit(surveyData)
      .then(() => setShowSurveyModal(false))
      .catch((error) =>
        alert("Failed to submit the survey. Please try again."),
      );
  };

  const fetchSidebarData = (zipCode) => {
    if (zipCode) {
      fetch(`/api/details?zipcode=${zipCode}`)
        .then((response) => response.json())
        .then((data) => setSidebarData(data))
        .catch((error) => console.error("Error fetching sidebar data:", error));
    }
  };

  return (
    <div>
      {/* Header */}
      <Header
        title="Happiness Index Map"
        username={username}
        onSignInClick={() => setShowSigninModal(true)}
        onSignUpClick={() => setShowSignupModal(true)}
        onLogoutClick={handleLogout}
        onSurveyClick={() => setShowSurveyModal(true)}
        onDeleteUserClick={handleDeleteUser}
      />

      {/* Main Content */}
      <div style={{ marginTop: "60px" }}>
        {loading ? (
          <div className="loading">
            <ClipLoader color="#123abc" loading={loading} size={50} />
            <p>Loading map...</p>
          </div>
        ) : (
          geoData && (
            <MapComponent
              geoData={geoData}
              setSelectedZip={setSelectedZip}
              setSidebarData={setSidebarData}
              fetchSidebarData={fetchSidebarData}
            />
          )
        )}
      </div>

      {/* Sidebar */}
      <Sidebar
        zipCode={selectedZip}
        data={sidebarData}
        useremail={useremail}
        onClose={() => {
          setSelectedZip(null);
        }}
        onSurveyClick={() => setShowSurveyModal(true)}
      />

      {/* Modals */}
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSignUp={handleSignUp}
        />
      )}
      {showSigninModal && (
        <SigninModal
          onClose={() => setShowSigninModal(false)}
          onSignIn={handleSignIn}
        />
      )}
      {showSurveyModal && (
        <SurveyModal
          onClose={() => setShowSurveyModal(false)}
          onSubmitSurvey={handleSurveySubmit}
        />
      )}

      {/* Search Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "30vh",
          marginTop: "20px",
        }}
      >
        {/* Title */}
        <h2
          style={{
            marginBottom: "15px",
            color: "#333",
            fontWeight: "bold",
            fontSize: "28px",
            textAlign: "center",
          }}
        >
          Search for news in the area
        </h2>

        {/* Button */}
        <button
          onClick={() => setShowZipCodeModal(true)}
          style={{
            padding: "12px 24px",
            borderRadius: "8px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          Search News
        </button>
      </div>

      {/* ZIP Code Search Modal */}
      {showZipCodeModal && (
        <ZipCodeSearchModal onClose={() => setShowZipCodeModal(false)} />
      )}
    </div>
  );
}

export default HomePage;
