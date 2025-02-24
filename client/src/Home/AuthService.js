import axios from "axios";

const handleError = (error, defaultMessage) =>
  error.response?.data?.error || defaultMessage;

export const signin = async (email, password) => {
  try {
    const response = await axios.post("/api/auth/signin", { email, password });

    const { accessToken, firstName, lastName } = response.data;

    localStorage.setItem("userToken", accessToken);
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("useremail", email);

    return { firstName, lastName };
  } catch (error) {
    const errorMessage = handleError(error, "Sign in failed.");
    console.error("Sign In Error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const signup = async (firstName, lastName, email, password) => {
  try {
    const response = await axios.post("/api/auth/signup", {
      firstName,
      lastName,
      email,
      password,
    });

    const { accessToken, message } = response.data;

    localStorage.setItem("userToken", accessToken);
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
    localStorage.setItem("useremail", email);

    console.log(message);
    return { firstName, lastName, token: accessToken };
  } catch (error) {
    const errorMessage = handleError(error, "Sign up failed.");
    console.error("Sign Up Error:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const signout = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User is not authenticated.");

    await axios.post(
      "/api/auth/signout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return { message: "Signed out successfully." };
  } catch (error) {
    const errorMessage = handleError(error, "Sign out failed.");
    console.error("Sign Out Error:", errorMessage);
    throw new Error(errorMessage);
  } finally {
    localStorage.removeItem("userToken");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("useremail");
  }
};

export const deleteUser = async () => {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("User is not authenticated.");

    await axios.delete("/api/auth/deleteUser", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return { message: "User deleted successfully." };
  } catch (error) {
    const errorMessage = handleError(error, "User deletion failed.");
    console.error("Delete User Error:", errorMessage);
    throw new Error(errorMessage);
  } finally {
    localStorage.removeItem("userToken");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("useremail");
  }
};
