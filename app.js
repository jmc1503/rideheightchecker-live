// Handle view toggling
listViewBtn.addEventListener('click', () => {
    resultContainer.style.display = 'block';
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
                    item['Maximum Height'] >= height &&
                    item['Active'] === 1; // Include only rides where Active = 1
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
