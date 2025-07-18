document.addEventListener("click", function (event) {
  const searchContainer = document.getElementById("searchContainer");
  const searchInput = document.getElementById("searchInput");
  const isClickInside = searchContainer.contains(event.target);

  if (!isClickInside && searchInput.classList.contains("show")) {
    const collapseInstance = bootstrap.Collapse.getInstance(searchInput);
    if (collapseInstance) {
      collapseInstance.hide();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const wishlistItemsContainer = document.getElementById("wishlist-items");
  const wishlistCount = document.getElementById("wishlist-count");
  const clearBtn = document.getElementById("clear-wishlist");

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  function renderWishlist() {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlistItemsContainer.innerHTML = "";

    if (wishlist.length === 0) {
      wishlistItemsContainer.innerHTML = `<p class="text-center text-muted">Your wishlist is empty.</p>`;
      wishlistCount.textContent = "(0)";
      return;
    }

    wishlistCount.textContent = `(${wishlist.length})`;

    // Load all products once
    fetch("categories.json")
      .then((res) => res.json())
      .then((data) => {
        // Flatten all products into a single array
        const allProducts = data.flatMap((category) => category.products);

        wishlist.forEach((id) => {
          const product = allProducts.find((p) => p.id === id);
          if (!product) return;

          const card = `
                  <div class="wishlist-card row align-items-center mb-3" data-id="${
                    product.id
                  }">
                    <div class="col-3 col-sm-2">
                      <img src="${product.image}" alt="${
            product.product_name
          }" class="img-fluid">
                    </div>
                    <div class="col-6 col-sm-6">
                      <h6 class="mb-1">${product.product_name}</h6>
                      <p class="text-muted mb-0">${product.subtitle}</p>
                    </div>
                    <div class="col-3 col-sm-2 text-end">
                      <div class="price">₹ ${product.price.toLocaleString()}</div>
                      <div class="old-price text-muted"><s>₹ ${product.old_price.toLocaleString()}</s></div>
                    </div>
                    <div class="col-12 col-sm-2 text-sm-end mt-3 mt-sm-0">
                      <button class="btn btn-green btn-sm w-100 remove-item">
                        <i class="fas fa-times me-1"></i> Remove Item
                      </button>
                    </div>
                  </div>`;
          wishlistItemsContainer.insertAdjacentHTML("beforeend", card);
        });
      });
  }

  // Remove one item
  wishlistItemsContainer.addEventListener("click", function (e) {
    if (e.target.closest(".remove-item")) {
      const card = e.target.closest(".wishlist-card");
      const id = card.dataset.id;

      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      const updatedWishlist = wishlist.filter((pid) => pid !== id);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      //location.reload(); // or call renderWishlist() again
      renderWishlist();
      updateWishlistCount();
    }
  });

  // Clear all
  clearBtn.addEventListener("click", function () {
    localStorage.removeItem("wishlist");
    renderWishlist();
    updateWishlistCount();
  });
  renderWishlist();
  updateWishlistCount();
  updateCartBadge();
});
