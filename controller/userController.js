import USER from "../model/userModel.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const { email, username } = req.body;

  try {
    const existingUser = await USER.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "username";
      return res.status(400).json({
        success: false,
        message: `User with the provided ${conflictField} already exists`,
      });
    }

    const user = new USER(req.body);
    await user.save();

    const accessToken = jwt.sign(
      { username: username, email: user.email },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1D" }
    );

    const responseUser = {
      name: user.fullName,
      email: user.email,
      username: user.username,
      accessToken,
    };

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: responseUser,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Registration failed.",
        errors: validationErrors,
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Internal server error. Please try again later.",
      });
    }
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "All input fields are required",
    });
  }

  try {
    const user = await USER.findOne({ username });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // 4. Compare password securely (avoid plain text comparison)
    // const isMatch = await user.comparePassword(password);

    if (password !== user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const accessToken = jwt.sign(
      { username: username, email: user.email },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1D" }
    );

    const responseUser = {
      name: user.fullName,
      email: user.email,
      username: user.username,
      accessToken,
    };

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: responseUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};

const getProfileInfo = async (req, res) => {
  const { email } = req.user;

  try {
    const user = await USER.findOne({ email }).select("-__v");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export { registerUser, loginUser, getProfileInfo };
