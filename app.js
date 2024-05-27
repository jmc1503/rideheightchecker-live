document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const themeParkSelect = document.getElementById('theme-park');
    const themeParkSelect2 = document.getElementById('theme-park2'); // Updated ID
    const resultContainer = document.getElementById('result-container');
    const listViewBtn = document.getElementById('list-view-btn');
    const mapViewBtn = document.getElementById('map-view-btn');
    const mapElement = document.getElementById('map');
    let map;
    let markers = [];

    // Handle country change event
    countrySelect.addEventListener('change', () => {
        const selectedCountry = countrySelect.value;
        themeParkSelect.innerHTML = '';
        themeParkSelect2.innerHTML = ''; // Added

        if (selectedCountry === '') {
            themeParkSelect.style.display = 'none';
            themeParkSelect2.style.display = 'none'; // Hide theme park dropdowns
        } else {
            fetch('data.json')
                .then(response => response.json())
                .then(data => {
                    const filteredData = selectedCountry === 'Any' ? data : data.filter(item => item.Country === selectedCountry);
                    const themeParks = [...new Set(filteredData.map(item => item['Theme Park'] || 'Unknown'))];
                    themeParks.forEach(themePark => {
                        const option = document.createElement('option');
                        option.value = themePark;
                        option.textContent = themePark;
                        themeParkSelect.appendChild(option);
                        themeParkSelect2.appendChild(option.cloneNode(true)); // Added
                    });
                    themeParkSelect.style.display = 'block';
                    themeParkSelect2.style.display = 'block'; // Show theme park dropdowns
                })
                .catch(error => {
                    console.error('Error fetching data:', error);
                });
        }
    });

    // Prevent default form submission
    document.getElementById('park-form').addEventListener('submit', function(event) {
        event.preventDefault();
        // Rest of the form submission handling code
        // ...
    });

    // Rest of the code remains the same
});
