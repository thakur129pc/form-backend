import express from "express";
import {
  registerUser,
  loginUser,
  getProfileInfo,
} from "../controller/userController.js";
import { verifyAuth } from "../middleware/auth.js";
import multer from "multer";

const router = express.Router();
const upload = multer();

router.post("/register", upload.none(), registerUser);
router.post("/login", loginUser);
router.post("/view-profile", verifyAuth, getProfileInfo);

export default router;
