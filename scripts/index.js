var i = 0;

// Fill in my age
const now = moment(new Date()).tz('America/Chicago');
const end = moment("1995-07-28").tz('America/Chicago'); // birth date
const duration = moment.duration(now.diff(end));
const years = parseInt(duration.asYears());
const ageSpans = document.getElementsByClassName('age');
for (i = 0; i < ageSpans.length; i++) {
    ageSpans[i].innerText = years;
}
