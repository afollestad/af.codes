var i = 0;

const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: 'numeric', day: 'numeric'
});
const parts = Object.fromEntries(
    fmt.formatToParts(new Date()).map(p => [p.type, +p.value])
);
const birthYear = 1995, birthMonth = 7, birthDay = 28;
let years = parts.year - birthYear;
if (parts.month < birthMonth || (parts.month === birthMonth && parts.day < birthDay)) {
    years--;
}
const ageSpans = document.getElementsByClassName('age');
for (i = 0; i < ageSpans.length; i++) {
    ageSpans[i].innerText = years;
}
