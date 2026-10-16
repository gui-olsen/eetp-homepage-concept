<?php
/**
 * EETP exploded view.
 *
 * Shortcode: [eetp_exploded]
 * Put it once in the Elementor single-product template (Shortcode widget).
 * It reads three ACF fields from the product that is open:
 *   ev_image  (Image, return format: Image Array)
 *   ev_pdf    (File,  return format: File Array)   optional
 *   ev_data   (Text Area)  one line per part, see exploded.js for the format
 * If the product has no image or no data, the shortcode prints nothing.
 */
if (!defined('ABSPATH')) {
	exit;
}

function eetp_ev_url($file) {
	return get_stylesheet_directory_uri() . '/eetp-exploded/' . $file;
}

function eetp_ev_ver($file) {
	$path = get_stylesheet_directory() . '/eetp-exploded/' . $file;
	return file_exists($path) ? filemtime($path) : null;
}

add_shortcode('eetp_exploded', function ($atts) {
	if (!function_exists('get_field')) {
		return '';
	}

	$atts    = shortcode_atts(array('id' => 0), $atts, 'eetp_exploded');
	$post_id = $atts['id'] ? (int) $atts['id'] : get_the_ID();
	if (!$post_id) {
		return '';
	}

	$image = get_field('ev_image', $post_id);
	$data  = get_field('ev_data', $post_id);
	if (empty($image['url']) || trim((string) $data) === '') {
		return '';
	}
	$pdf = get_field('ev_pdf', $post_id);

	wp_enqueue_style('eetp-exploded', eetp_ev_url('exploded.css'), array(), eetp_ev_ver('exploded.css'));
	wp_enqueue_script('eetp-exploded', eetp_ev_url('exploded.js'), array(), eetp_ev_ver('exploded.js'), true);

	$alt = !empty($image['alt']) ? $image['alt'] : get_the_title($post_id) . ' exploded view';

	ob_start();
	?>
	<div class="eetp-ev">
		<div class="eetp-ev__canvas">
			<?php
			if (!empty($image['ID'])) {
				echo wp_get_attachment_image($image['ID'], 'full', false, array('class' => 'eetp-ev__img', 'alt' => $alt));
			} else {
				printf(
					'<img class="eetp-ev__img" src="%s" width="%d" height="%d" alt="%s">',
					esc_url($image['url']),
					(int) $image['width'],
					(int) $image['height'],
					esc_attr($alt)
				);
			}
			?>
		</div>
		<textarea class="eetp-ev__data" hidden><?php echo esc_textarea($data); ?></textarea>
		<?php if (!empty($pdf['url'])) : ?>
			<a class="eetp-ev__pdf" href="<?php echo esc_url($pdf['url']); ?>" download>Download exploded view (PDF)</a>
		<?php endif; ?>
	</div>
	<?php
	return ob_get_clean();
});
