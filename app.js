// Your JavaScript code with the necessary changes
// Theme park filter hiding/showing based on country selection
document.getElementById('country').addEventListener('change', () => {
    const selectedCountry = document.getElementById('country').value;
    const themeParkSelect = document.getElementById('theme-park');
    themeParkSelect.innerHTML = '';

    if (selectedCountry === '') {
        document.getElementById('theme-park-label').classList.add('hidden');
        themeParkSelect.disabled = true;
    } else {
        document.getElementById('theme-park-label').classList.remove('hidden');
        themeParkSelect.disabled = false;

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
                });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
});

// Other JavaScript code remains the same
