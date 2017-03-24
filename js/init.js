$(document).ready(function () {
    $(".button-collapse").sideNav();

    $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false,
            hover: false,
            gutter: -18,
            belowOrigin: true // Displays dropdown below the button
        }
    );
});