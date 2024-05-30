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
            themeParkSelect.classList.add('hidden'); // Hide theme park dropdown
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
                    themeParkSelect.classList.remove('hidden'); // Show theme park dropdown
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
                        item['Maximum Height'] >= height
                        );
                });

                filteredRides.sort((a, b) => {
                    const percentageA = ((filteredRides.filter(ride => ride['Theme Park'] === a['Theme Park']).length) / (data.filter(ride => ride['Theme Park'] === a['Theme Park']).length) * 100);
                    const percentageB = ((filteredRides.filter(ride => ride['Theme Park'] === b['Theme Park']).length) / (data.filter(ride => ride['Theme Park'] === b['Theme Park']).length) * 100);
                    return percentageB - percentageA || a['Theme Park'].localeCompare(b['Theme Park']);
                });

                resultContainer.innerHTML = '';

                if (filteredRides.length > 0) {
                    filteredRides.forEach(park => {
                        const parkCard = document.createElement('div');
                        parkCard.classList.add('card');

                        const parkHeader = document.createElement('h3');
                        parkHeader.innerHTML = `${park['Theme Park']} - ${((filteredRides.filter(ride => ride['Theme Park'] === park['Theme Park']).length) / (data.filter(ride => ride['Theme Park'] === park['Theme Park']).length) * 100).toFixed(0)}% of available rides`;
                        parkCard.appendChild(parkHeader);

                        if (park['URL']) {
                            const parkLink = document.createElement('a');
                            parkLink.href = park['URL'];
                            parkLink.target = '_blank';
                            parkLink.textContent = 'Buy Tickets';
                            parkCard.appendChild(parkLink);
                        }

                        const moreInfoBtn = document.createElement('button');
                        moreInfoBtn.textContent = 'More Information';
                        moreInfoBtn.addEventListener('click', () => {
                            // Toggle visibility of ride information
                            const rideInfo = parkCard.querySelector('.ride-info');
                            rideInfo.classList.toggle('hidden');
                            moreInfoBtn.textContent = rideInfo.classList.contains('hidden') ? 'More Information' : 'Less Information';
                        });
                        parkCard.appendChild(moreInfoBtn);

                        const rideInfo = document.createElement('div');
                        rideInfo.classList.add('ride-info', 'hidden');

                        const heights = [...new Set(filteredRides.filter(ride => ride['Theme Park'] === park['Theme Park']).map(ride => ride['Minimum Height']))];
                        heights.sort((a, b) => a - b);

                        heights.forEach(height => {
                            const heightHeader = document.createElement('h4');
                            heightHeader.textContent = `Minimum Height: ${height} cm`;
                            rideInfo.appendChild(heightHeader);

                            const parkList = document.createElement('ul');
                            filteredRides.filter(ride => ride['Theme Park'] === park['Theme Park'] && ride['Minimum Height'] === height).forEach(ride => {
                                const listItem = document.createElement('li');
                                listItem.textContent = ride.Ride;
                                parkList.appendChild(listItem);
                            });
                            rideInfo.appendChild(parkList);
                        });

                        parkCard.appendChild(rideInfo);

                        resultContainer.appendChild(parkCard);
                    });
                } else {
                    resultContainer.textContent = 'No rides available for your height in this theme park.';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });

    // Handle view toggling
    listViewBtn.addEventListener('click', () => {
        resultContainer.style.display = 'flex';
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
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });
});

