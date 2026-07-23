(function () {
    var btn = document.getElementById('overview-return');
    if (!btn) return;

    var threshold = 400;

    function update() {
        if (window.scrollY > threshold) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', update, { passive: true });
    update();

    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
