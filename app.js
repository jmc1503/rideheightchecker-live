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
            data.forEach(item => {
                const marker = L.marker([item.Latitude, item.Longitude]).addTo(mymap);
                marker.bindTooltip(`<b>${item['Theme Park']}</b><br>${item.Ride}<br>Minimum Height: ${item['Minimum Height']} cm<br>Maximum Height: ${item['Maximum Height']} cm`, {
                    permanent: true,
                    direction: 'top'
                }).openTooltip();
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
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
});
