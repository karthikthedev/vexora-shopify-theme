# VexoraCare — Custom Shopify Theme

A custom Shopify storefront for **VexoraCare**, a wellness and posture-care brand. Built on Shopify's Dawn 15.4.0 as a base, with **~8,400 lines of custom Liquid** across 12 bespoke sections — a redesigned homepage, product page, cart, reviews system, and catalog.

> **Live store:** _<!-- TODO: paste your store URL here -->_
> **Built by:** [@karthikthedev](https://github.com/karthikthedev)

---

## Demo walkthrough

<!-- TODO: after uploading docs/v1.mp4, see docs/README.md for how to make this play inline on GitHub -->

📹 **[Watch the full store walkthrough →](docs/v1.mp4)**

---

## Screenshots

| | |
|---|---|
| ![Homepage](docs/s1.png) <br> **Homepage** — hero, brand statement, CTA | ![Hero section](docs/s2.png) <br> **Hero** — headline, stats row, floating trust badges |
| ![Category cards](docs/s3.png) <br> **Category cards** — posture, massagers, pain relief | ![Catalog](docs/s4.png) <br> **Catalog** — five collection cards, editable handles |
| ![Product page](docs/s5.png) <br> **Product page** — gallery, buy box, accordions | ![Benefits](docs/s6.png) <br> **Feature strip** — benefits and product highlights |
| ![Reviews](docs/s7.png) <br> **Reviews** — metaobject-driven, with photo gallery | ![Cart](docs/s8.png) <br> **Cart** — free-shipping progress bar, upsells |
| ![Collections](docs/s9.png) <br> **Collections** — nine category templates | ![Footer](docs/s10.png) <br> **Footer** — newsletter, socials, contact |

_Captions are placeholders — reorder or reword them to match what each screenshot actually shows._

---

## What I built

Everything below is custom work written on top of Dawn. Each section is **fully schema-driven** — every headline, image, link, colour, and product handle is editable from the Shopify theme editor rather than hardcoded, so the client can run the store without touching code.

| Section | Lines | What it does |
|---|---:|---|
| `sections/b1g1.liquid` | 1,431 | Buy-one-get-one product page variant — 46 theme-editor settings |
| `sections/product-page-design-2.liquid` | 1,295 | Main product page — gallery, buy box, benefit strip, accordions (shipping, returns, care), featured review |
| `sections/vexoracare-reviews.liquid` | 1,024 | Review system backed by Shopify **metaobjects**, with star ratings and a customer-photo gallery |
| `sections/vexoracare-header.liquid` | 803 | Full cart page — AJAX line-item updates, free-shipping progress bar, upsell collection |
| `sections/vexoracare-catalog.liquid` | 707 | Catalog grid — five configurable collection cards (31 settings) |
| `sections/vexoracare-hero-2.liquid` | 679 | Secondary hero — three category cards, centre product image, benefit pills (32 settings) |
| `sections/footer.liquid` | 638 | Custom footer — newsletter signup form, social links, contact block |
| `sections/vexoracare-hero-1.liquid` | 575 | Homepage hero — layered headline, stats row, floating trust badges (27 settings) |
| `sections/vexoracare-cart.liquid` | 561 | Alternative cart design with upsell rail |
| `sections/k2.liquid` | 434 | Related-products grid, auto-pulled from the current product's collection |
| `sections/vexoracare-product-collection.liquid` | 200 | Product-collection listing block |
| `templates/page.wishlist.liquid` | 89 | Wishlist page — persists to `localStorage`, no app required |

Plus **nine collection templates** (`women`, `men`, `kids`, `beauty`, `footwear`, `watches`, `luxury`, `home-decore`, `all-products`) and a custom page-transition loader in `layout/theme.liquid` — an SVG progress ring with percentage readout that intercepts internal navigation.

---

## Technical highlights

**Metaobject-driven reviews.** Rather than paying for a reviews app, `vexoracare-reviews.liquid` reads from `product.metafields.custom.product_reviews` — a Shopify metaobject definition with `name`, `rating`, `title`, `body`, `date`, and an optional `image` file reference. The optional image field conditionally enables a customer-photo gallery below the review list.

**AJAX cart.** The cart page updates line items via `fetch` against Shopify's Cart API and re-renders using the Section Rendering API — no full page reload. Includes a live free-shipping progress bar computed in Liquid from `cart.total_price` against a merchant-set threshold.

**App-free wishlist.** Wishlist state persists in `localStorage` and renders client-side, avoiding a paid app and its script tag.

**Schema-first authoring.** Across the custom sections there are 200+ theme-editor settings. Copy, imagery, colours, and collection handles are all merchant-editable — the design survives content changes without developer involvement.

**Accessibility.** Sections expose configurable `aria-label` settings, use `visually-hidden` helper classes for screen-reader text, and mark decorative SVGs `aria-hidden`.

---

## Repository structure

```
assets/      185 files — CSS, JS, SVG icons
config/      theme settings + schema (Dawn 15.4.0 base)
layout/      theme.liquid (custom page-transition loader), password, gift card
locales/     51 translation files
sections/    66 sections — 12 custom, rest Dawn
snippets/    57 snippets
templates/   33 templates — 9 custom collection templates, 2 product variants
docs/        screenshots and walkthrough video
```

---

## Running locally

Requires the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).

```bash
shopify theme dev --store your-store.myshopify.com   # hot-reloading local preview
shopify theme check                                   # lint the Liquid
shopify theme push --unpublished                      # upload as a draft theme
```

The reviews section needs a `product_reviews` metaobject definition in Shopify Admin before it renders content — see the setup note in the section's theme-editor sidebar.

---

## Notes

- **Sanitized for public release.** The store contact address in the footer is a placeholder (`contact@example.com`); the real address is set in the theme editor under **Footer → Contact**. No API keys, access tokens, or customer data are in this repository.
- **Third-party integrations.** The theme carries leftover sections from the EComposer and PageFly page builders (`sections/ecom-*`, `snippets/ecom_*`, `snippets/pagefly-main-js.liquid`). These are app-generated, not hand-written.
- `sections/vexoracare-header.liquid` is named "header" but contains the cart page (its schema name is `Cart page`) — a leftover from reusing the file. It is currently referenced by both `templates/index.json` and `templates/cart.json`.
