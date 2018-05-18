function init_readme() {
    
    $('#next').off();
    $('#prev').off();
    
    $(document).ready(function () {
        // options
        var speed = 500; //transition speed - fade
        var autoswitch = false; //auto slider options
        var autoswitch_speed = 5000; //auto slider speed

        // // add first initial active class
        if (readme == true) {
            $(".slide").last().addClass("active");
            readme = false;
        }
        // // hide all slides
        $(".slide").hide;

        // // show only active class slide
        $(".slide active").show();

        // Next Event Handler
        $('#next').on('click', nextSlide);// call function nextSlide

        // Prev Event Handler
        $('#prev').on('click', prevSlide);// call function prevSlide

        // Auto Slider Handler
        // if (autoswitch == true) {
        //     setInterval(nextSlide, autoswitch_speed);// call function and value 4000
        // }

        // Switch to next slide
        // var a = ["step1.jpg", "step2.jpg", "step3.jpg", "step4.jpg", "step5.jpg"];

        function nextSlide() {

            // var src = path.basename($("#steps").attr("src"));
            // var idx = a.indexOf(src);
            // $("#steps").attr("src", "imgs/" + a[++idx]);


            $('.active').removeClass('active').addClass('oldActive');;
            if ($('.oldActive').is(':last-child')) {
                $('.slide').first().addClass('active');
            } else {
                $('.oldActive').next().addClass('active');
            }
            $('.oldActive').removeClass('oldActive');
            $('.slide').fadeOut(speed);
            $('.active').fadeIn(speed);

        }

        // Switch to prev slide
        function prevSlide() {
            // var src = path.basename($("#steps").attr("src"));
            // var idx = a.indexOf(src);
            // $("#steps").attr("src", "imgs/" + a[--idx]);

            $('.active').removeClass('active').addClass('oldActive');
            if ($('.oldActive').is(':first-child')) {
                $('.slide').last().addClass('active');
            } else {
                $('.oldActive').prev().addClass('active');
            }
            $('.oldActive').removeClass('oldActive');
            $('.slide').fadeOut(speed);
            $('.active').fadeIn(speed);
        }
    });
}