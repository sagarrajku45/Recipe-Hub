const recipeContainer = document.getElementById("recipe-container");
const loadMoreButton = document.getElementById("load-more");
const searchForm = document.getElementById("search-form");
const searchBar = document.getElementById("search-bar");

let currentQuery = ""; // Tracks the current search query
let currentOffset = 0; // Tracks the current offset for pagination
const recipesPerPage = 7; // Number of recipes per fetch

// Fetch recipes using Spoonacular API
const fetchRecipes = async (append = false) => {
  const apiKey = "57a3de97718f457b9fc38c9c3bd6bfad"; // Replace with your Spoonacular API key
  const baseUrl = "https://api.spoonacular.com/recipes/complexSearch";
  const queryParam = currentQuery ? `query=${currentQuery}&` : "cuisine=Indian&";
  const url = `${baseUrl}?${queryParam}number=${recipesPerPage}&offset=${currentOffset}&apiKey=${apiKey}`;

  try {
    console.log(`Fetching recipes with URL: ${url}`); // Debugging URL
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data); // Debugging API response

    displayRecipes(data.results, append); // Use `data.results` for `complexSearch`
    currentOffset += recipesPerPage; // Increment the offset for the next fetch
  } catch (error) {
    console.error("Error fetching recipes:", error);
    recipeContainer.innerHTML = `<p>Failed to load recipes. Please try again later.</p>`;
  }
};

// Display recipes on the page
const displayRecipes = async (recipes, append = false) => {
  if (!append) recipeContainer.innerHTML = ""; // Clear existing content if not appending
  if (!recipes || recipes.length === 0) {
    recipeContainer.innerHTML = `<p>No recipes found. Try a different search term.</p>`;
    return;
  }

  for (const recipe of recipes) {
    // Fetch detailed recipe information to get sourceUrl
    const sourceUrl = await fetchRecipeDetails(recipe.id);

    const recipeCard = document.createElement("div");
    recipeCard.classList.add("recipe-card");
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>${recipe.summary ? recipe.summary.slice(0, 100) : "No description available"}...</p>
      <a href="${sourceUrl}" target="_blank">View Recipe</a>
    `;
    recipeContainer.appendChild(recipeCard);
  }
};

// Fetch detailed recipe information using the recipe ID
const fetchRecipeDetails = async (recipeId) => {
  const apiKey = "57a3de97718f457b9fc38c9c3bd6bfad"; // Replace with your Spoonacular API key
  const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch recipe details for ID ${recipeId}`);
    }

    const data = await response.json();
    return data.sourceUrl || "#"; // Return sourceUrl or "#" if unavailable
  } catch (error) {
    console.error("Error fetching recipe details:", error);
    return "#"; // Return "#" as a fallback for broken links
  }
};

// Handle search form submission
searchForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form from reloading the page
  currentQuery = searchBar.value.trim(); // Get search query from input
  currentOffset = 0; // Reset offset for a new search
  fetchRecipes(); // Fetch recipes based on the search query
});

// Load more recipes when the button is clicked
const loadMoreRecipes = () => {
  fetchRecipes(true); // Append new recipes instead of replacing the current ones
};

// Event listener for "Load More" button
loadMoreButton.addEventListener("click", loadMoreRecipes);

// Load initial recipes on page load
fetchRecipes();
