document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
    const resultContainer = document.getElementById('result-container');
    const listViewBtn = document.getElementById('list-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const mapElement = document.getElementById('map');

    let map;
    let markers = [];

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
    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        themeParkSelect.innerHTML = '';
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        themeParkSelect.appendChild(anyOption);

        if (selectedCountry === '') {
            themeParkSelect.style.display = 'none'; // Hide theme park dropdown
        } else {
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
                    themeParkSelect.style.display = 'block'; // Show theme park dropdown
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    });

    // Handle form submission
    document.getElementById('park-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const height = parseInt(document.getElementById('height').value);
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
                        item['Maximum Height'] >= height &&
                        item['Active'] === 1; // Include only rides where Active = 1
                });

                // Sort filtered rides by ride name
                filteredRides.sort((a, b) => a.Ride.localeCompare(b.Ride));

                // Clear result container before adding new content
                resultContainer.innerHTML = '';

                if (filteredRides.length > 0) {
                    // Display rides for each theme park
                    const themeParks = [...new Set(filteredRides.map(item => item['Theme Park']))];
                    themeParks.forEach(park => {
                        const parkURL = filteredRides.find(ride => ride['Theme Park'] === park).URL;
                        const parkContainer = document.createElement('div');
                        parkContainer.classList.add('park-container');

                        // Park header with "More Info" link
                        const parkHeader = document.createElement('h3');
                        parkHeader.innerHTML = `<span class="park-name">${park}</span> - <a href="${parkURL}" target="_blank" class="buy-tickets-link">Buy Tickets</a>`;
                        parkHeader.addEventListener('click', function() {
                            const ridesContainer = parkContainer.querySelector('.rides-container');
                            ridesContainer.classList.toggle('expanded');
                        });
                        parkContainer.appendChild(parkHeader);

                        // Rides list
                        const ridesContainer = document.createElement('div');
                        ridesContainer.classList.add('rides-container');
                        filteredRides.filter(ride => ride['Theme Park'] === park).forEach(ride => {
                            const rideItem = document.createElement('div');
                            rideItem.textContent = ride.Ride;
                            ridesContainer.appendChild(rideItem);
                        });
                        parkContainer.appendChild(ridesContainer);

                        resultContainer.appendChild(parkContainer);
                    });
                } else {
                    // Display message if no rides found
                    resultContainer.textContent = 'No rides available for your height in this theme park.';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });

    // Handle view toggling
    listViewBtn.addEventListener('click', () => {
        resultContainer.style.display = 'block';
        mapElement.style.display = 'none';
    });

    mapViewBtn.addEventListener('click', () => {
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

        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                const height = parseInt(document.getElementById('height').value);
                const country = countrySelect.value;
                const themePark = themeParkSelect.value;

                let filteredRides = data.filter(item => {
                    return (country === '' || item.Country === country) &&
                        (themePark === '' || item['Theme Park'] === themePark) &&
                        item['Minimum Height'] <= height &&
                        item['Maximum Height'] >= height &&
                        item['Active'] === 1; // Include only rides where Active = 1
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
                   
