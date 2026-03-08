(function () {
    var fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric', month: 'numeric', day: 'numeric'
    });
    var parts = Object.fromEntries(
        fmt.formatToParts(new Date()).map(function (p) { return [p.type, +p.value]; })
    );
    var birthYear = 1995, birthMonth = 7, birthDay = 28;
    var years = parts.year - birthYear;
    if (parts.month < birthMonth || (parts.month === birthMonth && parts.day < birthDay)) {
        years--;
    }
    var ageSpans = document.getElementsByClassName('age');
    for (var i = 0; i < ageSpans.length; i++) {
        ageSpans[i].innerText = years;
    }
})();
