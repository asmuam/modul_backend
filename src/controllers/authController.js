import * as authService from "../services/authService.js";

const register = async (req, res) => {
  try {
    const { username, password, email, name, role } = req.body;
    await authService.registerUser(username, password, email, name, role);
    res.status(201).send("User registered");
  } catch (error) {
    if (error.message === 'User with this username or email already exists') {
      res.status(409).send(error.message); // Conflict for duplicate users
    } else {
      res.status(400).send(error.message); // Bad request for other errors
    }
  }
};


const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { uid, name, token, refreshToken } = await authService.authenticateUser(
      username,
      password
    );

    // Set refresh token in an HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure flag in production
      sameSite: "Strict", // Adjust based on your requirements
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({ uid, name, token });
  } catch (error) {
    res.status(401).send(error.message);
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await authService.logoutUser(refreshToken); // Pass the refreshToken to remove it from the database
      res.clearCookie("refreshToken"); // Clear the cookie
    }

    res.status(200).send("Logged out successfully");
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send("No refresh token provided");
    }

    const newToken = await authService.refreshToken(refreshToken);

    if (newToken) {
      // Successfully refreshed token
      res.json({ token: newToken });
    } else {
      // Failed to refresh token
      res.status(401).send("Invalid refresh token or user not found");
    }
  
  } catch (error) {
    // Log the error and send a generic error response
    console.error("Error during token refresh:", error.message);
    res.status(401).send("An error occurred during token refresh");
  }
};


export { register, login, logout, refresh };
