# EETP Exploded View (WordPress plugin)

A small plugin that adds the `[eetp_exploded]` shortcode and an "Exploded view" box on every product. One piece of code for all products: each product keeps its own image, parts and hover areas in its own fields.

Needs ACF (the free version is enough) and WooCommerce products.

## Install (staging first)
1. WordPress admin > Plugins > Add New > Upload Plugin > choose `eetp-exploded.zip` > Install > Activate.
2. Open the Elementor single-product template and add a Shortcode widget with `[eetp_exploded]` where the exploded view should appear (at the top for products with an exploded view).

## Per product
Open the product and fill the "Exploded view" box:
- **Exploded view image**: the drawing without the parts table.
- **Exploded view PDF** (optional): shows a download link under the image.
- **Exploded view data**: one line per part.

    number | name | part number | qty | description | link | areas

- `areas`: `x,y x,y x,y ...` in pixels of the uploaded image. Use `;` for more than one area on the same part.
- `link`: product page of the part (starts with `/` or `https://`). Leave empty if the part has no page.
- Lines that start with `#` are ignored. Parts without areas are not clickable.

If the product has no image or no data, nothing is shown, so the same template can serve every product.

Working example: `../../exploded-test.html` (Ball Screw Assembly 10mm).

Status: the JS, CSS and markup are tested in the static test page. The PHP and the ACF box still need a first run on the staging site.
