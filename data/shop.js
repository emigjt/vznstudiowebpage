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
    images   Product photos: [front] or [front, back], e.g.
               ["assets/media/shop/hoodie-front.jpg", "assets/media/shop/hoodie-back.jpg"]
             With a back photo, it shows on hover and with a Front / Back button.
             (optional — a mockup is drawn until you add photos).
             Square photos about 1000 px wide work best.
    mockup   Which mockup to draw without a photo: "tee", "hoodie" or "poster".
    url      Checkout link. Without one the button says "Coming soon".

*/
window.VZN_SHOP = [
  {
    name: "Beyond Sight Hoodie", type: "Hoodie", price: "",
    images: ["assets/media/shop/beyond-sight-hoodie-front.jpg", "assets/media/shop/beyond-sight-hoodie-back.jpg"],
    url: ""
  }
];
