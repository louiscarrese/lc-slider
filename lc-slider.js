
jQuery(function () {

	jQuery('.owl-carousel').each(function() {
		//Extract options from the wordpress configuration
		options = extractOptions(lcSliderParams, jQuery(this).data('sliderid'));

		//Add common options
		options['singleItem'] = true;
		options['theme'] = 'ak-owl-theme';
		options['navigationText'] = ['', ''];
		options['stopOnHover'] = true;
//		options['navigation'] = true;

		//Init owl carousel
		jQuery(this).owlCarousel(options);

	}); 

	// jQuery('.owl-carousel').owlCarousel({
	// 	singleItem: true,
	// 	navigation: true

	// });

});


/**
 * Extract options from the wordpress stored format to this plugin format.
 */
function extractOptions(options, sliderId) {
    return {
    	navigation: (options[sliderId]["nav"]["arrows"] == 1),
    	pagination: (options[sliderId]["nav"]["bullets"] == 1),
    	slideSpeed: options[sliderId]["speed"]["speed"],
    	//TODO: theme: options[sliderId]["eyecandy"]["theme"],

		// speed: options[sliderId]["speed"]["speed"],
		// delay: options[sliderId]["speed"]["delay"],
		// dots: (options[sliderId]["nav"]["bullets"] == 1),
		// arrows: (options[sliderId]["nav"]["arrows"] == 1),
		// progress: (options[sliderId]["eyecandy"]["progressbar"]),
		// transitioned: options[sliderId]["eyecandy"]["transitioned"]
    };
}
