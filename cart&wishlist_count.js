function updateWishlistCount() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const badge = document.getElementById("whishlist-badge");
  if (badge) {
    badge.textContent = wishlist.length;
  }
}

function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = cart.length;
  }
}

//register form logic
function registration() {
  const form = document.getElementById("registerForm");
  const successMsg = document.getElementById("registerSuccess");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value.trim();

    if (!name || !phone || !email || !password) {
      alert("Please fill out all fields.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    //Check for duplicate email
    const emailExists = users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      alert(
        "This email is already registered. Please use a different one or log in."
      );
      return;
    }

    // Add new user
    const newUser = { name, phone, email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // Show success
    successMsg.classList.remove("d-none");

    // Reset form
    form.reset();

    // Close modal after 2 seconds
    setTimeout(() => {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("registerModal")
      );
      modal.hide();
      successMsg.classList.add("d-none");
    }, 2000);
  });
}

//login form logic
function loginForm() {
  const loginForm = document.getElementById("loginForm");
  const loginMsg = document.getElementById("loginMessage");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      // Success
      loginMsg.className = "alert alert-success mt-3";
      loginMsg.textContent = "Login successful!";

      // Optional: store session info
      localStorage.setItem("loggedInUser", JSON.stringify(matchedUser));
      updateNavbar();
      // Hide modal after 1s
      setTimeout(() => {
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("loginModal")
        );
        if (modal) modal.hide();
        loginMsg.classList.add("d-none");
        loginForm.reset();
      }, 1000);
    } else {
      // Failed login
      loginMsg.className = "alert alert-danger mt-3";
      loginMsg.textContent = "Invalid email or password!";
    }
  });
}

//navbar update
function updateNavbar() {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  if (loggedInUser) {
    document.getElementById("authButtons").classList.add("d-none");
    document.getElementById("userSection").classList.remove("d-none");

    document.getElementById(
      "greetUser"
    ).textContent = `Hello, ${loggedInUser.name}`;
    // Fill account details
    document.getElementById("accountDetails").innerHTML = `
            <strong>Name:</strong> ${loggedInUser.name}<br>
            <strong>Email:</strong> ${loggedInUser.email}<br>
            <strong>Phone:</strong> ${loggedInUser.phone}
        `;
  } else {
    // Show login/signup, hide user
    document.getElementById("authButtons").classList.remove("d-none");
    document.getElementById("userSection").classList.add("d-none");
  }
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  updateNavbar();
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("accountModal")
  );
  if (modal) modal.hide();
  window.location.href = "home.html";
}

function showOrders() {
  window.location.href = "order_track.html";
}

//cartlogic and wishlist ui change
let isCartHandlerAttached = false;

function getAddToCartValues() {
  // Prevent multiple event listener attachments
  if (isCartHandlerAttached) return;

  document.addEventListener("click", function (e) {
    const addToCartBtn = e.target.closest(".btn-add-cart");
    const wishlistIcon = e.target.closest(".wishlist-icon");
    const compareBtn = e.target.closest(".btn-add-compare");

    // Add to Cart logic
    if (addToCartBtn) {
      const id = addToCartBtn.dataset.id;
      const name = addToCartBtn.dataset.name;
      const image = addToCartBtn.dataset.image;
      const price = parseFloat(addToCartBtn.dataset.price);

      addToCart(id, name, image, price);
    }

    // Wishlist toggle logic
    if (wishlistIcon) {
      e.preventDefault();
      const id = wishlistIcon.dataset.id;
      toggleWishlist(id, wishlistIcon);
    }

    //add to compare logic
    if (compareBtn) {
      e.preventDefault();
      const id = compareBtn.dataset.id;
      addToCompare(id);
    }
  });

  isCartHandlerAttached = true;
}

function addToCart(id, name, image, price) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const product = {
    id,
    name,
    price,
    unitPrice: price,
    image,
    quantity: 1,
  };

  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.price = existingItem.quantity * existingItem.unitPrice;
  } else {
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  showCartToast();
}

function toggleWishlist(productId, element) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const idStr = String(productId); // ensure consistent comparison

  const index = wishlist.indexOf(idStr);
  if (index > -1) {
    // Remove from wishlist
    wishlist.splice(index, 1);
    if (element) element.classList.remove("wishlist-active");
  } else {
    // Add to wishlist
    wishlist.push(idStr);
    if (element) element.classList.add("wishlist-active");
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistCount();

  // Only call this if rendering updated HTML without correct state
  // highlightWishlistedItems();
}

// Initialize wishlist UI (on page load)
function highlightWishlistedItems() {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

  document.querySelectorAll(".wishlist-icon").forEach((el) => {
    const id = String(el.dataset.id); // ensure string comparison
    if (wishlist.includes(id)) {
      el.classList.add("wishlist-active");
    } else {
      el.classList.remove("wishlist-active");
    }
  });
}

// addtocart show bootstrap
function showCartToast() {
  const toastElement = document.getElementById("cartToast");
  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

function addToCompare(productId) {
  let compareList = JSON.parse(localStorage.getItem("compareList")) || [];
  const idStr = String(productId); // ensure consistency

  if (compareList.includes(idStr)) {
    alert("Product already in comparison.");
    return;
  }

  if (compareList.length >= 2) {
    alert("You can only compare up to 2 products.");
    return;
  }

  compareList.push(idStr);
  localStorage.setItem("compareList", JSON.stringify(compareList));
  alert("Product added to comparison!");
}
function viewCompare() {
  window.location.href = "product_comparison.html";
}
function clearCompare() {
  localStorage.removeItem("compareList");
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  let allProducts = [];

  // Fetch data from categories.json
  fetch("categories.json")
    .then((res) => res.json())
    .then((data) => {
      // Flatten the products from each category
      data.forEach((category) => {
        if (Array.isArray(category.products)) {
          category.products.forEach((product) => {
            allProducts.push(product);
          });
        }
      });
    })
    .catch((err) => console.error("Failed to load products:", err));

  // Access DOM elements safely
  const searchBox = document.getElementById("navbarSearchBox");
  const resultBox = document.getElementById("searchResults");
  const searchContainer = document.getElementById("searchContainer");
  document.getElementById("searchResults").style.display = "none";
  if (searchBox && resultBox) {
    searchBox.addEventListener("input", function () {
      const searchText = this.value.trim().toLowerCase();
      resultBox.innerHTML = "";

      if (searchText.length === 0) {
        document.getElementById("searchResults").style.display = "none";

        return;
      } else {
        document.getElementById("searchResults").style.display = "block";
      }

      const matches = allProducts.filter((product) =>
        product.product_name.toLowerCase().includes(searchText)
      );

      if (matches.length === 0) {
        resultBox.innerHTML =
          '<p class="mb-0 text-muted">No results found.</p>';
        return;
      }

      // Render top 5 matches
      matches.slice(0, 5).forEach((product) => {
        const div = document.createElement("div");
        div.className = "search-item py-1 border-bottom";
        div.innerHTML = `
          <a href="product_detail.html?id=${product.id}" class="text-decoration-none text-dark d-block">
            ${product.product_name}
          </a>
        `;
        resultBox.appendChild(div);
      });
    });

    // Hide search result on outside click
    document.addEventListener("click", (e) => {
      if (!searchContainer.contains(e.target)) {
        resultBox.innerHTML = "";
      }
    });
  }
});
