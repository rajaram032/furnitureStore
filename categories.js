function loadCategories(limit = null) {
  fetch('categories.json')
    .then(response => response.json())
    .then(categories => {
      const container = document.getElementById('category-container');
      if (!container) return;

      // Use full list if no limit, else slice
      const newCategories = limit ? categories.slice(0, limit) : categories;

      newCategories.forEach(category => {
        const col = document.createElement('div');
        col.className = 'col-md-3 col-sm-6';

        col.innerHTML = `
          <a href="category_products.html?category=${encodeURIComponent(category.category_title.trim())}" class="text-decoration-none text-dark">
            <div class="category-box text-center">
              <img src="${category.image}" alt="${category.alt || category.category_title}" class="category-img">
              <div class="category-title text-center mt-2">${category.category_title}</div>
            </div>
          </a>
        `;
        container.appendChild(col);
      });
    })
    .catch(error => console.error('Error loading categories:', error));
}




