// utils/cityExtractor.js
const tunisiaCities = require("./tunisiaCities.json");

/**
 * Extracts all city and delegation names from Tunisia cities data
 * @returns {string[]} Array of all city and delegation names
 */
function extractAllCityNames() {
  const cityNames = [];

  tunisiaCities.forEach((city) => {
    // Add main city name
    if (city.Name) cityNames.push(city.Name);

    // Add delegations
    if (city.Delegations) {
      city.Delegations.forEach((delegation) => {
        if (delegation.Name) cityNames.push(delegation.Name);
      });
    }
  });

  return [...new Set(cityNames)]; // Remove duplicates
}

module.exports = { extractAllCityNames };
