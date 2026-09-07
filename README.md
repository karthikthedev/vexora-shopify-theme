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

### Optimisation pass

Mobile, Lighthouse 13.4.1, both runs against the same local `shopify theme dev` server thirty minutes apart, so the comparison is like for like.

| | Before | After | |
|---|---:|---:|---:|
| **Performance score** | 49 | **55** | +6 |
| Largest Contentful Paint | 7.9 s | **5.7 s** | −2.15 s |
| Speed Index | 5.1 s | **3.6 s** | −1.46 s |
| Cumulative Layout Shift | 0.038 | **0.003** | −0.036 |
| Time to Interactive | 8.8 s | 8.4 s | −0.40 s |
| Total Blocking Time | 800 ms | 750 ms | −50 ms |
| First Contentful Paint | 2.7 s | 2.7 s | — |

The LCP element is the hero `<h1>`, not an image — Lighthouse reports `lcp-discovery-insight` as not applicable, so there is nothing to preload and the work was in whatever delayed that heading's first paint:

| LCP subpart | Before | After |
|---|---:|---:|
| Time to first byte | 1,431 ms | 1,083 ms |
| Element render delay | 1,880 ms | **524 ms** |

Element render delay fell 72%. Render-blocking requests went from four (2,543 ms) to one (816 ms), stylesheets from ten to four, font files from six to five. Not all of the LCP gain is the change: TTFB also moved 348 ms, which is dev-server variance, so roughly 1.36 s of the 2.15 s is attributable to the render-delay work.

**What changed.** Nine sections each emitted their own Google Fonts stylesheet, every one asking for a different weight combination so none shared a cache entry, and all discovered late because they sit in the body — the homepage pulled four. These became a single request in `<head>` covering the union of every weight, loaded off the critical path; all sixteen weight/style combinations are still requested, so typography is unchanged. The hero `<h1>` also carried a 250 ms `animation-delay` while sitting at `opacity: 0`, and Chrome raises no LCP candidate for a zero-opacity element, so that delay gated the metric on the LCP element itself. Slideshow, slider and localization stylesheets blocked rendering on every page for markup that only renders conditionally — a one-block announcement bar, selectors switched off — and now load on the same condition as the markup they style.

Consolidating the font request also collapsed CLS from 0.038 to 0.003: the font now arrives before first paint, so the swap no longer reflows the heading.

### Production baseline

Measured against a live storefront on 7 September 2026, default presets — mobile at 4× CPU slowdown over simulated slow 4G, desktop unthrottled. These figures **predate the optimisation pass above**.

| Category | Mobile | Desktop |
|---|---:|---:|
| Performance | 41 | 65 |
| Accessibility | 90 → **100** | 93 → **100** |
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

The server is not the bottleneck — the root document returns in 60 ms. INP is absent because it needs real interaction; a lab run cannot produce it. The page is 1,253 KiB over 122 requests, with a 430-element DOM.

Local and production are not interchangeable: `shopify theme dev` applies no compression and returns the document roughly 350 ms slower, so local runs read about 1.3 s pessimistic on LCP. A production re-run should land below the 5.7 s measured locally.

### Room for improvement

**Total Blocking Time is now the ceiling.** 750 ms on mobile, and the heaviest contributors are not this theme's: Shopify's perf-kit costs 2,222 ms of CPU in the production run, followed by the web-pixels bundle and the Facebook Pixel. 69 KiB of the JavaScript shipped is unused, none of it from the theme. The lever is pruning unused pixels in Customer Events rather than anything in the Liquid.

**Animations are down to one.** Lighthouse flagged eight non-composited animated elements; seven are gone. Two of them had looped forever — a `border-radius` morph on the hero photo, and the dots in a full-screen loading overlay that kept animating behind `visibility: hidden` for the life of every page. That overlay was removed outright: it played a simulated progress bar and dismissed on a timer up to 2.2 s after the document was already complete. The one that remains is a `width`-driven typewriter reveal, ten layout steps running once, kept deliberately — removing it costs the effect and saves almost nothing.

**base.css.** 82 KiB and 92% unused on the homepage, and the single remaining render-blocking request locally at 816 ms. In production it measures 0 ms and 0.0 KiB — Shopify gzips it and the CDN caches it — so the local figure is an artefact of the dev server, and splitting the file would be risk bought against a cost that does not exist in production.

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
