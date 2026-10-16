# EETP Exploded View (WordPress plugin)

A small plugin that adds the `[eetp_exploded]` shortcode and an "Exploded view" box on every product. One piece of code for all products: each product keeps its own image, parts and hover areas in its own fields.

Needs ACF (the free version is enough) and WooCommerce products.

## Install (staging first)
1. WordPress admin > Plugins > Add New > Upload Plugin > choose `eetp-exploded.zip` > Install > Activate.
2. Open the Elementor single-product template and add a Shortcode widget with `[eetp_exploded]` where the exploded view should appear (at the top for products with an exploded view). This is done once, not per product.

## Per product
Open the product and fill the "Exploded view" box:
- **Exploded view image**: the drawing without the parts table.
- **Exploded view PDF** (optional): shows a download link under the image.
- **Exploded view data**: one line per part.

    number | name | part number | qty | description | link | datasheet | areas | photo

- `link`: the product page of the part. Gives the "View product" button, and the plugin takes the part photo (the product's featured image) and short description from that page.
- `datasheet`: file to download. Gives the "Download datasheet" button. Leave empty if there is none.
- `areas`: `x,y x,y x,y ...` in pixels of the uploaded image. Use `;` for more than one area on the same part.
- `photo`: optional photo address for a part that has no product page. It wins over the product photo.
- Lines that start with `#` are ignored. Parts without areas are not clickable.

## What the visitor sees
- Hover: the part is highlighted and a small label shows its number and name.
- Click or tap: a box opens with the part photo, name, part number, quantity per assembly, description, a "View product" button and, when there is one, a "Download datasheet" button.
- If a part has no photo at all, the box is smaller and shows only the text.

If the product has no image or no data, nothing is shown, so the same template can serve every product.

Working example: `../../exploded-test.html` (Ball Screw Assembly 10mm).

Status: the JS, CSS and markup are tested in the static test page. The PHP and the ACF box still need a first run on the staging site.
