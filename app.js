document.addEventListener('DOMContentLoaded', function () {
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

    const burgerMenuIcon = document.getElementById('burger-menu-icon');
    const burgerMenuModal = document.getElementById('burger-menu-modal');
    const closeBurgerMenuModal = document.getElementById('close-burger-menu-modal');

    mobileResetBtn.type = 'button';
    mobileResetBtn.className = 'reset-btn';
    mobileResetBtn.textContent = 'Reset';
    mobileParkForm.appendChild(mobileResetBtn);

    let map;
    let markers = [];
    let allData = []; // Store all data for later use
    let filteredRides = []; // Store filtered data
    let currentPage = 1; // Track the current page
    // Set default values for rows and columns
    let desktopRows = 5;
    let desktopColumns = 3;
    let mobileRows = 15; // Mobile will just show one column with 15 items per page
    const resultsPerPage = 15;

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
    parkForm.addEventListener('submit', function (event) {
        event.preventDefault();

        currentPage = 1; // Reset to the first page when a new filter is applied

        const height = parseInt(document.getElementById('height').value);
        const country = countrySelect.value;
        const themePark = themeParkSelect.value;

        filteredRides = allData.filter(item => {
            return (country === '' || item.Country === country) &&
                (themePark === '' || item['Theme Park'] === themePark) &&
                item['Minimum Height'] <= height &&
                item['Maximum Height'] >= height;
        });

        displayResults(filteredRides);
    });

    // Handle country change event to filter theme parks
    countrySelect.addEventListener('change', function () {
        const selectedCountry = countrySelect.value;
        const filteredData = selectedCountry ? allData.filter(item => item.Country === selectedCountry) : allData;
        populateThemeParkSelect(filteredData);
    });

    // Handle mobile form submission
    mobileParkForm.addEventListener('submit', function (event) {
        event.preventDefault();

        currentPage = 1; // Reset to the first page when a new filter is applied

        const height = parseInt(mobileHeightInput.value);
        const country = mobileCountrySelect.value;
        const themePark = mobileThemeParkSelect.value;

        filteredRides = allData.filter(item => {
            return (country === '' || item.Country === country) &&
                (themePark === '' || item['Theme Park'] === themePark) &&
                item['Minimum Height'] <= height &&
                item['Maximum Height'] >= height;
        });

        filterModal.classList.remove('show');
        displayResults(filteredRides);
    });

    // Handle mobile country change event to filter theme parks
    mobileCountrySelect.addEventListener('change', function () {
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
    
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.style.display = 'none'; // Hide pagination when map view is selected
    
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
    
            // Sort by affiliated status, then by percentage of rides available, then alphabetically by park name
            parksWithPercentage.sort((a, b) => {
                if (a.parkData.Affiliated !== b.parkData.Affiliated) {
                    return b.parkData.Affiliated - a.parkData.Affiliated;
                }
                if (a.percentage !== b.percentage) {
                    return b.percentage - a.percentage;
                }
                return a.park.localeCompare(b.park);
            });
    
            // Determine number of columns based on screen width
            const isMobile = window.innerWidth <= 768;
            const rows = isMobile ? 15 : 5;
            const columns = isMobile ? 1 : 3;
            const itemsPerPage = rows * columns;
    
            // Pagination logic
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedParks = parksWithPercentage.slice(startIndex, endIndex);
    
            paginatedParks.forEach(({ park, percentage, parkData }) => {
                const parkCard = createParkCard(park, percentage, parkData, data);
                resultContainer.appendChild(parkCard);
            });
    
            // Ensure equal-sized rows and fill remaining space with empty cards
            const numCards = resultContainer.children.length;
            const numEmptyCards = (columns - (numCards % columns)) % columns;
            for (let i = 0; i < numEmptyCards; i++) {
                const emptyCard = document.createElement('div');
                emptyCard.classList.add('park-card', 'empty-card');
                resultContainer.appendChild(emptyCard);
            }
    
            // Show pagination controls only if there are multiple pages
            const paginationContainer = document.getElementById('pagination-container');
            if (parksWithPercentage.length > itemsPerPage) {
                createPaginationControls(parksWithPercentage.length, itemsPerPage);
                paginationContainer.style.display = 'block'; // Show pagination
            } else {
                paginationContainer.style.display = 'none'; // Hide pagination if not needed
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
    
        adjustFooterPosition(); // Adjust footer position after displaying results
    }

    function createParkCard(park, percentage, parkData, data) {
        const parkURL = parkData.URL;
        const parkImage = parkData.Image || '';
        const countryEmoji = parkData.Flag || '';

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

        if (parkData.Affiliated === 1 && parkURL) {
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
        return parkCard;
    }

    function createPaginationControls(totalResults, itemsPerPage) {
        const totalPages = Math.ceil(totalResults / itemsPerPage);
        const paginationContainer = document.getElementById('pagination-container');
        paginationContainer.innerHTML = '';
    
        const paginationList = document.createElement('ul');
        paginationList.classList.add('pagination-list');
    
        function createPageLink(page) {
            const pageItem = document.createElement('li');
            pageItem.classList.add('pagination-item');
            const pageLink = document.createElement('button');
            pageLink.textContent = page;
            pageLink.classList.add('pagination-link');
            if (page === currentPage) {
                pageLink.classList.add('active');
            }
            pageLink.addEventListener('click', () => {
                currentPage = page;
                displayResults(filteredRides.length > 0 ? filteredRides : allData);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
            pageItem.appendChild(pageLink);
            return pageItem;
        }
    
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                paginationList.appendChild(createPageLink(i));
            }
        } else {
            paginationList.appendChild(createPageLink(1));
            if (currentPage > 3) {
                const ellipsis = document.createElement('li');
                ellipsis.textContent = '...';
                paginationList.appendChild(ellipsis);
            }
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);
            for (let i = startPage; i <= endPage; i++) {
                paginationList.appendChild(createPageLink(i));
            }
            if (currentPage < totalPages - 2) {
                const ellipsis = document.createElement('li');
                ellipsis.textContent = '...';
                paginationList.appendChild(ellipsis);
            }
            paginationList.appendChild(createPageLink(totalPages));
        }
    
        paginationContainer.appendChild(paginationList);
        paginationContainer.style.display = 'block';  // Ensure the pagination container is shown
    }

    function showRideInfoModal(park, rides) {
        rideInfoContainer.innerHTML = `<h3>${park}</h3>`;
        let heights = [...new Set(rides.map(ride => parseInt(ride['Minimum Height'])))]; // Ensure heights are integers
        heights.sort((a, b) => a - b);

        heights.forEach(height => {
            const heightSection = document.createElement('div');
            heightSection.innerHTML = `<h4>Minimum Height: ${height} cm</h4>`;
            const rideList = document.createElement('ul');
            rides.filter(ride => parseInt(ride['Minimum Height']) === height)
                .sort((a, b) => {
                    const nameA = a.Ride.toLowerCase().replace(/^the\s+/i, '');
                    const nameB = b.Ride.toLowerCase().replace(/^the\s+/i, '');
                    return nameA.localeCompare(nameB);
                })
                .forEach(ride => {
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

    // Burger menu logic
    burgerMenuIcon.addEventListener('click', () => {
        burgerMenuModal.style.display = 'block';
    });

    closeBurgerMenuModal.addEventListener('click', () => {
        burgerMenuModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === burgerMenuModal) {
            burgerMenuModal.style.display = 'none';
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

    // Adjust footer position on window resize
    window.addEventListener('resize', adjustFooterPosition);
});

function adjustFooterPosition() {
    const footer = document.getElementById('footer');
    const resultContainer = document.getElementById('result-container');
    const containerHeight = resultContainer.scrollHeight;
    const windowHeight = window.innerHeight;

    if (containerHeight + 100 > windowHeight) { // Check if content height is greater than window height
        footer.style.position = 'relative'; // Use relative positioning if content is taller
    } else {
        footer.style.position = 'fixed'; // Fix footer to bottom if content is shorter
        footer.style.bottom = '0';
        footer.style.width = '100%';
    }
}
