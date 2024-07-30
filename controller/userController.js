import { unflattenObject } from "../helpers/unflattenObject.js";
import { comparePassword, hashPassword } from "../middleware/hash.js";
import USER from "../model/userModel.js";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  const data = unflattenObject(req.body);
  const { email, username, password } = data;

  try {
    const existingUser = await USER.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const conflictField = existingUser.email === email ? "email" : "username";
      return res.status(400).json({
        success: false,
        message: `User with the provided ${conflictField} already exists`,
      });
    }

    const increptedPassword = await hashPassword(password);

    const user = new USER({ ...data, password: increptedPassword });
    await user.save();

    const responseUser = {
      name: user.fullName,
      email: user.email,
      username: user.username,
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

    const isPasswordMatch = await comparePassword(password, user.password);

    if (!isPasswordMatch) {
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
    const user = await USER.findOne({ email }).select("-password -__v");
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
