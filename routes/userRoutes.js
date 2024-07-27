import express from "express";
import {
  registerUser,
  loginUser,
  getProfileInfo,
} from "../controller/userController.js";
import { verifyAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/view-profile", verifyAuth, getProfileInfo);

export default router;
