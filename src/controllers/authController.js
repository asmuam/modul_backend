import * as authService from "../services/authService.js";

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    await authService.registerUser(username, password, email);
    res.status(201).send("User registered");
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const { token, refreshToken } = await authService.authenticateUser(
      username,
      password
    );

    // Set refresh token in an HttpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure flag in production
      sameSite: "Strict", // Adjust based on your requirements
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ token });
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

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).send("No refresh token provided");
    }

    const newToken = await authService.refreshToken(refreshToken);
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).send(error.message);
  }
};

export { register, login, logout, refreshToken };
