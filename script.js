const products = [
  {
    id: 1,
    name: "Cuenta Steam - Payday 3",
    price: 2,
    category: "steam",
    image: "opti-hero.png",
    description:
      "Steam Account con Payday 3. La cuenta puede tener más juegos, saldo o regalos. Formato: login:pass. Fresh, checked y UHQ.",
    badge: "Top"
  },
  {
    id: 2,
    name: "Cuenta Steam - Schedule",
    price: 2,
    category: "steam",
    image: "opti-hero.png",
    description:
      "Steam Account con Schedule. La cuenta puede tener más juegos, saldo o regalos. Formato: login:pass. Fresh, checked y UHQ.",
    badge: "Nuevo"
  },
  {
    id: 3,
    name: "Cuenta Steam - Minecraft",
    price: 2,
    category: "steam",
    image: "opti-hero.png",
    description:
      "Steam Account con Minecraft. La cuenta puede tener más juegos, saldo o regalos. Formato: login:pass. Fresh, checked y UHQ.",
    badge: "Popular"
  },
  {
    id: 4,
    name: "ChatGPT Premium ilimitado",
    price: 3,
    category: "steam",
    image: "opti-hero.png",
    description:
      "Acceso inmediato. Cuenta premium ilimitada. Entrega digital y soporte directo.",
    badge: "Pro"
  }
];

const grid = document.getElementById("productGrid");
const cartCount = document.getElementById("cartCount");
const cartPanel = document.getElementById("cartPanel");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const overlay = document.getElementById("overlay");
const cartButton = document.getElementById("openCart");
const checkoutPanel = document.getElementById("checkoutPanel");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutItems = document.getElementById("checkoutItems");
const copyTicketButton = document.getElementById("copyTicket");
const closeCheckout = document.getElementById("closeCheckout");

const state = {
  cart: JSON.parse(localStorage.getItem("optistore-cart")) || {},
  category: "all",
  search: "",
  sort: "featured"
};

function saveCart() {
  localStorage.setItem("optistore-cart", JSON.stringify(state.cart));
}

function formatPrice(value) {
  return `€${value.toFixed(2)}`;
}

function formatCategoryLabel(category) {
  if (category === "steam") return "Cuentas Steam";
  return category;
}

function updateCartCount() {
  const total = Object.values(state.cart).reduce((sum, item) => sum + item.qty, 0);
  cartCount.textContent = total;
}

function pulseCart() {
  if (!cartButton) return;
  cartButton.classList.remove("pulse");
  void cartButton.offsetWidth;
  cartButton.classList.add("pulse");
}

function markAdded(button) {
  if (!button) return;
  const original = button.textContent;
  button.textContent = "Añadido";
  button.classList.add("btn-added");
  setTimeout(() => {
    button.textContent = original;
    button.classList.remove("btn-added");
  }, 900);
}

function renderProducts() {
  let filtered = products.filter((product) => {
    const matchCategory = state.category === "all" || product.category === state.category;
    const matchSearch =
      product.name.toLowerCase().includes(state.search) ||
      product.description.toLowerCase().includes(state.search);
    return matchCategory && matchSearch;
  });

  if (state.sort === "price-asc") {
    filtered = filtered.sort((a, b) => a.price - b.price);
  }
  if (state.sort === "price-desc") {
    filtered = filtered.sort((a, b) => b.price - a.price);
  }

  if (filtered.length === 0) {
    grid.innerHTML = "<div class=\"empty-state\">No encontramos resultados. Prueba con otro término o categoría.</div>";
    return;
  }

  grid.innerHTML = filtered
    .map(
      (product) => `
      <article class="product-card">
        <span class="badge">${product.badge}</span>
        <div class="product-media">
          <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.style.display='none';">
        </div>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-meta">
          <span>${formatPrice(product.price)}</span>
          <span>${formatCategoryLabel(product.category)}</span>
        </div>
        <button type="button" data-id="${product.id}">Añadir al carrito</button>
      </article>
    `
    )
    .join("");
}

