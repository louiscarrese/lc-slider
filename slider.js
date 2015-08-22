/**
 *   Unslider by @idiot and @damirfoy
 *   Contributors:
 *   - @ShamoX
 *
 */

(function($, f) {
    var Unslider = function() {
	//  Object clone
	var _ = this;
	
	//  Set some options
	_.o = {
	    speed: 500,     // animation speed, false for no transition (integer or boolean)
	    delay: 3000,    // delay between slides, false for no autoplay (integer or boolean)
	    init: 0,        // init delay, false for no delay (integer or boolean)
	    pause: !f,      // pause on hover (boolean)
	    loop: !f,       // infinitely looping (boolean)
	    keys: f,        // keyboard shortcuts (boolean)
	    dots: f,        // display dots pagination (boolean)
	    arrows: f,      // display prev/next arrows (boolean)
	    progress: f,	// display a progress bar (boolean)
	    prev: '&nbsp;', // text or html inside prev button (string)
	    next: '&nbsp;', // same as for prev option
	    fluid: !f,       // is it a percentage width? (boolean)
	    starting: f,    // invoke before animation (function with argument)
	    complete: f,    // invoke after animation (function with argument)
	    items: '>ul',   // slides container selector
	    item: '>li',    // slidable items selector
	    easing: 'swing',// easing function to use for animation
	    autoplay: true,  // enable autoplay on initialisation
	    transitioned: '' // The class on which to make a non sliding transition
	    
	};
	
	_.init = function(el, o) {
	    //  Check whether we're passing any options in to Unslider
	    //Get the correct options
	    var options = extractOptions(o, el.data('sliderid'));
	    _.o = $.extend(_.o, options);

	    _.el = el;
	    _.ul = el.find(_.o.items);
	    _.max = [el.outerWidth() | 0, el.outerHeight() | 0];
	    _.li = _.ul.find(_.o.item).each(function(index) {
		var me = $(this),
		width = me.outerWidth();
		
		//  Set the max values
		if (width > _.max[0]) _.max[0] = width;
	    });
	    
	    
	    //  Cached vars
	    var o = _.o,
	    ul = _.ul,
	    li = _.li,
	    len = li.length;
	    
	    //  Current indeed
	    _.i = 0;
	    
	    //  Set the main element
	    el.css({width: _.max[0], overflow: 'hidden'});
	    
	    //  Set the relative widths
	    ul.css({position: 'relative', left: 0, width: (len * 100) + '%'});
	    if(o.fluid) {
		li.css({'float': 'left', width: (100 / len) + '%'});
	    } else {
		li.css({'float': 'left', width: (_.max[0]) + 'px'});
	    }
	    
	    //  Autoslide
	    o.autoplay && setTimeout(function() {
		if (o.delay | 0) {
		    _.play();
		    
		    if (o.pause) {
			el.on('mouseover mouseout', function(e) {
			    _.stop();
			    e.type == 'mouseout' && _.play();
			});
		    };
		};
	    }, o.init | 0);
	    
	    _.refreshRate = 20;
	    _.elapsed = 0;
	    
	    //  Keypresses
	    if (o.keys) {
		$(document).keydown(function(e) {
		    var key = e.which;
		    
		    if (key == 37)
			_.prev(); // Left
		    else if (key == 39)
			_.next(); // Right
		    else if (key == 27)
			_.stop(); // Esc
		});
	    };
	    
	    //  Dot pagination
	    o.dots && nav('dot');
	    
	    //  Arrows support
	    o.arrows && nav('arrow');
	    
	    //progress bar support
	    o.progress && progressbar();
	    
	    o.transitioned != '' && transition();
	    
	    //  Patch for fluid-width sliders. Screw those guys.
	    if (o.fluid) {
		var innerWidth = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
		var styl = {height: '100%'},
		width = el.outerWidth();
		
		
		ul.css(styl);
		styl['width'] = Math.min(Math.round((width / el.parent().width()) * 100), 100) + '%';
		el.css(styl);
		
		li.css({width: innerWidth + 'px'});
		
	    };
	    
	    //  Move support
	    if ($.event.special['move'] || $.Event('move')) {
		el.on('movestart', function(e) {
		    if ((e.distX > e.distY && e.distX < -e.distY) || (e.distX < e.distY && e.distX > -e.distY)) {
			e.preventDefault();
		    }else{
			el.data("left", _.ul.offset().left / el.width() * 100);
		    }
		}).on('move', function(e) {
		    var left = 100 * e.distX / el.width();
		    var leftDelta = 100 * e.deltaX / el.width();
		    _.ul[0].style.left = parseInt(_.ul[0].style.left.replace("%", ""))+leftDelta+"%";
		    
		    _.ul.data("left", left);
		}).on('moveend', function(e) {
		    var left = _.ul.data("left");
		    if (Math.abs(left) > 30){
			var i = left > 0 ? _.i-1 : _.i+1;
			if (i < 0 || i >= len) i = _.i;
			_.to(i);
		    }else{
			_.to(_.i);
		    }
		});
	    };
	    
	    return _;
	};
	
	//  Move Unslider to a slide index
	_.to = function(index, callback) {
	    //Handle the progress bar if needed
	    if (_.o.progress) {
		_.elapsed = 0;
		refreshProgressbar();
	    }
	    
	    //Store some things for easy access
	    var o = _.o,
	    el = _.el,
	    ul = _.ul,
	    li = _.li,
	    current = _.i,
	    target = li.eq(index);
	    
	    $.isFunction(o.starting) && !callback && o.starting(el, li.eq(current));
	    
	    //  To slide or not to slide
	    if ((!target.length || index < 0) && o.loop == f) 
		return;
	    
	    //  Check if it's out of bounds
	    if (!target.length) 
		index = 0;
	    if (index < 0) 
		index = li.length - 1;
	    target = li.eq(index);
	    
	    var speed = callback ? 5 : o.speed | 0,
	    easing = o.easing,
	    obj = {/*height: target.outerHeight()*/};
	    
	    if (!ul.queue('fx').length) {
		//  Handle those pesky dots
		el.find('.dot').eq(index).addClass('active').siblings().removeClass('active');
		
		//lc - hide the transitioned elements
		li.find(_.o.transitioned).fadeOut(_.o.speed / 2);
		el.animate(obj, speed, easing) && ul.animate($.extend({left: '-' + index + '00%'}, obj), speed, easing, function(data) {
		    _.i = index;
		    
		    //lc - display the transitioned element
		    li.find(_.o.transitioned).fadeIn(_.o.speed);
		    
		    $.isFunction(o.complete) && !callback && o.complete(el, target);
		});
		
	    };
	};
	
	//  Autoplay functionality
	_.play = function() {
	    if(_.o.progress == true) {
		//Si on affiche une barre de progression, on met un intervalle court pour le raffraichissement
		_.t = setInterval(function() {
		    if(_.elapsed >= _.o.delay) {
			_.to(_.i + 1);
		    } else  {
			refreshProgressbar();
		    }
		    
		    _.elapsed += _.refreshRate;
		}, _.refreshRate);
	    } else {
		//Si on n'affiche pas de barre de progression, on met juste un intervalle pour passer au suivant
		_.t = setInterval(function() {
		    _.to(_.i + 1);
		}, _.o.delay | 0);
	    }
	};
	
	//  Stop autoplay
	_.stop = function() {
	    _.t = clearInterval(_.t);
	    return _;
	};
	
	//  Move to previous/next slide
	_.next = function() {
	    return _.stop().to(_.i + 1);
	};
	
	_.prev = function() {
	    return _.stop().to(_.i - 1);
	};
	
	//  Create dots and arrows
	function nav(name, html) {
	    if (name == 'dot') {
		html = '<div class="dots-wrapper surimposed"><div class="dots">';
		$.each(_.li, function(index) {
		    html += '<div class="' + (index == _.i ? name + ' active' : name) + '">&nbsp;</div>';// + ++index + '</div>';
		    ++index;
		});
		html += '</div></div>';
	    } else {
		html = '<div class="vertical-center arrows surimposed">';
		html = html /*+ name + 's">'*/ + '<div class ="' + name + ' prev">' + _.o.prev + '</div><div class="' + name + ' next">' + _.o.next + '</div></div>';
	    };
	    
	    _.el.addClass('has-' + name + 's').append(html).find('.' + name).click(function() {
		var me = $(this);
		me.hasClass('dot') ? _.stop().to(me.index()) : me.hasClass('prev') ? _.prev() : _.next();
	    });
	};
	
	//  Create progress bar (called at init)
	function progressbar() {
	    html = '<div class="progressbar"></div>';
	    _.el.addClass('has-progressbar').append(html);
	}
	
	//  Refresh progress bar (called on interval)
	function refreshProgressbar() {
	    var pbarWidth = (_.elapsed * 100) / _.o.delay;
	    _.el.find('.progressbar').width(pbarWidth + '%');
	}
	
	
	//  Init transitions 
	function transition() {
	    var transitionedElements = _.el.find(_.o.transitioned);
	    for(var i = 0, ii = transitionedElements.length; i < ii; i++) {
		transitionedElements[i].style.display = 'none';
	    }
	    jQuery(transitionedElements).fadeIn(_.o.speed);
	}
	
	/**
	 * Extract options from the wordpress stored format to this plugin format.
	 */
	function extractOptions(options, sliderId) {
	    return {
		speed: options[sliderId]["speed"]["speed"],
		delay: options[sliderId]["speed"]["delay"],
		dots: (options[sliderId]["nav"]["bullets"] == 1),
		arrows: (options[sliderId]["nav"]["arrows"] == 1),
		progress: (options[sliderId]["eyecandy"]["progressbar"]),
		transitioned: options[sliderId]["eyecandy"]["transitioned"]
	    };
	}
    };
    
    //  Create a jQuery plugin
    $.fn.unslider = function(o) {
	var len = this.length;
	
	//  Enable multiple-slider support
	return this.each(function(index) {
	    //  Cache a copy of $(this), so it
	    var me = $(this),
	    key = 'unslider' + (len > 1 ? '-' + ++index : ''),
	    instance = (new Unslider).init(me, o);
	    
	    //  Invoke an Unslider instance
	    me.data(key, instance).data('key', key);
	});
    };
    
    Unslider.version = "1.0.0";
})(jQuery, false);
