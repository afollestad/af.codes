var i = 0;

// Fill in my age
const now = moment(new Date()).tz('America/Los_Angeles');
const end = moment("1995-07-28").tz('America/Los_Angeles'); // birth date
const duration = moment.duration(now.diff(end));
const years = parseInt(duration.asYears());
const ageSpans = document.getElementsByClassName('age');
for (i = 0; i < ageSpans.length; i++) {
    ageSpans[i].innerText = years;
}

// Fill in GitHub star counts
const starSpans = document.getElementsByClassName('stars');
for (i = 0; i < starSpans.length; i++) {
    const currentSpan = starSpans[i];
    const repo = currentSpan.getAttribute('repo');

    // Default value
    currentSpan.innerHTML = `Check it out <a href="https://github.com/afollestad/${repo}" target="_blank">on GitHub</a>`;

    fetch(`https://api.github.com/repos/afollestad/${repo}`, {
        mode: 'no-cors',
        cache: 'no-cache',
        referrerPolicy: 'no-referrer'
    })
        .then(data => data.json())
        .then(json => {
            const starGazers = numberWithCommas(json.stargazers_count);
            // console.log(`Stargazers for ${repo}: ${starGazers}`);
            currentSpan.innerHTML = `Currently has <strong>${starGazers}</strong> stars <a href="https://github.com/afollestad/${repo}" target="_blank">on GitHub</a>`;
        })
        .catch(err => console.log(`Failed to get stars for ${repo}: ${err}`));
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
