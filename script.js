// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA3aetlyBiZm7OQ_tol2AlgA-FZH5MWa-g",
  authDomain: "suggestb-85bf6.firebaseapp.com",
  databaseURL: "https://suggestb-85bf6-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "suggestb-85bf6",
  storageBucket: "suggestb-85bf6.appspot.com",
  messagingSenderId: "807053257328",
  appId: "1:807053257328:web:daa84a494b7842f1a2a2b5",
  measurementId: "G-J1SW2PX0DG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Global variables
let selectedCategory = '';
let allRecipes = [];

// Handle category selection
function selectCategory(category) {
  selectedCategory = category;
  document.getElementById('ingredientInput').style.display = 'block';
  document.getElementById('recipeResults').innerHTML = '';
}

// Find matching recipes
function findRecipes() {
  const input = document.getElementById('ingredients').value.trim().toLowerCase();
  if (!input) return;

  const inputIngredients = input.split(',').map(i => i.trim());
  const resultsSection = document.getElementById('recipeResults');
  resultsSection.innerHTML = `<h2>Matching Recipes:</h2>`;

  const matches = allRecipes.filter(recipe =>
    recipe.category === selectedCategory &&
    recipe.ingredients.some(ing => inputIngredients.includes(ing.toLowerCase()))
  );

  if (matches.length === 0) {
    resultsSection.innerHTML += `<p>No matching recipes found.</p>`;
    return;
  }

  matches.forEach(recipe => {
    const div = document.createElement('div');
    div.className = 'recipe';
    div.innerHTML = `
      <h3>${recipe.name}</h3>
      <p><strong>Ingredients:</strong> ${recipe.ingredients.join(', ')}</p>
      <p><strong>Instructions:</strong> ${recipe.instructions}</p>
    `;
    resultsSection.appendChild(div);
  });
}

// Add a new recipe to Firebase
function addRecipe() {
  const name = document.getElementById('recipeName').value.trim();
  const category = document.getElementById('recipeCategory').value;
  const ingredients = document.getElementById('recipeIngredients').value.trim().split(',').map(i => i.trim());
  const instructions = document.getElementById('recipeInstructions').value.trim();

  if (!name || !ingredients.length || !instructions) {
    alert('Please fill in all recipe fields.');
    return;
  }

  const recipeData = { name, category, ingredients, instructions };
  const recipeRef = push(ref(db, 'recipes/'));

  set(recipeRef, recipeData).then(() => {
    alert('✅ Recipe added!');
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeIngredients').value = '';
    document.getElementById('recipeInstructions').value = '';
    fetchRecipes();
  });
}

// Load all recipes from Firebase
function fetchRecipes() {
  const recipeRef = ref(db, 'recipes/');
  onValue(recipeRef, snapshot => {
    const data = snapshot.val();
    allRecipes = [];
    for (let key in data) {
      allRecipes.push(data[key]);
    }
  });
}

// Initial fetch
fetchRecipes();

// Make functions accessible in HTML
window.selectCategory = selectCategory;
window.findRecipes = findRecipes;
window.addRecipe = addRecipe;
