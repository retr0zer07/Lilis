const menuToggle = document.querySelector(".menu-toggle");
const menu = document.querySelector(".menu");
const menuLinks = document.querySelectorAll(".menu a");
const siteHeader = document.querySelector(".site-header");
const cartDrawer = document.querySelector(".cart-drawer");
const cartBackdrop = document.querySelector(".cart-backdrop");
const cartToggles = document.querySelectorAll(".cart-toggle");
const cartCloseButtons = document.querySelectorAll("[data-cart-close]");
const cartItemsContainer = document.querySelector(".cart-items");
const cartEmpty = document.querySelector(".cart-empty");
const cartTotalValue = document.querySelector(".cart-total-value");
const cartCountElements = document.querySelectorAll(".cart-count");
const checkoutButton = document.querySelector(".checkout-btn");
const checkoutNote = document.querySelector(".checkout-note");
const checkoutDetails = document.querySelector("#checkout-details");
const helpToggle = document.querySelector(".help-toggle");
const helpPanel = document.querySelector(".help-panel");
const helpClose = document.querySelector(".help-close");
const helpQuestions = document.querySelectorAll("[data-help-answer]");
const accessibilityToggle = document.querySelector(".accessibility-toggle");
const accessibilityPanel = document.querySelector(".accessibility-panel");
const accessibilityClose = document.querySelector(".accessibility-close");
const accessibilitySettings = document.querySelectorAll("[data-a11y-setting]");
const cookieBanner = document.querySelector("#cookie-banner");
const cookieButtons = document.querySelectorAll(".cookie-essential, .cookie-accept");
const newsletterForm = document.querySelector("#newsletter-form");
const newsletterStatus = document.querySelector("#newsletter-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const formatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});
let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("lilis-cart") ?? "[]");
} catch {
  cart = [];
}

const updateHeader = () => {
  siteHeader?.classList.toggle("scrolled", window.scrollY > 12);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

if (menuToggle && menu) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
    });
  });
}

const saveCart = () => {
  localStorage.setItem("lilis-cart", JSON.stringify(cart));
};

const getCartTotals = () => cart.reduce(
  (totals, item) => ({
    count: totals.count + item.quantity,
    amount: totals.amount + item.price * item.quantity,
  }),
  { count: 0, amount: 0 }
);

const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "'": "&#39;",
  '"': "&quot;",
}[character]));

const openCart = () => {
  cartDrawer?.classList.add("open");
  cartDrawer?.setAttribute("aria-hidden", "false");
  cartBackdrop?.removeAttribute("hidden");
  cartToggles.forEach((button) => button.setAttribute("aria-expanded", "true"));
};

const closeCart = () => {
  cartDrawer?.classList.remove("open");
  cartDrawer?.setAttribute("aria-hidden", "true");
  cartBackdrop?.setAttribute("hidden", "");
  cartToggles.forEach((button) => button.setAttribute("aria-expanded", "false"));
};

const renderCart = () => {
  if (!cartItemsContainer || !cartTotalValue || !checkoutButton || !cartEmpty) {
    return;
  }

  const totals = getCartTotals();

  cartItemsContainer.innerHTML = cart.map((item) => `
    <article class="cart-item">
      <div>
        <h3>${escapeHtml(item.name)}</h3>
        <p>${formatter.format(item.price)} · ${formatter.format(item.price * item.quantity)}</p>
      </div>
      <div class="cart-quantity" aria-label="Cantidad de ${escapeHtml(item.name)}">
        <button type="button" data-cart-action="decrease" data-id="${escapeHtml(item.id)}" aria-label="Quitar una unidad de ${escapeHtml(item.name)}">-</button>
        <strong>${item.quantity}</strong>
        <button type="button" data-cart-action="increase" data-id="${escapeHtml(item.id)}" aria-label="Agregar una unidad de ${escapeHtml(item.name)}">+</button>
      </div>
    </article>
  `).join("");

  cartEmpty.hidden = cart.length > 0;
  cartTotalValue.textContent = formatter.format(totals.amount);
  checkoutButton.disabled = cart.length === 0;
  cartCountElements.forEach((element) => {
    element.textContent = String(totals.count);
  });
};

