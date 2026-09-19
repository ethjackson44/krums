# krums Storefront

A responsive, interaction-rich storefront concept for krums, built around the brand line “all snacks leave krums,” the official mouse mascot, and the flavor palette supplied in the brand board.

## Run locally

Open `index.html` directly, or from this directory run:

```powershell
python -m http.server 4173
```

Then visit `http://localhost:4173`.

## Commerce integration

Product data lives in `script.js`. The `commerce.checkout()` adapter is the intended integration point for Shopify Storefront API, Shopify Buy Button, Stripe Checkout, or another hosted checkout provider. The cart UI is already provider-agnostic and persists in `localStorage`.

## Included interactions

- Animated three-flavor product switching with matching packaging
- Scroll reveals, pointer parallax, product tilt, and reduced-motion support
- Quantity controls, quick-add products, persistent cart, and free-shipping progress
- Story modal, expandable product details, benefit accordion, FAQ, and review carousel
- Responsive mobile navigation and layouts

## Product artwork

The active pouch and lifestyle assets use the supplied flavor direction: the Original flavor’s tan-and-brown palette for Chocolate Chip and the main brand theme, lavender-pink for Birthday Cake, and warm orange for Cinnamon Roll. The website mascot is a transparent production cutout derived from the supplied `Krums.png` artwork.

The sampled brand-board colors are dark brown `#1f110e`, gold `#a17b4e`, pink `#b7747d`, sage `#6e764f`, and orange `#a14d2b`. Final packaging concepts should still be replaced with print-ready production artwork before launch.

Before launch, replace concept pricing, nutrition claims, product copy, email handling, legal links, and social/contact destinations with verified production content.
