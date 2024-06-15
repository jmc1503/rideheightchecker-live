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
    const mapContainer = document.getElementById('map-container');

    let map;
    let markers = [];
    let allData = [];

    const countryEmojiMap = {
        "United States": "🇺🇸",
        "United Kingdom": "🇬🇧",
        "France": "🇫🇷",
        "Germany": "🇩🇪",
        "Denmark": "🇩🇰"
        // Add more mappings as needed
    };

    // Hide map container by default
    mapContainer.style.display = 'none';

    // Fetch data from JSON file
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allData = data; // Store all data for later use

            // Populate country dropdown
            const anyOption = document.createElement('option');
            anyOption.value = '';
            anyOption.textContent = 'Any';
            countrySelect.appendChild(anyOption);

            const countries = [...new Set(data.map(item => item.Country))].sort();
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                countrySelect.appendChild(option);
            });

            // Populate theme park dropdown
            populateThemeParkSelect(data);
            
            displayResults(data); // Display all theme parks initially
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    function populateThemeParkSelect(data) {
        themeParkSelect.innerHTML = '';
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        themeParkSelect.appendChild(anyOption);

        const themeParks = [...new Set(data.filter(item => item.Active === 1).map(item => item['Theme Park']))].sort();
        themeParks.forEach(themePark => {
            const option = document.createElement('option');
            option.value = themePark;
            option.textContent = themePark;
            themeParkSelect.appendChild(option);
        });
    }

    // Handle form submission
    parkForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const height = parseInt(document.getElementById('height').value);
        const country = countrySelect.value;
        const themePark = themeParkSelect.value;

        let filteredRides = allData.filter(item => {
            return (country === '' || item.Country === country) &&
                (themePark === '' || item['Theme Park'] === themePark) &&
                item['Minimum Height'] <= height &&
                item['Maximum Height'] >= height;
        });

        displayResults(filteredRides);
    });

    // Handle country change event to filter theme parks
    countrySelect.addEventListener('change', function() {
        const selectedCountry = countrySelect.value;
        const filteredData = selectedCountry ? allData.filter(item => item.Country === selectedCountry) : allData;
        populateThemeParkSelect(filteredData);
    });

    // Handle reset button click
    resetBtn.addEventListener('click', () => {
        parkForm.reset();
        listViewBtn.click(); // Simulate list view button click
        displayResults(allData); // Display all theme parks again
        window.scrollTo(0, 0); // Scroll to top after reset
    });

    // Handle view toggling
    listViewBtn.addEventListener('click', () => {
        resultContainer.style.display = 'grid';
        mapContainer.style.display = 'none';
        mapElement.style.display = 'none';
        listViewBtn.classList.add('active');
        listViewBtn.classList.remove('inactive');
        mapViewBtn.classList.add('inactive');
        mapViewBtn.classList.remove('active');
    });

    mapViewBtn.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        mapContainer.style.display = 'block';
        mapElement.style.display = 'block';
        mapViewBtn.classList.add('active');
        mapViewBtn.classList.remove('inactive');
        listViewBtn.classList.add('inactive');
        listViewBtn.classList.remove('active');

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

        const height = parseInt(document.getElementById('height').value);
        const country = countrySelect.value;
        const themePark = themeParkSelect.value;

        let filteredRides = allData.filter(item => {
            return (country === '' || item.Country === country) &&
                (themePark === '' || item['Theme Park'] === themePark) &&
                item['Minimum Height'] <= height &&
                item['Maximum Height'] >= height;
        });

        const themeParks = [...new Set(filteredRides.map(item => item['Theme Park']))];

        themeParks.forEach(park => {
            const parkData = allData.find(item => item['Theme Park'] === park);
            if (parkData) {
                const totalRidesInPark = allData.filter(ride => ride['Theme Park'] === park).length;
                const availableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === park).length;
                const percentage = ((availableRidesInPark / totalRidesInPark) * 100).toFixed(0);

                const marker = L.marker([parkData.Latitude, parkData.Longitude]).addTo(map);
                marker.bindPopup(`<b>${park}</b><br>${parkData.Country}<br>${percentage}% of rides available`).openPopup();
                markers.push(marker);
            }
        });

        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    });

    // Display results
    function displayResults(data) {
        resultContainer.innerHTML = '';

        if (data.length > 0) {
            const themeParks = [...new Set(data.map(item => item['Theme Park']))];

            let parksWithPercentage = themeParks.map(park => {
                const parkData = data.find(ride => ride['Theme Park'] === park);
                const totalRidesInPark = allData.filter(ride => ride['Theme Park'] === park).length;
                const availableRidesInPark = data.filter(ride => ride['Theme Park'] === park).length;
                const percentage = ((availableRidesInPark / totalRidesInPark) * 100).toFixed(0);
                return { park, percentage: parseInt(percentage), parkData, data };
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

            parksWithPercentage.forEach(({ park, percentage, parkData, data }) => {
                const parkURL = parkData.URL;
                const parkImage = parkData.Image || '';
                const countryEmoji = countryEmojiMap[parkData.Country] || '';

                const parkCard = document.createElement('div');
                parkCard.classList.add('park-card');

                const flagIcon = document.createElement('div');
                flagIcon.classList.add('flag-icon');
                flagIcon.textContent = countryEmoji;
                parkCard.appendChild(flagIcon);

                const parkHeader = document.createElement('h3');
                parkHeader.innerHTML = `${park}`;
                parkCard.appendChild(parkHeader);

                const parkInfo = document.createElement('p');
                parkInfo.classList.add('park-info');
                parkInfo.innerHTML = `${percentage}% of rides available`;
                parkCard.appendChild(parkInfo);

                if (parkImage) {
                    const parkImgElement = document.createElement('img');
                    parkImgElement.src = parkImage;
                    parkImgElement.classList.add('park-image');
                    parkCard.appendChild(parkImgElement);
                }

                const actionContainer = document.createElement('div');
                actionContainer.classList.add('action-container');

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
                    showRideInfoModal(park, data.filter(ride => ride['Theme Park'] === park));
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
            resultContainer.style.display = 'grid';
            document.querySelector('.container').classList.add('results-shown'); // Expand container
        } else {
            resultContainer.textContent = 'No rides available for your height in this theme park.';
            resultContainer.style.display = 'block';
        }
    }

    function showRideInfoModal(park, rides) {
        rideInfoContainer.innerHTML = `<h3>${park}</h3>`;
        let heights = [...new Set(rides.map(ride => ride['Minimum Height']))];
        heights.sort((a, b) => a - b);

        heights.forEach(height => {
            const heightHeader = document.createElement('h4');
            heightHeader.textContent = `Minimum Height: ${height} cm`;
            rideInfoContainer.appendChild(heightHeader);

            const rideList = document.createElement('ul');
            // Filter and sort rides alphabetically by ride name
            rides.filter(ride => ride['Minimum Height'] === height)
                .sort((a, b) => a.Ride.localeCompare(b.Ride))
                .forEach(ride => {
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
});
