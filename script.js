const products = [
  {id:"chocolate-chip",name:"Chocolate Chip",price:7.99,image:"assets/pouch-krums-chocolate-chip.png",kicker:"THE OG CRUNCH",word:"CLASSIC",description:"Buttery cookie dough crunch studded with rich chocolate chips. Classic comfort, wildly crispy.",notes:["Buttery","Chocolatey","Nostalgic"],bg:"#d9bc91"},
  {id:"birthday-cake",name:"Birthday Cake",price:7.99,image:"assets/pouch-krums-birthday-cake-palette.png",kicker:"THE PARTY CRUNCH",word:"CELEBRATE",description:"Vanilla cookie dough, joyful rainbow sprinkles, and enough party energy to make any Tuesday feel special.",notes:["Vanilla","Confetti","Joyful"],bg:"#d8b6d3"},
  {id:"cinnamon-roll",name:"Cinnamon Roll",price:7.99,image:"assets/pouch-krums-cinnamon-roll-palette.png",kicker:"THE COZY CRUNCH",word:"COZY",description:"Warm cinnamon-swirled cookie dough with a sweet glaze finish. Basically a bakery hug with a snap.",notes:["Cinnamon","Glazed","Warm"],bg:"#e9a46c"}
];

const commerce = {
  // Replace this method with Shopify Storefront Cart API, Stripe Checkout,
  // or another hosted commerce provider. The UI passes provider-neutral lines.
  async checkout(lines){console.info("Commerce-ready checkout lines",lines);showToast("Your checkout connection is ready for Shopify ✦")}
};

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = amount => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(amount);
const getProduct = id => products.find(product => product.id === id);
let activeFlavor = "chocolate-chip";
let mainQuantity = 1;
let cart = JSON.parse(localStorage.getItem("krums-cart-v1") || "{}");
let reviewIndex = 0;
let announcementIndex = 0;
const announcements = ["Free shipping on snack boxes over $35","All snacks leave krums.","Three flavors. Infinite krums."];

function swapImage(image,newSrc,newAlt){image.classList.add(image.id === "hero-pouch" ? "swapping" : "switching");setTimeout(()=>{image.src=newSrc;image.alt=newAlt;image.onload=()=>image.classList.remove("swapping","switching")},180)}

function setFlavor(id,{scroll=false}={}){
  const product=getProduct(id);if(!product)return;activeFlavor=id;
  $$(".flavor-theme").forEach(section=>section.dataset.theme=id);
  $$("[data-flavor]").forEach(button=>{const active=button.dataset.flavor===id;button.classList.toggle("active",active);if(button.getAttribute("role")==="tab")button.setAttribute("aria-selected",String(active))});
  swapImage($("#hero-pouch"),product.image,`${product.name} krums pouch`);swapImage($("#spotlight-pouch"),product.image,`${product.name} krums pouch`);
  $("#product-kicker").textContent=product.kicker;$("#product-name").textContent=product.name;$("#huge-word").textContent=product.word;$("#product-description").textContent=product.description;$("#product-price").textContent=money(product.price);$("#taste-notes").innerHTML=product.notes.map(note=>`<span>${note}</span>`).join("");
  mainQuantity=1;updateMainQuantity();if(scroll)$("#product-spotlight").scrollIntoView({behavior:"smooth",block:"center"});
}

function updateMainQuantity(){const product=getProduct(activeFlavor);$("#main-qty").textContent=mainQuantity;$("#add-main-total").textContent=money(product.price*mainQuantity)}

function renderMiniProducts(){
  $("#mini-products").innerHTML=products.map(product=>`<article class="mini-product" data-select-flavor="${product.id}" style="--mini-bg:${product.bg}"><img src="${product.image}" alt="${product.name} pouch" loading="lazy" /><div><h4>${product.name}</h4><p>${money(product.price)} · 4oz pouch</p></div><button data-quick-add="${product.id}" aria-label="Quick add ${product.name}">+</button></article>`).join("");
}

function saveCart(){localStorage.setItem("krums-cart-v1",JSON.stringify(cart));renderCart()}
function addToCart(id,quantity=1){cart[id]=(cart[id]||0)+quantity;saveCart();showToast(`${getProduct(id).name} added to your bag ♡`)}
function renderCart(){
  const lines=Object.entries(cart).filter(([,quantity])=>quantity>0);const count=lines.reduce((sum,[,quantity])=>sum+quantity,0);const total=lines.reduce((sum,[id,quantity])=>sum+getProduct(id).price*quantity,0);
  $("#cart-count").textContent=count;$("#cart-title-count").textContent=`(${count})`;$("#cart-empty").hidden=lines.length>0;$("#cart-footer").hidden=lines.length===0;$("#cart-total").textContent=money(total);
  $("#cart-items").innerHTML=lines.map(([id,quantity])=>{const product=getProduct(id);return `<article class="cart-item"><img src="${product.image}" alt="" style="--item-bg:${product.bg}"/><div><h3>${product.name}</h3><p>${money(product.price)}</p><div class="cart-qty"><button data-cart-qty="${id}" data-delta="-1" aria-label="Remove one">−</button><span>${quantity}</span><button data-cart-qty="${id}" data-delta="1" aria-label="Add one">+</button></div></div><button class="remove-item" data-remove="${id}">Remove</button></article>`}).join("");
  const remaining=Math.max(0,35-total);$("#shipping-copy").textContent=remaining>0?`You’re ${money(remaining)} away from free shipping`:"You unlocked free shipping! ♡";$("#shipping-bar").style.width=`${Math.min(100,total/35*100)}%`;
}

