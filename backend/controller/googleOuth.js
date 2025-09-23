import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../model/userSchema.js";

import dotenv from "dotenv";
dotenv.config()

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google login
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // frontend sends Google ID token

    // Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, picture } = ticket.getPayload();

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").length > 1 ? name.split(" ")[1] : "",
        password: null, 
        isVerified: true, 
        profilePic: picture,
        username: name
      });
    }

    // Issue JWT
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstname,
        lastName: user.lastname,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    res.status(400).json({ message: "Google login failed", error: err.message });
  }
};
