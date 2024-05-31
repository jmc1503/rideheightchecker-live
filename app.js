document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
    const themeParkContainer = document.getElementById('theme-park-container');
    const resultContainer = document.getElementById('result-container');
    const listViewBtn = document.getElementById('list-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const mapElement = document.getElementById('map');
    const modal = document.getElementById('modal');
    const rideInfoContainer = document.getElementById('ride-info');
    const closeModal = document.getElementsByClassName('close')[0];

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
            themeParkContainer.style.display = 'none'; // Hide theme park container
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
                    themeParkContainer.style.display = 'block'; // Show theme park container
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
                        item['Maximum Height'] >= height;
                });

                filteredRides.sort((a, b) => {
                    const aTotalRidesInPark = data.filter(ride => ride['Theme Park'] === a['Theme Park']).length;
                    const aAvailableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === a['Theme Park']).length;
                    const aPercentage = (aAvailableRidesInPark / aTotalRidesInPark) * 100;

                    const bTotalRidesInPark = data.filter(ride => ride['Theme Park'] === b['Theme Park']).length;
                    const bAvailableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === b['Theme Park']).length;
                    const bPercentage = (bAvailableRidesInPark / bTotalRidesInPark) * 100;

                    if (bPercentage === aPercentage) {
                        return a['Theme Park'].localeCompare(b['Theme Park']);
                    }

                    return bPercentage - aPercentage;
                });

                resultContainer.innerHTML = '';

                if (filteredRides.length > 0) {
                    const themeParks = [...new Set(filteredRides.map(item => item['Theme Park']))];

                    let parksWithPercentage = themeParks.map(park => {
                        const parkData = filteredRides.find(ride => ride['Theme Park'] === park);
                        const totalRidesInPark = data.filter(ride => ride['Theme Park'] === park).length;
                        const availableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === park).length;
                        const percentage = ((availableRidesInPark / totalRidesInPark) * 100).toFixed(0);
                        return { park, percentage: parseInt(percentage), parkData, filteredRides };
                    });

                    // Sort by percentage desc and then by park name asc
                    parksWithPercentage.sort((a, b) => b.percentage - a.percentage || a.park.localeCompare(b.park));

                    parksWithPercentage.forEach(({ park, percentage, parkData, filteredRides }) => {
                        const parkURL = parkData.URL;

                        const parkCard = document.createElement('div');
                        parkCard.classList.add('park-card');

                        const parkHeader = document.createElement('h3');
                        parkHeader.classList.add('park-header');
                        parkHeader.innerHTML = `${park}`;
                        parkCard.appendChild(parkHeader);

                        const parkInfo = document.createElement('p');
                        parkInfo.classList.add('park-info');
                        parkInfo.innerHTML = `${percentage}% of available rides<br>${parkURL ? `<a href="${parkURL}" target="_blank">Buy Tickets</a>` : ''}`;
                        parkCard.appendChild(parkInfo);

                        const moreInfoButton = document.createElement('button');
                        moreInfoButton.textContent = 'More Information';
                        moreInfoButton.addEventListener('click', () => {
                            showRideInfoModal(park, filteredRides.filter(ride => ride['Theme Park'] === park));
                        });
                        parkCard.appendChild(moreInfoButton);

                        resultContainer.appendChild(parkCard);
                    });

                    resultContainer.style.display = 'flex';
                } else {
                    resultContainer.textContent = 'No rides available for your height in this theme park.';
                    resultContainer.style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    });

    // Show ride info modal
    function showRideInfoModal(themePark, rides) {
        rideInfoContainer.innerHTML = `<h2>${themePark} Ride Information</h2>`;

        rides.forEach(ride => {
            const rideHeader = document.createElement('h4');
            rideHeader.textContent = `${ride.Ride}`;

            const minHeight = document.createElement('p');
            minHeight.textContent = `Minimum Height: ${ride['Minimum Height']} cm`;

            rideInfoContainer.appendChild(rideHeader);
            rideInfoContainer.appendChild(minHeight);
        });

        modal.style.display = 'block';
    }

    // Hide ride info modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
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
