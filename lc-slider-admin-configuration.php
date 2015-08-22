<?php 

//La 'lib' de génération de configuration
//Set up pour WordPress
add_action('admin_menu', 'lc_slider_menu_register');
function lc_slider_menu_register() {
	add_options_page('lc-slider', 'lc-slider', 'manage_options', 'lc-slider-menu', 'lc_slider_menu_build');

}

function lc_slider_conf_definition() {
	$configuration = array(
		'title' => 'Configuration du slider',
		'repeater' => true,
		'sections' => array( //La liste des sections de configuration
				'id' => array(
					'title' => 'Identifiant du slider',
					'fields' => array(
						'id' => array(
							'label' => '',
							'type' => 'text',
						),
					),
				),
				'data' => array( //Une section de configuration
					'title' => 'Données à afficher',
					'condition' => array(
							     'label' => 'Type de slider',
							     'type' => 'dropdown',
							     'values' => array('category' => 'Catégorie', 'metabox' => 'Champ Metabox'),
							     'default_value' => 'category',
							     ),
					'fields' => array( //La liste des champs de la section
						'category' => array( //Un champ de la section
							'label' => 'Catégorie',
							'type' => 'category',
							'condition' => 'category'
						), //category
						'metabox' => array( //Un champ de la section
							'label' => 'Id du champ Metabox',
							'type' => 'text',
							'condition' => 'metabox'
						), //category
					), //data[fields]
				), //data
				'display' => array( //Une section de configuration
					'title' => 'Affichage',
					'fields' => array( //La liste des champs de la section
						'linktext' => array( //Un champ de la section
							'label' => 'Texte du lien',
							'type' => 'text',
							'explanation' => 'Si vide, pas de lien',
						), //linktext
						'show_title' => array( //Un champ de la section
							'label' => 'Afficher le titre',
							'type' => 'checkbox',
							'default_value' => true,
						), //show_title
						'show_description' => array(
									    'label' => 'Afficher la description',
									    'type' => 'checkbox',
									    'default_value' => true,
									    ),
					), //nav[fields]
				), //nav
				'nav' => array( //Une section de configuration
					'title' => 'Configuration de la navigation',
					'fields' => array( //La liste des champs de la section
						'bullets' => array( //Un champ de la section
							'label' => 'Bulles de navigation',
							'type' => 'checkbox',
							'default_value' => true,
						), //bullets
						'arrows' => array( //Un champ de la section
							'label' => 'Flèches de navigation',
							'type' => 'checkbox',
							'default_value' => true,
						), //arrows
					), //nav[fields]
				), //nav
				'speed' => array( //Une section de configuration
					'title' => 'Configuration des vitesses d\'animation',
					'fields' => array( //La liste des champs de la section
						'speed' => array( //Un champ de la section
							'label' => 'Vitesse de transition (millisecondes)',
							'type' => 'text',
							'default_value' => 500,
						), //speed
						'delay' => array( //Un champ de la section
							'label' => 'Temps entre deux slides (millisecondes)',
							'type' => 'text',
							'default_value' => 10000,
						), //delay
					), //speed[fields]
				), //speed
				'eyecandy' => array( //Une section de configuration
					'title' => 'Configuration de l\'ergonomie',
					'fields' => array( //La liste des champs de la section
						'transitioned' => array( //Un champ de la section
							'label' => 'Sélecteur des éléments ne "glissant" pas',
							'type' => 'text',
							'default_value' => '.lc-slider-caption',
						), //transitioned
						'progressbar' => array( //Un champ de la section
							'label' => 'Afficher la barre de progression',
							'explanation' => 'La barre de progression peut impacter les performances du navigateur',
							'type' => 'checkbox',
							'default_value' => false,
						), //progressbar
					), //eyecandy[fields]
				), //eyecandy
		) //sections
	);//configuration

	return $configuration;

}

function lc_slider_menu_build() {

  if(function_exists('lc_genconf')) {
    echo lc_genconf('lc-slider');
  } else {
    echo "Dependency lc-genconf not found";
  }

}
?>