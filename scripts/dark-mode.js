// If `prefers-color-scheme` is not supported, fall back to light mode.
// In this case, index-light.css will be downloaded with `highest` priority.
if (window.matchMedia('(prefers-color-scheme)').media === 'not all') {
    // console.log('Themes not supported, falling back to light theme.');
    document.documentElement.style.display = 'none';
    document.head.insertAdjacentHTML(
        'beforeend',
        '<link rel="stylesheet" href="styles/index-light.css" onload="document.documentElement.style.display = ``">'
    );
}

var themeColor = null;
if (window.matchMedia('(prefers-color-scheme: dark)').matches == true) {
    // console.log('Dark mode is enabled.');
    themeColor = '#1565c0';
} else {
    // console.log('Dark mode is disabled.');
    themeColor = '#039be5';
}

document.head.insertAdjacentHTML(
    'beforeend',
    '<meta content="' + themeColor + '" name="theme-color">'
);