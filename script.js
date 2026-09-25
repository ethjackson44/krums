const products = [
  {
    id:"chocolate-chip", name:"Chocolate Chip", category:"Cookie Dough Chips", size:"4 oz pouch", price:7.99,
    image:"assets/pouch-krums-chocolate-chip.png", kicker:"THE OG CRUNCH", bg:"#d9bc91",
    description:"Buttery cookie dough crunch studded with rich chocolate chips. Classic comfort, wildly crispy.",
    notes:["Buttery","Chocolatey","Nostalgic"],
    gallery:[
      {src:"assets/pouch-krums-chocolate-chip.png",alt:"Chocolate Chip Krums pouch",fit:"contain"},
      {src:"assets/moment-krums-desk.png",alt:"Chocolate Chip Krums beside coffee on a sunlit desk",fit:"cover"}
    ],
    overview:"Chocolate Chip turns nostalgic cookie-dough flavor into thin, crispy pieces with rich chocolatey bites in every handful.",
    useCases:"Keep a pouch in a desk drawer, bring it on a road trip, or open it whenever a familiar chocolate-chip craving needs more crunch.",
    usage:"Open the pouch and snack straight from the bag. It also works as a crunchy topping for yogurt, ice cream, or an afternoon coffee break.",
    flavorDetail:"Classic chocolate-chip cookie-dough flavor with a buttery finish and a light, crispy snap."
  },
  {
    id:"birthday-cake", name:"Birthday Cake", category:"Cookie Dough Chips", size:"4 oz pouch", price:7.99,
    image:"assets/pouch-krums-birthday-cake-palette.png", kicker:"THE PARTY CRUNCH", bg:"#d8b6d3",
    description:"Vanilla cookie dough, joyful rainbow sprinkles, and enough party energy to make any Tuesday feel special.",
    notes:["Vanilla","Confetti","Joyful"],
    gallery:[
      {src:"assets/pouch-krums-birthday-cake-palette.png",alt:"Birthday Cake Krums pouch",fit:"contain"},
      {src:"assets/moment-krums-road-trip.png",alt:"Birthday Cake Krums on a sunny road trip",fit:"cover"}
    ],
    overview:"Birthday Cake brings vanilla cookie-dough flavor and colorful sprinkles together in a light, crispy snack made for everyday celebrating.",
    useCases:"Bring it to movie night, pass it around at a party, or keep a pouch nearby when an ordinary afternoon could use some confetti.",
    usage:"Open, share, and crunch. Birthday Cake is ready straight from the pouch and makes a playful topping for ice cream or yogurt.",
    flavorDetail:"Sweet vanilla cookie-dough flavor with colorful sprinkles and a crisp, celebratory finish."
  },
  {
    id:"cinnamon-roll", name:"Cinnamon Roll", category:"Cookie Dough Chips", size:"4 oz pouch", price:7.99,
    image:"assets/pouch-krums-cinnamon-roll-palette.png", kicker:"THE COZY CRUNCH", bg:"#e9a46c",
    description:"Warm cinnamon-swirled cookie dough with a sweet glaze finish. Basically a bakery hug with a snap.",
    notes:["Cinnamon","Glazed","Warm"],
    gallery:[
      {src:"assets/pouch-krums-cinnamon-roll-palette.png",alt:"Cinnamon Roll Krums pouch",fit:"contain"},
      {src:"assets/moment-krums-cozy-palette.png",alt:"Cinnamon Roll Krums during a cozy snack break",fit:"cover"}
    ],
    overview:"Cinnamon Roll layers warm cinnamon, cookie-dough flavor, and a sweet glazed finish into a thin snack with a satisfying snap.",
    useCases:"Pair it with morning coffee, keep it nearby for the afternoon slump, or open a pouch when the bakery craving arrives.",
    usage:"Enjoy it straight from the pouch, alongside coffee, or crushed over oatmeal, yogurt, or vanilla ice cream.",
    flavorDetail:"Warm cinnamon-swirled cookie-dough flavor with a sweet glaze-inspired finish."
  }
];

