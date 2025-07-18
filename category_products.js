document.addEventListener("DOMContentLoaded", function () {
  showSelectedCategoryProducts();
  highlightWishlistedItems();
  updateWishlistCount();
  updateCartBadge();
  registration();
  loginForm();
  updateNavbar();
});



function showSelectedCategoryProducts() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategory = urlParams.get("category");

  fetch("categories.json")
    .then((res) => res.json())
    .then((data) => {
          
      const categoryButtonsContainer =
        document.getElementById("category-buttons");
      const productsSection = document.getElementById("products-section");
      const productList = document.getElementById("product-list");
      const categoryTitle = document.getElementById("category-title");

      // Show category buttons
      data.forEach((category) => {
        const btn = document.createElement("button");
        btn.className = `btn  m-2 ${
          category.category_title === selectedCategory ? "active" : ""
        }`;
        btn.textContent = category.category_title;
        btn.onclick = () => {
          window.location.href = `category_products.html?category=${encodeURIComponent(
            category.category_title
          )}`;
          btn.style.backgroundColor = "red";
        };
        categoryButtonsContainer.appendChild(btn);
      });

      // Show selected category products
      const matchedCategory = data.find(
        (cat) => cat.category_title === selectedCategory
      );
      if (!matchedCategory) {
        categoryTitle.textContent = "Category not found.";
        return;
      }

      categoryTitle.textContent = matchedCategory.category_title;
      productsSection.style.display = "block";
      productList.innerHTML = "";

      matchedCategory.products.forEach((product) => {
        const discount = product.old_price
          ? Math.round(
              ((product.old_price - product.price) / product.old_price) * 100
            )
          : 0;
        const productCard = `
  <div class="col-md-4 col-lg-4 col-sm-6">
    <div class="product-card">
      <div class="card-container">
        <div class="product-image">
          <img src="${product.image}" class="img-fluid" alt="${
          product.product_name
        }">
          <span class="discount-badge">-${discount}%</span>
        </div>
        <div class="product-details">
          <div class="product-title" style="height:65px">${product.product_name}</div>
          <div class="product-sub">${product.subtitle}</div>
          <div class="price">₹${product.price.toLocaleString()}<span class="price-old">₹${
          product.old_price
        }</span></div>
        </div>
      </div>
      <div class="product-actions d-flex flex-column align-items-center">
        <button class="btn-add-cart"
          data-id="${product.id}"
          data-name="${product.product_name.replace(/"/g, "&quot;")}"
          data-image="${product.image}"
          data-price="${product.price}">
          Add to Cart
        </button>
        <div class="icon-actions">
           <a href="#" class="action-link btn-add-compare" data-id="${product.id}">
                <i class="fa-solid fa-code-compare"></i><span>Compare</span>
              </a>
          <a href="product_detail.html?id=${product.id}" class="action-link">
            <img src="images/Group.png" alt=""><span>Quick View</span>
          </a>
          <a href="#" class="action-link wishlist-icon " data-id="${
            product.id
          }">
  <i class="fas fa-heart me-2"></i><span>Like</span>
</a>
        </div>
      </div>
    </div>
  </div>
`;

        productList.insertAdjacentHTML("beforeend", productCard);
      });
      //Call highlightWishlistedItems() after rendering cards because icons not red after switching
      highlightWishlistedItems();
      //from cart logic
      getAddToCartValues();
    })
   // error block
    .catch((error) => {
      console.error("Failed to load categories.json", error);
     
    });
}
