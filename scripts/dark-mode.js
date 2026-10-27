(function () {
    var darkSheet = document.getElementById('theme-dark');
    var lightSheet = document.getElementById('theme-light');

    // localStorage throws in Safari private mode and with blocked storage. This
    // script runs synchronously in <head>, so an uncaught throw would leave the
    // page unthemed.
    function readStored() {
        try {
            return localStorage.getItem('theme');
        } catch (e) {
            return null;
        }
    }

    function writeStored(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            /* preference is lost on reload, but the toggle still works */
        }
    }

    var stored = readStored();

    function getActiveTheme() {
        if (stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyThemeColor(theme) {
        // Both theme-color metas are media-scoped, so an override has to
        // overwrite each of them; whichever one the browser picks must agree.
        var themeColor = theme === 'dark' ? '#0a0f1d' : '#f6f8fc';
        var metas = document.querySelectorAll('meta[name="theme-color"]');
        for (var i = 0; i < metas.length; i++) {
            metas[i].content = themeColor;
        }
    }

    // Themed images are a <picture> whose dark <source> is media-scoped like the
    // stylesheets, so an override has to flip it the same way. Runs against
    // whatever is parsed so far — in <head> that is nothing, and the
    // DOMContentLoaded pass below picks them up.
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

    var currentTheme = getActiveTheme();

    // Without a stored override the stylesheets, the picture sources, and the
    // theme-color metas are all media-scoped, so the browser follows the OS on
    // its own — including live appearance changes. Only an override needs
    // applying here.
    if (stored) {
        applyTheme(currentTheme);
    }

    document.addEventListener('DOMContentLoaded', function () {
        // The <picture> elements didn't exist when an override was applied above.
        if (stored) {
            applyPictures(currentTheme);
        }

        var toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        // Pressed means dark mode is active.
        function syncPressed() {
            toggle.setAttribute('aria-pressed', String(currentTheme === 'dark'));
        }

        syncPressed();

        toggle.addEventListener('click', function () {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            stored = currentTheme;
            writeStored(currentTheme);
            applyTheme(currentTheme);
            syncPressed();
        });

        // With no stored override the media-scoped stylesheets and picture
        // sources follow OS appearance changes on their own, but currentTheme
        // (with it the toggle's next-click direction and aria-pressed) would go
        // stale.
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (stored) return;
            currentTheme = e.matches ? 'dark' : 'light';
            syncPressed();
        });
    });
})();
