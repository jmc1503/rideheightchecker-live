document.addEventListener("DOMContentLoaded", function () {
    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
    const resultContainer = document.getElementById('result-container');
    const mapContainer = document.getElementById('map');
    const mapViewBtn = document.getElementById('map-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');

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

            // Handle country change event
            countrySelect.addEventListener('change', () => {
                const selectedCountry = countrySelect.value;
                themeParkSelect.innerHTML = '';
                themeParkSelect.classList.toggle('hidden', selectedCountry === '');

                if (selectedCountry !== '') {
                    const anyThemeParkOption = document.createElement('option');
                    anyThemeParkOption.value = '';
                    anyThemeParkOption.textContent = 'Any';
                    themeParkSelect.appendChild(anyThemeParkOption);

                    const filteredData = selectedCountry === '' ? data : data.filter(item => item.Country === selectedCountry);
                    const themeParks = [...new Set(filteredData.map(item => item['Theme Park'] || 'Unknown'))];
                    themeParks.forEach(themePark => {
                        const option = document.createElement('option');
                        option.value = themePark;
                        option.textContent = themePark;
                        themeParkSelect.appendChild(option);
                    });
                }
            });

            // Handle form submission
            document.getElementById('park-form').addEventListener('submit', function (event) {
                event.preventDefault();

                const height = parseInt(document.getElementById('height').value);
                const country = countrySelect.value;
                const themePark = themeParkSelect.value;

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

                    themeParks.forEach(park => {
                        const parkURL = filteredRides.find(ride => ride['Theme Park'] === park).URL;
                        const totalRidesInPark = data.filter(ride => ride['Theme Park'] === park).length;
                        const availableRidesInPark = filteredRides.filter(ride => ride['Theme Park'] === park).length;
                        const percentage = ((availableRidesInPark / totalRidesInPark) * 100).toFixed(0);

                        const parkContainer = document.createElement('div');
                        parkContainer.classList.add('park-container');

                        const parkHeader = document.createElement('h3');
                        parkHeader.innerHTML = `${park} - ${percentage}% of available rides <a href="${parkURL}" target="_blank">Buy Tickets</a>`;
                        parkContainer.appendChild(parkHeader);

                        resultContainer.appendChild(parkContainer);
                    });

                    resultContainer.style.display = 'block';
                } else {
                    resultContainer.textContent = 'No rides available for your height in this theme park.';
                    resultContainer.style.display = 'block';
                }
            });

            // Map view button
            mapViewBtn.addEventListener('click', () => {
                resultContainer.style.display = 'none';
                mapContainer.style.display = 'block';

                const map = L.map('map').setView([51.505, -0.09], 2);

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 18,
                    attribution: '© OpenStreetMap'
                }).addTo(map);

                data.forEach(item => {
                    if (item.Latitude && item.Longitude) {
                        const totalRidesInPark = data.filter(ride => ride['Theme Park'] === item['Theme Park']).length;
                        const availableRidesInPark = data.filter(ride => ride['Theme Park'] === item['Theme Park'] && ride['Minimum Height'] <= parseInt(document.getElementById('height').value) && ride['Maximum Height'] >= parseInt(document.getElementById('height').value)).length;
                        const percentage = ((availableRidesInPark / totalRidesInPark) * 100).toFixed(0);

                        L.marker([item.Latitude, item.Longitude]).addTo(map)
                            .bindPopup(`<b>${item['Theme Park']}</b><br>${percentage}% of available rides`);
                    }
                });
            });

            // List view button
            listViewBtn.addEventListener('click', () => {
                mapContainer.style.display = 'none';
                resultContainer.style.display = 'block';
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});
