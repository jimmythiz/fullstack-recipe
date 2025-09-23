import express from "express";
const authRoutes = express.Router();

import {signup,login,verifyEmail,requestPasswordReset,resetPassword} from "../../controller/userController/userController.js";
import {googleLogin} from "../../controller/googleOuth.js"
// Email/Password
authRoutes.post("/register", signup);
authRoutes.post("/login", login);

// Email Verification
authRoutes.get("/verify/:token", verifyEmail);

// Password Reset
authRoutes.post("/forgot-password", requestPasswordReset);
authRoutes.post("/reset-password/:token", resetPassword);

// Google OAuth
authRoutes.post("/google", googleLogin);


export default authRoutes;
