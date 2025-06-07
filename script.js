// Wait for Firestore to be available
document.addEventListener("DOMContentLoaded", () => {
  if (!window.db) {
    console.error("Firebase Firestore not initialized.");
    return;
  }

  const db = window.db;
  let selectedCategory = "";

  // Select category and show ingredient input
  window.selectCategory = (category) => {
    selectedCategory = category;
    document.getElementById("ingredientInput").style.display = "block";
  };

  // Add a new recipe to Firestore
  window.addRecipe = async () => {
    const name = document.getElementById("recipeName").value.trim();
    const category = document.getElementById("recipeCategory").value;
    const ingredients = document.getElementById("recipeIngredients").value.toLowerCase().split(",").map(i => i.trim());
    const instructions = document.getElementById("recipeInstructions").value.trim();

    if (!name || ingredients.length === 0 || !instructions) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await firebase.firestore().collection("recipes").add({
        name,
        category,
        ingredients,
        instructions,
        timestamp: Date.now()
      });
      alert("Recipe added successfully!");
      clearRecipeForm();
    } catch (err) {
      console.error("Error adding recipe:", err);
      alert("Failed to add recipe.");
    }
  };

  const clearRecipeForm = () => {
    document.getElementById("recipeName").value = "";
    document.getElementById("recipeIngredients").value = "";
    document.getElementById("recipeInstructions").value = "";
  };

  // Find matching recipes
  window.findRecipes = async () => {
    const input = document.getElementById("ingredients").value.toLowerCase().split(",").map(i => i.trim());
    const resultsDiv = document.getElementById("recipeResults");
    resultsDiv.innerHTML = "<h2>Matching Recipes</h2>";

    try {
      const snapshot = await firebase.firestore().collection("recipes")
        .where("category", "==", selectedCategory)
        .get();

      if (snapshot.empty) {
        resultsDiv.innerHTML += "<p>No recipes found for this category.</p>";
        return;
      }

      let matchedRecipes = [];

      snapshot.forEach(doc => {
        const recipe = doc.data();
        const matched = recipe.ingredients.some(ing => input.includes(ing));
        if (matched) {
          matchedRecipes.push(recipe);
        }
      });

      if (matchedRecipes.length === 0) {
        resultsDiv.innerHTML += "<p>No matching recipes found with your ingredients.</p>";
        return;
      }

      matchedRecipes.forEach(recipe => {
        const recipeEl = document.createElement("div");
        recipeEl.className = "recipe";
        recipeEl.innerHTML = `
          <h3>${recipe.name}</h3>
          <p><strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}</p>
          <p><strong>Instructions:</strong> ${recipe.instructions}</p>
        `;
        resultsDiv.appendChild(recipeEl);
      });
    } catch (err) {
      console.error("Error finding recipes:", err);
      resultsDiv.innerHTML += "<p>Error fetching recipes.</p>";
    }
  };
});
