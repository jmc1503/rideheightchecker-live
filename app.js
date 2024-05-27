$(document).ready(function() {

  // Populate the country dropdown
  function populateCountryDropdown() {
      var countries = [];
      $.each(data, function(index, item) {
          if ($.inArray(item.Country, countries) === -1) {
              countries.push(item.Country);
          }
      });

      // Sort the countries alphabetically
      countries.sort();

      // Populate the dropdown
      var $dropdown = $('#country-dropdown');
      $dropdown.empty();
      $.each(countries, function(index, country) {
          $dropdown.append($('<option></option>').attr('value', country).text(country));
      });
  }

  // Update the theme park dropdown based on the selected country
  $('#country-dropdown').change(function() {
      var selectedCountry = $(this).val();
      var $themeParkDropdown = $('#theme-park-dropdown');
      $themeParkDropdown.empty();
      $.each(data, function(index, item) {
          if (item.Country === selectedCountry) {
              $themeParkDropdown.append($('<option></option>').attr('value', item.ThemePark).text(item.ThemePark));
          }
      });
  });

  // Filter data based on selected country and theme park
  $('#filter-btn').click(function() {
      var selectedCountry = $('#country-dropdown').val();
      var selectedThemePark = $('#theme-park-dropdown').val();
      var result = [];

      $.each(data, function(index, item) {
          if (item.Country === selectedCountry && item.ThemePark === selectedThemePark) {
              result.push(item);
          }
      });

      displayResult(result);
  });

  // Display result
  function displayResult(result) {
      var $resultDiv = $('#result');
      $resultDiv.empty();

      if (result.length > 0) {
          var $table = $('<table></table>');
          var $thead = $('<thead><tr><th>Ride</th><th>Minimum Height</th><th>Maximum Height</th></tr></thead>');
          var $tbody = $('<tbody></tbody>');

          $.each(result, function(index, item) {
              var $row = $('<tr></tr>');
              $row.append($('<td></td>').text(item.Ride));
              $row.append($('<td></td>').text(item["Minimum Height"]));
              $row.append($('<td></td>').text(item["Maximum Height"]));
              $tbody.append($row);
          });

          $table.append($thead);
          $table.append($tbody);
          $resultDiv.append($table);
      } else {
          $resultDiv.text('No results found.');
      }
  }

  // Initialize the page
  populateCountryDropdown();
});
