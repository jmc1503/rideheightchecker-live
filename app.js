document.addEventListener('DOMContentLoaded', function () {
    // Variables for the mobile default view
    const mobileDefaultView = document.getElementById('mobile-default-view');
    const findParkBtn = document.getElementById('find-park-btn');
    const mainContainer = document.querySelector('.main-container');

    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
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
    const mobileResetBtn = document.createElement('button');
    const paginationContainer = document.getElementById('pagination-container');

    const burgerMenuIcon = document.getElementById('burger-menu-icon');
    const burgerMenuModal = document.getElementById('burger-menu-modal');
    const closeBurgerMenuModal = document.getElementById('close-burger-menu-modal');

    mobileResetBtn.type = 'button';
    mobileResetBtn.className = 'reset-btn';
    mobileResetBtn.textContent = 'Reset';
    mobileParkForm.appendChild(mobileResetBtn);

    let map;
    let markers = [];
    let allData = [];
    let filteredRides = [];
    let currentPage = 1;
    const resultsPerPage = 15;

    mapContainer.style.display = 'none';

    // Show only the default view on mobile when the page loads
    if (window.innerWidth <= 768) {
        showDefaultView(); 
    }

    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            allData = data;

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

            populateThemeParkSelect(data);
            displayResults(data);
            populateMobileCountrySelect(data);
            loadRandomBackgroundImages(data);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    // Function to shuffle an array
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function loadRandomBackgroundImages(data) {
        const imageContainer = document.getElementById('background-image-container');
        const uniqueImages = [...new Set(data.map(item => item.Image))].filter(image => image);
        const shuffledImages = shuffleArray(uniqueImages).slice(0, 3); // Select 3 unique images
    
        shuffledImages.forEach(image => {
            const div = document.createElement('div');
            div.classList.add('background-image');
            div.style.backgroundImage = `url('${image}')`; // Set the background image from the Image field
            imageContainer.appendChild(div);
        });
    }

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

    parkForm.addEventListener('submit', function (event) {
        event.preventDefault();

        currentPage = 1;

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

    countrySelect.addEventListener('change', function () {
        const selectedCountry = countrySelect.value;
        const filteredData = selectedCountry ? allData.filter(item => item.Country === selectedCountry) : allData;
        populateThemeParkSelect(filteredData);
    });

    mobileParkForm.addEventListener('submit', function (event) {
        event.preventDefault();

        currentPage = 1;

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

        showResultsView(); 
    });

    findParkBtn.addEventListener('click', function () {
        showResultsView(); 
    });

    mobileCountrySelect.addEventListener('change', function () {
        const selectedCountry = mobileCountrySelect.value;
        const filteredData = selectedCountry ? allData.filter(item => item.Country === selectedCountry) : allData;
        populateMobileThemeParkSelect(filteredData);
    });

    mobileResetBtn.addEventListener('click', () => {
        mobileParkForm.reset();
        populateMobileThemeParkSelect(allData);
        displayResults(allData); 

        showResultsView(); 
    });

    // Add this before the event listener for listViewBtn
resetBtn.addEventListener('click', () => {
    parkForm.reset(); // Reset the form inputs
    populateThemeParkSelect(allData); // Repopulate the theme park dropdown with all options
    displayResults(allData); // Display all the results without any filters

    // Reset the view to list view
    resultContainer.style.display = 'grid';
    mapContainer.style.display = 'none';
    mapElement.style.display = 'none';
    listViewBtn.classList.add('active');
    listViewBtn.classList.remove('inactive');
    mapViewBtn.classList.add('inactive');
    mapViewBtn.classList.remove('active');

    adjustFooterPosition(); // Adjust footer position if necessary
});

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

        paginationContainer.style.display = 'none'; 

        if (!map) {
            map = L.map('map').setView([51.505, -0.09], 2);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 18
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
                const percentage = totalRidesInPark > 0 ? ((availableRidesInPark / totalRidesInPark) * 100).toFixed(0) : 0;
                return { park, percentage: parseInt(percentage), parkData, availableRides: availableRidesInPark };
            });
    
            parksWithPercentage.sort((a, b) => {
                if (a.parkData.Affiliated !== b.parkData.Affiliated) {
                    return b.parkData.Affiliated - a.parkData.Affiliated;
                }
                if (a.percentage !== b.percentage) {
                    return b.percentage - a.percentage;
                }
                return a.park.localeCompare(b.park);
            });
    
            const isMobile = window.innerWidth <= 768;
            const rows = isMobile ? 15 : 5;
            const columns = isMobile ? 1 : 3;
            const itemsPerPage = rows * columns;
    
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const paginatedParks = parksWithPercentage.slice(startIndex, endIndex);
    
            paginatedParks.forEach(({ park, percentage, parkData, availableRides }) => {
                if (availableRides > 0) {  // Ensure the card is only created for parks with available rides
                    const parkCard = createParkCard(park, percentage, parkData, data, availableRides);
                    resultContainer.appendChild(parkCard);
                }
            });
    
            if (parksWithPercentage.length > itemsPerPage) {
                createPaginationControls(parksWithPercentage.length, itemsPerPage);
                paginationContainer.style.display = 'block'; 
            } else {
                paginationContainer.style.display = 'none'; 
            }
    
            viewToggle.style.display = 'flex'; 
            resultContainer.style.display = 'grid';
            const container = document.querySelector('.container');
            if (container) {
                container.classList.add('results-shown');
            }
        } else {
            resultContainer.textContent = 'No rides available for your height in this theme park.';
            resultContainer.style.display = 'block';
            paginationContainer.style.display = 'none';
        }
    
        adjustFooterPosition(); 
    }
    

    function createParkCard(park, percentage, parkData, data, availableRides) {
        const parkURL = parkData.URL;
        const parkImage = parkData.Image || '';
        const countryEmoji = parkData.Flag || '';
        const city = parkData.City || '';
        const state = parkData.State || '';
    
        const parkCard = document.createElement('div');
        parkCard.classList.add('park-card');
    
        const imageContainer = document.createElement('div');
        imageContainer.classList.add('image-container');
    
        const flagIcon = document.createElement('div');
        flagIcon.classList.add('flag-icon', 'flag-icon-control');
        flagIcon.textContent = countryEmoji;
        imageContainer.appendChild(flagIcon);
    
        if (parkImage) {
            const parkImgElement = document.createElement('img');
            parkImgElement.src = parkImage;
            parkImgElement.classList.add('park-image');
            parkImgElement.alt = parkData.Alt || `${park} theme park in ${parkData.Country}`;
            parkImgElement.loading = 'lazy';
            imageContainer.appendChild(parkImgElement);
        }
    
        parkCard.appendChild(imageContainer);
    
        const parkInfoContainer = document.createElement('div');
        parkInfoContainer.classList.add('park-info-container');
    
        const parkTitleContainer = document.createElement('div');
        parkTitleContainer.classList.add('park-title-container');
        const parkTitle = document.createElement('h3');
        parkTitle.classList.add('park-title');
        parkTitle.textContent = park;
        parkTitleContainer.appendChild(parkTitle);
        parkInfoContainer.appendChild(parkTitleContainer);
    
        const parkLocationContainer = document.createElement('div');
        parkLocationContainer.classList.add('park-location-container');
        const parkLocation = document.createElement('p');
        parkLocation.classList.add('park-location');
        parkLocation.textContent = `${city}, ${state}`;
        parkLocationContainer.appendChild(parkLocation);
        parkInfoContainer.appendChild(parkLocationContainer);
    
        const parkAvailabilityContainer = document.createElement('div');
        parkAvailabilityContainer.classList.add('park-availability-container');
        const parkInfo = document.createElement('p');
        parkInfo.classList.add('park-info');
        parkInfo.innerHTML = `${percentage}% (${availableRides} rides) available`;
        parkAvailabilityContainer.appendChild(parkInfo);
        parkInfoContainer.appendChild(parkAvailabilityContainer);
    
        const actionContainer = document.createElement('div');
        actionContainer.classList.add('action-container');
    
        if (parkData.Affiliated === 1 && parkURL) {
            const buyTicketsBtn = document.createElement('button');
            buyTicketsBtn.classList.add('action-btn', 'buy-tickets-btn');
            buyTicketsBtn.innerHTML = '🎟️ Buy Tickets';
            buyTicketsBtn.onclick = () => window.open(parkURL, '_blank');
            actionContainer.appendChild(buyTicketsBtn);
        } else {
            const placeholder = document.createElement('div');
            placeholder.classList.add('action-btn', 'buy-tickets-btn');
            placeholder.style.visibility = 'hidden'; // Hide the placeholder without removing it from layout
            actionContainer.appendChild(placeholder);
        }
    
        const moreInfoLink = document.createElement('a');
        moreInfoLink.classList.add('more-info-link');
        moreInfoLink.href = '#';
        moreInfoLink.textContent = 'More Information';
        moreInfoLink.addEventListener('click', (event) => {
            event.preventDefault();
            showRideInfoModal(park, allData.filter(ride => ride['Theme Park'] === park));
        });
        actionContainer.appendChild(moreInfoLink);
    
        parkInfoContainer.appendChild(actionContainer);
        parkCard.appendChild(parkInfoContainer);
    
        return parkCard;
    }
    
    
    
    
    function adjustFontSize(element, maxFontSize, minFontSize) {
        const containerWidth = element.parentElement.clientWidth;
    
        let fontSize = maxFontSize;
        element.style.fontSize = fontSize + 'px';
    
        while (element.scrollWidth > containerWidth && fontSize > minFontSize) {
            fontSize -= 0.5; // Decrease by 0.5px for a smoother transition
            element.style.fontSize = fontSize + 'px';
        }
    }
    
    document.addEventListener('DOMContentLoaded', function () {
        const parkTitles = document.querySelectorAll('.park-title');
    
        parkTitles.forEach(title => {
            adjustFontSize(title, 15, 10); // Adjust the max and min font sizes as needed
        });
    });
    
    
    
    

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
        paginationContainer.style.display = 'block'; 
    }

    function showRideInfoModal(park, allRides) {
        const userHeight = parseInt(document.getElementById('height').value) || parseInt(document.getElementById('mobile-height').value);
        const heightProvided = !isNaN(userHeight); // Check if height is provided
    
        rideInfoContainer.innerHTML = ''; // Clear the container
    
        // Theme Park Name
        const parkNameElement = document.createElement('h3');
        parkNameElement.textContent = park;
        parkNameElement.classList.add('modal-park-name'); // Add class for custom styles
        rideInfoContainer.appendChild(parkNameElement);
    
        // Group rides by minimum height and sort alphabetically within each group
        let heights = [...new Set(allRides.map(ride => parseInt(ride['Minimum Height'])))];
        heights.sort((a, b) => a - b);
    
        heights.forEach(height => {
            const heightSection = document.createElement('div');
            heightSection.classList.add('modal-height-section'); // Add class for custom styles
    
            const heightTitle = document.createElement('h4');
            heightTitle.textContent = `Minimum Height: ${height} cm`;
            heightTitle.classList.add('modal-height-title'); // Add class for custom styles
            heightSection.appendChild(heightTitle);
    
            const rideList = document.createElement('ul');
            rideList.classList.add('modal-ride-list'); // Add class for custom styles
    
            // Show all rides for the current height group
            allRides.filter(ride => parseInt(ride['Minimum Height']) === height)
                .sort((a, b) => {
                    const nameA = a.Ride.toLowerCase().replace(/^the\s+/i, '');
                    const nameB = b.Ride.toLowerCase().replace(/^the\s+/i, '');
                    return nameA.localeCompare(nameB);
                })
                .forEach(ride => {
                    const rideItem = document.createElement('li');
                    rideItem.textContent = ride.Ride;
    
                    // Determine if the ride is available based on user's height
                    if (!heightProvided || (userHeight >= ride['Minimum Height'] && userHeight <= ride['Maximum Height'])) {
                        rideItem.classList.add('available-ride'); // Available - green
                    } else {
                        rideItem.classList.add('unavailable-ride'); // Unavailable - red
                    }
    
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

    window.addEventListener('resize', adjustFooterPosition);

    function showDefaultView() {
        mobileDefaultView.style.display = 'block'; 
        mobileFilterBtn.style.display = 'none'; 
        resultContainer.style.display = 'none'; 
        paginationContainer.style.display = 'none';
        mainContainer.style.display = 'none'; // Hide the main container
    }

    function showResultsView() {
        mobileDefaultView.style.display = 'none';
        mobileFilterBtn.style.display = 'block';
        resultContainer.style.display = 'block';
        paginationContainer.style.display = 'block';
        mainContainer.style.display = 'block'; // Show the main container
    }
});

function adjustFooterPosition() {
    const footer = document.getElementById('footer');
    const resultContainer = document.getElementById('result-container');
    const containerHeight = resultContainer.scrollHeight;
    const windowHeight = window.innerHeight;

    if (containerHeight + 100 > windowHeight) { 
        footer.style.position = 'relative';
    } else {
        footer.style.position = 'fixed'; 
        footer.style.bottom = '0';
        footer.style.width = '100%';
    }

    function adjustFontSize(element, maxFontSize, minFontSize) {
        const containerWidth = element.parentElement.clientWidth;
        let fontSize = maxFontSize;
        element.style.fontSize = fontSize + 'px';

        while (element.scrollWidth > containerWidth && fontSize > minFontSize) {
            fontSize -= 0.5; // Decrease by 0.5px for a smoother transition
            element.style.fontSize = fontSize + 'px';
        }
    }

    const parkTitles = document.querySelectorAll('.park-title');
    parkTitles.forEach(title => {
        if (title.textContent.trim() === 'Legoland Discovery Centre Manchester' || 
            title.textContent.trim() === 'Legoland Discovery Centre Birmingham') {
            adjustFontSize(title, 15, 10); // Adjust between 15px and 10px
        }
    });
    
    // Ensure this runs after everything is loaded
    window.addEventListener('load', () => {
        parkTitles.forEach(title => {
            adjustFontSize(title, 15, 10); // Adjust again in case the first attempt didn't apply
        });
    });
}
