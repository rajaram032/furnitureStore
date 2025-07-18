document.addEventListener("DOMContentLoaded", function () {
  renderCheckoutSummary();
  formSubmission();
  updateWishlistCount();
  updateCartBadge();
  registration();
  loginForm();
  updateNavbar();
});

function formatCurrency(amount) {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}

function renderCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const checkoutItemsContainer = document.getElementById("checkout-items");
  const subtotalElement = document.getElementById("checkout-subtotal");
  const totalElement = document.getElementById("checkout-total");
  const deliveryElement = document.getElementById("delivery-charge");

  let subtotal = 0;
  let summaryHTML = "";

  if (cart.length === 0) {
    checkoutItemsContainer.innerHTML = `<p class="text-muted">Your cart is empty.</p>`;
    subtotalElement.innerText = formatCurrency(0);
    deliveryElement.innerText = formatCurrency(0);
    totalElement.innerText = formatCurrency(0);
    return;
  }

  cart.forEach((item) => {
    const itemTotal = item.unitPrice * item.quantity;
    subtotal += itemTotal;

    summaryHTML += `
        <div class="d-flex justify-content-between">
            <img src="${item.image}" class="img-fluid me-2" alt="${
      item.name
    }" style="width:25px;height:25px;">
            <p class="align-self-start">${item.name} x ${item.quantity}</p>
            <p>${formatCurrency(itemTotal)}</p>
        </div>`;
  });

  checkoutItemsContainer.innerHTML = summaryHTML;

  const deliveryCharge = 499; // optionally make it conditional
  subtotalElement.innerText = formatCurrency(subtotal);
  deliveryElement.innerText = formatCurrency(deliveryCharge);
  totalElement.innerText = formatCurrency(subtotal + deliveryCharge);
}

//form submission
function formSubmission() {
  const form = document.getElementById("billing-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add("was-validated");

      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
        firstInvalid.focus();
      }
      return;
    }
    event.preventDefault(); // Stop default form submission

    // 1. Extract data from form
    const formData = new FormData(form);
    const billingData = {};
    for (const [key, value] of formData.entries()) {
      billingData[key] = value.trim();
    }

    // 2. Construct a neat billingDetails object
    const billingDetails = {
      name: `${billingData["firstName"] || ""} ${
        billingData["lastName"] || ""
      }`.trim(),
      country: "India",
      street: billingData["street"] || "",
      city: billingData["city"] || "",
      zip: billingData["zip"] || "",
      phone: billingData["phone"] || "",
      email: billingData["email"] || "",
      additional: billingData["additional"] || "",
    };

    // 3. Prepare full order summary
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const subtotalText = document.getElementById("checkout-subtotal").innerText;
    const deliveryText = document.getElementById("delivery-charge").innerText;
    const totalText = document.getElementById("checkout-total").innerText;

    // ✅ Parse currency safely
    const parseCurrency = (str) => parseFloat(str.replace(/Rs\.?\s?|,/g, ""));
    // ✅ Get selected payment method
    const selectedPayment = document.querySelector(
      'input[name="paymentMethod"]:checked'
    );
    const paymentMethod = selectedPayment
      ? selectedPayment.nextElementSibling.innerText.trim()
      : "Not specified";
    const orderDate = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    const receiptNumber = generateReceiptNumber();

    const orderSummary = {
      billing: billingDetails,
      cart: cart,
      subtotal: parseFloat(subtotalText.replace(/Rs\.?\s?|,/g, "")),
      deliveryCharge: parseFloat(deliveryText.replace(/Rs\.?\s?|,/g, "")),
      finalAmount: parseFloat(totalText.replace(/Rs\.?\s?|,/g, "")),
      paymentMethod: paymentMethod,
      orderDate: orderDate,
      receiptNumber: receiptNumber 
    };
    let existingOrders = JSON.parse(localStorage.getItem("orderDetails")) || [];

    if (Array.isArray(existingOrders)) {
      // Already an array — push new order
      existingOrders.push(orderSummary);
    } else {
      // First order — create an array
      existingOrders = [orderSummary];
    }

    localStorage.setItem("orderDetails", JSON.stringify(existingOrders));

    // 4. Clear cart, refresh view
    localStorage.removeItem("cart");
    renderCheckoutSummary();
    updateCartBadge();

    // 5. Show order modal with countdown
    const orderModal = new bootstrap.Modal(
      document.getElementById("orderModal")
    );
    orderModal.show();

    const countdownElement = document.getElementById("countdown-timer");
    let seconds = 4;
    countdownElement.innerText = `Redirecting to order tracking page in ${seconds} seconds...`;

    const interval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        countdownElement.innerText = `Redirecting to order tracking page in ${seconds} seconds...`;
      } else {
        clearInterval(interval);
        window.location.href = "order_track.html";
      }
    }, 1000);
  });
}
function generateReceiptNumber() {
  const prefix = "WD"; // Your brand or custom prefix
  const randomPart = Math.random().toString(36).substr(2, 6).toUpperCase(); // Random alphanumeric
  const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
  return `${prefix}-${randomPart}${timestamp}`;
}
