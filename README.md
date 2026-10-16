# EETP — Homepage concept

Homepage design concept for **Extensive Energy Technology Partnership (EETP)**, a Calgary-based maker of MWD (Measurement While Drilling) components, field support and consulting.

Built from the approved Figma frame (`Homepage-02`) as a static showcase for EETP's leadership team. It is a concept, not the production site: links and buttons are intentionally inert because the other pages do not exist yet.

**Live preview:** https://gui-olsen.github.io/eetp-homepage-concept/

## Run it locally

Any static file server works, e.g.:

```bash
npx http-server -p 5566 -c-1
```

Then open `http://localhost:5566`.

## Structure

| File | Purpose |
|---|---|
| `index.html` | Homepage 02: hero with video, products, services, reliability, testimonials, news, FAQ, call-out and footer. |
| `home-01.html` | Homepage 01 (Figma `Homepage-01`): video hero, grey product grid, service cards, reliability panels, news, FAQ. |
| `home-03.html` | Homepage 03 (Figma `Homepage-03`): centred video hero with a floating kit banner and a services card that overlaps the reliability photo. |
| `css/variants.css` | Styles for homepages 01 and 03, plus the shared card accordion. |
| `js/variants.js` | Accordion for homepages 01 and 03. |
| `product.html` | Individual product page (MWD Ball-Screw Drive): intro, specifications, benefits, interactive exploded view, inquiry form, related products. Reached from the "Linear Drive Assembly" card on the homepage. |
| `product-03.html` | Product page variant 03 (Figma `Individual-product-03`): dark hero, overview, specification table, benefits and inquiry stacked, related products. No exploded view. |
| `product-03-1.html` | Product page variant 03.1 (Figma `Individual-product-03.1`): overview, two-column specifications with benefits and inquiry, interactive exploded view, related products. |
| `wordpress/eetp-exploded/` | WordPress version of the exploded view: `[eetp_exploded]` shortcode (PHP, JS, CSS) plus the ACF field group. Test page: `exploded-test.html`. |
| `css/product.css` | Styles for the product pages and the exploded-view lightbox. |
| `js/exploded-data.js` | Exploded view data: 24 parts, hotspot polygons (drawing pixel space) and sample copy. |
| `js/exploded.js` | Exploded view behaviour: hover highlight and tooltip, click to open the lightbox, keyboard support, Esc to close. |
| `css/tokens.css` | EETP brand variables, forked from [`gui-olsen/guiolsen-design-system`](https://github.com/gui-olsen/guiolsen-design-system). Same names and values as the variables in the Figma file. |
| `css/components.css` | Base styles, buttons, section labels, text links, headings. Built on the tokens. |
| `css/styles.css` | Section layouts, hover states, entrance animations and the responsive breakpoints. |
| `js/main.js` | Hero title word reveal, scroll-reveal, count-up metric, FAQ accordion, inert links. |
| `images/` | Assets exported from Figma. The large photos are compressed to WebP. `images/products/` and `images/articles/` hold product photos and article featured images taken from eetp.ca. |
| `video/hero.mp4` | Looping hero background video (8 s, 1280×720, about 4 MB). |

## Brand tokens (`css/tokens.css`)

- `--color-accent` `#0075C1` (CTAs, links, labels), `--color-primary` `#000000` (headings, dark surfaces)
- `--color-primary-tint` `#F8F9F9`, `--color-secondary-tint` `#E9E9E9`, `--color-accent-tint` `#E6F1F9`
- `--font-secondary` Montserrat (headings), `--font-primary` PT Sans (body), `--font-mono` Roboto Mono (technical labels)

## Interactions

- **Sticky header (all pages):** the header stays on screen while scrolling. After a few pixels it turns solid blue, the call button turns white, and the bar gets slightly shorter.
- **Hero video:** muted, looping and inline-playing behind the dark gradient.
- **Entrance:** the hero video settles in, the nav drops in, the title reveals word by word, then the actions, capability note and ticker follow. Every section after the hero reveals on scroll with a short stagger, and the "20+" metric counts up.
- **Hover:** buttons lift and darken, nav links draw an underline, product and article cards lift with an image zoom, service rows highlight, capability panels glow, and text-link arrows nudge.
- **FAQ:** a smooth accordion (first item open, keyboard accessible).
- **Exploded view (product page):** hotspots are hidden until hover. Hovering a part highlights it and shows its name; clicking opens a lightbox with a zoomed detail, description, part number, quantity, material, and "View product" (only for parts with their own page) and "Download datasheet" buttons. Both buttons are inert in this concept.
- **Accessibility:** respects `prefers-reduced-motion` (everything shows immediately, no movement), visible focus states, semantic landmarks and a skip link.

## Notes on the content

Copy and imagery come from the Figma frames. Product cards and article cards use real product photos, names and article titles from eetp.ca (product descriptions are short paraphrases of the site copy, and the P-xxx codes are placeholders). The FAQ questions and answers and the testimonials are still sample text, and the reliability photo is a watermarked stock preview. Replace these before anything goes live.

The exploded view uses the TVD001 rev G drawing and its parts list as stand-in content while the real MWD Ball-Screw Drive drawing is not available. Part descriptions are sample copy. The product photo, related products and specification text come from the Figma frame.

Both pages are marked `noindex` so search engines skip it while it is a concept.
