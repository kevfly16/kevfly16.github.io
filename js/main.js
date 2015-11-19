jQuery(document).ready(function(){
	var intro = $('.cd-intro-block'),
		projectsContainer = $('.cd-projects-wrapper'),
		projectsSlider = projectsContainer.children('.cd-slider'),
		singleProjectContent = null,
		sliderNav = $('.cd-slider-navigation');

	var resizing = false;
	
	//if on desktop - set a width for the projectsSlider element
	setSliderContainer();
	$(window).on('resize', function(){
		//on resize - update projectsSlider width and translate value
		if( !resizing ) {
			(!window.requestAnimationFrame) ? setSliderContainer() : window.requestAnimationFrame(setSliderContainer);
			resizing = true;
		}
	});

	//show the projects slider if user clicks the show-projects button
	intro.on('click', 'a[data-action="show-projects"]', function(event) {
		event.preventDefault();
		intro.addClass('projects-visible');
		projectsContainer.addClass('projects-visible');
		//animate single project - entrance animation
		setTimeout(function(){
			showProjectPreview(projectsSlider.children('li').eq(0));
		}, 200);
	});

	intro.on('click', function(event) {
		//projects slider is visible - hide slider and show the intro panel
		if( intro.hasClass('projects-visible') && !$(event.target).is('a[data-action="show-projects"]') ) {
			intro.removeClass('projects-visible');
			projectsContainer.removeClass('projects-visible');
		}
	});

	//select a single project - open project-content panel
	projectsContainer.on('click', '.cd-slider a', function(event) {
		var mq = checkMQ();
		event.preventDefault();
		if( $(this).parent('li').next('li').is('.current') && (mq == 'desktop') ) {
			prevSides(projectsSlider);
		} else if ( $(this).parent('li').prev('li').prev('li').prev('li').is('.current')  && (mq == 'desktop') ) {
			nextSides(projectsSlider);
		} else {
			singleProjectContent = $("#" + $(this).data("project"));
			singleProjectContent.addClass('is-visible');
			$(".resume-div").load("Resume.htm");
  		$(".cover-div").load("Cover.htm");
  		$(".user-div").load("User.htm");
			singleProjectContent.on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', 
	   		function() {
	      	singleProjectContent.hide().show(0);
	      });
			
			//close single project content
			singleProjectContent.on('click', '.close', function(event){
				event.preventDefault();
				singleProjectContent.removeClass('is-visible');
			});
		}
	});

	//go to next/pre slide - clicking on the next/prev arrow
	sliderNav.on('click', '.next', function(){
		nextSides(projectsSlider);
	});
	sliderNav.on('click', '.prev', function(){
		prevSides(projectsSlider);
	});

	//go to next/pre slide - keyboard navigation
	$(document).keyup(function(event){
		var mq = checkMQ();
		if(event.which=='37' &&  intro.hasClass('projects-visible') && !(sliderNav.find('.prev').hasClass('inactive')) && (mq == 'desktop') ) {
			prevSides(projectsSlider);
		} else if( event.which=='39' &&  intro.hasClass('projects-visible') && !(sliderNav.find('.next').hasClass('inactive')) && (mq == 'desktop') ) {
			nextSides(projectsSlider);
		} else if(event.which=='27' && singleProjectContent.hasClass('is-visible')) {
			singleProjectContent.removeClass('is-visible');
		}
	});

	projectsSlider.on('swipeleft', function(){
		var mq = checkMQ();
		if( !(sliderNav.find('.next').hasClass('inactive')) && (mq == 'desktop') ) nextSides(projectsSlider);
	});

	projectsSlider.on('swiperight', function(){
		var mq = checkMQ();
		if ( !(sliderNav.find('.prev').hasClass('inactive')) && (mq == 'desktop') ) prevSides(projectsSlider);
	});

	function showProjectPreview(project) {
		if(project.length > 0 ) {
			setTimeout(function(){
				project.addClass('slides-in');
				showProjectPreview(project.next());
			}, 50);
		}
	}

	function checkMQ() {
		//check if mobile or desktop device
		return window.getComputedStyle(document.querySelector('.cd-projects-wrapper'), '::before').getPropertyValue('content').replace(/'/g, "").replace(/"/g, "");
	}

	function setSliderContainer() {
		var mq = checkMQ();
		if(mq == 'desktop') {
			var	slides = projectsSlider.children('li'),
				slideWidth = slides.eq(0).width(),
				marginLeft = Number(projectsSlider.children('li').eq(1).css('margin-left').replace('px', '')),
				sliderWidth = ( slideWidth + marginLeft )*( slides.length + 1 ) + 'px',
				slideCurrentIndex = projectsSlider.children('li.current').index();
			projectsSlider.css('width', sliderWidth);
			( slideCurrentIndex != 0 ) && setTranslateValue(projectsSlider, (  slideCurrentIndex * (slideWidth + marginLeft) + 'px'));
		} else {
			projectsSlider.css('width', '');
			setTranslateValue(projectsSlider, 0);
		}
		resizing = false;
	}

	function nextSides(slider) {
		var actual = slider.children('.current'),
			index = actual.index(),
			following = actual.nextAll('li').length,
			width = actual.width(),
			marginLeft = Number(slider.children('li').eq(1).css('margin-left').replace('px', ''));

		index = (following > 4 ) ? index + 3 : index + following - 2;
		//calculate the translate value of the slider container
		translate = index * (width + marginLeft) + 'px';

		slider.addClass('next');
		setTranslateValue(slider, translate);
		slider.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
			updateSlider('next', actual, slider, following);
		});

		if( $('.no-csstransitions').length > 0 ) updateSlider('next', actual, slider, following);
	}

	function prevSides(slider) {
		var actual = slider.children('.previous'),
			index = actual.index(),
			width = actual.width(),
			marginLeft = Number(slider.children('li').eq(1).css('margin-left').replace('px', ''));

		translate = index * (width + marginLeft) + 'px';

		slider.addClass('prev');
		setTranslateValue(slider, translate);
		slider.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
			updateSlider('prev', actual, slider);
		});

		if( $('.no-csstransitions').length > 0 ) updateSlider('prev', actual, slider);
	}

	function updateSlider(direction, actual, slider, numerFollowing) {
		if( direction == 'next' ) {
			
			slider.removeClass('next').find('.previous').removeClass('previous');
			actual.removeClass('current');
			if( numerFollowing > 4 ) {
				actual.addClass('previous').next('li').next('li').next('li').addClass('current');
			} else if ( numerFollowing == 4 ) {
				actual.next('li').next('li').addClass('current').prev('li').prev('li').addClass('previous');
			} else {
				actual.next('li').addClass('current').end().addClass('previous');
			}
		} else {
			
			slider.removeClass('prev').find('.current').removeClass('current');
			actual.removeClass('previous').addClass('current');
			if(actual.prevAll('li').length > 2 ) {
				actual.prev('li').prev('li').prev('li').addClass('previous');
			} else {
				( !slider.children('li').eq(0).hasClass('current') ) && slider.children('li').eq(0).addClass('previous');
			}
		}
		
		updateNavigation();
	}

	function updateNavigation() {
		//update visibility of next/prev buttons according to the visible slides
		var current = projectsContainer.find('li.current');
		(current.is(':first-child')) ? sliderNav.find('.prev').addClass('inactive') : sliderNav.find('.prev').removeClass('inactive');
		(current.nextAll('li').length < 3 ) ? sliderNav.find('.next').addClass('inactive') : sliderNav.find('.next').removeClass('inactive');
	}

	function setTranslateValue(item, translate) {
		item.css({
		    '-moz-transform': 'translateX(-' + translate + ')',
		    '-webkit-transform': 'translateX(-' + translate + ')',
			'-ms-transform': 'translateX(-' + translate + ')',
			'-o-transform': 'translateX(-' + translate + ')',
			'transform': 'translateX(-' + translate + ')',
		});
	}

	var initPhotoSwipeFromDOM = function(gallerySelector) {

    // parse slide data (url, title, size ...) from DOM elements 
    // (children of gallerySelector)
    var parseThumbnailElements = function(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for(var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes 
            if(figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if(figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML; 
            }

            if(linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            } 

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };

    // find nearest parent element
    var closest = function closest(el, fn) {
        return el && ( fn(el) ? el : closest(el.parentNode, fn) );
    };

    // triggers when user clicks on thumbnail
    var onThumbnailsClick = function(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if(!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if(childNodes[i].nodeType !== 1) { 
                continue; 
            }

            if(childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if(index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe( index, clickedGallery );
        }
        return false;
    };

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    var photoswipeParseHash = function() {
        var hash = window.location.hash.substring(1),
        params = {};

        if(hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if(!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');  
            if(pair.length < 2) {
                continue;
            }           
            params[pair[0]] = pair[1];
        }

        if(params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        return params;
    };

    var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            gallery,
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),

            getThumbBoundsFn: function(index) {
                // See Options -> getThumbBoundsFn section of documentation for more info
                var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                    pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                    rect = thumbnail.getBoundingClientRect(); 

                return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
            }

        };

        // PhotoSwipe opened from URL
        if(fromURL) {
            if(options.galleryPIDs) {
                // parse real index when custom PIDs are used 
                // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
                for(var j = 0; j < items.length; j++) {
                    if(items[j].pid == index) {
                        options.index = j;
                        break;
                    }
                }
            } else {
                // in URL indexes start from 1
                options.index = parseInt(index, 10) - 1;
            }
        } else {
            options.index = parseInt(index, 10);
        }

        // exit if index not found
        if( isNaN(options.index) ) {
            return;
        }

        if(disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();
    };

    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll( gallerySelector );

    for(var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i+1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if(hashData.pid && hashData.gid) {
        openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
    }
};

// execute above function
initPhotoSwipeFromDOM('.gallery');
});