function openLayer(type){$("#scrim").hidden=false;document.body.classList.add("modal-open");if(type==="cart"){$("#cart-drawer").classList.add("open");$("#cart-drawer").setAttribute("aria-hidden","false")}else{$("#story-modal").hidden=false}}
function closeLayers(){$("#scrim").hidden=true;document.body.classList.remove("modal-open");$("#cart-drawer").classList.remove("open");$("#cart-drawer").setAttribute("aria-hidden","true");$("#story-modal").hidden=true}
function showToast(message){const toast=$("#toast");toast.textContent=message;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2400)}

function updateReview(direction){const reviews=$$(".review");reviews[reviewIndex].classList.remove("active");reviewIndex=(reviewIndex+direction+reviews.length)%reviews.length;reviews[reviewIndex].classList.add("active");$("#review-progress").textContent=`0${reviewIndex+1} / 0${reviews.length}`}

document.addEventListener("click",event=>{
  const flavor=event.target.closest("[data-flavor]");const select=event.target.closest("[data-select-flavor]");const quick=event.target.closest("[data-quick-add]");const cartQty=event.target.closest("[data-cart-qty]");const remove=event.target.closest("[data-remove]");const announcement=event.target.closest("[data-announcement]");
  if(flavor)setFlavor(flavor.dataset.flavor);
  if(select&&!quick)setFlavor(select.dataset.selectFlavor,{scroll:true});
  if(quick){event.stopPropagation();addToCart(quick.dataset.quickAdd)}
  if(cartQty){cart[cartQty.dataset.cartQty]=Math.max(0,(cart[cartQty.dataset.cartQty]||0)+Number(cartQty.dataset.delta));saveCart()}
  if(remove){delete cart[remove.dataset.remove];saveCart()}
  if(announcement){announcementIndex=(announcementIndex+Number(announcement.dataset.announcement)+announcements.length)%announcements.length;$("#announcement-copy").animate([{opacity:0},{opacity:1}],{duration:250});$("#announcement-copy").textContent=announcements[announcementIndex]}
});

$("#add-main").addEventListener("click",()=>{addToCart(activeFlavor,mainQuantity);openLayer("cart")});
$$('[data-main-qty]').forEach(button=>button.addEventListener("click",()=>{mainQuantity=Math.max(1,Math.min(12,mainQuantity+Number(button.dataset.mainQty)));updateMainQuantity()}));
$("#ingredients-toggle").addEventListener("click",event=>{const button=event.currentTarget;const open=button.getAttribute("aria-expanded")==="true";button.setAttribute("aria-expanded",String(!open));$("#ingredients-panel").classList.toggle("open",!open)});
$("#spin-product").addEventListener("click",()=>{const image=$("#spotlight-pouch");image.classList.remove("wiggle");requestAnimationFrame(()=>image.classList.add("wiggle"))});
$("#open-cart").addEventListener("click",()=>openLayer("cart"));$("#close-cart").addEventListener("click",closeLayers);$("#scrim").addEventListener("click",closeLayers);$("#play-story").addEventListener("click",()=>openLayer("story"));$("#close-story").addEventListener("click",closeLayers);$("#empty-shop").addEventListener("click",closeLayers);document.addEventListener("keydown",event=>{if(event.key==="Escape")closeLayers()});
$("#checkout-button").addEventListener("click",()=>commerce.checkout(Object.entries(cart).map(([id,quantity])=>({product:getProduct(id),quantity}))));
$("#review-prev").addEventListener("click",()=>updateReview(-1));$("#review-next").addEventListener("click",()=>updateReview(1));
$$('.benefit').forEach(button=>button.addEventListener("click",()=>{const opening=!button.classList.contains("active");button.classList.toggle("active",opening);button.setAttribute("aria-expanded",String(opening))}));
const setMenu=open=>{const toggle=$("#menu-toggle");$("#main-nav").classList.toggle("open",open);toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close menu":"Open menu")};
$("#menu-toggle").addEventListener("click",()=>setMenu(!$("#main-nav").classList.contains("open")));
$$('#main-nav a').forEach(link=>link.addEventListener("click",()=>setMenu(false)));
window.addEventListener("resize",()=>{if(window.innerWidth>760)setMenu(false)});
$("#newsletter-form").addEventListener("submit",event=>{event.preventDefault();$("#form-status").textContent="You’re in! Happy mail is headed your way ♡";event.target.reset()});

const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.style.setProperty("--delay",`${entry.target.dataset.delay||0}ms`);entry.target.classList.add("visible");revealObserver.unobserve(entry.target)}}),{threshold:.13});$$('.reveal').forEach(element=>revealObserver.observe(element));
window.addEventListener("scroll",()=>$("#site-header").classList.toggle("scrolled",scrollY>30),{passive:true});

if(matchMedia('(pointer:fine)').matches){document.addEventListener("pointermove",event=>{const hero=$("#top").getBoundingClientRect();if(event.clientY<hero.bottom){const x=(event.clientX/innerWidth-.5),y=(event.clientY/innerHeight-.5);$$('[data-parallax]').forEach(el=>{const strength=Number(el.dataset.parallax);el.style.transform=`translate(${x*strength}px,${y*strength}px)`});$("#hero-stage").style.transform=`rotateY(${x*5}deg) rotateX(${-y*4}deg)`}})}

window.addEventListener("load",()=>setTimeout(()=>$("#page-loader").classList.add("done"),350));
$("#year").textContent=new Date().getFullYear();renderMiniProducts();renderCart();updateMainQuantity();setInterval(()=>updateReview(1),7500);
