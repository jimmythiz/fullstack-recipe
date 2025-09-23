import User from "../../model/userSchema.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import {generateToken} from "../../utils/generateToken.js"
import sendEmail from "../../utils/sendEmail.js"
import dotenv from "dotenv";
dotenv.config()

export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, username, password, confirmPassword } = req.body;
    if (
      !firstName ||
      !lastName ||
      !email ||
      !username ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "Incomplete Fields" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }
    if (password !== confirmPassword) {
      return res.status(422).json({ message: "Passwords do not match" });
    }
    
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
        firstName,
        lastName,
        email,
        username,
        password : hashedPassword,
        authProvider: "local",
        verificationToken
    })
    const verifyUrl = `${process.env.CLIENT_URL}/verify/${verificationToken}`;
    await sendEmail(email, "Verify your account", `Click here to verify your account: ${verifyUrl}`);
    res.status(201).json({message:"User created",user})
    
  } catch (error) {
    res.status(500).json({message : "User could not be created"})
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate incoming data
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find the user by email
    const user = await User.findOne({ email }).select('+password');

    // 3. Handle user not found or no password stored
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Handle unverified users
    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    // 5. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 6. Generate a JWT and create a user object without the password
    const token = generateToken(user._id);
    const userObject = user.toObject();
    delete userObject.password;

    // 7. Send success response
    res.status(200).json({ token, user: userObject });

  } catch (err) {
    // 8. Handle server-side errors
    console.error(err); // Log the full error for debugging
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail(user.email, "Password Reset", `Reset your password here: ${resetUrl}`);

    res.status(200).json({ message: "Password reset link sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const deleteAccount = async (req, res) => {
  try {
    const { userId } = req.user; 
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user registered via Google, skip password check
    if (user.authProvider === "local") {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
