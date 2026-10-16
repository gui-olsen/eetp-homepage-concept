<?php
/**
 * Plugin Name: EETP Exploded View
 * Description: Interactive exploded view for EETP products. Adds the [eetp_exploded] shortcode and an "Exploded view" box (ACF) on each product.
 * Version:     0.1.0
 * Author:      Gui Olsen
 * Requires PHP: 7.2
 *
 * How it works
 * - Each product has three ACF fields: ev_image, ev_pdf and ev_data (see eetp_ev_register_fields below).
 * - Put the shortcode [eetp_exploded] once in the Elementor single-product template.
 * - On a product page the shortcode reads that product's fields and draws its own image, parts and hover areas.
 * - If the product has no image or no data, the shortcode prints nothing.
 */
if (!defined('ABSPATH')) {
	exit;
}

define('EETP_EV_VERSION', '0.1.0');
define('EETP_EV_URL', plugin_dir_url(__FILE__));

/* The "Exploded view" box on the product edit screen. Needs ACF (free version is enough). */
add_action('acf/init', 'eetp_ev_register_fields');
function eetp_ev_register_fields() {
	if (!function_exists('acf_add_local_field_group')) {
		return;
	}
	acf_add_local_field_group(array(
		'key'      => 'group_eetp_exploded_view',
		'title'    => 'Exploded view',
		'fields'   => array(
			array(
				'key'          => 'field_eetp_ev_image',
				'label'        => 'Exploded view image (PNG)',
				'name'         => 'ev_image',
				'type'         => 'image',
				'instructions' => 'The exploded view drawing without the parts table.',
				'return_format' => 'array',
				'preview_size' => 'medium',
				'library'      => 'all',
			),
			array(
				'key'          => 'field_eetp_ev_pdf',
				'label'        => 'Exploded view PDF',
				'name'         => 'ev_pdf',
				'type'         => 'file',
				'instructions' => 'Optional. Shows a download link under the image.',
				'return_format' => 'array',
				'library'      => 'all',
			),
			array(
				'key'          => 'field_eetp_ev_data',
				'label'        => 'Exploded view data',
				'name'         => 'ev_data',
				'type'         => 'textarea',
				'instructions' => 'One line per part: number | name | part number | qty | description | link | areas',
				'rows'         => 20,
				'new_lines'    => '',
			),
		),
		'location' => array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'product',
				),
			),
		),
		'position'             => 'normal',
		'style'                => 'default',
		'label_placement'      => 'top',
		'instruction_placement' => 'label',
	));
}

/* [eetp_exploded] */
add_shortcode('eetp_exploded', 'eetp_ev_shortcode');
function eetp_ev_shortcode($atts) {
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

	wp_enqueue_style('eetp-exploded', EETP_EV_URL . 'assets/exploded.css', array(), EETP_EV_VERSION);
	wp_enqueue_script('eetp-exploded', EETP_EV_URL . 'assets/exploded.js', array(), EETP_EV_VERSION, true);

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
}
