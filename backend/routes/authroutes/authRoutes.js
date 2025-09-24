import express from "express";
const authRoutes = express.Router();

import {signup,login,verifyEmail,requestPasswordReset,resetPassword,logout,deleteAccount,refresh,getUserDetails} from "../../controller/userController/userController.js";

import { protect } from "../../middlewares/auth.js";
// Email/Password
authRoutes.post("/register", signup);
authRoutes.post("/login", login);

// Email Verification
authRoutes.get("/verify/:token", verifyEmail);

// Password Reset
authRoutes.post("/forgot-password", requestPasswordReset);
authRoutes.post("/reset-password/:token", resetPassword);

authRoutes.get("/me", protect, getUserDetails);

authRoutes.post("/logout",protect, logout)
authRoutes.delete("/delete",protect, deleteAccount)
authRoutes.post("/refresh", refresh)


export default authRoutes;