function renderCart() {
  const items = Object.values(state.cart);

  if (items.length === 0) {
    cartItems.innerHTML = "<p>Tu carrito está vacío. Elige algo.</p>";
    cartTotal.textContent = "€0.00";
    updateCartCount();
    return;
  }

  cartItems.innerHTML = items
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <h4>${item.name}</h4>
          <span>${formatPrice(item.price)}</span>
        </div>
        <div class="qty">
          <button data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.qty}</span>
          <button data-action="increase" data-id="${item.id}">+</button>
        </div>
      </div>
    `
    )
    .join("");

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartTotal.textContent = formatPrice(total);
  updateCartCount();
}

function addToCart(id, button) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  if (!state.cart[id]) {
    state.cart[id] = { ...product, qty: 1 };
  } else {
    state.cart[id].qty += 1;
  }

  saveCart();
  renderCart();
  pulseCart();
  markAdded(button);
}

function updateQty(id, delta) {
  if (!state.cart[id]) return;
  state.cart[id].qty += delta;
  if (state.cart[id].qty <= 0) {
    delete state.cart[id];
  }
  saveCart();
  renderCart();
}

function setOverlayState() {
  const open = cartPanel.classList.contains("open") || checkoutPanel.classList.contains("open");
  overlay.classList.toggle("show", open);
}

function toggleCart(open) {
  if (open) {
    checkoutPanel.classList.remove("open");
    checkoutPanel.setAttribute("aria-hidden", "true");
  }
  cartPanel.classList.toggle("open", open);
  cartPanel.setAttribute("aria-hidden", (!open).toString());
  setOverlayState();
}

function toggleCheckout(open) {
  if (open) {
    cartPanel.classList.remove("open");
    cartPanel.setAttribute("aria-hidden", "true");
  }
  checkoutPanel.classList.toggle("open", open);
  checkoutPanel.setAttribute("aria-hidden", (!open).toString());
  setOverlayState();
}

function closePanels() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  checkoutPanel.classList.remove("open");
  checkoutPanel.setAttribute("aria-hidden", "true");
  setOverlayState();
}

renderProducts();
renderCart();
updateCartCount();

// Events

document.getElementById("categorySelect").addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

document.getElementById("searchInput").addEventListener("input", (event) => {
  state.search = event.target.value.toLowerCase();
  renderProducts();
});

document.getElementById("sortSelect").addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

grid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  addToCart(id, button);
  toggleCart(true);
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  if (action === "increase") updateQty(id, 1);
  if (action === "decrease") updateQty(id, -1);
});

document.getElementById("openCart").addEventListener("click", () => toggleCart(true));

document.getElementById("closeCart").addEventListener("click", () => toggleCart(false));

overlay.addEventListener("click", closePanels);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closePanels();
});

document.getElementById("checkoutBtn").addEventListener("click", () => {
  const items = Object.values(state.cart);
  if (items.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }
  const order = buildOrder(items);
  renderCheckout(order);
  toggleCheckout(true);
});

closeCheckout.addEventListener("click", () => toggleCheckout(false));

function buildOrder(items) {
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const createdAt = new Date().toISOString();
  return { total, items, createdAt };
}

function renderCheckout(order) {
  checkoutTotal.textContent = formatPrice(order.total);
  checkoutItems.innerHTML = order.items
    .map(
      (item) => `
      <div class="checkout-item">
        <span>${item.name} x${item.qty}</span>
        <span>${formatPrice(item.price * item.qty)}</span>
      </div>
    `
    )
    .join("");
  localStorage.setItem("optistore-last-order", JSON.stringify(order));
}

function buildTicketText() {
  const raw = localStorage.getItem("optistore-last-order");
  if (!raw) return "";
  const order = JSON.parse(raw);
  const lines = order.items.map(
    (item) => `- ${item.name} x${item.qty} (${formatPrice(item.price * item.qty)})`
  );
  return [
    `Total: ${formatPrice(order.total)}`,
    "Items:",
    ...lines
  ].join("\n");
}

if (copyTicketButton) {
  copyTicketButton.addEventListener("click", async () => {
    const text = buildTicketText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyTicketButton.textContent = "Copiado";
      setTimeout(() => {
        copyTicketButton.textContent = "Copiar";
      }, 1000);
    } catch {
      alert("No se pudo copiar.");
    }
  });
}
