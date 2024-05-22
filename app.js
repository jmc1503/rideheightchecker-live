document.getElementById('park-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const height = parseInt(document.getElementById('height').value);
    const country = document.getElementById('country').value;

    // Simulated data for theme parks
    const themeParks = {
        'USA': ['Disneyland', 'Universal Studios'],
        'UK': ['Alton Towers', 'Thorpe Park']
        // Add more theme parks for other countries
    };

    const eligibleParks = themeParks[country].filter(park => canVisitPark(park, height));

    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = '';

    if (eligibleParks.length > 0) {
        const parkList = document.createElement('ul');
        eligibleParks.forEach(park => {
            const listItem = document.createElement('li');
            listItem.textContent = park;
            parkList.appendChild(listItem);
        });
        resultContainer.appendChild(parkList);
        resultContainer.style.display = 'block';
    } else {
        resultContainer.textContent = 'Sorry, there are no theme parks available for your height in this country.';
        resultContainer.style.display = 'block';
    }
});

function canVisitPark(park, height) {
    // Simulated height restrictions (in cm)
    const heightRestrictions = {
        'Disneyland': 100,
        'Universal Studios': 120,
        'Alton Towers': 130,
        'Thorpe Park': 140
        // Add more height restrictions for other theme parks
    };

    return height >= heightRestrictions[park];
}
