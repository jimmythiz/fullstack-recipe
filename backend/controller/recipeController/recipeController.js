import Recipe from "../../model/recipeSchema";

export const getAllRecipes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const recipes = await Recipe.find().skip(skip).limit(limit);
    const total = await Recipe.countDocuments();
    return res
      .status(200)
      .json({
        message: "Success",
        page,
        totalPages: Math.ceil(total / limit),
        totalRecipes: total,
        recipes,
      });
  } catch (error) {
    return res.status(500).json(error.message);
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
    return res.status(500).json(error.message);
  }
};

export const createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, categories } = req.body;
    if(!title|| !description|| !ingredients|| !steps || !categories){
        res.status(400).json({message : "Incomplete Fields"})
    }

    // ✅ whitelist allowed fields
    const recipeData = {
      title,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [ingredients],
      categories: Array.isArray(categories) ? categories : [categories],
      createdBy: req.user.id, // always bind to logged-in user
    };

    // ✅ handle step-by-step with optional images
    if (steps) {
      const parsedSteps = JSON.parse(steps); // if sent as JSON string
      recipeData.steps = parsedSteps.map((step, index) => ({
        text: step.text,
        image: req.files?.stepImages?.[index]?.path || "", // attach uploaded step image if exists
      }));
    }

    // ✅ handle final result images
    if (req.files?.finalImages) {
      recipeData.images = req.files.finalImages.map((file) => file.path);
    }
    const recipe = await Recipe.create(recipeData);
    res.status(201).json({ message: "Recipe Created", recipe });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};


// Update a recipe
export const updateRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    // Define what fields can be updated
    const allowedUpdates = [
      "title",
      "description",
      "ingredients",
      "steps",
      "images",
      "categories",
    ];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((key) =>
      allowedUpdates.includes(key)
    );

    if (!isValidOperation) {
      return res.status(400).json({ error: "Invalid update fields provided" });
    }

    // Find recipe
    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // Apply updates with sanitization
    updates.forEach((field) => {
      let value = req.body[field];

      if (typeof value === "string") {
        value = value.trim();
      }

      if (Array.isArray(value)) {
        // ensure arrays contain only strings
        value = value.map((item) =>
          typeof item === "string" ? item.trim() : item
        );
      }

      // Special handling for steps
      if (field === "steps" && Array.isArray(value)) {
        value = value.map((step) => ({
          text: step.text?.trim() || "",
          image: step.image?.trim() || "",
        }));
      }

      recipe[field] = value;
    });

    await recipe.save();
    res.json({ message: "Recipe updated successfully", recipe });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error while updating recipe" });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if(!deletedRecipe){
        res.status(404).json({message:"Recipe not found"})
    }
    return res.status(200).json({ message: "Successfuly Deleted" });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};
