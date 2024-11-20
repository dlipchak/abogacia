jQuery(function($) {
    // First, force initial animation immediately
    $('.swiper-wrapper').find('[data-animate]').each(function() {
        const element = $(this);
        const animationType = element.attr('data-animate');
        const delay = parseInt(element.attr('data-delay')) || 0;
        
        // Remove any existing classes
        element.removeClass('animated ' + animationType);
        
        // Force animation
        setTimeout(() => {
            element.addClass('animated ' + animationType);
        }, delay);
    });

    // Then initialize Swiper
    const swiperParent = new Swiper('.swiper-parent', {
        direction: 'horizontal',
        loop: true,
        speed: 650,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false
        },
        
        navigation: {
            nextEl: '.slider-arrow-right',
            prevEl: '.slider-arrow-left'
        },
        
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },

        on: {
            slideChangeTransitionStart: function() {
                $('.swiper-slide').find('[data-animate]').each(function() {
                    const element = $(this);
                    element.removeClass('animated ' + element.attr('data-animate'));
                });
            },
            
            slideChangeTransitionEnd: function() {
                $('.swiper-slide-active').find('[data-animate]').each(function() {
                    const element = $(this);
                    const animationType = element.attr('data-animate');
                    const delay = parseInt(element.attr('data-delay')) || 0;
                    
                    setTimeout(() => {
                        element.addClass('animated ' + animationType);
                    }, delay);
                });
            }
        }
    });
});