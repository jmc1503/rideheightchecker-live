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
    parkForm.addEventListener('submit', function(event) {
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

                // Sort filtered rides by URL presence, percentage, and park name
                filteredRides.sort((a, b) => {
                    const aTotalRidesInPark = data.filter(ride => ride['Theme Park'] === a['Theme Park']).length;
                    const aAvailableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === a['Theme Park']).length;
                    const aPercentage = (aAvailableRidesInPark / aTotalRidesInPark) * 100;

                    const bTotalRidesInPark = data.filter(ride => ride['Theme Park'] === b['Theme Park']).length;
                    const bAvailableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === b['Theme Park']).length;
                    const bPercentage = (bAvailableRidesInPark / bTotalRidesInPark) * 100;

                    if (bPercentage === aPercentage) {
                        if (b.URL && !a.URL) return 1;
                        if (!b.URL && a.URL) return -1;
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

                    // Sort by percentage desc, then by URL presence, and then by park name asc
                    parksWithPercentage.sort((a, b) => {
                        if (a.percentage === b.percentage) {
                            if (b.parkData.URL && !a.parkData.URL) return 1;
                            if (!b.parkData.URL && a.parkData.URL) return -1;
                            return a.park.localeCompare(b.park);
                        }
                        return b.percentage - a.percentage;
                    });

                    parksWithPercentage.forEach(({ park, percentage, parkData, filteredRides }) => {
                        const parkURL = parkData.URL;
                        const parkImage = parkData.Image || '';

                        const parkCard = document.createElement('div');
                        parkCard.classList.add('park-card');

                        const parkHeader = document.createElement('h3');
                        parkHeader.innerHTML = `${park}`;
                        parkHeader.style.textAlign = 'center'; // Center the park name
                        parkHeader.style.fontWeight = 'bold'; // Make the park name bold
                        parkCard.appendChild(parkHeader);

                        const parkInfo = document.createElement('p');
                        parkInfo.classList.add('park-info');
                        parkInfo.innerHTML = `${percentage}% of available rides`;
                        parkInfo.style.textAlign = 'center'; // Center the percentage text
                        parkCard.appendChild(parkInfo);

                        if (parkImage) {
                            const parkImgElement = document.createElement('img');
                            parkImgElement.src = parkImage;
                            parkImgElement.classList.add('park-image');
                            parkCard.appendChild(parkImgElement);
                        }

                        const actionContainer = document.createElement('div');
                        actionContainer.classList.add('action-container');

                        const accommodationBtn = document.createElement('button');
                        accommodationBtn.classList.add('accommodation-btn');
                        accommodationBtn.innerHTML = 'Find Nearby Accommodation';
                        accommodationBtn.onclick = (event) => handleAccommodationBtnClick(event, parkData);
                        actionContainer.appendChild(accommodationBtn);

                        if (parkURL) {
                            const buyTicketsBtn = document.createElement('button');
                            buyTicketsBtn.classList.add('action-btn');
                            buyTicketsBtn.innerHTML = '🎟️ Buy Tickets';
                            buyTicketsBtn.onclick = () => window.open(parkURL, '_blank');
                            actionContainer.appendChild(buyTicketsBtn);
                        }

                        const moreInfoBtn = document.createElement('div');
                        moreInfoBtn.textContent = 'More Information';
                        moreInfoBtn.classList.add('more-info-btn');
                        moreInfoBtn.addEventListener('click', () => {
                            showRideInfoModal(park, filteredRides.filter(ride => ride['Theme Park'] === park));
                        });
                        actionContainer.appendChild(moreInfoBtn);

                        parkCard.appendChild(actionContainer);
                        resultContainer.appendChild(parkCard);
                    });

                    // Ensure 4 cards per row with equal size
                    const numCards = resultContainer.children.length;
                    const numEmptyCards = (4 - (numCards % 4)) % 4;
                    for (let i = 0; i < numEmptyCards; i++) {
                        const emptyCard = document.createElement('div');
                        emptyCard.classList.add('park-card', 'empty-card');
                        resultContainer.appendChild(emptyCard);
                    }

                    viewToggle.style.display = 'flex'; // Show view toggle buttons
                    resultContainer.style.display = 'flex';
                    document.querySelector('.container').classList.add('results-shown'); // Expand container
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
        listViewBtn.classList.add('active');
        mapViewBtn.classList.remove('active');
        listViewBtn.classList.remove('inactive');
        mapViewBtn.classList.add('inactive');
    });

    mapViewBtn.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        mapElement.style.display = 'block';
        mapViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
        mapViewBtn.classList.remove('inactive');
        listViewBtn.classList.add('inactive');

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

    // Handle reset button click
    resetBtn.addEventListener('click', () => {
        parkForm.reset();
        themeParkContainer.style.display = 'none';
        resultContainer.style.display = 'none';
        viewToggle.style.display = 'none';
        document.querySelector('.container').classList.remove('results-shown'); // Contract container

        if (map) {
            mapElement.style.display = 'none';
        }
    });

    // Function to create Booking.com search URL
    function createBookingUrl(lat, lon) {
        return `https://www.booking.com/searchresults.html?ss=&latitude=${lat}&longitude=${lon}&radius=5`;
    }

    // Function to handle button click for finding nearby accommodation
    function handleAccommodationBtnClick(event, parkData) {
        const lat = parkData.Latitude;
        const lon = parkData.Longitude;
        if (lat && lon) {
            const url = createBookingUrl(lat, lon);
            window.open(url, '_blank');
        } else {
            alert("Coordinates not available for this theme park.");
        }
    }
});
