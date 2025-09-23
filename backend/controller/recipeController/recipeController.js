import Recipe from "../../model/recipeSchema.js";

export const getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const recipes = await Recipe.find().skip(skip).limit(limit);
    const total = await Recipe.countDocuments();
    return res.status(200).json({
      message: "Success",
      page,
      totalPages: Math.ceil(total / limit),
      totalRecipes: total,
      recipes,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe Not Found" });
    }
    return res.status(200).json({ message: "Success", recipe });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, prepTime, steps, categories } = req.body;
    
    // Validation
    if (!title || !description || !ingredients || !steps || !prepTime) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Parse JSON strings
    const parsedIngredients = typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients;
    const parsedSteps = typeof steps === "string" ? JSON.parse(steps) : steps;
    const parsedCategories = typeof categories === "string" ? JSON.parse(categories) : (categories || []);

    // Validate parsed data
    if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
      return res.status(400).json({ message: "At least one ingredient is required" });
    }

    if (!Array.isArray(parsedSteps) || parsedSteps.length === 0) {
      return res.status(400).json({ message: "At least one step is required" });
    }

    // Get uploaded files
    const finalImages = req.files["images"] || [];
    const stepImages = req.files["stepImages"] || [];

    // Map step images to steps
    const stepsWithImages = parsedSteps.map((step, index) => ({
      text: step.text,
      image: stepImages[index]?.url || "",
    }));

    // Create recipe data
    const recipeData = {
      title: title.trim(),
      description: description.trim(),
      prepTime: parseInt(prepTime),
      ingredients: parsedIngredients.filter(ing => ing.trim() !== ""),
      steps: stepsWithImages,
      categories: Array.isArray(parsedCategories) ? parsedCategories : [],
      images: finalImages.map((img) => img.url),
      createdBy: req.user?.id || null, // This requires authentication middleware
    };

    const recipe = await Recipe.create(recipeData);
    res.status(201).json({ message: "Recipe Created Successfully", recipe });
  } catch (error) {
    console.error("Create recipe error:", error);
    return res.status(500).json({ 
      message: "Failed to create recipe", 
      error: error.message 
    });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Find recipe first
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user owns the recipe (if authentication is implemented)
    // if (req.user && recipe.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: "Not authorized to update this recipe" });
    // }

    const { title, description, ingredients, prepTime, steps, categories } = req.body;

    // Parse JSON strings if they exist
    const parsedIngredients = ingredients ? (typeof ingredients === "string" ? JSON.parse(ingredients) : ingredients) : recipe.ingredients;
    const parsedSteps = steps ? (typeof steps === "string" ? JSON.parse(steps) : steps) : recipe.steps;
    const parsedCategories = categories ? (typeof categories === "string" ? JSON.parse(categories) : categories) : recipe.categories;

    // Get uploaded files
    const finalImages = req.files["images"] || [];
    const stepImages = req.files["stepImages"] || [];

    // Update steps with new images if provided
    const updatedSteps = parsedSteps.map((step, index) => ({
      text: step.text,
      image: stepImages[index]?.url || step.image || "",
    }));

    // Update recipe
    const updatedData = {
      title: title ? title.trim() : recipe.title,
      description: description ? description.trim() : recipe.description,
      prepTime: prepTime ? parseInt(prepTime) : recipe.prepTime,
      ingredients: parsedIngredients.filter(ing => ing.trim() !== ""),
      steps: updatedSteps,
      categories: parsedCategories,
      images: finalImages.length > 0 ? finalImages.map(img => img.url) : recipe.images,
    };

    const updatedRecipe = await Recipe.findByIdAndUpdate(id, updatedData, { new: true });
    res.json({ message: "Recipe updated successfully", recipe: updatedRecipe });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error while updating recipe", error: error.message });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(200).json({ message: "Successfully Deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};