import express from "express";
const recipeRoute = express.Router();
import { getAllRecipes,getRecipe,createRecipe,updateRecipe,deleteRecipe } from "../../controller/recipeController/recipeController";
import uploadMultiple from "../../utils/uploadMultiple";
import upload from "../../utils/multer";

recipeRoute.get("/", getAllRecipes);

recipeRoute.get("/:id", getRecipe);

recipeRoute.post("/",upload.array("images"),uploadMultiple, createRecipe);

recipeRoute.put("/:id",upload.array("images"),uploadMultiple, updateRecipe);

recipeRoute.delete("/:id", deleteRecipe);

export default recipeRoute;
