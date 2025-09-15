import express from "express";

const recipeRoute = express.Router();

recipeRoute.get("/", getAllRecipes);

recipeRoute.post("/", createRecipe);

recipeRoute.get("/:id", getRecipeById);

recipeRoute.put("/:id", updateRecipe);

recipeRoute.delete("/:id", deleteRecipe);

export default recipeRoute;
