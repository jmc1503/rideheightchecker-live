document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
    const themeParkContainer = document.getElementById('theme-park-container');
    const resultContainer = document.getElementById('result-container');
    const listViewBtn = document.getElementById('list-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const mapElement = document.getElementById('map');
    const viewToggle = document.querySelector('.view-toggle');
    const modal = document.getElementById('modal');
    const rideInfoContainer = document.getElementById('ride-info');
    const closeModal = document.getElementsByClassName('close')[0];
    const resetBtn = document.querySelector('.reset-btn');
    const parkForm = document.getElementById('park-form');

    let map;
    let markers = [];

    // Fetch data from JSON file
    function fetchData() {
        return fetch('data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    // Populate country dropdown
    function populateCountryDropdown(data) {
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
    }

    // Handle country change event
    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        themeParkSelect.innerHTML = '';
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        themeParkSelect.appendChild(anyOption);

        if (selectedCountry === '') {
            themeParkContainer.style.display = 'none'; // Hide theme park container
        } else {
            fetchData()
                .then(data => {
                    const filteredData = selectedCountry === '' ? data : data.filter(item => item.Country === selectedCountry);
                    const themeParks = [...new Set(filteredData.map(item => item['Theme Park'] || 'Unknown'))];
                    themeParks.forEach(themePark => {
                        const option = document.createElement('option');
                        option.value = themePark;
                        option.textContent = themePark;
                        themeParkSelect.appendChild(option);
                    });
                    themeParkContainer.style.display = 'block'; // Show theme park container
                });
        }
    });

    // Handle form submission
    parkForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent the default form submission behavior

        const height = parseInt(document.getElementById('height').value);
        const country = countrySelect.value;
        const themePark = themeParkSelect.value;

        fetchData()
            .then(data => {
                let filteredRides = data.filter(item => {
                    return (country === '' || item.Country === country) &&
                        (themePark === '' || item['Theme Park'] === themePark) &&
                        item['Minimum Height'] <= height &&
                        item['Maximum Height'] >= height;
                });

                // Display filtered rides
                displayFilteredRides(filteredRides);
            });
    });

    // Function to display filtered rides
    function displayFilteredRides(filteredRides) {
        resultContainer.innerHTML = '';

        if (filteredRides.length > 0) {
            // Display rides
            filteredRides.forEach(ride => {
                const rideCard = document.createElement('div');
                rideCard.textContent = ride.Ride; // Example: Display ride name
                resultContainer.appendChild(rideCard);
            });
        } else {
            resultContainer.textContent = 'No rides available for your criteria.';
        }
    }

    // Other code remains unchanged...
    // Handle view toggling
    listViewBtn.addEventListener('click', () => {
        listViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
        resultContainer.style.display = 'block';
        mapElement.style.display = 'none';
    });

    mapViewBtn.addEventListener('click', () => {
        mapViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        resultContainer.style.display = 'none';
        mapElement.style.display = 'block';

        if (!map) {
            map = L.map('map').setView([51.505, -0.09], 2);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap'
            }).addTo(map);
        }

        markers.forEach(marker => {
            map.removeLayer(marker);
        });

        markers = [];

        fetchData()
            .then(data => {
                const height = parseInt(document.getElementById('height').value);
                const country = countrySelect.value;
                const themePark = themeParkSelect.value;

                let filteredRides = data.filter(item => {
                    return (country === '' || item.Country === country) &&
                        (themePark === '' || item['Theme Park'] === themePark) &&
                        item['Minimum Height'] <= height &&
                        item['Maximum Height'] >= height;
                });

                const themeParks = [...new Set(filteredRides.map(item => item['Theme Park']))];

                themeParks.forEach(park => {
                    const parkData = data.find(item => item['Theme Park'] === park);
                    if (parkData) {
                        const totalRidesInPark = data.filter(ride => ride['Theme Park'] === park).length;
                        const availableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === park).length;
                        const percentage = ((availableRidesInPark / totalRidesInPark) * 100).toFixed(0);

                        const marker = L.marker([parkData.Latitude, parkData.Longitude]).addTo(map);
                        marker.bindPopup(`<b>${park}</b><br>${parkData.Country}<br>${percentage}% of rides available`).openPopup();
                        markers.push(marker);
                    }
                });
            });
    });

    // Handle reset button click
    resetBtn.addEventListener('click', () => {
        parkForm.reset();
        themeParkContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        viewToggle.style.display = 'none';
        document.querySelector('.container').classList.remove('results-shown'); // Contract container
    });
});
