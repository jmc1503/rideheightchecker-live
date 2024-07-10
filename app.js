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
    const closeModal = modal.querySelector('.close');
    const resetBtn = document.querySelector('.reset-btn');
    const parkForm = document.getElementById('park-form');
    const mapContainer = document.getElementById('map-container');

    const mobileFilterBtn = document.getElementById('mobile-filter-btn');
    const filterModal = document.getElementById('filter-modal');
    const mobileParkForm = document.getElementById('mobile-park-form');
    const mobileCloseModal = filterModal.querySelector('.close');
    const mobileCountrySelect = document.getElementById('mobile-country');
    const mobileThemeParkSelect = document.getElementById('mobile-theme-park');
    const mobileHeightInput = document.getElementById('mobile-height');
    const mobileResetBtn = document.createElement('button'); // Create reset button for mobile

    mobileResetBtn.type = 'button';
    mobileResetBtn.className = 'reset-btn';
    mobileResetBtn.textContent = 'Reset';
    mobileParkForm.appendChild(mobileResetBtn);

    let map;
    let markers = [];
    let allData = [];

    const countryEmojiMap = {
        "United States": "🇺🇸",
        "United Kingdom": "🇬🇧",
        "France": "🇫🇷",
        "Germany": "🇩🇪",
        "Denmark": "🇩🇰",
        "Canada": "🇨🇦",
        "Costa Rica": "🇨🇷"
        "Åland Islands": "🇦🇽"
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

            // Populate mobile country dropdown
            populateMobileCountrySelect(data);
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

    function populateMobileCountrySelect(data) {
        mobileCountrySelect.innerHTML = '';
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        mobileCountrySelect.appendChild(anyOption);

        const countries = [...new Set(data.map(item => item.Country))].sort();
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            mobileCountrySelect.appendChild(option);
        });
    }

    function populateMobileThemeParkSelect(data) {
        mobileThemeParkSelect.innerHTML = '';
        const anyOption = document.createElement('option');
        anyOption.value = '';
        anyOption.textContent = 'Any';
        mobileThemeParkSelect.appendChild(anyOption);

        const themeParks = [...new Set(data.filter(item => item.Active === 1).map(item => item['Theme Park']))].sort();
        themeParks.forEach(themePark => {
            const option = document.createElement('option');
            option.value = themePark;
            option.textContent = themePark;
            mobileThemeParkSelect.appendChild(option);
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

    // Handle mobile form submission
    mobileParkForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const height = parseInt(mobileHeightInput.value);
        const country = mobileCountrySelect.value;
        const themePark = mobileThemeParkSelect.value;

        let filteredRides = allData.filter(item => {
            return (country === '' || item.Country === country) &&
                (themePark === '' || item['Theme Park'] === themePark) &&
                item['Minimum Height'] <= height &&
                item['Maximum Height'] >= height;
        });

        filterModal.classList.remove('show');
        displayResults(filteredRides);
    });

    // Handle mobile country change event to filter theme parks
    mobileCountrySelect.addEventListener('change', function() {
        const selectedCountry = mobileCountrySelect.value;
        const filteredData = selectedCountry ? allData.filter(item => item.Country === selectedCountry) : allData;
        populateMobileThemeParkSelect(filteredData);
    });

    // Handle reset button click
    resetBtn.addEventListener('click', () => {
        parkForm.reset();
        listViewBtn.click(); // Simulate list view button click
        displayResults(allData); // Display all theme parks again
        window.scrollTo(0, 0); // Scroll to top after reset
    });

    // Handle mobile reset button click
    mobileResetBtn.addEventListener('click', () => {
        mobileParkForm.reset();
        populateMobileThemeParkSelect(allData);
        displayResults(allData); // Display all theme parks again
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
                    parkImgElement.alt = parkData.Alt || `${park} theme park in ${parkData.Country}`;
                    parkImgElement.loading = 'lazy';
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
            const container = document.querySelector('.container');
            if (container) {
                container.classList.add('results-shown'); // Expand container
            }
        } else {
            resultContainer.textContent = 'No rides available for your height in this theme park.';
            resultContainer.style.display = 'block';
        }
    }
    

    function showRideInfoModal(park, rides) {
        rideInfoContainer.innerHTML = `<h3>${park}</h3>`;
        let heights = [...new Set(rides.map(ride => parseInt(ride['Minimum Height'])))]; // Ensure heights are integers
        heights.sort((a, b) => a - b);

        heights.forEach(height => {
            const heightSection = document.createElement('div');
            heightSection.innerHTML = `<h4>Minimum Height: ${height} cm</h4>`;
            const rideList = document.createElement('ul');
            rides.filter(ride => parseInt(ride['Minimum Height']) === height).forEach(ride => {
                const rideItem = document.createElement('li');
                rideItem.textContent = ride.Ride;
                rideList.appendChild(rideItem);
            });
            heightSection.appendChild(rideList);
            rideInfoContainer.appendChild(heightSection);
        });

        modal.style.display = 'block';
    }

    closeModal.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === modal || event.target === filterModal) {
            modal.style.display = 'none';
            filterModal.classList.remove('show');
        }
    };

    // Mobile filter modal logic
    mobileFilterBtn.addEventListener('click', () => {
        filterModal.classList.add('show');
    });

    mobileCloseModal.addEventListener('click', () => {
        filterModal.classList.remove('show');
    });

    window.addEventListener('click', (event) => {
        if (event.target === filterModal) {
            filterModal.classList.remove('show');
        }
    });

    // Ensure list and map views work for mobile
    const mobileListViewBtn = document.createElement('button');
    mobileListViewBtn.classList.add('view-toggle', 'mobile-only');
    mobileListViewBtn.innerHTML = 'List View';
    mobileListViewBtn.addEventListener('click', () => {
        resultContainer.style.display = 'grid';
        mapContainer.style.display = 'none';
        mapElement.style.display = 'none';
        mobileListViewBtn.classList.add('active');
        mobileListViewBtn.classList.remove('inactive');
        mapViewBtn.classList.add('inactive');
        mapViewBtn.classList.remove('active');
    });

    const mobileMapViewBtn = document.createElement('button');
    mobileMapViewBtn.classList.add('view-toggle', 'mobile-only');
    mobileMapViewBtn.innerHTML = 'Map View';
    mobileMapViewBtn.addEventListener('click', () => {
        resultContainer.style.display = 'none';
        mapContainer.style.display = 'block';
        mapElement.style.display = 'block';
        mobileMapViewBtn.classList.add('active');
        mobileMapViewBtn.classList.remove('inactive');
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

        const height = parseInt(mobileHeightInput.value);
        const country = mobileCountrySelect.value;
        const themePark = mobileThemeParkSelect.value;

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

    filterModal.querySelector('.view-toggle').appendChild(mobileListViewBtn);
    filterModal.querySelector('.view-toggle').appendChild(mobileMapViewBtn);
});
