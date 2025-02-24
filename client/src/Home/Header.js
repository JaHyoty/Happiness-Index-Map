import React from "react";
import PropTypes from "prop-types";

function Header({
  title,
  username,
  onSignInClick,
  onSignUpClick,
  onLogoutClick,
  onSurveyClick,
  onDeleteUserClick,
}) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#f8f9fa",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
      }}
    >
      <h1 style={{ margin: 0 }}>{title}</h1>
      <div>
        {username ? (
          <>
            <span style={{ marginRight: "15px" }}>Hello, {username}</span>
            <button
              onClick={onSurveyClick}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
              }}
            >
              Complete a survey
            </button>
            <button
              onClick={onLogoutClick}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
              }}
            >
              Logout
            </button>
            <button
              onClick={onDeleteUserClick}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
              }}
            >
              Delete Account
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onSignInClick}
              style={{
                marginRight: "10px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
            <button
              onClick={onSignUpClick}
              style={{
                marginRight: "30px",
                padding: "8px 16px",
                cursor: "pointer",
              }}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  username: PropTypes.string,
  onSignInClick: PropTypes.func.isRequired,
  onSignUpClick: PropTypes.func.isRequired,
  onLogoutClick: PropTypes.func.isRequired,
  onSurveyClick: PropTypes.func.isRequired,
  onDeleteUserClick: PropTypes.func.isRequired,
};

export default Header;
