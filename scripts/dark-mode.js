(function () {
    var darkSheet = document.getElementById('theme-dark');
    var lightSheet = document.getElementById('theme-light');
    var stored = localStorage.getItem('theme');

    function getActiveTheme() {
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Themed images are a <picture> whose dark <source> is media-scoped like the
    // stylesheets, so an override has to flip it the same way.
    function applyPictures(theme) {
        var sources = document.querySelectorAll('picture source[data-theme]');
        for (var i = 0; i < sources.length; i++) {
            sources[i].media = sources[i].getAttribute('data-theme') === theme ? 'all' : 'not all';
        }
    }

    function applyTheme(theme) {
        if (theme === 'dark') {
            darkSheet.media = 'all';
            lightSheet.media = 'not all';
        } else {
            lightSheet.media = 'all';
            darkSheet.media = 'not all';
        }
        applyThemeColor(theme);
        applyPictures(theme);
    }

    function restoreSystemDefault() {
        darkSheet.media = '(prefers-color-scheme: dark)';
        lightSheet.media = '(prefers-color-scheme: no-preference), (prefers-color-scheme: light)';
        applyThemeColor(getActiveTheme());
    }

    function applyThemeColor(theme) {
        var themeColor = theme === 'dark' ? '#00279d' : '#039be5';
        var meta = document.querySelector('meta[name="theme-color"]');
        if (meta) {
            meta.content = themeColor;
        } else {
            document.head.insertAdjacentHTML(
                'beforeend',
                '<meta content="' + themeColor + '" name="theme-color">'
            );
        }
    }

    var currentTheme = getActiveTheme();

    if (stored) {
        applyTheme(currentTheme);
    } else {
        applyThemeColor(currentTheme);
    }

    document.addEventListener('DOMContentLoaded', function () {
        // The <picture> elements weren't parsed yet when an override was applied in <head>.
        if (stored) {
            applyPictures(currentTheme);
        }

        var toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        toggle.addEventListener('click', function () {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', currentTheme);
            stored = currentTheme;
            applyTheme(currentTheme);
        });
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!stored) {
            currentTheme = e.matches ? 'dark' : 'light';
            applyThemeColor(currentTheme);
        }
    });
})();
