import express from "express";
const recipeRoute = express.Router();
import { getAllRecipes,getRecipe,createRecipe,updateRecipe,deleteRecipe } from "../../controller/recipeController/recipeController.js";
import uploadMultiple from "../../utils/uploadMultiple.js";
import upload from "../../utils/multer.js";

recipeRoute.get("/", getAllRecipes);

recipeRoute.get("/:id", getRecipe);

recipeRoute.post("/",  upload.fields([
  { name: "images" },
  { name: "stepImages" }
]),uploadMultiple, createRecipe);

recipeRoute.put("/:id",upload.fields([
  { name: "images" },
  { name: "stepImages" }
]),uploadMultiple, updateRecipe);

recipeRoute.delete("/:id", deleteRecipe);

export default recipeRoute;
