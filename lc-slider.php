<?php
/**
 * Plugin Name: lc-slider
 * Plugin URI: http://NOT YET
 * Description: A slider by Louis Carrese
 * Version: 1.0.0
 * Author: Louis Carrese
 * Author URI: http://louiscarrese.com
 * License: LGPL
 */
require_once('lc-genconf/lc-wpgenconf.php');
require_once('lc-slider-admin-configuration.php');

/**
 *	Initialisation du plugin
 */

//Hook pour charger les différentes ressources (CSS, javascript, ...)
add_action('wp_enqueue_scripts', 'lc_slider_ressource_register');
function lc_slider_ressource_register() {
	//owl.carousel
	wp_enqueue_style('owl-carousel-style', plugins_url('owl.carousel/owl-carousel/owl.carousel.css', __FILE__));
	wp_enqueue_style('owl-carousel-theme', plugins_url('owl.carousel/owl-carousel/owl.theme.css', __FILE__));
	wp_enqueue_script('owl-carousel-script', plugins_url('owl.carousel/owl-carousel/owl.carousel.js', __FILE__), array('jquery'));

	//La CSS par défaut
	wp_enqueue_style('lc_slider_style', plugins_url('lc-slider.css', __FILE__));

	//Le javascript qui init les sliders sur la page
	wp_enqueue_script('lc-slider-init', plugins_url('lc-slider.js', __FILE__));

	$options = json_decode(get_option('lc-slider'), true);

	$lc_conf = new LcGenconf\ConfigurationReader('lc-slider');
		

	//On réorganise les options par identifiants de slider
	$options_sorted = array();
	foreach($lc_conf->getRaw() as $option) {
	  $options_sorted[$option['id']['id']] = $option;
	}

	wp_localize_script('lc-slider-init', 'lcSliderParams', $options_sorted);

}
//Shortcode
add_shortcode('lc_slider', 'lc_slider');


//Fonction principale
function lc_slider($id, $echo = false) {
  $lc_conf = new LcGenconf\ConfigurationReader('lc-slider');
  
  if($lc_conf->findRepeater('id', 'id', $id) === false) {
    wp_die('repeater not found ! (id = ' . $id . ')');
    return;
  }

  //Récupération des images à afficher
  $images = get_images($lc_conf);

	//Affichage des données
	$html = '';

	//Début du bloc HTML
	$html .= '<div id="main-slider" class="lc-slider owl-carousel" data-sliderid="' . $id . '">';

	foreach($images as $image) {
		$html .= '<div class="lc-slider-slide">';
		 $html .= '<div class="lc-slider-picture" style="background-image:url(' . $image['url'] . ')">';
		 $html .= '<img style="visibility:hidden" src="' . $image['url'] . '" />';
		 $html .= '</div>';
		//$html .= '<img class="lc-slider-picture" src="' . $image['url'] . '" />';

		$html .= '<div class="lc-slider-caption vertical-center lc-slider-notransition">';
		if($lc_conf->get('display', 'show_title') == 1) 
		  $html .= '<h2>' . $image['title'] . '</h2>';
		if($lc_conf->get('display', 'linktext') != '')
		  $html .= '<a href="">' . $lc_conf->get('display', 'linktext') . '</a>';
		$html .= '</div>';

		if($lc_conf->get('display', 'show_description') == 0)
		  $html .= '<div class="lc-slider-description lc-slider-notransition">' . $image['description'] . '</div>';
		$html .= '</div>';
	}


	//Fin du bloc HTML
	$html .= '</div>';

	echo $html;
}

function get_images($lc_conf) {
  switch( $lc_conf->get('data', 'condition')){
    case 'metabox':
      return get_images_metabox($lc_conf->get('data', 'metabox'));
      break;
    case 'category':
      return get_images_category($lc_conf->get('data', 'category'));
      break;
    default:
      return null;
      break;
  }

}

function get_images_metabox($metabox_id) {
  $images = array();
  $metabox_images = rwmb_meta($metabox_id, 'type=image&size=post_slider');
  foreach($metabox_images as $metabox_image) {
    $images[] = array(
		      'url' => $metabox_image['url'],
		      'title' => $metabox_image['title'],
		      'alt' => $metabox_image['alt'],
		      'description' => $metabox_image['caption'],
		      );
  }
  

  return $images;
}

function get_images_category($category_id) {
  
  $images = array();

  $post_args = array('category' => $category_id);
  $posts = get_posts($post_args);

  foreach($posts as $post) {
    $image = array();
    
    $slider_image = get_field('slider_image', $post->ID);
    $image['url'] = $slider_image['url'];
    $image['title'] = apply_filters('the_title', $post->post_title);
    $images[] = $image;
  }


}

?>