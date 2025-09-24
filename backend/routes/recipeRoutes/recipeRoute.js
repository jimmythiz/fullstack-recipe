import express from "express";
const recipeRoute = express.Router();
import { getAllRecipes,getRecipe,createRecipe,updateRecipe,deleteRecipe,getMyRecipes } from "../../controller/recipeController/recipeController.js";
import uploadMultiple from "../../utils/uploadMultiple.js";
import upload from "../../utils/multer.js";
import { protect } from "../../middlewares/auth.js";

recipeRoute.get("/", getAllRecipes);
recipeRoute.get("/my-recipes",protect, getMyRecipes)
recipeRoute.get("/:id", getRecipe);


recipeRoute.post("/",protect,  upload.fields([
  { name: "images",maxCount: 5 },
  { name: "stepImages",maxCount: 10 }
]),uploadMultiple, createRecipe);

recipeRoute.put("/:id",protect,upload.fields([
  { name: "images",maxCount: 5 },
  { name: "stepImages",maxCount: 10 }
]),uploadMultiple, updateRecipe);

recipeRoute.delete("/:id",protect, deleteRecipe);

export default recipeRoute;
