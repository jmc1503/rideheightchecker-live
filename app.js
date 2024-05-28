document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('park-form');
    const heightInput = document.getElementById('height');
    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
    const resultContainer = document.getElementById('result-container');
    const mapDiv = document.getElementById('map');
    let map, markers = [];

    // Initialize the map
    map = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const activeRides = data.filter(ride => ride.Active === 1);
            populateCountrySelect(activeRides);
            handleCountryChange(activeRides);
            handleFormSubmit(activeRides);
        });

    function populateCountrySelect(rides) {
        const countries = [...new Set(rides.map(ride => ride.Country))];
        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countrySelect.appendChild(option);
        });
    }

    function handleCountryChange(rides) {
        countrySelect.addEventListener('change', function () {
            const selectedCountry = this.value;
            themeParkSelect.innerHTML = '<option value="">All Theme Parks</option>';

            const themeParks = [...new Set(rides.filter(ride => ride.Country === selectedCountry).map(ride => ride.Theme_Park))];
            themeParks.forEach(themePark => {
                const option = document.createElement('option');
                option.value = themePark;
                option.textContent = themePark;
                themeParkSelect.appendChild(option);
            });

            themeParkSelect.style.display = 'block';
        });
    }

    function handleFormSubmit(rides) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const height = parseInt(heightInput.value);
            const country = countrySelect.value;
            const themePark = themeParkSelect.value;

            let filteredRides = rides.filter(ride => ride.Minimum_Height <= height && ride.Maximum_Height >= height);
            if (country) {
                filteredRides = filteredRides.filter(ride => ride.Country === country);
            }
            if (themePark) {
                filteredRides = filteredRides.filter(ride => ride.Theme_Park === themePark);
            }

            displayResults(filteredRides);
        });
    }

    function displayResults(rides) {
        resultContainer.innerHTML = '';
        clearMarkers();

        const themeParks = [...new Set(rides.map(ride => ride.Theme_Park))];
        themeParks.forEach(themePark => {
            const parkRides = rides.filter(ride => ride.Theme_Park === themePark);
            const parkDiv = document.createElement('div');
            parkDiv.classList.add('theme-park');
            
            const parkTitle = document.createElement('h2');
            parkTitle.textContent = themePark;
            parkDiv.appendChild(parkTitle);

            const moreInfo = document.createElement('span');
            moreInfo.classList.add('more-info');
            moreInfo.textContent = 'More info';
            parkDiv.appendChild(moreInfo);

            const ridesDiv = document.createElement('div');
            ridesDiv.classList.add('rides');
            ridesDiv.style.display = 'none';

            parkRides.forEach(ride => {
                const rideDiv = document.createElement('div');
                rideDiv.classList.add('ride');
                
                rideDiv.innerHTML = `
                    <p><strong>Ride:</strong> ${ride.Ride}</p>
                    <p><strong>Minimum Height:</strong> ${ride.Minimum_Height} cm</p>
                    <p><strong>Maximum Height:</strong> ${ride.Maximum_Height} cm</p>
                `;

                if (ride.URL) {
                    const ticketLink = document.createElement('a');
                    ticketLink.href = ride.URL;
                    ticketLink.target = '_blank';
                    ticketLink.textContent = 'Buy Tickets';
                    rideDiv.appendChild(ticketLink);
                }

                ridesDiv.appendChild(rideDiv);
                addMarker(ride);
            });

            parkDiv.appendChild(ridesDiv);
            resultContainer.appendChild(parkDiv);

            moreInfo.addEventListener('click', function () {
                ridesDiv.style.display = ridesDiv.style.display === 'none' ? 'block' : 'none';
            });
        });
    }

    function addMarker(ride) {
        const marker = L.marker([ride.Latitude, ride.Longitude]).addTo(map)
            .bindPopup(`<b>${ride.Ride}</b><br>${ride.Theme_Park}`).openPopup();
        markers.push(marker);
    }

    function clearMarkers() {
        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
    }

    document.getElementById('list-view-btn').addEventListener('click', function () {
        resultContainer.style.display = 'block';
        mapDiv.style.display = 'none';
    });

    document.getElementById('map-view-btn').addEventListener('click', function () {
        resultContainer.style.display = 'none';
        mapDiv.style.display = 'block';
        map.invalidateSize();
    });
});
