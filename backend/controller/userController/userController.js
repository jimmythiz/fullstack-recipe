import User from "../../model/userSchema.js";
import bcrypt from "bcrypt"
import crypto from "crypto"
import {generateTokens} from "../../utils/generateToken.js"
import sendEmail from "../../utils/sendEmail.js"
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
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
    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify/${verificationToken}`;
    await sendEmail(email, "Verify your account", `Click here to verify your account: ${verifyUrl}`);
    const userObject = user.toObject();
delete userObject.password;
delete userObject.verificationToken;
    res.status(201).json({message:"User created",userObject})
    
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

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const { accessToken, refreshToken } = generateTokens(user._id);
    res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // Prevents client-side JS access
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict', // Helps prevent CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        });

    res.status(200).json({ accessToken});

  } catch (err) {
    console.error(err); 
    res.status(500).json({ message: "An unexpected error occurred" });
  }
};


export const refresh = (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
        return res.status(401).json({ message: "No refresh token provided" });
    }
    
    try {
        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        
        // Generate a new access token
        const accessToken = jwt.sign(
            { id: decoded.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "15m" }
        );
        
        res.status(200).json({ accessToken });
        
    } catch (err) {
        // Handle invalid or expired refresh token
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000; 
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${resetToken}`;
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
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
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

export const logout = (req, res) => {
  
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
    
    res.status(200).json({ message: "Logged out successfully" });
};

export const getUserDetails = async (req,res)=>{
  try{
    const user = req.user;
    if (!user){
      return res.status(404).json({message:"User Not Found"})
    }
    return res.status(200).json({
  _id: user._id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  username: user.username,
  isVerified: user.isVerified,
});


  }catch(error){
    res.status(500).json({message : error.message})
  }
}

export const deleteAccount = async (req, res) => {
  try {
    const  userId  = req.user._id; 
    const { password } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Incorrect password" });
  

    await User.findByIdAndDelete(userId);
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
