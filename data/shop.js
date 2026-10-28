/*
  VZN — Vision Studio Co. shop
  ----------------------------
  Products shown in the Shop section, in this order.

  The site itself can't take payments, so each product links out to a checkout
  page from whichever store you use, e.g. a Stripe Payment Link, a Shopify or
  Big Cartel product page, or a Fourthwall / Printful store.

  Fields
    name     Product name.
    type     Short label, e.g. "T-shirt", "Hoodie", "Print".
    price    Shown as written, e.g. "$35" (leave empty until it's set).
    sizes    List of sizes or options shown on the card (optional).
    image    Product photo, e.g. "assets/media/shop/tee.jpg" (optional — a mockup
             is drawn until you add one).
    mockup   Which mockup to draw without a photo: "tee", "hoodie" or "poster".
    url      Checkout link. Without one the button says "Coming soon".

  The entries below are placeholders — replace them with real products.
*/
window.VZN_SHOP = [
  { name: "Eye Logo Tee", type: "T-shirt", price: "", sizes: ["S", "M", "L", "XL"], image: "", mockup: "tee", url: "" },
  { name: "Eye Logo Hoodie", type: "Hoodie", price: "", sizes: ["S", "M", "L", "XL"], image: "", mockup: "hoodie", url: "" },
  { name: "Vision Poster", type: "Print · 18 × 24 in", price: "", sizes: [], image: "", mockup: "poster", url: "" }
];
