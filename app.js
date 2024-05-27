document.addEventListener('DOMContentLoaded', () => {
    const resultContainer = document.getElementById('result-container');
    const mapContainer = document.getElementById('map');
    const listViewBtn = document.getElementById('list-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');

    // Initialize map
    const mymap = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Load data and add markers to the map
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const markers = [];
            const parks = {};
            data.forEach(item => {
                const marker = L.marker([item.Latitude, item.Longitude]).addTo(mymap);
                marker.bindTooltip(`<b>${item['Theme Park']}</b><br>${item.Ride}<br>Minimum Height: ${item['Minimum Height']} cm<br>Maximum Height: ${item['Maximum Height']} cm`, {
                    permanent: true,
                    direction: 'top'
                }).openTooltip();
                markers.push(marker);

                if (!parks[item['Theme Park']]) {
                    parks[item['Theme Park']] = [];
                }
                parks[item['Theme Park']].push(item);
            });

            // Filter data by country
            const countrySelect = document.getElementById('country');
            countrySelect.addEventListener('change', () => {
                const selectedCountry = countrySelect.value;
                markers.forEach(marker => marker.remove());
                Object.values(parks).forEach(park => {
                    park.forEach(item => {
                        if (selectedCountry === '' || item.Country === selectedCountry) {
                            const marker = L.marker([item.Latitude, item.Longitude]).addTo(mymap);
                            marker.bindTooltip(`<b>${item['Theme Park']}</b><br>${item.Ride}<br>Minimum Height: ${item['Minimum Height']} cm<br>Maximum Height: ${item['Maximum Height']} cm`, {
                                permanent: true,
                                direction: 'top'
                            }).openTooltip();
                            markers.push(marker);
                        }
                    });
                });
            });

            // Map view button
            mapViewBtn.addEventListener('click', () => {
                resultContainer.style.display = 'none';
                mapContainer.style.display = 'block';
            });

            // List view button
            listViewBtn.addEventListener('click', () => {
                mapContainer.style.display = 'none';
                resultContainer.style.display = 'block';
            });

            // Form submission
            const form = document.getElementById('park-form');
            form.addEventListener('submit', event => {
                event.preventDefault();
                const height = parseInt(document.getElementById('height').value);
                const selectedCountry = countrySelect.value;
                const filteredData = data.filter(item => (selectedCountry === '' || item.Country === selectedCountry) && height >= item['Minimum Height'] && height <= item['Maximum Height']);
                displayResults(filteredData);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    // Function to display results
    function displayResults(data) {
        resultContainer.innerHTML = '';
        const parks = {};
        data.forEach(item => {
            if (!parks[item['Theme Park']]) {
                parks[item['Theme Park']] = [];
            }
            parks[item['Theme Park']].push(item);
        });

        Object.entries(parks).forEach(([parkName, parkData]) => {
            const parkContainer = document.createElement('div');
            parkContainer.classList.add('park-container');
            const parkHeader = document.createElement('h3');
            parkHeader.innerHTML = `${parkName} - ${calculatePercentage(parkData)}% of available rides`;
            parkContainer.appendChild(parkHeader);

            const parkList = document.createElement('ul');
            parkData.forEach(ride => {
                const listItem = document.createElement('li');
                listItem.textContent = ride.Ride;
                parkList.appendChild(listItem);
            });
            parkContainer.appendChild(parkList);
            resultContainer.appendChild(parkContainer);
        });
    }

    // Function to calculate percentage of available rides
    function calculatePercentage(parkData) {
        const totalRides = parkData.length;
        const availableRides = parkData.filter(ride => ride['Minimum Height'] <= height && ride['Maximum Height'] >= height).length;
        return ((availableRides / totalRides) * 100).toFixed(2);
    }
});
