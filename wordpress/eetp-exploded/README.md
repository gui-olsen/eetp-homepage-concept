# EETP exploded view (WordPress)

Shortcode `[eetp_exploded]`. One piece of code for every product. Each product keeps its own image, parts and hover areas in three ACF fields.

## Install (staging first)
1. Copy this folder to `wp-content/themes/<child-theme>/eetp-exploded/`.
2. In the child theme `functions.php` add:
   `require_once get_stylesheet_directory() . '/eetp-exploded/exploded.php';`
3. ACF > Tools > Import Field Groups > choose `acf-field-group.json`.
4. In the Elementor single-product template add a Shortcode widget with `[eetp_exploded]` where the exploded view should appear.

## Per product
Open the product and fill the "Exploded view" box: image, PDF (optional) and the data text.

Data, one line per part, fields separated by `|`:

    number | name | part number | qty | description | link | areas

- `areas`: `x,y x,y x,y ...` in pixels of the uploaded image. Use `;` for more than one area on the same part.
- `link`: product page of the part (starts with `/` or `https://`). Leave empty if the part has no page.
- Lines that start with `#` are ignored. Parts without areas are not clickable.

See `../../exploded-test.html` for a working example (Ball Screw Assembly 10mm).

Not yet tested inside WordPress: the JS, CSS and markup are tested in the static page; the PHP and the ACF import still need a first run on staging.
