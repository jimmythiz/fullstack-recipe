import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: { type: String, required: true, unique: true },
    username : String,
    password: { type: String }, 
    googleId: { type: String }, 
  },
  { timestamps: true }
)


const User = mongoose.model("User", userSchema);
export default User;