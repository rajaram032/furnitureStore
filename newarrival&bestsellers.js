// Global cache for both
let allBestSellers = [];
let allNewArrivals = [];

function getBestSellersDataFromApi() {
  fetch("bestSellers.json") // Replace with your JSON path if needed
    .then((res) => res.json())
    .then((data) => {
      renderBestSellers(data);
      allBestSellers = data;
      applySharedFilters();
    })
    .catch((err) => console.error("Failed to load Best sellers:", err));
}
function getNewArrivalsDataFromApi(limit = null) {
  fetch("newArrivals.json")
    .then((res) => res.json())
    .then((data) => {
      renderNewArrivals(data, limit);
      allNewArrivals = data;

      applySharedFilters();
    })
    .catch((err) => console.error("Failed to load New Arrivals:", err));
}

function renderBestSellers(products) {
  const container = document.getElementById("bestSellersContainer");
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = `
    <div class="col-12 text-center py-4">
      <i class="fas fa-box-open fa-2x text-muted mb-2"></i>
      <p class="text-danger fw-semibold">No Best Seller products available.</p>
    </div>`;
    return;
  }
  products.forEach(
    ({ id, product_name, subtitle, image, price, old_price }) => {
      const discount = old_price
        ? Math.round(((old_price - price) / old_price) * 100)
        : 0;

      const productHTML = `
      <div class="col-md-4 col-lg-4 col-sm-6">
        <div class="product-card">
          <div class="card-container">
            <div class="product-image">
              <img src="${image}" class="img-fluid" alt="${product_name}">
              ${
                discount > 0
                  ? `<span class="discount-badge">-${discount}%</span>`
                  : ""
              }
            </div>
            <div class="product-details">
              <div class="product-title" style="height:60px">${product_name}</div>
              <div class="product-sub">${subtitle || ""}</div>
              <div class="price">
                ₹${Number(price).toLocaleString()}
                ${
                  old_price
                    ? `<span class="price-old">₹${Number(
                        old_price
                      ).toLocaleString()}</span>`
                    : ""
                }
              </div>
            </div>
          </div>
          <div class="product-actions d-flex flex-column align-items-center">
            <button class="btn-add-cart"
              data-id="${id}"
              data-name="${product_name.replace(/"/g, "&quot;")}"
              data-image="${image}"
              data-price="${price}">
              Add to Cart
            </button>
            <div class="icon-actions ">
              <a href="#" class="action-link btn-add-compare" data-id="${id}">
                <i class="fa-solid fa-code-compare"></i><span>Compare</span>
              </a>
              <a href="product_detail.html?id=${id}" class="action-link">
                <img src="images/Group.png" alt=""><span>Quick View</span>
              </a>
              <a href="#" class="action-link wishlist-icon" data-id="${id}">
                <i class="fas fa-heart me-2"></i><span>Like</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

      container.insertAdjacentHTML("beforeend", productHTML);
    }
  );
  //Call highlightWishlistedItems() after rendering cards because icons not red after switching
  highlightWishlistedItems();
  //from cart logic

  // Update wishlist count after rendering
}

function renderNewArrivals(products, limit) {
  const container = document.getElementById("newArrivalsContainer");
  container.innerHTML = "";

  // Use full list if no limit, else slice
  const newProducts = limit ? products.slice(0, limit) : products;

  if (newProducts.length === 0) {
    container.innerHTML = `
    <div class="col-12 text-center py-4">
      <i class="fas fa-box-open fa-2x text-muted mb-2"></i>
      <p class="text-danger fw-semibold">No New Arrival products available.</p>
    </div>`;
    return;
  }
  newProducts.forEach((product) => {
    const { id, product_name, subtitle, image, price, old_price } = product;

    const productHTML = `
        <div class="col-sm-6 col-md-4 col-lg-4">
           <div class="product-card">
             <div class="card-container">
               <div class="product-image">
                 <img src="${image}" alt="${product_name}" class="img-fluid" />
                 <span class="badge-new">New</span>
               </div>
               <div class="product-details">
                 <div class="product-title" style="height:45px">${product_name}</div>
                 <div class="product-sub mt-2">${subtitle}</div>
                 <div class="price">
                   ₹${Number(price).toLocaleString()}
                   ${
                     old_price
                       ? `<span class="price-old">₹${Number(
                           old_price
                         ).toLocaleString()}</span>`
                       : ""
                   }
                 </div>
               </div>
             </div>
             <!-- Actions on hover -->
             <div class="product-actions d-flex flex-column align-items-center">
               <button class="btn-add-cart"
                   data-id="${id}"
                   data-name="${product_name.replace(/"/g, "&quot;")}"
                   data-image="${image}"
                   data-price="${price}">
                   Add to Cart
               </button>
               <div class="icon-actions">
                  <a href="#" class="action-link btn-add-compare" data-id="${id}">
                <i class="fa-solid fa-code-compare"></i><span>Compare</span>
              </a>
                 <a href="product_detail.html?id=${id}" class="action-link">
                   <img src="images/Group.png" alt=""><span>Quick View</span>
                 </a>
                 <a href="#" class="action-link wishlist-icon" data-id="${id}">
                   <i class="fas fa-heart me-2"></i><span>Like</span>
                 </a>
                            </div>
                        </div>
                    </div>
                </div>
      `;

    container.insertAdjacentHTML("beforeend", productHTML);
  });

  highlightWishlistedItems();
  //from cart logic

  // Update wishlist count after rendering
}

function renderRecentlyViewed(page = 1, perPage = 4) {
  const container = document.getElementById("recentlyViewedContainer");
  const pagination = document.getElementById("recentPagination");

  let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || [];
  if (viewed.length === 0) {
    container.innerHTML = `<p class="text-center">No recently viewed items.</p>`;
    pagination.innerHTML = "";
    return;
  }
  const totalPages = Math.ceil(viewed.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const pageItems = viewed.slice(start, end);

  // Render products
  container.innerHTML = pageItems
    .map((p) => {
      const discount = p.old_price
        ? Math.round(((p.old_price - p.price) / p.old_price) * 100)
        : 0;

      return `
        <div class="col-md-4 col-lg-3 col-sm-6 ">
            <div class="product-card">
                <div class="card-container">
                    <div class="product-image">
                        <img src="${p.image}" class="img-fluid" alt="${
        p.product_name
      }">
                        ${
                          discount > 0
                            ? `<span class="discount-badge">${discount}% </span>`
                            : ""
                        }
                    </div>
                    <div class="product-details">
                        <div class="product-title" style="height:55px">${
                          p.product_name
                        }</div>
                        <div class="product-sub">${p.subtitle || ""}</div>
                        <div class="price">
                            ₹${Number(p.price).toLocaleString()}
                            ${
                              p.old_price
                                ? `<span class="price-old">₹${Number(
                                    p.old_price
                                  ).toLocaleString()}</span>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
                <div class="product-actions d-flex flex-column align-items-center">
                    <button class="btn-add-cart"
                        data-id="${p.id}"
                        data-name="${p.product_name.replace(/"/g, "&quot;")}"
                        data-image="${p.image}"
                        data-price="${p.price}">
                        Add to Cart
                    </button>
                    <div class="icon-actions">
                         <a href="#" class="action-link btn-add-compare" data-id="${
                           p.id
                         }">
                <i class="fa-solid fa-code-compare"></i><span>Compare</span>
              </a>
                        <a href="product_detail.html?id=${
                          p.id
                        }" class="action-link">
                            <img src="images/Group.png" alt=""><span>Quick View</span>
                        </a>
                        <a href="#" class="action-link wishlist-icon" data-id="${
                          p.id
                        }">
                            <i class="fas fa-heart me-2"></i><span>Like</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>`;
    })
    .join("");

  // Render pagination
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
        <li class="page-item ${i === page ? "active" : ""}">
            <a class="page-link" href="#">${i}</a>
        </li>`;
  }

  // Add event listeners to pagination
  document.querySelectorAll("#recentPagination .page-link").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const selectedPage = parseInt(this.textContent);
      renderRecentlyViewed(selectedPage, perPage);
    });
  });
}


// Sort helper
function sortProducts(arr, order) {
  if (order === "asc") {
    return arr.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (order === "desc") {
    return arr.sort((a, b) => Number(b.price) - Number(a.price));
  }
  return arr;
}

// Main shared filtering logic
function applySharedFilters() {
  let bestFiltered = [...allBestSellers];
  let newFiltered = [...allNewArrivals];

  const limit = parseInt(document.getElementById("showCount")?.value) || 16;
  const sortOption = document.getElementById("sortOptions")?.value;
  const selectedCategory = document.getElementById("categoryFilter")?.value || "all";
  const selectedBrand = document.getElementById("brandFilter")?.value || "all";
  const selectedSeating = document.getElementById("seatingFilter")?.value || "all";

  // Filters
  const filterByCategory = (product) =>
    selectedCategory === "all" || product.category?.toLowerCase() === selectedCategory.toLowerCase();

  const filterByBrand = (product) =>
    selectedBrand === "all" || product.subtitle?.toLowerCase().includes(selectedBrand.toLowerCase());

  const filterBySeating = (product) => {
    if (selectedSeating === "all") return true;
    const seatingValue = parseInt(product.seating || product.type?.[0]) || 0;
    return selectedSeating === "4" ? seatingValue >= 4 : seatingValue === parseInt(selectedSeating);
  };

  // Apply filters
  bestFiltered = bestFiltered.filter(p => filterByCategory(p) && filterByBrand(p) && filterBySeating(p));
  newFiltered = newFiltered.filter(p => filterByCategory(p) && filterByBrand(p) && filterBySeating(p));

  // Apply sorting
  bestFiltered = sortProducts(bestFiltered, sortOption);
  newFiltered = sortProducts(newFiltered, sortOption);

  // Apply limit
  const bestToShow = limit >= bestFiltered.length ? bestFiltered : bestFiltered.slice(0, limit);
  const newToShow = limit >= newFiltered.length ? newFiltered : newFiltered.slice(0, limit);

  // Render results
  renderBestSellers(bestToShow);
  renderNewArrivals(newToShow);

  // Total product count
  const totalCount = bestFiltered.length + newFiltered.length;
  document.getElementById("productsCount").textContent = totalCount;

  // Show "no products" message if needed (in render functions)
}

// Reset filters
function resetAllFilters() {
  const cat = document.getElementById("categoryFilter");
const brand = document.getElementById("brandFilter");
const seat = document.getElementById("seatingFilter");
const sort = document.getElementById("sortOptions");
const count = document.getElementById("showCount");

if (cat) cat.value = "all";
if (brand) brand.value = "all";
if (seat) seat.value = "all";
if (sort) sort.value = "default";


applySharedFilters();

}

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  const elements = ["sortOptions", "showCount", "categoryFilter", "brandFilter", "seatingFilter"];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", applySharedFilters);
    }
  });

  const resetBtn = document.getElementById("resetFilters");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      document.getElementById("categoryFilter").value = "all";
      document.getElementById("brandFilter").value = "all";
      document.getElementById("seatingFilter").value = "all";
      document.getElementById("sortOptions").value = "default";
    
      applySharedFilters(); // <-- This re-applies UI + product rendering
    });
  }

  getBestSellersDataFromApi();
  getNewArrivalsDataFromApi();
});