const commerce = {
  // Replace this method with Shopify Storefront Cart API, Stripe Checkout,
  // or another hosted commerce provider. The UI passes provider-neutral lines.
  async checkout(lines) {
    console.info("Commerce-ready checkout lines", lines);
    showToast("Your checkout connection is ready for Shopify ✦");
  }
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = amount => new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"}).format(amount);
const getProduct = id => products.find(product => product.id === id);
const on = (selector, event, handler) => $(selector)?.addEventListener(event, handler);

let activeFlavor = "chocolate-chip";
let mainQuantity = 1;
let galleryIndex = 0;
let cart = JSON.parse(localStorage.getItem("krums-cart-v1") || "{}");
let reviewIndex = 0;
let announcementIndex = 0;
const announcements = [
  {text:"Free shipping on orders $35+"},
  {text:"Join the Krums list and get 10% off your first order", emailOffer:true}
];

function renderAnnouncement() {
  const copy = $("#announcement-copy");
  if (!copy) return;
  const announcement = announcements[announcementIndex];
  copy.textContent = announcement.text;
  copy.classList.toggle("is-email-offer", Boolean(announcement.emailOffer));
  if (announcement.emailOffer) {
    copy.dataset.emailPopup = "true";
    copy.setAttribute("role", "button");
    copy.setAttribute("tabindex", "0");
    copy.setAttribute("aria-label", `${announcement.text}. Open email signup.`);
  } else {
    delete copy.dataset.emailPopup;
    copy.removeAttribute("role");
    copy.removeAttribute("tabindex");
    copy.removeAttribute("aria-label");
  }
}

function changeAnnouncement(direction = 1) {
  announcementIndex = (announcementIndex + direction + announcements.length) % announcements.length;
  const copy = $("#announcement-copy");
  copy?.animate([{opacity:0,transform:"translateY(4px)"},{opacity:1,transform:"translateY(0)"}], {duration:280});
  renderAnnouncement();
}

function mountEmailPopup() {
  if ($("#email-popup-backdrop")) return;
  document.body.insertAdjacentHTML("beforeend", `
    <div class="email-popup-backdrop" id="email-popup-backdrop" aria-hidden="true">
      <section class="email-popup" role="dialog" aria-modal="true" aria-labelledby="email-popup-title">
        <button class="email-popup-close" type="button" data-close-email-popup aria-label="Close email signup">×</button>
        <div class="email-popup-art" aria-hidden="true">
          <img class="email-popup-logo" src="assets/krums-packaging-wordmark.png" alt="" />
          <img class="email-popup-mascot" src="assets/krums-mascot-head.png" alt="" />
          <span>10%<small>off</small></span>
        </div>
        <div class="email-popup-content">
          <p class="eyebrow"><span></span> Join the Krums list</p>
          <h2 id="email-popup-title">Take 10% off your first crunch.</h2>
          <p>Get new-flavor drops, snacky surprises, and a welcome offer for your first order.</p>
          <form id="email-popup-form">
            <label for="email-popup-input">Email address</label>
            <div><input id="email-popup-input" name="email" type="email" placeholder="you@email.com" autocomplete="email" required /><button type="submit">Get 10% off</button></div>
          </form>
          <small>No spam. Just the good stuff.</small>
        </div>
      </section>
    </div>`);
}

function openEmailPopup({automatic = false} = {}) {
  const backdrop = $("#email-popup-backdrop");
  if (!backdrop) return;
  if (automatic) sessionStorage.setItem("krums-email-popup-seen", "true");
  closeLayers();
  backdrop.setAttribute("aria-hidden", "false");
  backdrop.classList.add("open");
  document.body.classList.add("modal-open");
  window.setTimeout(() => $("#email-popup-input")?.focus(), 220);
}

function closeEmailPopup() {
  const backdrop = $("#email-popup-backdrop");
  if (!backdrop?.classList.contains("open")) return;
  backdrop.classList.remove("open");
  backdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function swapImage(image, newSrc, newAlt) {
  if (!image) return;
  image.classList.add(image.id === "hero-pouch" ? "swapping" : "switching");
  window.setTimeout(() => {
    image.src = newSrc;
    image.alt = newAlt;
    image.onload = () => image.classList.remove("swapping", "switching");
  }, 180);
}

function updateMainQuantity() {
  if ($("#main-qty")) $("#main-qty").textContent = mainQuantity;
}

function setFlavor(id, {scroll = false} = {}) {
  const product = getProduct(id);
  if (!product) return;
  activeFlavor = id;
  $$(".flavor-theme").forEach(section => section.dataset.theme = id);
  $$('[data-flavor]').forEach(button => {
    const active = button.dataset.flavor === id;
    button.classList.toggle("active", active);
    if (button.getAttribute("role") === "tab") button.setAttribute("aria-selected", String(active));
  });
  swapImage($("#hero-pouch"), product.image, `${product.name} Krums pouch`);
  swapImage($("#spotlight-pouch"), product.image, `${product.name} Krums pouch`);
  if ($("#product-kicker")) $("#product-kicker").textContent = product.kicker;
  if ($("#product-name")) $("#product-name").textContent = product.name;
  if ($("#product-description")) $("#product-description").textContent = product.description;
  if ($("#product-price")) $("#product-price").textContent = money(product.price);
  if ($("#taste-notes")) $("#taste-notes").innerHTML = product.notes.map(note => `<span>${note}</span>`).join("");
  mainQuantity = 1;
  updateMainQuantity();
  if (scroll && $("#product-spotlight")) $("#product-spotlight").scrollIntoView({behavior:"smooth",block:"center"});
}

function renderShop() {
  const grid = $("#shop-grid");
  if (!grid) return;
  grid.innerHTML = products.map(product => `
    <article class="shop-card" style="--card-bg:${product.bg}">
      <a class="shop-card-link" href="product.html?flavor=${product.id}" aria-label="View ${product.name} product page"></a>
      <div class="shop-card-image"><img src="${product.image}" alt="${product.name} Krums pouch" loading="lazy" /></div>
      <p>${product.category}</p>
      <div class="shop-card-heading"><h3>${product.name}</h3><strong>${money(product.price)}</strong></div>
      <div class="shop-card-actions"><button class="shop-card-add" data-quick-add="${product.id}" aria-label="Add ${product.name} to cart">Add to cart</button></div>
    </article>`).join("");
}

function productInformation(product) {
  return [
    {
      title:"Nutrition Facts",
      content:`<div class="nutrition-grid"><div><strong>6g</strong><span>Fiber</span></div><div><strong>4g</strong><span>Net carbs</span></div><div><strong>Low</strong><span>Sugar</span></div><div><strong>4 oz</strong><span>Pouch</span></div></div><p class="info-note">Final serving and nutrition-panel details will be confirmed before launch.</p>`
    },
    {title:"Use Cases",content:`<p>${product.useCases}</p>`},
    {title:"Key Benefits",content:"<ul><li>6g fiber per serving</li><li>4g net carbs per serving</li><li>Vegan-friendly</li><li>Made with non-GMO ingredients</li></ul>"},
    {title:"Details",content:`<dl><div><dt>Category</dt><dd>${product.category}</dd></div><div><dt>Size</dt><dd>${product.size}</dd></div><div><dt>Texture</dt><dd>Thin and crispy</dd></div><div><dt>Flavor</dt><dd>${product.flavorDetail}</dd></div></dl>`},
    {title:"Product Overview",content:`<p>${product.overview}</p>`},
    {title:"How & When to Use",content:`<p>${product.usage}</p>`},
    {title:"Ingredients",content:"<p>Krums are being finalized with a focus on clean, vegan-friendly ingredients. The complete ingredient list and allergen statement will be published before launch.</p>"}
  ];
}

function setGalleryImage(index) {
  const product = getProduct(activeFlavor);
  const image = $("#product-main-image");
  if (!product || !image || !product.gallery?.length) return;
  galleryIndex = (index + product.gallery.length) % product.gallery.length;
  const selected = product.gallery[galleryIndex];
  const media = $("#product-main-media");
  image.classList.add("changing");
  window.setTimeout(() => {
    image.src = selected.src;
    image.alt = selected.alt;
    media?.classList.toggle("is-lifestyle", selected.fit === "cover");
    image.classList.remove("changing");
  }, 140);
  $$("[data-gallery-index]").forEach(button => {
    const active = Number(button.dataset.galleryIndex) === galleryIndex;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if ($("#gallery-count")) $("#gallery-count").textContent = `${galleryIndex + 1} / ${product.gallery.length}`;
}

function renderProductPage() {
  const detail = $("#product-detail");
  if (!detail) return;
  const requested = new URLSearchParams(window.location.search).get("flavor");
  const product = getProduct(requested) || products[0];
  activeFlavor = product.id;
  galleryIndex = 0;
  detail.dataset.theme = product.id;
  document.title = `${product.name} Krums`;
  $("#page-description")?.setAttribute("content", `${product.name} Krums — ${product.description}`);
  if ($("#product-breadcrumb")) $("#product-breadcrumb").textContent = product.name;
  if ($("#detail-kicker")) $("#detail-kicker").textContent = product.kicker;
  if ($("#detail-name")) $("#detail-name").textContent = product.name;
  if ($("#detail-description")) $("#detail-description").textContent = product.description;
  if ($("#detail-size")) $("#detail-size").textContent = `One ${product.size}`;
  if ($("#product-price")) $("#product-price").textContent = money(product.price);
  if ($("#detail-taste-notes")) $("#detail-taste-notes").innerHTML = product.notes.map(note => `<span>${note}</span>`).join("");
  if ($("#detail-metrics")) $("#detail-metrics").innerHTML = `<div><strong>6g</strong><span>fiber</span></div><div><strong>4g</strong><span>net carbs</span></div><div><strong>100%</strong><span>snackable</span></div>`;
  if ($("#detail-flavors")) $("#detail-flavors").innerHTML = products.map(item => `<a href="product.html?flavor=${item.id}" class="${item.id === product.id ? "active" : ""}" aria-current="${item.id === product.id ? "page" : "false"}"><i style="--dot:${item.bg}"></i>${item.name}</a>`).join("");
  if ($("#product-thumbnails")) $("#product-thumbnails").innerHTML = product.gallery.map((item, index) => `<button data-gallery-index="${index}" class="${index === 0 ? "active" : ""}" aria-label="Show image ${index + 1}" aria-pressed="${index === 0}"><img src="${item.src}" alt="" /></button>`).join("");
  if ($("#product-accordions")) $("#product-accordions").innerHTML = productInformation(product).map(item => `<details><summary>${item.title}<span>+</span></summary><div class="product-info-body"><div>${item.content}</div></div></details>`).join("");
  if ($("#related-products")) $("#related-products").innerHTML = products.filter(item => item.id !== product.id).map(item => `<article style="--card-bg:${item.bg}"><a href="product.html?flavor=${item.id}"><div><img src="${item.image}" alt="${item.name} Krums pouch" /></div><span>${item.category}</span><h3>${item.name}</h3><strong>${money(item.price)}</strong></a></article>`).join("");
  mainQuantity = 1;
  updateMainQuantity();
  setGalleryImage(0);
}

function saveCart() {
  localStorage.setItem("krums-cart-v1", JSON.stringify(cart));
  renderCart();
}

function addToCart(id, quantity = 1) {
  const product = getProduct(id);
  if (!product) return;
  cart[id] = (cart[id] || 0) + quantity;
  saveCart();
  showToast(`${product.name} added to your bag.`);
}

function renderCart() {
  const lines = Object.entries(cart).filter(([id, quantity]) => quantity > 0 && getProduct(id));
  const count = lines.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = lines.reduce((sum, [id, quantity]) => sum + getProduct(id).price * quantity, 0);
  if ($("#cart-count")) $("#cart-count").textContent = count;
  if ($("#cart-title-count")) $("#cart-title-count").textContent = `(${count})`;
  if ($("#cart-empty")) $("#cart-empty").hidden = lines.length > 0;
  if ($("#cart-footer")) $("#cart-footer").hidden = lines.length === 0;
  if ($("#cart-total")) $("#cart-total").textContent = money(total);
  if ($("#cart-items")) $("#cart-items").innerHTML = lines.map(([id, quantity]) => {
    const product = getProduct(id);
    return `<article class="cart-item"><img src="${product.image}" alt="" style="--item-bg:${product.bg}"/><div><h3>${product.name}</h3><p>${money(product.price)}</p><div class="cart-qty"><button data-cart-qty="${id}" data-delta="-1" aria-label="Remove one">−</button><span>${quantity}</span><button data-cart-qty="${id}" data-delta="1" aria-label="Add one">+</button></div></div><button class="remove-item" data-remove="${id}">Remove</button></article>`;
  }).join("");
  const remaining = Math.max(0, 35 - total);
  if ($("#shipping-copy")) $("#shipping-copy").textContent = remaining > 0 ? `You’re ${money(remaining)} away from free shipping` : "You unlocked free shipping!";
  if ($("#shipping-bar")) $("#shipping-bar").style.width = `${Math.min(100, total / 35 * 100)}%`;
}

function openLayer() {
  if ($("#scrim")) $("#scrim").hidden = false;
  document.body.classList.add("modal-open");
  $("#cart-drawer")?.classList.add("open");
  $("#cart-drawer")?.setAttribute("aria-hidden", "false");
}

function closeLayers() {
  if ($("#scrim")) $("#scrim").hidden = true;
  document.body.classList.remove("modal-open");
  $("#cart-drawer")?.classList.remove("open");
  $("#cart-drawer")?.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function updateReview(direction) {
  const reviews = $$(".review");
  if (reviews.length < 2) return;
  reviews[reviewIndex]?.classList.remove("active");
  reviewIndex = (reviewIndex + direction + reviews.length) % reviews.length;
  reviews[reviewIndex].classList.add("active");
}

document.addEventListener("click", event => {
  const flavor = event.target.closest("[data-flavor]");
  const select = event.target.closest("[data-select-flavor]");
  const quick = event.target.closest("[data-quick-add]");
  const cartQty = event.target.closest("[data-cart-qty]");
  const remove = event.target.closest("[data-remove]");
  const announcement = event.target.closest("[data-announcement]");
  const emailPopupTrigger = event.target.closest("[data-email-popup]");
  const emailPopupClose = event.target.closest("[data-close-email-popup]");
  const galleryTarget = event.target.closest("[data-gallery-index]");
  const galleryStep = event.target.closest("[data-gallery-step]");
  if (flavor) setFlavor(flavor.dataset.flavor);
  if (select && !quick) setFlavor(select.dataset.selectFlavor, {scroll:true});
  if (quick) { event.stopPropagation(); addToCart(quick.dataset.quickAdd); openLayer(); }
  if (cartQty) { cart[cartQty.dataset.cartQty] = Math.max(0, (cart[cartQty.dataset.cartQty] || 0) + Number(cartQty.dataset.delta)); saveCart(); }
  if (remove) { delete cart[remove.dataset.remove]; saveCart(); }
  if (galleryTarget) setGalleryImage(Number(galleryTarget.dataset.galleryIndex));
  if (galleryStep) setGalleryImage(galleryIndex + Number(galleryStep.dataset.galleryStep));
  if (emailPopupTrigger) openEmailPopup();
  if (emailPopupClose || event.target.id === "email-popup-backdrop") closeEmailPopup();
  if (announcement) {
    changeAnnouncement(Number(announcement.dataset.announcement));
  }
});

document.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.matches?.("[data-email-popup]")) {
    event.preventDefault();
    openEmailPopup();
  }
});

document.addEventListener("submit", event => {
  if (event.target.id !== "email-popup-form") return;
  event.preventDefault();
  const content = $(".email-popup-content");
  if (!content) return;
  sessionStorage.setItem("krums-email-popup-seen", "true");
  content.innerHTML = `<div class="email-popup-success" aria-live="polite"><p class="eyebrow"><span></span> You’re in</p><h2>Your 10% welcome offer is reserved.</h2><p>Watch your inbox for the good stuff and the next flavor drop.</p><button class="button button-primary" type="button" data-close-email-popup>Keep exploring</button></div>`;
});

on("#add-main", "click", () => { addToCart(activeFlavor, mainQuantity); openLayer(); });
$$('[data-main-qty]').forEach(button => button.addEventListener("click", () => { mainQuantity = Math.max(1, Math.min(12, mainQuantity + Number(button.dataset.mainQty))); updateMainQuantity(); }));
on("#open-cart", "click", openLayer);
on("#close-cart", "click", closeLayers);
on("#scrim", "click", closeLayers);
on("#empty-shop", "click", closeLayers);
on("#checkout-button", "click", () => commerce.checkout(Object.entries(cart).map(([id, quantity]) => ({product:getProduct(id), quantity}))));
on("#review-prev", "click", () => updateReview(-1));
on("#review-next", "click", () => updateReview(1));
on("#contact-form", "submit", event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const subject = encodeURIComponent(`Krums contact: ${data.get("topic")}`);
  const body = encodeURIComponent(`Name: ${data.get("name")}\nEmail: ${data.get("email")}\nTopic: ${data.get("topic")}\n\n${data.get("message")}`);
  if ($("#contact-status")) $("#contact-status").textContent = "Your email app should open with the message ready to send.";
  window.location.href = `mailto:hello@krumssnacks.com?subject=${subject}&body=${body}`;
});
document.addEventListener("keydown", event => { if (event.key === "Escape") { closeLayers(); closeEmailPopup(); } });

const setMenu = open => {
  const toggle = $("#menu-toggle");
  $("#main-nav")?.classList.toggle("open", open);
  toggle?.setAttribute("aria-expanded", String(open));
  toggle?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
on("#menu-toggle", "click", () => setMenu(!$("#main-nav")?.classList.contains("open")));
$$('#main-nav a').forEach(link => link.addEventListener("click", () => setMenu(false)));
window.addEventListener("resize", () => { if (window.innerWidth > 760) setMenu(false); });

const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) {
    entry.target.style.setProperty("--delay", `${entry.target.dataset.delay || 0}ms`);
    entry.target.classList.add("visible");
  } else {
    entry.target.classList.remove("visible");
  }
}), {threshold:.13});
$$('.reveal').forEach(element => revealObserver.observe(element));
window.addEventListener("scroll", () => $("#site-header")?.classList.toggle("scrolled", scrollY > 30), {passive:true});
window.addEventListener("load", () => setTimeout(() => $("#page-loader")?.classList.add("done"), 350));

if ($("#year")) $("#year").textContent = new Date().getFullYear();
mountEmailPopup();
renderAnnouncement();
renderShop();
renderProductPage();
renderCart();
updateMainQuantity();
if ($("#announcement-copy")) setInterval(() => changeAnnouncement(1), 6000);
if (!sessionStorage.getItem("krums-email-popup-seen")) window.setTimeout(() => openEmailPopup({automatic:true}), 950);
if ($$(".review").length > 1) setInterval(() => updateReview(1), 7500);
