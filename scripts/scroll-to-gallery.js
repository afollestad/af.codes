(function () {
    // Keep the gallery shortcut inert when its target is not present.
    var btn = document.getElementById('scroll-to-gallery');
    var section = document.getElementById('recent-shots');
    if (!btn || !section) return;

    btn.addEventListener('click', function () {
        section.scrollIntoView({ behavior: 'smooth' });
    });
})();
