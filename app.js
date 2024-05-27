document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
    const heightInput = document.getElementById('height');
    const parkForm = document.getElementById('park-form');

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
    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;

        // Clear theme park dropdown
        themeParkSelect.innerHTML = '';
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        themeParkSelect.appendChild(anyOption);

        // Fetch data based on selected country
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
    parkForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const height = parseInt(heightInput.value);
        const country = countrySelect.value;
        const themePark = themeParkSelect.value;

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

                const resultContainer = document.getElementById('result-container');
                resultContainer.innerHTML = '';

                if (filteredRides.length > 0) {
                    // Display filtered rides
                    filteredRides.forEach(ride => {
                        const rideItem = document.createElement('div');
                        rideItem.textContent = `${ride.Ride} at ${ride['Theme Park']}, ${ride.Country}`;
                        resultContainer.appendChild(rideItem);
                    });
                } else {
                    // No rides available message
                    resultContainer.textContent = 'No rides available for your criteria.';
                }

                // Show result container
                resultContainer.style.display = 'block';
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
});
