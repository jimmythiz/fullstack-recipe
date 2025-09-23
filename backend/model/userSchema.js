import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    username: { type: String, required: true, unique: true, trim: true },

    password: { type: String }, // not required if using Google

    googleId: { type: String }, // for Google OAuth users

    profilePic: { type: String, default: "" },

    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }], // bookmarked recipes

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    verificationToken: { type: String }, // for email verification
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    isVerified: { type: Boolean, default: false }, // important: default false until email verified
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
