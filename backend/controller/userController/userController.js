import User from "../../model/userSchema";
import bcrypt from "bcrypt"
import passport from "passport"
import {generateToken} from "../../utils/gen"

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
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = User.create({
        firstName,
        lastName,
        email,
        username,
        password : hashedPassword,
    })
    res.status(201).json({message:"User created", user})
    
  } catch (error) {
    res.status(500).json({message : "User could not be created"})
  }
};

export const login = async (req, res,next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: info?.message || "Login failed" });
    }

    // issue JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  })(req, res, next);
};

export const resetPassword = async (req, res) => {};

export const forgotPassword = async (req, res) => {};

export const deleteAccount = async (req, res) => {};
