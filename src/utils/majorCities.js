/**
 * Major-city labels rendered on the countries map when a country is focused.
 * Keyed by the world-atlas polygon name (e.g. "United Kingdom" — the same key
 * the map shading uses), NOT the raw country name on clubs rows.
 *
 * Coverage is intentionally limited to the countries that show up on the
 * map today plus a handful of common football countries so the feature
 * lights up if a user adds, e.g., a La Liga or Bundesliga kit later.
 *
 * To extend: add the polygon name as a key and 4–8 of the most recognizable
 * cities. Order doesn't matter for rendering.
 */

const MAJOR_CITIES = {
  Canada: [
    { name: 'Toronto', lat: 43.6532, lng: -79.3832 },
    { name: 'Vancouver', lat: 49.2827, lng: -123.1207 },
    { name: 'Montreal', lat: 45.5019, lng: -73.5674 },
    { name: 'Ottawa', lat: 45.4215, lng: -75.6972 },
    { name: 'Calgary', lat: 51.0447, lng: -114.0719 },
  ],
  // UK home nations are rendered as separate polygons, so cities are
  // keyed by home nation rather than by 'United Kingdom'.
  England: [
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
    { name: 'Birmingham', lat: 52.4862, lng: -1.8904 },
    { name: 'Liverpool', lat: 53.4084, lng: -2.9916 },
    { name: 'Leeds', lat: 53.8008, lng: -1.5491 },
    { name: 'Newcastle', lat: 54.9783, lng: -1.6178 },
  ],
  Scotland: [
    { name: 'Glasgow', lat: 55.8642, lng: -4.2518 },
    { name: 'Edinburgh', lat: 55.9533, lng: -3.1883 },
    { name: 'Aberdeen', lat: 57.1497, lng: -2.0943 },
    { name: 'Dundee', lat: 56.462, lng: -2.9707 },
  ],
  Wales: [
    { name: 'Cardiff', lat: 51.4816, lng: -3.1791 },
    { name: 'Swansea', lat: 51.6214, lng: -3.9436 },
    { name: 'Newport', lat: 51.5842, lng: -2.9977 },
  ],
  'Northern Ireland': [
    { name: 'Belfast', lat: 54.5973, lng: -5.9301 },
    { name: 'Derry', lat: 54.9966, lng: -7.3086 },
  ],
  Italy: [
    { name: 'Rome', lat: 41.9028, lng: 12.4964 },
    { name: 'Milan', lat: 45.4642, lng: 9.19 },
    { name: 'Naples', lat: 40.8518, lng: 14.2681 },
    { name: 'Turin', lat: 45.0703, lng: 7.6869 },
    { name: 'Florence', lat: 43.7696, lng: 11.2558 },
    { name: 'Venice', lat: 45.4408, lng: 12.3155 },
    { name: 'Bologna', lat: 44.4949, lng: 11.3426 },
  ],
  Spain: [
    { name: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Barcelona', lat: 41.3851, lng: 2.1734 },
    { name: 'Valencia', lat: 39.4699, lng: -0.3763 },
    { name: 'Seville', lat: 37.3886, lng: -5.9823 },
    { name: 'Bilbao', lat: 43.263, lng: -2.935 },
  ],
  France: [
    { name: 'Paris', lat: 48.8566, lng: 2.3522 },
    { name: 'Marseille', lat: 43.2965, lng: 5.3698 },
    { name: 'Lyon', lat: 45.764, lng: 4.8357 },
    { name: 'Nice', lat: 43.7102, lng: 7.262 },
    { name: 'Bordeaux', lat: 44.8378, lng: -0.5792 },
  ],
  Germany: [
    { name: 'Berlin', lat: 52.52, lng: 13.405 },
    { name: 'Munich', lat: 48.1351, lng: 11.582 },
    { name: 'Hamburg', lat: 53.5511, lng: 9.9937 },
    { name: 'Cologne', lat: 50.9375, lng: 6.9603 },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
    { name: 'Dortmund', lat: 51.5136, lng: 7.4653 },
  ],
  Netherlands: [
    { name: 'Amsterdam', lat: 52.3676, lng: 4.9041 },
    { name: 'Rotterdam', lat: 51.9244, lng: 4.4777 },
    { name: 'Eindhoven', lat: 51.4416, lng: 5.4697 },
    { name: 'The Hague', lat: 52.0705, lng: 4.3007 },
  ],
  Portugal: [
    { name: 'Lisbon', lat: 38.7223, lng: -9.1393 },
    { name: 'Porto', lat: 41.1579, lng: -8.6291 },
    { name: 'Braga', lat: 41.5454, lng: -8.4265 },
  ],
  'United States of America': [
    { name: 'New York', lat: 40.7128, lng: -74.006 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Boston', lat: 42.3601, lng: -71.0589 },
    { name: 'Atlanta', lat: 33.749, lng: -84.388 },
  ],
  Brazil: [
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333 },
    { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 },
    { name: 'Brasília', lat: -15.8267, lng: -47.9218 },
    { name: 'Salvador', lat: -12.9714, lng: -38.5014 },
    { name: 'Porto Alegre', lat: -30.0346, lng: -51.2177 },
  ],
  Argentina: [
    { name: 'Buenos Aires', lat: -34.6037, lng: -58.3816 },
    { name: 'Córdoba', lat: -31.4201, lng: -64.1888 },
    { name: 'Rosario', lat: -32.9587, lng: -60.693 },
  ],
  'Saudi Arabia': [
    { name: 'Riyadh', lat: 24.7136, lng: 46.6753 },
    { name: 'Jeddah', lat: 21.4858, lng: 39.1925 },
    { name: 'Mecca', lat: 21.3891, lng: 39.8579 },
  ],
  Mexico: [
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332 },
    { name: 'Guadalajara', lat: 20.6597, lng: -103.3496 },
    { name: 'Monterrey', lat: 25.6866, lng: -100.3161 },
  ],
  Australia: [
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
    { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
    { name: 'Perth', lat: -31.9505, lng: 115.8605 },
  ],
}

export function getMajorCities(geoCountryName) {
  if (!geoCountryName) return []
  return MAJOR_CITIES[geoCountryName] || []
}
