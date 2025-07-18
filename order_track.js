document.addEventListener("DOMContentLoaded", function () {
  renderAllOrders();
  updateWishlistCount();
  updateCartBadge();
  registration();
  loginForm();
  updateNavbar();
});

function renderAllOrders() {
  const orderListContainer = document.getElementById("orderListContainer");
  const orders = JSON.parse(localStorage.getItem("orderDetails")) || [];
  document.getElementById("orders-count").innerHTML = `(${orders.length})`;

  const formatCurrency = (value) => (value != null ? `Rs. ${value}` : "N/A");

  // Render all orders
  orders
    .slice()
    .reverse()
    .forEach((order, index) => {
      const firstItem =
        order.cart && order.cart.length > 0 ? order.cart[0] : null;

      const card = document.createElement("div");
      card.className = "card shadow-0 border mb-3";

      if (!firstItem) {
        card.innerHTML = `
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-12 text-center">
                                <p class="text-muted mb-0">Order ${
                                  index + 1
                                } has no items in the cart.</p>
                            </div>
                        </div>
                    </div>`;
        orderListContainer.appendChild(card);
        return;
      }

      card.innerHTML = `
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-2">
                            <img src="${
                              firstItem.image ||
                              "https://via.placeholder.com/150"
                            }" class="img-fluid" alt="${firstItem.name}">
                        </div>
                        <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="text-muted mb-0">${firstItem.name}</p>
                        </div>
                        <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="text-muted mb-0 small">Qty: ${
                              firstItem.quantity || 1
                            }</p>
                        </div>
                        <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="text-muted mb-0 small">Total: ${formatCurrency(
                              order.finalAmount
                            )}</p>
                        </div>
                        <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="text-muted mb-0 small">${
                              order.orderDate
                            }</p>
                        </div>
                        <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                            <p class="text-muted mb-0 small border-bottom border-secondary" style="cursor:pointer"
                                data-bs-toggle="modal" data-bs-target="#orderDetails"
                                onclick="showOrderDetails(${
                                  orders.length - 1 - index
                                })">
                                View Order Details
                            </p>
                        </div>
                    </div>
                </div>
            `;
      orderListContainer.appendChild(card);
    });
}

function showOrderDetails(orderIndex) {
  const orders = JSON.parse(localStorage.getItem("orderDetails")) || [];
  const order = orders[orderIndex];
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

  const formatCurrency = (value) => (value != null ? `Rs. ${value}` : "N/A");

  // Customer name
  if (loggedInUser && loggedInUser.name) {
    document.getElementById("orderCustomerName").textContent =
      loggedInUser.name;
  } else {
    document.getElementById("orderCustomerName").textContent =
      "Valued Customer";
  }

  // Receipt voucher dummy
  document.getElementById("receiptVoucher").textContent = order.receiptNumber;

  // Render products in modal
  const productList = document.getElementById("orderProductList");
  productList.innerHTML = "";

  if (!order.cart || order.cart.length === 0) {
    productList.innerHTML = `<p class="text-muted">No products found in this order.</p>`;
  } else {
    order.cart.forEach((item) => {
      const html = `
                <div class="card shadow-0 border mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-2">
                                <img src="${
                                  item.image ||
                                  "https://via.placeholder.com/150"
                                }" class="img-fluid" alt="${item.name}">
                            </div>
                            <div class="col-md-6 text-center d-flex justify-content-center align-items-center">
                                <p class="text-muted mb-0">${item.name}</p>
                            </div>
                                                        
                            <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                                <p class="text-muted mb-0 small">Qty: ${
                                  item.quantity || 1
                                }</p>
                            </div>
                            <div class="col-md-2 text-center d-flex justify-content-center align-items-center">
                                <p class="text-muted mb-0 small">${formatCurrency(
                                  item.price
                                )}</p>
                            </div>
                            <div class="progress-wrapper no-print">
  <hr class="mb-4">
  <div class="row d-flex align-items-center">
    <div class="col-md-2">
      <p class="text-muted mb-0 small">Track Order</p>
    </div>
    <div class="col-md-10">
      <div class="progress" style="height: 6px; border-radius: 16px;">
        <div class="progress-bar" role="progressbar"
          style="width: 35%; border-radius: 16px; background-color:#b98a30"
          aria-valuenow="65" aria-valuemin="0" aria-valuemax="100">
        </div>
      </div>
      <div class="d-flex justify-content-around mb-1">
        <p class="text-muted mt-1 mb-0 small ms-xl-5">Out for delivery</p>
        <p class="text-muted mt-1 mb-0 small ms-xl-5">Delivered</p>
      </div>
    </div>
  </div>
</div>

                    </div>
                </div>`;
      productList.innerHTML += html;
    });
  }

  // Summary info
  const summary = `
            <div class="d-flex flex-column flex-md-row justify-content-center justify-content-md-between   pt-2">
                        
            <div class="text-start text-md-start mb-3 mb-md-0">
                 <p class="fw-bold mb-0">Billing Address:</p>
                <p class="text-muted mb-0">Name: ${order.billing.name}</p>
                <p class="text-muted mb-0">Email: ${order.billing.email}</p>
                <p class="text-muted mb-0">Phone: ${order.billing.phone}</p>
                  
                <p class="text-muted mb-0">Address: ${order.billing.street}, ${
    order.billing.city
  }, ${order.billing.zip}</p>
                <p class="text-muted mb-0">Country: ${order.billing.country}</p>
            </div>
            <div class="class="text-center text-md-end"">
                  <p class="fw-bold mb-0">Order Details:</p>
                <p class="text-muted  mb-0"><span class="text-black">Date:</span >${
                  order.orderDate
                }</p>
                 <p class="text-muted mb-0"><span class="text-black">Payment Method:</span >${
                   order.paymentMethod
                 }</p>
                <p class="text-muted mb-0"><span class="text-black">Subtotal: </span >${formatCurrency(
                  order.subtotal
                )}</p>
                <p class="text-muted mb-0"><span class="text-black">Delivery Charge:</span > ${formatCurrency(
                  order.deliveryCharge
                )}</p>
            </div>
        `;
  document.getElementById("orderSummary").innerHTML = summary;

  // Total Paid
  document.getElementById("orderTotalPaid").textContent = formatCurrency(
    order.finalAmount
  );
}

function downloadReceipt() {
  const element = document.getElementById("pdfContent");
  const originalScroll = document.documentElement.scrollTop;

  // Scroll to top to ensure full content is visible to html2canvas
  window.scrollTo({ top: 0, behavior: "instant" });

  // Temporarily hide non-PDF elements
  const toHide = [
    ...element.querySelectorAll(".progress-wrapper"),
    ...document.querySelectorAll(".download-btn"),
  ];
  toHide.forEach((el) => (el.style.display = "none"));

  // Add padding for cleaner PDF output
  const originalPadding = element.style.padding;
  element.style.padding = "20px";

  const options = {
    margin: [0.5, 0.5, 0.5, 0.5],
    filename: `receipt_${Date.now()}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  };

  html2pdf()
    .set(options)
    .from(element)
    .save()
    .then(() => {
      // Restore everything after PDF is generated
      toHide.forEach((el) => (el.style.display = ""));
      element.style.padding = originalPadding;
      window.scrollTo({ top: originalScroll, behavior: "instant" });
    })
    .catch((err) => {
      console.error("PDF download failed:", err);
      // Ensure UI is restored even if there's an error
      toHide.forEach((el) => (el.style.display = ""));
      element.style.padding = originalPadding;
      window.scrollTo({ top: originalScroll, behavior: "instant" });
    });
}

