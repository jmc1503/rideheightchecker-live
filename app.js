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

                filteredRides.sort((a, b) => a.Ride.localeCompare(b.Ride));

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
                        parkHeader.innerHTML = `${park} - ${percentage}% of available rides`;
                        parkCard.appendChild(parkHeader);

                        if (parkURL) {
                            const buyTicketsLink = document.createElement('a');
                            buyTicketsLink.href = parkURL;
                            buyTicketsLink.target = '_blank';
                            buyTicketsLink.textContent = 'Buy Tickets';
                            parkCard.appendChild(buyTicketsLink);
                            parkCard.appendChild(document.createElement('br'));
                        }

                        const moreInfoBtn = document.createElement('button');
                        moreInfoBtn.textContent = 'More Information';
                        moreInfoBtn.classList.add('more-info-btn');
                        moreInfoBtn.addEventListener('click', () => {
                            showRideInfoModal(park, filteredRides.filter(ride => ride['Theme Park'] === park));
                        });
                        parkCard.appendChild(moreInfoBtn);

                        resultContainer.appendChild(parkCard);
                    });

                    viewToggle.style.display = 'flex'; // Show view toggle buttons
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

    function showRideInfoModal(park, rides) {
        rideInfoContainer.innerHTML = `<h3>${park}</h3>`;
        let heights = [...new Set(rides.map(ride => ride['Minimum Height']))];
        heights.sort((a, b) => a - b);

        heights.forEach(height => {
            const heightHeader = document.createElement('h4');
            heightHeader.textContent = `Minimum Height: ${height} cm`;
            rideInfoContainer.appendChild(heightHeader);

            const rideList = document.createElement('ul');
            rides.filter(ride => ride['Minimum Height'] === height).forEach(ride => {
                const listItem = document.createElement('li');
                listItem.textContent = ride.Ride;
                rideList.appendChild(listItem);
            });
            rideInfoContainer.appendChild(rideList);
        });

        modal.style.display = 'block';
    }

    // Hide modal on close
    closeModal.onclick = function() {
        modal.style.display = 'none';
    }

    // Hide modal when clicking outside of it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

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
