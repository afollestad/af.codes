(function () {
    // Keep the experience shortcut inert when its target is not present.
    var btn = document.getElementById('scroll-to-experience');
    var section = document.getElementById('experience');
    if (!btn || !section) return;

    btn.addEventListener('click', function () {
        section.scrollIntoView({ behavior: 'smooth' });
    });
})();
