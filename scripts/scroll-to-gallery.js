(function () {
    var btn = document.getElementById('scroll-to-gallery');
    var section = document.getElementById('recent-shots');
    if (!btn || !section) return;

    btn.addEventListener('click', function () {
        section.scrollIntoView({ behavior: 'smooth' });
    });
})();
