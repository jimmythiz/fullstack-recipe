import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String], // list of ingredients
      required: true,
    },
    prepTime : {
      type:Number,
      required: true
    },
    steps: [
      {
        text: { type: String, required: true }, // instruction text
        image: { type: String, default: "" },   // optional image for this step
      },
    ],
    images: {
      type: [String], // final dish images
      default: [],
    },
    categories: {
      type: [String], // e.g., ["Vegan", "Breakfast"]
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        value: { type: Number, min: 1, max: 5 },
      },
    ],
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
