/**
 * @param {string} url
 */
function navigateToPage(url) {
  console.log('Navigating to ' + url);
  $('#spaContainer').html('');
  $.ajax({
    url: url,
    cache: false,
    async: true
  }).done(function (html) {
    $('#spaContainer').html(html);
    componentHandler.upgradeDom();
  }).fail(function (jqXHR) {
    $('#spaContainer').html(jqXHR.responseText);
    componentHandler.upgradeDom();
  });
}

if ("onhashchange" in window) {
  window.onhashchange = function () {
    hashChanged(window.location.hash);
  }
} else {
  var storedHash = window.location.hash;
  window.setInterval(function () {
    if (window.location.hash !== storedHash) {
      storedHash = window.location.hash;
      hashChanged(storedHash);
    }
  }, 100);
}

hashChanged(window.location.hash);
