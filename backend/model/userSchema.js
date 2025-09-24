import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, required: true, },

    lastName: { type: String, trim: true, required: true, },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    username: { type: String, required: true, unique: true, trim: true },

    password: { type: String,required: true,select: false, }, // not required if using Google

    profilePic: { type: String, default: "" },

    favourites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }], // bookmarked recipes

    verificationToken: { type: String }, // for email verification
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    isVerified: { type: Boolean, default: false }, // important: default false until email verified
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
