// Fetch data from JSON file
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        // Populate country dropdown
        const countrySelect = document.getElementById('country');
        const countries = [...new Set(data.map(item => item.Country))];
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });

        // Handle country change event
        countrySelect.addEventListener('change', () => {
            const selectedCountry = countrySelect.value;
            const themeParkSelect = document.getElementById('theme-park');
            themeParkSelect.innerHTML = '';
            const themeParks = [...new Set(data.filter(item => item.Country === selectedCountry).map(item => item['Theme Park']))];
            themeParks.forEach(themePark => {
                const option = document.createElement('option');
                option.value = themePark;
                option.textContent = themePark;
                themeParkSelect.appendChild(option);
            });
        });
    });

// Handle form submission
document.getElementById('park-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const height = parseInt(document.getElementById('height').value);
    const country = document.getElementById('country').value;
    const themePark = document.getElementById('theme-park').value;

    // Fetch data from JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Filter rides based on country and theme park
            const filteredRides = data.filter(item => item.Country === country && item['Theme Park'] === themePark);
            
            const resultContainer = document.getElementById('result-container');
            resultContainer.innerHTML = '';

            if (filteredRides.length > 0) {
                const parkList = document.createElement('ul');
                filteredRides.forEach(ride => {
                    // Check if height is within range
                    if (height >= ride['Minimum Height'] && height <= ride['Maximum Height']) {
                        const listItem = document.createElement('li');
                        listItem.textContent = ride.Ride;
                        parkList.appendChild(listItem);
                    }
                });
                resultContainer.appendChild(parkList);
                resultContainer.style.display = 'block';
            } else {
                resultContainer.textContent = 'Sorry, no rides available for your height in this theme park.';
                resultContainer.style.display = 'block';
            }
        });
});
