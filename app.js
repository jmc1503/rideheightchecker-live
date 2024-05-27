// Fetch data from JSON file
fetch('data.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Populate country dropdown
        const countrySelect = document.getElementById('country');
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        countrySelect.appendChild(anyOption);

        const countries = [...new Set(data.map(item => item.Country))];
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

// Handle country change event
document.getElementById('country').addEventListener('change', () => {
    const selectedCountry = document.getElementById('country').value;
    
    const themeParkSelect = document.getElementById('theme-park');
    themeParkSelect.innerHTML = '';
    const anyOption = document.createElement('option');
    anyOption.value = '';
    anyOption.textContent = 'Any';
    themeParkSelect.appendChild(anyOption);

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const filteredData = selectedCountry === '' ? data : data.filter(item => item.Country === selectedCountry);
            const themeParks = [...new Set(filteredData.map(item => item['Theme Park'] || 'Unknown'))];
            themeParks.forEach(themePark => {
                const option = document.createElement('option');
                option.value = themePark;
                option.textContent = themePark;
                themeParkSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});

// Handle form submission
document.getElementById('park-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const height = parseInt(document.getElementById('height').value);
    const country = document.getElementById('country').value;
    const themePark = document.getElementById('theme-park').value;
    
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            let filteredRides = data.filter(item => {
                return (country === '' || item.Country === country) &&
                       (themePark === '' || item['Theme Park'] === themePark) &&
                       item['Minimum Height'] <= height &&
                       item['Maximum Height'] >= height;
            });
            
            filteredRides.sort((a, b) => a.Ride.localeCompare(b.Ride));

            const resultContainer = document.getElementById('result-container');
            resultContainer.innerHTML = '';

            if (filteredRides.length > 0) {
                const themeParks = [...new Set(filteredRides.map(item => item['Theme Park']))];
                
                themeParks.forEach(park => {
                    const parkURL = filteredRides.find(ride => ride['Theme Park'] === park).URL;
                    const totalRidesInPark = data.filter(ride => ride['Theme Park'] === park).length;
                    const availableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === park).length;
                    const percentage = ((availableRidesInPark / totalRidesInPark) * 100).toFixed(2);
                    
                    const parkHeader = document.createElement('h3');
                    parkHeader.innerHTML = `${park} <a href="${parkURL}" target="_blank">Buy Tickets</a> (${percentage}% of rides available)`;
                    resultContainer.appendChild(parkHeader);

                    const heights = [...new Set(filteredRides.filter(ride => ride['Theme Park'] === park).map(ride => ride['Minimum Height']))];
                    heights.sort((a, b) => a - b);
                    
                    heights.forEach(height => {
                        const heightHeader = document.createElement('h4');
                        heightHeader.textContent = `Minimum Height: ${height} cm`;
                        resultContainer.appendChild(heightHeader);

                        const parkList = document.createElement('ul');
                        filteredRides.filter(ride => ride