const addToCart = (productCard) => {
  const id = productCard.dataset.id;
  const name = productCard.dataset.name;
  const price = Number(productCard.dataset.price);

  if (!id || !name || Number.isNaN(price)) {
    return;
  }

  const existingItem = cart.find((item) => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  saveCart();
  renderCart();
  openCart();
};

const addCustomOrderToCart = (card) => {
  const type = card.querySelector('[data-custom-field="tipo"]')?.value ?? "Postre";
  const ingredients = card.querySelector('[data-custom-field="ingredientes"]')?.value.trim() ?? "";
  const note = card.querySelector('[data-custom-field="nota"]')?.value.trim() ?? "";
  const details = [type, ingredients ? `Ingredientes: ${ingredients}` : "", note ? `Nota: ${note}` : ""]
    .filter(Boolean)
    .join(" · ");
  const name = `Lata a tu medida (${details})`;
  const id = `lata-a-tu-medida-${type}-${ingredients}-${note}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price: Number(card.dataset.price), quantity: 1 });
  }

  saveCart();
  renderCart();
  openCart();
};

const updateCartItem = (id, amount) => {
  cart = cart
    .map((item) => item.id === id ? { ...item, quantity: item.quantity + amount } : item)
    .filter((item) => item.quantity > 0);

  saveCart();
  renderCart();
};

cartToggles.forEach((button) => {
  button.addEventListener("click", openCart);
});

cartCloseButtons.forEach((button) => {
  button.addEventListener("click", closeCart);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeHelp();
  }
});

const openHelp = () => {
  helpPanel?.removeAttribute("hidden");
  helpPanel?.classList.add("open");
  helpPanel?.setAttribute("aria-hidden", "false");
  helpToggle?.setAttribute("aria-expanded", "true");
  helpToggle?.setAttribute("aria-label", "Cerrar ayuda");
};

const closeHelp = () => {
  helpPanel?.classList.remove("open");
  helpPanel?.setAttribute("aria-hidden", "true");
  helpPanel?.setAttribute("hidden", "");
  helpToggle?.setAttribute("aria-expanded", "false");
  helpToggle?.setAttribute("aria-label", "Abrir ayuda");
};

const setAccessibilityPanel = (isOpen) => {
  accessibilityPanel?.classList.toggle("open", isOpen);
  accessibilityPanel?.toggleAttribute("hidden", !isOpen);
  accessibilityPanel?.setAttribute("aria-hidden", String(!isOpen));
  accessibilityToggle?.setAttribute("aria-expanded", String(isOpen));
};

const applyAccessibilitySettings = () => {
  accessibilitySettings.forEach((setting) => {
    document.body.classList.toggle(`a11y-${setting.dataset.a11ySetting}`, setting.checked);
  });
};

try {
  const savedSettings = JSON.parse(localStorage.getItem("lilis-accessibility") ?? "{}");
  accessibilitySettings.forEach((setting) => {
    setting.checked = Boolean(savedSettings[setting.dataset.a11ySetting]);
    setting.addEventListener("change", () => {
      applyAccessibilitySettings();
      const settings = Object.fromEntries([...accessibilitySettings].map((item) => [item.dataset.a11ySetting, item.checked]));
      localStorage.setItem("lilis-accessibility", JSON.stringify(settings));
    });
  });
  applyAccessibilitySettings();
} catch {
  accessibilitySettings.forEach((setting) => setting.addEventListener("change", applyAccessibilitySettings));
}

accessibilityToggle?.addEventListener("click", () => {
  setAccessibilityPanel(!accessibilityPanel?.classList.contains("open"));
});

accessibilityClose?.addEventListener("click", () => setAccessibilityPanel(false));

document.addEventListener("click", (event) => {
  if (accessibilityPanel?.classList.contains("open") && !event.target.closest(".accessibility-panel, .accessibility-toggle")) {
    setAccessibilityPanel(false);
  }
});

if (!localStorage.getItem("lilis-cookie-consent")) {
  cookieBanner?.removeAttribute("hidden");
}

cookieButtons.forEach((button) => {
  button.addEventListener("click", () => {
    localStorage.setItem("lilis-cookie-consent", button.classList.contains("cookie-accept") ? "all" : "necessary");
    cookieBanner?.setAttribute("hidden", "");
  });
});

newsletterForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!newsletterForm.checkValidity()) {
    newsletterForm.reportValidity();
    return;
  }

  const email = newsletterForm.querySelector("#newsletter-email")?.value.trim();
  if (email) {
    localStorage.setItem("lilis-newsletter-email", email);
    newsletterStatus.textContent = "Correo guardado. Conecta el servicio de mailing para activar los avisos.";
    newsletterForm.reset();
  }
});

helpToggle?.addEventListener("click", () => {
  if (helpPanel?.classList.contains("open")) {
    closeHelp();
  } else {
    openHelp();
  }
});

helpClose?.addEventListener("click", closeHelp);

helpQuestions.forEach((question) => {
  question.addEventListener("click", () => {
    const answer = document.querySelector(".help-answer");
    if (answer) {
      answer.textContent = question.dataset.helpAnswer ?? "";
    }
  });
});

document.addEventListener("click", (event) => {
  if (helpPanel?.classList.contains("open") && !event.target.closest(".help-widget")) {
    closeHelp();
  }
});

const filterButtons = document.querySelectorAll(".filter-btn");
const productCards = document.querySelectorAll("#productos .product-card");
const productSearch = document.querySelector("#product-search");
const searchStatus = document.querySelector(".search-status");
let wasSearching = false;

const updateProductVisibility = () => {
  const activeFilter = document.querySelector(".filter-btn.active")?.dataset.filter ?? "all";
  const query = productSearch?.value.trim().toLowerCase() ?? "";
  let visibleCount = 0;

  document.body.classList.toggle("searching", Boolean(query));

  if (query && !wasSearching) {
    document.querySelector("#productos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  wasSearching = Boolean(query);

  productCards.forEach((card) => {
    const searchableText = `${card.dataset.name ?? ""} ${card.dataset.category ?? ""} ${card.textContent}`.toLowerCase();
    const matchesFilter = activeFilter === "all" || card.dataset.category === activeFilter;
    const matchesSearch = !query || searchableText.includes(query);
    const isVisible = matchesFilter && matchesSearch;

    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) {
      visibleCount += 1;
    }
  });

  if (searchStatus) {
    searchStatus.textContent = query ? `${visibleCount} producto${visibleCount === 1 ? "" : "s"} encontrado${visibleCount === 1 ? "" : "s"}` : "";
  }
};

productSearch?.addEventListener("input", updateProductVisibility);

productCards.forEach((card) => {
  if (card.querySelector(".product-meta")) {
    return;
  }

  const category = card.dataset.category;
  const details = {
    postres: ["250 ml", "Refrigerado", "Para regalo"],
    cafe: ["250 ml", "Servir frío", "Café premium"],
    fruta: ["250 ml", "Fruta fresca", "Sin complicación"],
  }[category] ?? ["250 ml", "Edición Lilis"];
  const footer = card.querySelector(".product-card-footer");
  const meta = document.createElement("div");
  meta.className = "product-meta";
  meta.innerHTML = details.map((detail) => `<span>${detail}</span>`).join("");
  footer?.before(meta);
});

document.addEventListener("click", (event) => {
  const customButton = event.target.closest(".custom-add-to-cart");
  const customCard = customButton?.closest(".custom-order-card");

  if (customCard) {
    addCustomOrderToCart(customCard);
    customButton.classList.add("just-added");
    customButton.textContent = "Creado";
    window.setTimeout(() => {
      customButton.classList.remove("just-added");
      customButton.textContent = "Crear pedido";
    }, 900);
    return;
  }

  const addButton = event.target.closest(".add-to-cart");
  const productCard = addButton?.closest(".product-card");

  if (productCard) {
    addToCart(productCard);
    addButton.classList.add("just-added");
    addButton.textContent = "Agregado";

    window.setTimeout(() => {
      addButton.classList.remove("just-added");
      addButton.textContent = "Agregar";
    }, 900);
  }
});

if (!reduceMotion.matches) {
  productCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      card.style.setProperty("--tilt-x", `${(x - 0.5) * 4}deg`);
      card.style.setProperty("--tilt-y", `${(0.5 - y) * 4}deg`);
      card.style.setProperty("--glow-x", `${x * 100}%`);
      card.style.setProperty("--glow-y", `${y * 100}%`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--glow-x", "50%");
      card.style.setProperty("--glow-y", "0%");
    });
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter ?? "all";

    filterButtons.forEach((item) => {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });
    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");

    updateProductVisibility();
  });
});

cartItemsContainer?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-cart-action]");
  if (!button) {
    return;
  }

  const id = button.dataset.id;
  const action = button.dataset.cartAction;
  if (!id) {
    return;
  }

  updateCartItem(id, action === "increase" ? 1 : -1);
});

checkoutButton?.addEventListener("click", () => {
  if (cart.length === 0) {
    return;
  }

  checkoutDetails?.removeAttribute("hidden");
  checkoutDetails?.querySelector("input")?.focus();
  checkoutNote.textContent = "Revisa tus datos y confirma el pedido.";
});

checkoutDetails?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!checkoutDetails.checkValidity()) {
    checkoutDetails.reportValidity();
    return;
  }

  const details = Object.fromEntries(new FormData(checkoutDetails).entries());
  localStorage.setItem("lilis-checkout-details", JSON.stringify(details));
  checkoutNote.textContent = "Pedido confirmado. Te contactaremos para coordinar la entrega y el pago.";
  checkoutDetails.reset();
  checkoutDetails.setAttribute("hidden", "");
});

const hero = document.querySelector(".hero");

if (hero && !reduceMotion.matches) {
  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * -12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -12;

    hero.style.setProperty("--hero-x", `${x}px`);
    hero.style.setProperty("--hero-y", `${y}px`);
  });

  hero.addEventListener("pointerleave", () => {
    hero.style.setProperty("--hero-x", "0px");
    hero.style.setProperty("--hero-y", "0px");
  });
}

const revealElements = document.querySelectorAll(".reveal");
document.documentElement.classList.add("js-reveal");

const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
};

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealElements.forEach((element) => {
    if (isInViewport(element)) {
      element.classList.add("visible");
    }
    observer.observe(element);
  });
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

const year = document.getElementById("year");
if (year) {
  year.textContent = String(new Date().getFullYear());
}

renderCart();
