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
             With a back photo, clicking the photo or its Front / Back button flips it.
             (optional — a mockup is drawn until you add photos).
             Square photos about 1000 px wide work best.
    colors   Colour options, each with its own photos (and optionally its own checkout
             link), shown as swatches; the first is shown first, e.g.
               colors: [
                 { name: "Charcoal", swatch: "#434344", images: ["...-charcoal-front.jpg", "...-charcoal-back.jpg"] },
                 { name: "Grey",     swatch: "#cdcccf", images: ["...-grey-front.jpg", "...-grey-back.jpg"], url: "..." }
               ]
             Use instead of images when a product comes in more than one colour.
    mockup   Which mockup to draw without a photo: "tee", "hoodie" or "poster".
    url      Checkout link. Without one the button says "Coming soon".
    archived true hides a product without deleting it (set false to bring it back).

*/
window.VZN_SHOP = [
  {
    name: "Beyond Sight Hoodie", type: "Hoodie", price: "", archived: true,
    images: ["assets/media/shop/beyond-sight-hoodie-front.jpg", "assets/media/shop/beyond-sight-hoodie-back.jpg"],
    url: ""
  },
  {
    name: "VZN Logo Hoodie", type: "Hoodie", price: "",
    colors: [
      {
        name: "Charcoal", swatch: "#434344",
        images: ["assets/media/shop/vzn-logo-hoodie-charcoal-front.jpg", "assets/media/shop/vzn-logo-hoodie-charcoal-back.jpg"]
      },
      {
        name: "Grey", swatch: "#cdcccf",
        images: ["assets/media/shop/vzn-logo-hoodie-grey-front.jpg", "assets/media/shop/vzn-logo-hoodie-grey-back.jpg"]
      }
    ],
    url: ""
  }
];
