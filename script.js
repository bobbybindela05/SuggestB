JS

const databaseURL = "https://suggestb-85bf6-default-rtdb.asia-southeast1.firebasedatabase.app/recipes";

// Meal category selection
let selectedCategory = null;
document.querySelectorAll(".meal-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedCategory = btn.dataset.category;
    document.getElementById("selected-category").innerText = selectedCategory;
  });
});

// Add recipe
document.getElementById("add-recipe-btn").addEventListener("click", async () => {
  const recipeName = document.getElementById("recipe-name").value.trim();
  const recipeIngredients = document.getElementById("recipe-ingredients").value.trim();

  if (!selectedCategory || !recipeName || !recipeIngredients) {
    alert("Please select category and fill all recipe details.");
    return;
  }

  const ingredientsArray = recipeIngredients
    .split(",")
    .map(i => i.trim().toLowerCase())
    .filter(i => i.length > 0);

  const recipeData = {
    name: recipeName.trim(),
    ingredients: ingredientsArray,
    category: selectedCategory
  };

  try {
    const response = await fetch(`${databaseURL}.json`, {
      method: "POST",
      body: JSON.stringify(recipeData)
    });

    if (response.ok) {
      alert("Recipe added successfully!");
      document.getElementById("recipe-name").value = "";
      document.getElementById("recipe-ingredients").value = "";
    } else {
      alert("Error adding recipe.");
    }
  } catch (error) {
    console.error(error);
    alert("Network error while adding recipe.");
  }
});

// Search by recipe name OR ingredients (case-insensitive)
document.getElementById("search-btn").addEventListener("click", async () => {
  const userInput = document.getElementById("search-ingredients").value.trim().toLowerCase();
  const searchCategory = selectedCategory;

  if (!searchCategory || !userInput) {
    alert("Please select a category and enter a search term.");
    return;
  }

  const searchTerms = userInput.split(",").map(term => term.trim());

  try {
    const response = await fetch(`${databaseURL}.json`);
    const data = await response.json();
    const resultArea = document.getElementById("search-results");
    resultArea.innerHTML = "";

    if (data) {
      const recipes = Object.values(data);

      const matches = recipes.filter(recipe => {
        if (recipe.category !== searchCategory) return false;

        const nameMatch = searchTerms.some(term =>
          recipe.name.toLowerCase().includes(term)
        );

        const ingredientMatch = recipe.ingredients.some(ing =>
          searchTerms.some(term => ing.includes(term))
        );

        return nameMatch || ingredientMatch;
      });

      if (matches.length) {
        matches.forEach(recipe => {
          const div = document.createElement("div");
          div.classList.add("recipe-card");
          div.innerHTML = `<strong>${recipe.name}</strong><br>Ingredients: ${recipe.ingredients.join(", ")}`;
          resultArea.appendChild(div);
        });
      } else {
        resultArea.innerHTML = "<p>No matching recipes found.</p>";
      }
    } else {
      resultArea.innerHTML = "<p>No recipes found in database.</p>";
    }
  } catch (error) {
    console.error(error);
    alert("Error fetching recipes.");
  }
});
