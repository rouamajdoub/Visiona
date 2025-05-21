// utils/geoHelper.js
const tunisiaCities = require("./tunisiaCities.json");

/**
 * Finds coordinates for a given city name or delegation name from the Tunisia cities data
 * @param {string} cityName - The name of the city or delegation to search for
 * @returns {Object|null} - Returns a Point GeoJSON object with coordinates or null if not found
 */
function getCoordinatesByCityName(cityName) {
  if (!cityName) return null;

  const cityNameLower = cityName.trim().toLowerCase();

  // First, try to find a direct match in the main cities
  for (const city of tunisiaCities) {
    // Check if main city name matches
    if (
      city.Name?.toLowerCase() === cityNameLower ||
      city.Value?.toLowerCase() === cityNameLower ||
      city.NameAr?.toLowerCase() === cityNameLower
    ) {
      // If it's a main city with no specific coordinates, use the first delegation's coordinates
      if (city.Delegations && city.Delegations.length > 0) {
        const firstDelegation = city.Delegations[0];
        return {
          type: "Point",
          coordinates: [firstDelegation.Longitude, firstDelegation.Latitude],
        };
      }
    }

    // Check in delegations
    if (city.Delegations) {
      for (const delegation of city.Delegations) {
        if (
          delegation.Name?.toLowerCase() === cityNameLower ||
          delegation.Value?.toLowerCase() === cityNameLower ||
          delegation.NameAr?.toLowerCase() === cityNameLower
        ) {
          return {
            type: "Point",
            coordinates: [delegation.Longitude, delegation.Latitude],
          };
        }
      }
    }
  }

  // If nothing found, return null
  return null;
}

module.exports = { getCoordinatesByCityName };
