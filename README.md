# VexoraCare — Custom Shopify Theme

A custom Shopify storefront for a wellness and posture-care brand. Built on Dawn 15.4.0, with **~8,400 lines of custom Liquid** across 12 bespoke sections — homepage, product page, reviews, cart, and catalog, all rebuilt from scratch.

**[View the live store →](https://vexoracare.myshopify.com/)** — storefront password: `vexora`

---

## Demo

[![Watch the store walkthrough](https://www.loom.com/v1/videos/bdc09f4efdc34ba395a46c64ad399d0b/thumbnail)](https://www.loom.com/share/bdc09f4efdc34ba395a46c64ad399d0b)

**▶ [Watch the full walkthrough](https://www.loom.com/share/bdc09f4efdc34ba395a46c64ad399d0b)** — homepage to checkout.

---

## Homepage

Layered editorial hero with animated stat counters and floating trust badges, followed by a dark category section and a benefit-pill product feature.

| | |
|---|---|
| ![Category pillars](docs/2s.png) | ![Product benefits](docs/3s.png) |
| **Three pillars** — category cards with per-card copy and links | **Benefit pills** — flanking a spotlit best-seller |

## Product page

| | |
|---|---|
| ![Product page](docs/5s.png) | ![Related products](docs/8s.png) |
| **Buy box** — swatch colour picker, seven size options, live stock state, discount badge, trust row | **Related products** — auto-pulled from the current product's collection |

## Reviews

Built on Shopify **metaobjects** instead of a paid reviews app — aggregate score, distribution, sorting, verified-buyer badges, and a customer photo gallery.

| | |
|---|---|
| ![Review summary](docs/6s.png) | ![Review grid](docs/7s.png) |
| **Aggregate rating** — computed in Liquid across all review entries | **Review cards** — customer photos, star ratings, helpfulness voting |

## Cart

| | |
|---|---|
| ![Cart drawer](docs/9s.png) | ![Cart page](docs/10s.png) |
| **Slide-out drawer** — AJAX add-to-cart, no page reload | **Cart page** — free-shipping progress bar, order notes, live totals |

## Footer

![Footer](docs/4s.png)

---

## What I built

Every section is **schema-driven** — headlines, images, links, colours, and collection handles are all editable from the Shopify theme editor, so the store owner can change content without touching code. Across the custom sections there are 200+ editor settings.

| Section | Lines | What it does |
|---|---:|---|
| `b1g1.liquid` | 1,431 | Buy-one-get-one product page variant, 46 editor settings |
| `product-page-design-2.liquid` | 1,295 | Product page — gallery, buy box, benefit strip, shipping/returns/care accordions |
| `vexoracare-reviews.liquid` | 1,024 | Metaobject-backed review system with photo gallery |
| `vexoracare-cart-page.liquid` | 803 | Cart page — AJAX line items, free-shipping bar, upsell rail |
| `vexoracare-catalog.liquid` | 707 | Catalog grid, five configurable collection cards |
| `vexoracare-hero-2.liquid` | 679 | Category section — three cards, centre image, benefit pills |
| `footer.liquid` | 638 | Footer — newsletter form, socials, policy links, payment icons |
| `vexoracare-hero-1.liquid` | 575 | Homepage hero — layered headline, stats, floating badges |
| `vexoracare-cart.liquid` | 561 | Alternative cart design with upsell rail |
| `k2.liquid` | 434 | Related-products carousel |
| `vexoracare-product-collection.liquid` | 200 | Product collection listing block |
| `templates/page.wishlist.liquid` | 89 | Wishlist page, persisted to `localStorage` |

Plus **nine collection templates** (women, men, kids, beauty, footwear, watches, luxury, home decor, all products) and a page-transition progress bar in `layout/theme.liquid` — a thin top bar that intercepts internal navigation.

---

## Technical notes

**Metaobject-driven reviews.** `vexoracare-reviews.liquid` reads from `product.metafields.custom.product_reviews`, a metaobject definition with `name`, `rating`, `title`, `body`, `date`, and an optional `image` reference. The aggregate score and rating distribution are computed in Liquid at render time. The optional image field conditionally enables the customer-photo gallery — no app, no subscription, no third-party script.

**AJAX cart.** Line-item updates go through Shopify's Cart API via `fetch` and re-render with the Section Rendering API, so quantity changes and removals never reload the page. The free-shipping progress bar is computed in Liquid from `cart.total_price` against a merchant-set threshold.

**App-free wishlist.** Wishlist state persists in `localStorage` and renders client-side, avoiding a paid app and the script tag that comes with it.

**Accessibility.** Configurable `aria-label` settings per section, `visually-hidden` helper classes for screen-reader text, and `aria-hidden` on decorative SVGs.

---

## Lighthouse

Measured with Lighthouse 13.4.1 against a live storefront running this theme, 7 September 2026, on the default presets — mobile throttled to 4× CPU slowdown over simulated slow 4G, desktop unthrottled.

| Category | Mobile | Desktop |
|---|---:|---:|
| Performance | 41 | 65 |
| Accessibility | 90 | 93 |
| Best Practices | 77 | 77 |
| SEO | 85 | 92 |

| Metric | Mobile | Desktop |
|---|---:|---:|
| First Contentful Paint | 2.1 s | 0.6 s |
| Largest Contentful Paint | 6.6 s | 2.3 s |
| Speed Index | 6.9 s | 2.2 s |
| Total Blocking Time | 1,920 ms | 420 ms |
| Cumulative Layout Shift | 0.003 | 0.001 |
| Time to Interactive | 8.2 s | 2.3 s |

CLS is effectively zero on both, and the server is not the bottleneck — the root document returns in 60 ms. INP is absent because it needs real interaction; a lab run cannot produce it. The page is 1,253 KiB over 122 requests, with a 430-element DOM.

### Room for improvement

**Main-thread work — the dominant cost.** 17.4 s of main-thread time on mobile, of which 8.9 s is Style & Layout. The cause is animations that cannot run on the compositor, so they force style and paint work every frame. Two of them looped forever: a `border-radius` morph on the hero photo, and the dots in the full-screen loading overlay, which kept animating behind a `visibility: hidden` overlay for the life of every page. The morph is gone, and the overlay was removed outright — it held the hero back by up to 2.2 s on first visit while a simulated progress bar played, and it accounted for five of the eight non-composited animations on the page. The remaining one-shot offenders — a `width`-driven typewriter reveal and its border-colour cursor — are ten layout steps that run once, and are kept deliberately, since removing them costs the effect and saves almost nothing.

**LCP is waiting on the main thread, not the network.** The 6.6 s breaks down as 977 ms to first byte plus 1,563 ms of element render delay, with no image load delay at all. Image optimisation would buy roughly 9 KiB; freeing the main thread is what moves this number.

**Third-party JavaScript.** Shopify's own perf-kit is the single heaviest script at 2,222 ms of CPU, followed by the web-pixels bundle and the Facebook Pixel. 69 KiB of the JavaScript shipped is unused, and none of it comes from this theme. The lever available here is pruning unused pixels in Customer Events rather than anything in the Liquid.

**Accessibility.** Four audits failed: `aria-label` on roleless `div`s in the payment badges, focusable children inside `aria-hidden` drawers, an accessible name that did not match its visible text, and a link distinguished from body text by colour alone. All four are fixed and awaiting re-measurement.

**Best Practices and SEO.** Best Practices sits at 77 on both form factors, driven by third-party cookies from the pixels above. On SEO, the page has no meta description, and mobile additionally flags an invalid `robots.txt` — which is the whole of the 85-vs-92 gap.

---

## Structure

```
assets/      185 files — CSS, JS, SVG icons
config/      theme settings and schema
layout/      theme.liquid with page-transition progress bar
locales/     51 translation files
sections/    66 sections — 12 custom
snippets/    57 snippets
templates/   33 templates — 9 custom collection templates, 2 product variants
docs/        screenshots
```

## Running locally

```bash
shopify theme dev --store your-store.myshopify.com   # hot-reloading preview
shopify theme check                                   # lint the Liquid
shopify theme push --unpublished                      # upload as a draft
```

The reviews section requires a `product_reviews` metaobject definition in Shopify Admin before it renders content.
