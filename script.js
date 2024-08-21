const apiKey = 'QZUxKwDzD80CpusWnBkkzSDgfJfy3I97zwuL9bWqsZUjxoEsOdiDYBhM';
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let searchResultsImages = []; // To store search results images

window.onload = async () => {
    await searchImages('laptops');
};

document.getElementById('searchButton').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value;
    await searchImages(query);
});

document.getElementById('searchInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const query = document.getElementById('searchInput').value;
        await searchImages(query);
    }
});

async function searchImages(query) {
    const response = await fetch(`https://api.pexels.com/v1/search?query=${query}`, {
        headers: {
            Authorization: apiKey
        }
    });
    const data = await response.json();
    searchResultsImages = data.photos;
    if (searchResultsImages.length > 0) {
        displayFirstImage(searchResultsImages[0]);
        displaySimilarResults(searchResultsImages.slice(1));
    }
}

function displayFirstImage(image) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `
        <div class="flex items-center p-4 bg-white shadow-md rounded mb-4">
            <img src="${image.src.medium}" alt="${image.alt}" class="h-48 w-auto rounded">
            <div class="ml-4">
                <h3 class="font-bold text-lg">${image.alt}</h3>
                <p>Photographer: ${image.photographer}</p>
                <button class="bg-red-600 text-white px-4 py-2 mt-4" onclick="window.open('${image.photographer_url}', '_blank')">EXPLORE MORE</button>
            </div>
        </div>
    `;
}

function displaySimilarResults(images) {
    const splideList = document.querySelector('.splide__list');
    splideList.innerHTML = '';
    images.forEach(image => {
        splideList.innerHTML += `
            <li class="splide__slide">
                <div class="relative p-4 bg-white shadow-md rounded">
                    <img src="${image.src.small}" alt="${image.alt}" class="h-48 w-full rounded">
                    <button class="absolute top-2 right-2 bg-gray-200 rounded-full p-1" onclick="toggleFavorite(${JSON.stringify(image).replace(/"/g, '&quot;')})">
                        <img src="${favorites.some(f => f.id === image.id) ? 'red-heart.png' : 'heart.png'}" class="h-6">
                    </button>
                    <div class="text-center mt-2">
                        <p class="font-semibold text-gray-700">${image.alt || 'No description'}</p>
                        <p class="text-gray-500">Photographer: ${image.photographer}</p>
                    </div>
                </div>
            </li>
        `;
    });

    new Splide('.splide', {
        type: 'loop',
        perPage: 3,
        autoplay: true,
        arrowPath: 'M14 2l-1.41 1.41L7.83 8H20v2H7.83l4.76 4.59L14 18l-8-8z', // Ensure this path is correct
        arrowColor: 'grey',
        pagination: false,
    }).mount();
}

function toggleFavorite(image) {
    const isFavorite = favorites.some(f => f.id === image.id);
    
    if (isFavorite) {
        // Remove from favorites
        favorites = favorites.filter(f => f.id !== image.id);
        searchResultsImages.unshift(image); // Add back to the start of search results
    } else {
        // Add to favorites
        favorites.push(image);
        searchResultsImages = searchResultsImages.filter(img => img.id !== image.id); // Remove from search results
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
    
    // Display only the first image after the heart button is clicked
    if (searchResultsImages.length > 0) {
        displayFirstImage(searchResultsImages[0]);
    } else {
        document.getElementById('searchResults').innerHTML = '';
    }
    
    // Update the favorites section
    displayFavorites();
}
function displaySearchResult(images) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = '';
    images.forEach(image => {
        searchResults.innerHTML += `
            <div class="relative p-4 bg-white shadow-md rounded mb-4">
                <img src="${image.src.medium}" alt="${image.alt}" class="h-48 w-auto rounded">
                <button class="absolute top-2 right-2 bg-gray-200 rounded-full p-1" onclick="toggleFavorite(${JSON.stringify(image).replace(/"/g, '&quot;')})">
                    <img src="${favorites.some(f => f.id === image.id) ? 'red-heart.png' : 'heart.png'}" class="h-6">
                </button>
                <div class="text-center mt-2">
                    <p class="font-semibold text-gray-700">${image.alt || 'No description'}</p>
                    <p class="text-gray-500">Photographer: ${image.photographer}</p>
                </div>
            </div>
        `;
    });
}

function displayFavorites() {
    const favoritesSection = document.getElementById('favoritesSection');
    favoritesSection.innerHTML = '';
    favorites.forEach(image => {
        favoritesSection.innerHTML += `
            <div class="relative p-4 bg-white shadow-md rounded mb-4">
                <img src="${image.src.small}" alt="${image.alt}" class="h-48 w-full rounded">
                <button class="absolute top-2 right-2 bg-gray-200 rounded-full p-1" onclick="toggleFavorite(${JSON.stringify(image).replace(/"/g, '&quot;')})">
                    <img src="red-heart.png" class="h-6">
                </button>
                <div class="text-center mt-2">
                    <p class="font-semibold text-gray-700">${image.alt || 'No description'}</p>
                    <p class="text-gray-500">Photographer: ${image.photographer}</p>
                </div>
            </div>
        `;
    });
}

document.getElementById('sortButton').addEventListener('click', () => {
    favorites.sort((a, b) => (a.alt || '').localeCompare(b.alt || ''));
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
});

displayFavorites();
