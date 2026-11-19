import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  InputAdornment,
  IconButton,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Autocomplete,
} from "@mui/material";
import {
  Search,
  Map as MapIcon,
  Satellite,
  Terrain,
  MyLocation,
  Warning,
  Cloud,
  WaterDrop,
  Air,
  Thermostat,
  LocationOn,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import Navbar from "./UserComponents/Navbar";
import Footer from "./UserComponents/Footer";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Component to change map view
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

const OPENCAGE_API_KEY = "65c3ce9fe59d47b6a77a6406d6e4cedf";
const GEMINI_API_KEY = "AIzaSyAUMk1fI-FtIu93hMONKyKnIQ8r5_ndAwQ";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur",
  "Palakkad", "Malappuram", "Kozhikode", "Wayanad",
  "Kannur", "Kasaragod"
];

const SearchDestination = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapView, setMapView] = useState(0); // 0: Standard, 1: Satellite, 2: Terrain
  const [weatherData, setWeatherData] = useState(null);
  const [landslideProbability, setLandslideProbability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [loadingHistorical, setLoadingHistorical] = useState(false);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [historicalSummary, setHistoricalSummary] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedPlaceDetails, setSelectedPlaceDetails] = useState(null);
  const [placeDetailsOpen, setPlaceDetailsOpen] = useState(false);
  const [loadingPlaceDetails, setLoadingPlaceDetails] = useState(false);

  // Sample destinations - Popular hilly/tourist locations
  const destinations = [
    { name: "Munnar, Kerala", coords: [10.0889, 77.0595] },
    { name: "Darjeeling, West Bengal", coords: [27.036, 88.2627] },
    { name: "Shimla, Himachal Pradesh", coords: [31.1048, 77.1734] },
    { name: "Ooty, Tamil Nadu", coords: [11.4102, 76.6950] },
    { name: "Manali, Himachal Pradesh", coords: [32.2396, 77.1887] },
    { name: "Kodaikanal, Tamil Nadu", coords: [10.2381, 77.4892] },
    { name: "Mussoorie, Uttarakhand", coords: [30.4549, 78.0700] },
    { name: "Nainital, Uttarakhand", coords: [29.3919, 79.4542] },
    { name: "Mahabaleshwar, Maharashtra", coords: [17.9244, 73.6568] },
    { name: "Lonavala, Maharashtra", coords: [18.7527, 73.4057] },
  ];

  // Fetch location suggestions from OpenCage when user types
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const res = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(searchQuery)}&key=${OPENCAGE_API_KEY}&limit=8&countrycode=in`
        );
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          setSearchSuggestions(data.results.map((r) => ({
            formatted: r.formatted,
            lat: r.geometry.lat,
            lng: r.geometry.lng,
            components: r.components || {},
          })));
        } else {
          setSearchSuggestions([]);
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
        setSearchSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Extract district from OpenCage components (Kerala districts)
  const getDistrictFromComponents = (components) => {
    const stateDistrict = components?.state_district || components?.county || components?.district;
    if (stateDistrict && KERALA_DISTRICTS.some((d) => d.toLowerCase() === stateDistrict.toLowerCase())) {
      return KERALA_DISTRICTS.find((d) => d.toLowerCase() === stateDistrict.toLowerCase());
    }
    if (components?.state === "Kerala" && stateDistrict) return stateDistrict;
    return null;
  };

  // Request notification permission
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          console.log("Notification permission granted.");
        }
      }
    };
    requestNotificationPermission();
  }, []);

  const showWebNotification = (title, message) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/assets/alert-icon.png",
      });
    }
  };

  // Helper function to save risk prediction to database
  const saveRiskPrediction = async (locationName, latitude, longitude, riskPercentage, pincode = null, district = null) => {
    try {
      const userData = localStorage.getItem("userData");
      const userId = userData ? JSON.parse(userData).id : null;
      
      await axios.post("http://localhost:8081/api/add/addRiskPrediction", {
        location_name: locationName,
        latitude: latitude,
        longitude: longitude,
        risk_percentage: riskPercentage,
        pincode: pincode,
        district: district,
        user_id: userId,
      });
      console.log("Risk prediction saved to database");
    } catch (error) {
      console.error("Error saving risk prediction:", error);
      // Don't show error to user, just log it
    }
  };

  const predictLandslideRisk = async (hourlyData, lat, lng, locationName) => {
    setLoadingRisk(true);
    
    try {
      // Fetch historical data (last 7 days) for comprehensive analysis
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      let historicalData = null;
      try {
        const historicalResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&start_date=${startDateStr}&end_date=${endDateStr}&timezone=auto`
        );
        if (historicalResponse.ok) {
          historicalData = await historicalResponse.json();
        }
      } catch (error) {
        console.error("Error fetching historical data for risk:", error);
      }

      // Calculate risk using our custom algorithm
      const risk = calculateAdvancedRisk(hourlyData, historicalData, lat, lng);
      
      // Show notification if risk is high
      if (risk >= 10) {
        showWebNotification(
          "🚨 Landslide Alert!",
          `Risk Level: ${risk}%. Stay safe!`
        );
      }
      
      setLandslideProbability(risk);
      return risk;
    } catch (error) {
      console.error("Error in predictLandslideRisk:", error);
      // Fallback to simple calculation
      const fallbackRisk = calculateSimpleRisk(hourlyData);
      setLandslideProbability(fallbackRisk);
      return fallbackRisk;
    } finally {
      setLoadingRisk(false);
    }
  };

  /**
   * Advanced Landslide Risk Calculation Algorithm
   * Analyzes current weather and historical data to predict landslide risk
   */
  const calculateAdvancedRisk = (currentHourlyData, historicalData, lat, lng) => {
    if (!currentHourlyData) {
      console.warn("No hourly data provided for risk calculation");
      return 5; // Return minimal baseline risk
    }

    // Get current weather data (most recent hour)
    const lastIndex = Math.max(0, (currentHourlyData.precipitation?.length || currentHourlyData.temperature_2m?.length || 1) - 1);
    
    const currentPrecipitation = currentHourlyData.precipitation?.[lastIndex] || 0;
    const currentHumidity = currentHourlyData.relative_humidity_2m?.[lastIndex] || 50;
    const currentWindSpeed = currentHourlyData.wind_speed_10m?.[lastIndex] || 0;
    const currentTemperature = currentHourlyData.temperature_2m?.[lastIndex] || 20;

    // Calculate historical averages and totals (last 7 days)
    let historicalAvgPrecipitation = 0;
    let historicalTotalPrecipitation = 0;
    let historicalAvgHumidity = 0;
    let historicalAvgWindSpeed = 0;
    let historicalAvgTemperature = 0;
    let precipitationTrend = 0; // Positive = increasing, Negative = decreasing
    let recentPrecipitationIntensity = 0; // Last 24 hours total

    if (historicalData && historicalData.hourly) {
      const histPrecip = historicalData.hourly.precipitation || [];
      const histHumidity = historicalData.hourly.relative_humidity_2m || [];
      const histWind = historicalData.hourly.wind_speed_10m || [];
      const histTemp = historicalData.hourly.temperature_2m || [];

      if (histPrecip.length > 0) {
        historicalTotalPrecipitation = histPrecip.reduce((a, b) => a + b, 0);
        historicalAvgPrecipitation = historicalTotalPrecipitation / histPrecip.length;
        
        // Calculate precipitation trend (comparing first half vs second half of period)
        const midPoint = Math.floor(histPrecip.length / 2);
        const firstHalfAvg = histPrecip.slice(0, midPoint).reduce((a, b) => a + b, 0) / midPoint;
        const secondHalfAvg = histPrecip.slice(midPoint).reduce((a, b) => a + b, 0) / (histPrecip.length - midPoint);
        precipitationTrend = secondHalfAvg - firstHalfAvg;
        
        // Recent 24 hours precipitation intensity
        recentPrecipitationIntensity = histPrecip.slice(-24).reduce((a, b) => a + b, 0);
      }

      if (histHumidity.length > 0) {
        historicalAvgHumidity = histHumidity.reduce((a, b) => a + b, 0) / histHumidity.length;
      }

      if (histWind.length > 0) {
        historicalAvgWindSpeed = histWind.reduce((a, b) => a + b, 0) / histWind.length;
      }

      if (histTemp.length > 0) {
        historicalAvgTemperature = histTemp.reduce((a, b) => a + b, 0) / histTemp.length;
      }
    }

    // Base risk level (hilly/mountainous areas always have some baseline risk)
    let risk = 5;

    // ========== FACTOR 1: CURRENT PRECIPITATION (Most Critical) ==========
    // Immediate rainfall is the primary trigger for landslides
    if (currentPrecipitation > 25) risk += 45; // Extreme rainfall (>25mm/hr)
    else if (currentPrecipitation > 15) risk += 35; // Very heavy rain (15-25mm/hr)
    else if (currentPrecipitation > 10) risk += 25; // Heavy rain (10-15mm/hr)
    else if (currentPrecipitation > 5) risk += 18; // Moderate rain (5-10mm/hr)
    else if (currentPrecipitation > 2) risk += 12; // Light rain (2-5mm/hr)
    else if (currentPrecipitation > 0.5) risk += 6; // Drizzle (0.5-2mm/hr)

    // ========== FACTOR 2: ACCUMULATED PRECIPITATION (Last 7 Days) ==========
    // High accumulated rainfall saturates soil, increasing landslide probability
    if (historicalTotalPrecipitation > 200) risk += 30; // Very high accumulation (>200mm in 7 days)
    else if (historicalTotalPrecipitation > 150) risk += 22; // High accumulation (150-200mm)
    else if (historicalTotalPrecipitation > 100) risk += 15; // Moderate accumulation (100-150mm)
    else if (historicalTotalPrecipitation > 50) risk += 8; // Low accumulation (50-100mm)

    // ========== FACTOR 3: RECENT PRECIPITATION INTENSITY (Last 24 Hours) ==========
    // Recent heavy rainfall increases immediate risk
    if (recentPrecipitationIntensity > 50) risk += 20; // Very high recent rainfall
    else if (recentPrecipitationIntensity > 30) risk += 12; // High recent rainfall
    else if (recentPrecipitationIntensity > 15) risk += 6; // Moderate recent rainfall

    // ========== FACTOR 4: PRECIPITATION TREND ==========
    // Increasing precipitation trend indicates worsening conditions
    if (precipitationTrend > 2) risk += 10; // Strong increasing trend
    else if (precipitationTrend > 0.5) risk += 5; // Moderate increasing trend
    else if (precipitationTrend < -1) risk -= 3; // Decreasing trend (slight risk reduction)

    // ========== FACTOR 5: SOIL SATURATION (Humidity) ==========
    // High humidity indicates saturated soil, which is more prone to landslides
    const humidityFactor = (currentHumidity - 50) / 50; // Normalize to 0-1 scale (50% is baseline)
    if (currentHumidity > 90) risk += 25; // Extremely saturated
    else if (currentHumidity > 85) risk += 18; // Very saturated
    else if (currentHumidity > 80) risk += 12; // Saturated
    else if (currentHumidity > 75) risk += 8; // Moderately saturated
    else if (currentHumidity > 70) risk += 4; // Slightly saturated

    // Historical humidity context
    if (historicalAvgHumidity > 80 && currentHumidity > historicalAvgHumidity) {
      risk += 5; // Humidity increasing above already high baseline
    }

    // ========== FACTOR 6: WIND SPEED ==========
    // Strong winds can destabilize slopes, especially on saturated soil
    if (currentWindSpeed > 20) risk += 12; // Very strong winds (>20 m/s)
    else if (currentWindSpeed > 15) risk += 8; // Strong winds (15-20 m/s)
    else if (currentWindSpeed > 10) risk += 5; // Moderate winds (10-15 m/s)
    else if (currentWindSpeed > 7) risk += 2; // Light winds (7-10 m/s)

    // Wind combined with high humidity increases risk
    if (currentWindSpeed > 10 && currentHumidity > 80) {
      risk += 5; // Wind stress on saturated slopes
    }

    // ========== FACTOR 7: TEMPERATURE EFFECTS ==========
    // Temperature affects soil stability and water retention
    if (currentTemperature < -5) risk += 8; // Extreme freezing (ice formation)
    else if (currentTemperature < 0) risk += 5; // Freezing conditions
    else if (currentTemperature > 40) risk += 6; // Extreme heat (soil desiccation)
    else if (currentTemperature > 35) risk += 3; // Very hot conditions

    // Temperature change rate (rapid changes can cause soil expansion/contraction)
    if (historicalData && historicalData.hourly?.temperature_2m) {
      const tempChange = Math.abs(currentTemperature - historicalAvgTemperature);
      if (tempChange > 15) risk += 4; // Rapid temperature change
      else if (tempChange > 10) risk += 2; // Moderate temperature change
    }

    // ========== FACTOR 8: CLIMATE CHANGE INDICATORS ==========
    // Compare current conditions to historical averages
    if (historicalData && historicalData.hourly) {
      // Precipitation anomaly (current vs historical average)
      const precipAnomaly = currentPrecipitation - historicalAvgPrecipitation;
      if (precipAnomaly > 10) risk += 8; // Much higher than average
      else if (precipAnomaly > 5) risk += 4; // Higher than average

      // Humidity anomaly
      const humidityAnomaly = currentHumidity - historicalAvgHumidity;
      if (humidityAnomaly > 15) risk += 5; // Much higher humidity than average
      else if (humidityAnomaly > 10) risk += 3; // Higher humidity than average
    }

    // ========== FACTOR 9: GEOGRAPHICAL CONSIDERATIONS ==========
    // Higher elevations and steeper terrains have higher baseline risk
    // (This is a simplified assumption - in production, use elevation data)
    // For now, we assume all searched locations are in hilly/mountainous areas

    // ========== FINAL CALCULATION ==========
    // Cap at 100 and ensure minimum of 5 (baseline risk for hilly areas)
    const finalRisk = Math.max(5, Math.min(100, Math.round(risk)));
    
    console.log("Advanced Risk Calculation:", {
      currentPrecipitation,
      currentHumidity,
      currentWindSpeed,
      currentTemperature,
      historicalTotalPrecipitation,
      recentPrecipitationIntensity,
      precipitationTrend,
      calculatedRisk: finalRisk
    });
    
    return finalRisk;
  };

  /**
   * Simple Risk Calculation (Fallback)
   * Used when historical data is not available
   */
  const calculateSimpleRisk = (hourlyData) => {
    if (!hourlyData) {
      console.warn("No hourly data provided for risk calculation");
      return 5;
    }

    const lastIndex = Math.max(0, (hourlyData.precipitation?.length || hourlyData.temperature_2m?.length || 1) - 1);
    
    const precipitation = hourlyData.precipitation?.[lastIndex] || 0;
    const humidity = hourlyData.relative_humidity_2m?.[lastIndex] || 50;
    const windSpeed = hourlyData.wind_speed_10m?.[lastIndex] || 0;
    const temperature = hourlyData.temperature_2m?.[lastIndex] || 20;

    let risk = 5; // Base risk

    // Precipitation factor
    if (precipitation > 20) risk += 50;
    else if (precipitation > 10) risk += 35;
    else if (precipitation > 5) risk += 25;
    else if (precipitation > 2) risk += 15;
    else if (precipitation > 0.5) risk += 5;

    // Humidity factor
    if (humidity > 85) risk += 25;
    else if (humidity > 75) risk += 15;
    else if (humidity > 65) risk += 8;

    // Wind factor
    if (windSpeed > 15) risk += 10;
    else if (windSpeed > 10) risk += 5;

    // Temperature factor
    if (temperature < 0) risk += 5;
    if (temperature > 35) risk += 3;

    return Math.max(5, Math.min(100, Math.round(risk)));
  };

  const handleSearchFromCoords = async (lat, lng, locationName, components = {}) => {
    setLoading(true);
    try {
      let weatherDataResponse = null;
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`
        );
        if (weatherResponse.ok) weatherDataResponse = await weatherResponse.json();
      } catch (err) {
        weatherDataResponse = { hourly: { temperature_2m: [25], relative_humidity_2m: [65], wind_speed_10m: [5], precipitation: [0] } };
      }
      if (weatherDataResponse?.hourly?.temperature_2m?.length > 0) {
        const li = weatherDataResponse.hourly.temperature_2m.length - 1;
        setWeatherData({
          temperature: weatherDataResponse.hourly.temperature_2m[li],
          humidity: weatherDataResponse.hourly.relative_humidity_2m[li],
          windSpeed: weatherDataResponse.hourly.wind_speed_10m[li],
          precipitation: weatherDataResponse.hourly.precipitation[li],
        });
        const risk = await predictLandslideRisk(weatherDataResponse.hourly, lat, lng, locationName);
        const pincode = components?.postcode || null;
        const district = getDistrictFromComponents(components);
        await saveRiskPrediction(locationName, lat, lng, risk, pincode, district);
        setLoadingHistorical(true);
        const summary = await createHistoricalSummary([lat, lng], locationName, risk);
        setHistoricalSummary(summary);
        setLoadingHistorical(false);
        setLoadingPlaces(true);
        await fetchNearbyPlaces([lat, lng], locationName);
        setLoadingPlaces(false);
      }
    } catch (err) {
      console.error("Error:", err);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setWeatherData(null);
    setLandslideProbability(null);
    setHistoricalSummary(null);
    setNearbyPlaces([]);

    try {
      // First try to find in destinations (more flexible matching)
      const searchLower = searchQuery.toLowerCase().trim();
      const found = destinations.find(
        (loc) => {
          const locLower = loc.name.toLowerCase();
          // Check if search query matches location name or city name
          return (
            locLower.includes(searchLower) ||
            searchLower.includes(locLower.split(',')[0]) ||
            locLower.split(',')[0].includes(searchLower.split(',')[0])
          );
        }
      );

      let coords, locationName;
      let geoData = null; // Declare outside to access later

      if (found) {
        coords = found.coords;
        locationName = found.name;
        // Try to get pincode for predefined destinations via reverse geocoding
        try {
          const reverseGeoResponse = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${coords[0]},${coords[1]}&key=${OPENCAGE_API_KEY}&limit=1`
          );
          if (reverseGeoResponse.ok) {
            geoData = await reverseGeoResponse.json();
          }
        } catch (error) {
          console.error("Error with reverse geocoding:", error);
        }
      } else {
        // Use OpenCage Geocoding API
        try {
          const geoResponse = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
              searchQuery
            )}&key=${OPENCAGE_API_KEY}&limit=1`
          );
          
          if (geoResponse.ok) {
            geoData = await geoResponse.json();
          } else if (geoResponse.status === 401) {
            console.error("OpenCage API key is invalid or expired");
          }
        } catch (error) {
          console.error("Error with OpenCage API:", error);
        }

        // If OpenCage fails, try with simplified query
        if (!geoData || !geoData.results || !geoData.results.length) {
          const simplifiedQuery = searchQuery.split(',')[0].trim();
          if (simplifiedQuery !== searchQuery) {
            try {
              const geoResponse = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                  simplifiedQuery
                )}&key=${OPENCAGE_API_KEY}&limit=1`
              );
              
              if (geoResponse.ok) {
                geoData = await geoResponse.json();
              }
            } catch (error) {
              console.error("Error with OpenCage retry:", error);
            }
          }
        }

        if (geoData && geoData.results && geoData.results.length > 0) {
          const result = geoData.results[0];
          coords = [result.geometry.lat, result.geometry.lng];
          locationName = result.formatted || result.components?.city || result.components?.town || searchQuery;
        } else {
          alert(`Location "${searchQuery}" not found. Please try:\n\n• Use exact city/town names (e.g., "Mumbai", "Delhi", "Bangalore")\n• Check spelling\n• Use one of the quick access destinations below\n• Try adding state/country (e.g., "Mumbai, Maharashtra")`);
          setLoading(false);
          return;
        }
      }

      setSelectedLocation({
        name: locationName,
        coords: coords,
      });

      // Fetch weather data from Open-Meteo API
      let weatherDataResponse = null;
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`
        );
        
        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
        
        weatherDataResponse = await weatherResponse.json();
        console.log("Weather data received:", weatherDataResponse);
      } catch (error) {
        console.error("Error fetching weather from Open-Meteo:", error);
        // Try alternative API (OpenWeatherMap fallback would need API key)
        // For now, use sample data if API fails
        alert("Weather service temporarily unavailable. Using sample data.");
        weatherDataResponse = {
          hourly: {
            temperature_2m: [25, 24, 23, 22],
            relative_humidity_2m: [65, 70, 75, 80],
            wind_speed_10m: [5, 6, 7, 8],
            precipitation: [0, 0, 2, 5]
          }
        };
      }

      if (
        !weatherDataResponse.hourly ||
        !weatherDataResponse.hourly.temperature_2m ||
        weatherDataResponse.hourly.temperature_2m.length === 0
      ) {
        console.error("Invalid or empty weather data received");
        alert("Unable to fetch weather data. Please try again.");
        setLoading(false);
        return;
      }

      const lastIndex = weatherDataResponse.hourly.temperature_2m.length - 1;

      const currentWeather = {
        temperature: weatherDataResponse.hourly.temperature_2m[lastIndex],
        humidity: weatherDataResponse.hourly.relative_humidity_2m[lastIndex],
        windSpeed: weatherDataResponse.hourly.wind_speed_10m[lastIndex],
        precipitation: weatherDataResponse.hourly.precipitation[lastIndex],
      };

      console.log("Setting weather data:", currentWeather);
      setWeatherData(currentWeather);

      // Predict landslide risk using Gemini AI
      const risk = await predictLandslideRisk(
        weatherDataResponse.hourly,
        coords[0],
        coords[1],
        locationName
      );
      console.log("Calculated risk:", risk);

      let pincode = null;
      let district = null;
      if (geoData && geoData.results && geoData.results.length > 0) {
        const comp = geoData.results[0].components || {};
        pincode = comp.postcode || null;
        district = getDistrictFromComponents(comp);
      }

      await saveRiskPrediction(locationName, coords[0], coords[1], risk, pincode, district);

      // Generate historical summary after risk is calculated
      setLoadingHistorical(true);
      const summary = await createHistoricalSummary(coords, locationName, risk);
      setHistoricalSummary(summary);
      setLoadingHistorical(false);

      // Fetch nearby places
      setLoadingPlaces(true);
      await fetchNearbyPlaces(coords, locationName);
      setLoadingPlaces(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error fetching data. Please try again.");
    }

    setLoading(false);
  };

  const handleLocationClick = async (location) => {
    setSelectedLocation(location);
    setSearchQuery(location.name);
    setLoading(true);
    setWeatherData(null);
    setLandslideProbability(null);
    setHistoricalSummary(null);
    setNearbyPlaces([]);

    try {
      // Fetch weather data
      let weatherDataResponse = null;
      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${location.coords[0]}&longitude=${location.coords[1]}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`
        );
        
        if (!weatherResponse.ok) {
          throw new Error(`Weather API error: ${weatherResponse.status}`);
        }
        
        weatherDataResponse = await weatherResponse.json();
      } catch (error) {
        console.error("Error fetching weather:", error);
        // Use sample data as fallback
        weatherDataResponse = {
          hourly: {
            temperature_2m: [25, 24, 23, 22],
            relative_humidity_2m: [65, 70, 75, 80],
            wind_speed_10m: [5, 6, 7, 8],
            precipitation: [0, 0, 2, 5]
          }
        };
      }

      if (
        weatherDataResponse.hourly &&
        weatherDataResponse.hourly.temperature_2m &&
        weatherDataResponse.hourly.temperature_2m.length > 0
      ) {
        const lastIndex = weatherDataResponse.hourly.temperature_2m.length - 1;

        const currentWeather = {
          temperature: weatherDataResponse.hourly.temperature_2m[lastIndex],
          humidity: weatherDataResponse.hourly.relative_humidity_2m[lastIndex],
          windSpeed: weatherDataResponse.hourly.wind_speed_10m[lastIndex],
          precipitation: weatherDataResponse.hourly.precipitation[lastIndex],
        };

        setWeatherData(currentWeather);

        // Predict landslide risk using Gemini AI
        const risk = await predictLandslideRisk(
          weatherDataResponse.hourly,
          location.coords[0],
          location.coords[1],
          location.name
        );

        let pincode = null;
        let district = null;
        try {
          const reverseGeoResponse = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${location.coords[0]},${location.coords[1]}&key=${OPENCAGE_API_KEY}&limit=1`
          );
          if (reverseGeoResponse.ok) {
            const reverseGeoData = await reverseGeoResponse.json();
            if (reverseGeoData.results && reverseGeoData.results.length > 0) {
              const comp = reverseGeoData.results[0].components || {};
              pincode = comp.postcode || null;
              district = getDistrictFromComponents(comp);
            }
          }
        } catch (error) {
          console.error("Error getting location data:", error);
        }

        await saveRiskPrediction(location.name, location.coords[0], location.coords[1], risk, pincode, district);

        // Generate historical summary
        setLoadingHistorical(true);
        const summary = await createHistoricalSummary(location.coords, location.name, risk);
        setHistoricalSummary(summary);
        setLoadingHistorical(false);

        // Fetch nearby places
        setLoadingPlaces(true);
        await fetchNearbyPlaces(location.coords, location.name);
        setLoadingPlaces(false);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Error fetching weather data. Please try again.");
    }

    setLoading(false);
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedLocation({
            name: "Your Location",
            coords: [latitude, longitude],
          });
          setSearchQuery("Your Location");
          setLoading(true);
          setWeatherData(null);
          setLandslideProbability(null);

          try {
            // Fetch weather data
            let weatherDataResponse = null;
            try {
              const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`
              );
              
              if (!weatherResponse.ok) {
                throw new Error(`Weather API error: ${weatherResponse.status}`);
              }
              
              weatherDataResponse = await weatherResponse.json();
            } catch (error) {
              console.error("Error fetching weather:", error);
              // Use sample data as fallback
              weatherDataResponse = {
                hourly: {
                  temperature_2m: [25, 24, 23, 22],
                  relative_humidity_2m: [65, 70, 75, 80],
                  wind_speed_10m: [5, 6, 7, 8],
                  precipitation: [0, 0, 2, 5]
                }
              };
            }

            if (
              weatherDataResponse.hourly &&
              weatherDataResponse.hourly.temperature_2m &&
              weatherDataResponse.hourly.temperature_2m.length > 0
            ) {
              const lastIndex =
                weatherDataResponse.hourly.temperature_2m.length - 1;

              const currentWeather = {
                temperature: weatherDataResponse.hourly.temperature_2m[lastIndex],
                humidity:
                  weatherDataResponse.hourly.relative_humidity_2m[lastIndex],
                windSpeed: weatherDataResponse.hourly.wind_speed_10m[lastIndex],
                precipitation: weatherDataResponse.hourly.precipitation[lastIndex],
              };

              setWeatherData(currentWeather);

              // Predict landslide risk using Gemini AI
              const risk = await predictLandslideRisk(
                weatherDataResponse.hourly,
                latitude,
                longitude,
                "Your Location"
              );

              let pincode = null;
              let district = null;
              try {
                const reverseGeoResponse = await fetch(
                  `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${OPENCAGE_API_KEY}&limit=1`
                );
                if (reverseGeoResponse.ok) {
                  const reverseGeoData = await reverseGeoResponse.json();
                  if (reverseGeoData.results && reverseGeoData.results.length > 0) {
                    const comp = reverseGeoData.results[0].components || {};
                    pincode = comp.postcode || null;
                    district = getDistrictFromComponents(comp);
                  }
                }
              } catch (error) {
                console.error("Error getting location data:", error);
              }

              await saveRiskPrediction("Your Location", latitude, longitude, risk, pincode, district);

              // Generate historical summary
              setLoadingHistorical(true);
              const summary = await createHistoricalSummary([latitude, longitude], "Your Location", risk);
              setHistoricalSummary(summary);
              setLoadingHistorical(false);

              // Fetch nearby places
              setLoadingPlaces(true);
              await fetchNearbyPlaces([latitude, longitude], "Your Location");
              setLoadingPlaces(false);
            }
          } catch (error) {
            console.error("Error fetching weather data:", error);
            alert("Error fetching weather data. Please try again.");
          }

          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Unable to get your location. Please search for a destination.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const getTileLayer = () => {
    switch (mapView) {
      case 1:
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        );
      case 2:
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          />
        );
      default:
        return (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        );
    }
  };

  const getRiskColor = (risk) => {
    if (risk >= 70) return "error";
    if (risk >= 40) return "warning";
    return "success";
  };

  const getRiskLabel = (risk) => {
    if (risk >= 70) return "High Risk";
    if (risk >= 40) return "Moderate Risk";
    return "Low Risk";
  };

  // Fetch and generate historical summary
  const createHistoricalSummary = async (coords, locationName, riskValue) => {
    try {
      // Calculate date range (last 7 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      // Fetch historical weather data
      let historicalData = null;
      try {
        const historicalResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&start_date=${startDateStr}&end_date=${endDateStr}&timezone=auto`
        );

        if (historicalResponse.ok) {
          historicalData = await historicalResponse.json();
        }
      } catch (error) {
        console.error("Error fetching historical data:", error);
      }

      // Generate summary using Gemini AI
      try {
        const weatherSummary = historicalData ? `
Temperature Data: ${JSON.stringify(historicalData.hourly?.temperature_2m?.slice(-24) || [])}
Humidity Data: ${JSON.stringify(historicalData.hourly?.relative_humidity_2m?.slice(-24) || [])}
Wind Speed Data: ${JSON.stringify(historicalData.hourly?.wind_speed_10m?.slice(-24) || [])}
Precipitation Data: ${JSON.stringify(historicalData.hourly?.precipitation?.slice(-24) || [])}
` : "Limited weather data available";

        const prompt = `You are a climate and landslide risk analysis expert. Analyze the following weather data for ${locationName} (latitude: ${coords[0]}, longitude: ${coords[1]}) and provide a comprehensive historical climate analysis.

Weather Data (Last 7 Days):
${weatherSummary}

Current Landslide Risk Level: ${riskValue}%

Please provide a detailed analysis in the following format:

**Historical Climate Analysis for ${locationName}**

**Climate Summary (Last 7 Days):**
[Analyze temperature patterns, precipitation, humidity, and wind conditions]

**Wind Conditions:**
[Analyze wind patterns and their impact on stability]

**Soil Type and Nature:**
[Analyze soil characteristics based on location and weather patterns, including permeability and saturation levels]

**Landslide Possibilities Assessment:**
[Based on the risk level ${riskValue}%, provide a detailed assessment with recommendations]

Format the response with clear sections, bullet points, and actionable recommendations. Be specific about the climate patterns observed and their implications for landslide risk.`;

        // Try different API endpoints and models (using correct model names from docs)
        const endpoints = [
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        ];

        let response = null;
        let lastError = null;

        for (const GEMINI_API_URL of endpoints) {
          try {
            response = await fetch(GEMINI_API_URL, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [{ text: prompt }],
                  },
                ],
              }),
            });

            if (response.ok) {
              break; // Success, exit loop
            } else {
              const errorData = await response.text();
              console.error(`Gemini API error (${response.status}):`, errorData);
              lastError = new Error(`API returned ${response.status}: ${errorData}`);
            }
          } catch (error) {
            console.error("Error calling Gemini API:", error);
            lastError = error;
            response = null;
          }
        }

        if (response && response.ok) {
          const data = await response.json();
          if (data.candidates && data.candidates.length > 0) {
            const aiSummary = data.candidates[0].content.parts[0].text;
            return aiSummary;
          }
        } else if (lastError) {
          console.error("All Gemini API endpoints failed. Last error:", lastError);
        }
      } catch (error) {
        console.error("Error generating summary with Gemini AI:", error);
      }

      // Fallback to text-based summary if Gemini fails
      const summary = createSummaryText(historicalData, null, coords, locationName, riskValue);
      return summary;
    } catch (error) {
      console.error("Error creating historical summary:", error);
      return createSummaryText(null, null, coords, locationName, riskValue);
    }
  };

  const createSummaryText = (historicalData, forecastData, coords, locationName, riskValue) => {
    let summary = `**Historical Climate Analysis for ${locationName}**\n\n`;

    // Climate Summary
    summary += "**Climate Summary (Last 7 Days):**\n\n";
    
    if (historicalData && historicalData.hourly) {
      const temps = historicalData.hourly.temperature_2m || [];
      const precip = historicalData.hourly.precipitation || [];
      const humidity = historicalData.hourly.relative_humidity_2m || [];
      const wind = historicalData.hourly.wind_speed_10m || [];

      if (temps.length > 0) {
        const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
        const maxTemp = Math.max(...temps);
        const minTemp = Math.min(...temps);
        const totalPrecip = precip.reduce((a, b) => a + b, 0);
        const avgHumidity = humidity.reduce((a, b) => a + b, 0) / humidity.length;
        const avgWind = wind.reduce((a, b) => a + b, 0) / wind.length;
        const maxWind = Math.max(...wind);

        summary += `• Average Temperature: ${avgTemp.toFixed(1)}°C (Range: ${minTemp.toFixed(1)}°C - ${maxTemp.toFixed(1)}°C)\n`;
        summary += `• Total Precipitation: ${totalPrecip.toFixed(1)} mm over 7 days\n`;
        summary += `• Average Humidity: ${avgHumidity.toFixed(1)}%\n`;
        summary += `• Average Wind Speed: ${avgWind.toFixed(1)} m/s (Max: ${maxWind.toFixed(1)} m/s)\n\n`;
      }
    } else {
      summary += "• Climate data: Moderate conditions observed\n";
      summary += "• Temperature: Varying between 15-25°C\n";
      summary += "• Precipitation: Intermittent rainfall patterns\n\n";
    }

    // Wind Analysis
    summary += "**Wind Conditions:**\n\n";
    if (historicalData && historicalData.hourly?.wind_speed_10m) {
      const wind = historicalData.hourly.wind_speed_10m;
      const avgWind = wind.reduce((a, b) => a + b, 0) / wind.length;
      const maxWind = Math.max(...wind);
      
      if (maxWind > 15) {
        summary += `• Strong winds observed (up to ${maxWind.toFixed(1)} m/s) - may contribute to slope instability\n`;
      } else if (avgWind > 8) {
        summary += `• Moderate wind conditions (average ${avgWind.toFixed(1)} m/s) - generally stable\n`;
      } else {
        summary += `• Light winds (average ${avgWind.toFixed(1)} m/s) - minimal impact on stability\n`;
      }
    } else {
      summary += "• Wind patterns: Generally moderate, with occasional gusts\n";
    }
    summary += "\n";

    // Soil Type and Nature Analysis (based on location and weather)
    summary += "**Soil Type and Nature:**\n\n";
    const lat = coords[0];
    const lng = coords[1];
    
    // Determine region characteristics
    if (lat > 20 && lat < 35 && lng > 70 && lng < 95) {
      // Indian subcontinent - hilly regions
      summary += "• Soil Type: Predominantly lateritic and red soil (typical of hilly regions)\n";
      summary += "• Soil Nature: Moderately permeable, prone to saturation during heavy rainfall\n";
      summary += "• Terrain: Mountainous/hilly terrain with varying slopes\n";
    } else {
      summary += "• Soil Type: Mixed composition typical of elevated regions\n";
      summary += "• Soil Nature: Variable permeability, affected by precipitation patterns\n";
      summary += "• Terrain: Elevated terrain with potential slope instability\n";
    }

    // Analyze soil saturation based on humidity and precipitation
    if (historicalData && historicalData.hourly) {
      const avgHumidity = historicalData.hourly.relative_humidity_2m?.reduce((a, b) => a + b, 0) / (historicalData.hourly.relative_humidity_2m?.length || 1) || 0;
      const totalPrecip = historicalData.hourly.precipitation?.reduce((a, b) => a + b, 0) || 0;

      if (avgHumidity > 80 && totalPrecip > 50) {
        summary += "• Current Condition: Soil is highly saturated due to recent heavy rainfall\n";
        summary += "• Stability: Reduced - high risk of waterlogging and soil movement\n";
      } else if (avgHumidity > 70 && totalPrecip > 20) {
        summary += "• Current Condition: Soil moisture levels elevated\n";
        summary += "• Stability: Moderate - monitor for signs of saturation\n";
      } else {
        summary += "• Current Condition: Soil moisture within normal ranges\n";
        summary += "• Stability: Generally stable under current conditions\n";
      }
    }
    summary += "\n";

    // Possibilities Assessment
    summary += "**Landslide Possibilities Assessment:**\n\n";
    
    if (riskValue !== null && riskValue !== undefined) {
      if (riskValue >= 70) {
        summary += "⚠️ **HIGH POSSIBILITY** - Immediate attention required!\n";
        summary += "• Conditions are highly favorable for landslide occurrence\n";
        summary += "• Heavy precipitation and saturated soil create significant risk\n";
        summary += "• Recommendation: Avoid travel, monitor conditions closely, prepare for evacuation if necessary\n";
      } else if (riskValue >= 40) {
        summary += "⚠️ **MODERATE POSSIBILITY** - Stay alert!\n";
        summary += "• Weather conditions indicate elevated risk levels\n";
        summary += "• Increased precipitation and humidity may affect slope stability\n";
        summary += "• Recommendation: Exercise caution, avoid steep slopes, monitor weather updates\n";
      } else {
        summary += "✅ **LOW POSSIBILITY** - Conditions appear stable\n";
        summary += "• Current weather patterns suggest minimal landslide risk\n";
        summary += "• Soil conditions are relatively stable\n";
        summary += "• Recommendation: Normal activities can continue, but remain aware of changing conditions\n";
      }
    } else {
      summary += "• Risk assessment: Based on historical patterns, conditions appear manageable\n";
      summary += "• Continue monitoring weather changes for any significant shifts\n";
    }

    return summary;
  };


  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Fetch nearby places using Gemini AI
  const fetchNearbyPlaces = async (coords, locationName) => {
    try {
      // Use Gemini AI to get top places to visit
      const prompt = `List 6-8 top tourist attractions, scenic spots, landmarks, or best places to visit near ${locationName} (latitude: ${coords[0]}, longitude: ${coords[1]}). 

For each place, provide:
1. Name of the place (specific and accurate)
2. Brief description (one sentence about what makes it special)
3. Approximate latitude and longitude coordinates (as accurate as possible)

Format the response as a JSON array ONLY, with this exact structure:
[
  {
    "name": "Place Name",
    "description": "Brief description of what makes this place special or interesting",
    "latitude": 10.1234,
    "longitude": 77.5678
  }
]

Only return the JSON array, no other text. Make sure the coordinates are realistic and near the location ${locationName}.`;

      // Try different API endpoints and models (using correct model names from docs)
      const endpoints = [
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      ];

      let response = null;
      let lastError = null;

      for (const GEMINI_API_URL of endpoints) {
        try {
          response = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [{ text: prompt }],
                },
              ],
            }),
          });

          if (response.ok) {
            break; // Success, exit loop
          } else {
            const errorData = await response.text();
            console.error(`Gemini API error (${response.status}):`, errorData);
            lastError = new Error(`API returned ${response.status}: ${errorData}`);
          }
        } catch (error) {
          console.error("Error calling Gemini API:", error);
          lastError = error;
          response = null;
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          const geminiResponse = data.candidates[0].content.parts[0].text;
          
          // Extract JSON from response
          let jsonMatch = geminiResponse.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            try {
              const places = JSON.parse(jsonMatch[0]);
              
              // Calculate distances and validate coordinates
              const placesWithDistance = places
                .filter((place) => place.latitude && place.longitude && place.name)
                .map((place) => {
                  const distance = calculateDistance(
                    coords[0],
                    coords[1],
                    place.latitude,
                    place.longitude
                  );
                  
                  return {
                    name: place.name,
                    description: place.description || `A popular destination near ${locationName}`,
                    latitude: place.latitude,
                    longitude: place.longitude,
                    distance: distance.toFixed(1),
                  };
                })
                .slice(0, 8); // Limit to 8 places

              if (placesWithDistance.length >= 3) {
                setNearbyPlaces(placesWithDistance);
                return;
              }
            } catch (error) {
              console.error("Error parsing places JSON from Gemini:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error fetching nearby places from Gemini AI:", error);
    }

    // Fallback to sample places if Gemini fails
    try {
      const samplePlaces = getSamplePlaces(coords, locationName);
      setNearbyPlaces(samplePlaces);
    } catch (error) {
      console.error("Error with fallback places:", error);
      setNearbyPlaces([]);
    }
  };

  // Fetch place details using OpenCage reverse geocoding
  const fetchPlaceDetails = async (place) => {
    try {
      // Try to get more info from OpenCage reverse geocoding
      let additionalInfo = "";
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${place.latitude},${place.longitude}&key=${OPENCAGE_API_KEY}&limit=1`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.results && data.results.length > 0) {
            const result = data.results[0];
            const components = result.components;
            if (components) {
              const locationParts = [
                components.city,
                components.town,
                components.village,
                components.state,
                components.country
              ].filter(Boolean);
              
              if (locationParts.length > 0) {
                additionalInfo = `Located in ${locationParts.join(', ')}. `;
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching place info from OpenCage:", error);
      }

      // Use default details with additional info
      const details = getDefaultPlaceDetails(place, additionalInfo);
      setSelectedPlaceDetails({
        ...place,
        details: details,
      });
    } catch (error) {
      console.error("Error fetching place details:", error);
      setSelectedPlaceDetails({
        ...place,
        details: getDefaultPlaceDetails(place),
      });
    } finally {
      setLoadingPlaceDetails(false);
    }
  };

  // Default place details
  const getDefaultPlaceDetails = (place, additionalInfo = "") => {
    return `**About ${place.name}**

${additionalInfo}${place.description}

**Best Time to Visit:**
The best time to visit is during the dry season when weather conditions are favorable. Early morning visits offer the best experience with pleasant weather and fewer crowds. Avoid visiting during monsoon season when landslide risks are higher.

**Things to Do:**
• Explore the scenic beauty and natural surroundings
• Take photographs of the picturesque landscape
• Enjoy the peaceful atmosphere and tranquility
• Learn about the local culture and history
• Experience the local cuisine and traditions

**Travel Tips:**
• Check weather conditions and landslide risk before visiting
• Wear comfortable walking shoes suitable for hilly terrain
• Carry water, snacks, and a first aid kit
• Respect the local environment and follow safety guidelines
• Inform someone about your travel plans

**Safety Considerations:**
• Be aware of landslide risks in hilly areas, especially during heavy rainfall
• Stay on marked paths and trails
• Monitor weather updates before and during your visit
• Follow local authorities' safety advisories
• Avoid visiting during extreme weather conditions
• Keep emergency contacts handy`;
  };

  // Get sample places as fallback
  const getSamplePlaces = (coords, locationName) => {
    // Generate sample places with slight variations in coordinates
    const samplePlaces = [
      {
        name: "Scenic Viewpoint",
        description: "Beautiful panoramic view of the surrounding mountains",
        latitude: coords[0] + (Math.random() - 0.5) * 0.1,
        longitude: coords[1] + (Math.random() - 0.5) * 0.1,
      },
      {
        name: "Historic Temple",
        description: "Ancient temple with rich cultural heritage",
        latitude: coords[0] + (Math.random() - 0.5) * 0.15,
        longitude: coords[1] + (Math.random() - 0.5) * 0.15,
      },
      {
        name: "Waterfall",
        description: "Picturesque waterfall perfect for nature lovers",
        latitude: coords[0] + (Math.random() - 0.5) * 0.12,
        longitude: coords[1] + (Math.random() - 0.5) * 0.12,
      },
      {
        name: "Tea Garden",
        description: "Lush green tea plantations offering serene views",
        latitude: coords[0] + (Math.random() - 0.5) * 0.08,
        longitude: coords[1] + (Math.random() - 0.5) * 0.08,
      },
      {
        name: "Adventure Park",
        description: "Thrilling activities and adventure sports",
        latitude: coords[0] + (Math.random() - 0.5) * 0.2,
        longitude: coords[1] + (Math.random() - 0.5) * 0.2,
      },
      {
        name: "Wildlife Sanctuary",
        description: "Home to diverse flora and fauna",
        latitude: coords[0] + (Math.random() - 0.5) * 0.18,
        longitude: coords[1] + (Math.random() - 0.5) * 0.18,
      },
    ];

    return samplePlaces.map((place) => {
      const distance = calculateDistance(
        coords[0],
        coords[1],
        place.latitude,
        place.longitude
      );
      return {
        ...place,
        distance: distance.toFixed(1),
      };
    });
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
        <Container maxWidth="xl" sx={{ pt: 4, pb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 1,
              textAlign: "center",
              background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Search For Destination
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 4 }}
          >
            Find and explore destinations with real-time weather and landslide risk assessment
          </Typography>

          {/* Search Bar with Autocomplete Suggestions */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 3,
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <Autocomplete
              freeSolo
              fullWidth
              options={searchSuggestions}
              getOptionLabel={(opt) => (typeof opt === "string" ? opt : opt.formatted || "")}
              loading={loadingSuggestions}
              inputValue={searchQuery}
              onInputChange={(e, val) => setSearchQuery(val || "")}
              onChange={(e, val) => {
                if (val && val.lat != null && val.lng != null) {
                  setSearchQuery(val.formatted);
                  setSelectedLocation({ name: val.formatted, coords: [val.lat, val.lng] });
                  setLoading(true);
                  setWeatherData(null);
                  setLandslideProbability(null);
                  setHistoricalSummary(null);
                  setNearbyPlaces([]);
                  handleSearchFromCoords(val.lat, val.lng, val.formatted, val.components);
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search any location (e.g., Munnar, Kochi, Munnar Kerala)"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              sx={{
                px: 4,
                background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                whiteSpace: "nowrap",
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Search"}
            </Button>
            <IconButton
              onClick={getCurrentLocation}
              disabled={loading}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
              title="Get Current Location"
            >
              <MyLocation />
            </IconButton>
          </Paper>

          {/* Weather and Risk Data */}
          {weatherData && (
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                    Weather Report for {selectedLocation?.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Card
                        sx={{
                          textAlign: "center",
                          bgcolor: "primary.light",
                          color: "white",
                        }}
                      >
                        <CardContent>
                          <Thermostat sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">
                            {weatherData.temperature}°C
                          </Typography>
                          <Typography variant="body2">Temperature</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card
                        sx={{
                          textAlign: "center",
                          bgcolor: "info.light",
                          color: "white",
                        }}
                      >
                        <CardContent>
                          <WaterDrop sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">
                            {weatherData.humidity}%
                          </Typography>
                          <Typography variant="body2">Humidity</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card
                        sx={{
                          textAlign: "center",
                          bgcolor: "secondary.light",
                          color: "white",
                        }}
                      >
                        <CardContent>
                          <Air sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">
                            {weatherData.windSpeed} m/s
                          </Typography>
                          <Typography variant="body2">Wind Speed</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card
                        sx={{
                          textAlign: "center",
                          bgcolor: "success.light",
                          color: "white",
                        }}
                      >
                        <CardContent>
                          <Cloud sx={{ fontSize: 40, mb: 1 }} />
                          <Typography variant="h6">
                            {weatherData.precipitation} mm
                          </Typography>
                          <Typography variant="body2">Precipitation</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                {loadingRisk ? (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 4,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px",
                      bgcolor: "grey.100",
                    }}
                  >
                    <CircularProgress size={60} sx={{ mb: 2, color: "primary.main" }} />
                    <Typography variant="h6" color="text.secondary">
                      Analyzing Risk with AI...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Checking historical data and weather patterns
                    </Typography>
                  </Paper>
                ) : landslideProbability !== null ? (
                  <Paper
                    elevation={3}
                    sx={{
                      p: 3,
                      bgcolor:
                        landslideProbability >= 70
                          ? "error.light"
                          : landslideProbability >= 40
                          ? "warning.light"
                          : "success.light",
                      color: "white",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Warning sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {landslideProbability}%
                        </Typography>
                        <Typography variant="h6">
                          {getRiskLabel(landslideProbability)}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={getRiskLabel(landslideProbability)}
                      color={getRiskColor(landslideProbability)}
                      sx={{ color: "white", fontWeight: 600 }}
                    />
                    {landslideProbability >= 10 && (
                      <Alert severity="warning" sx={{ mt: 2 }}>
                        Stay alert! Monitor weather conditions and follow safety
                        guidelines.
                      </Alert>
                    )}
                  </Paper>
                ) : null}
              </Grid>
            </Grid>
          )}

          {/* Historical Data Summary */}
          {loadingHistorical ? (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                mb: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
                bgcolor: "#fafafa",
              }}
            >
              <CircularProgress size={60} sx={{ mb: 2, color: "primary.main" }} />
              <Typography variant="h6" color="text.secondary">
                Generating Historical Analysis with AI...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Analyzing 7 days of climate data and patterns
              </Typography>
            </Paper>
          ) : historicalSummary ? (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                mb: 3,
                bgcolor: "#fafafa",
                borderLeft: "4px solid",
                borderColor: "primary.main",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Warning sx={{ fontSize: 28 }} />
                Historical Data Summary
              </Typography>
              <Box
                sx={{
                  whiteSpace: "pre-line",
                  lineHeight: 1.8,
                  "& strong": {
                    color: "primary.dark",
                    fontWeight: 600,
                  },
                }}
              >
                {historicalSummary.split("\n").map((line, index) => {
                  if (line.startsWith("**") && line.endsWith("**")) {
                    // Bold heading
                    const text = line.replace(/\*\*/g, "");
                    return (
                      <Typography
                        key={index}
                        variant="h6"
                        sx={{
                          mt: index > 0 ? 3 : 0,
                          mb: 1.5,
                          fontWeight: 600,
                          color: "primary.main",
                        }}
                      >
                        {text}
                      </Typography>
                    );
                  } else if (line.startsWith("•")) {
                    // Bullet point
                    return (
                      <Typography
                        key={index}
                        variant="body1"
                        sx={{ mb: 1, ml: 2 }}
                      >
                        {line}
                      </Typography>
                    );
                  } else if (line.trim() === "") {
                    // Empty line
                    return <br key={index} />;
                  } else {
                    // Regular text
                    return (
                      <Typography key={index} variant="body1" sx={{ mb: 1 }}>
                        {line}
                      </Typography>
                    );
                  }
                })}
              </Box>
            </Paper>
          ) : null}

          {/* Map View Tabs */}
          <Paper elevation={3} sx={{ mb: 3 }}>
            <Tabs
              value={mapView}
              onChange={(e, newValue) => setMapView(newValue)}
              centered
            >
              <Tab icon={<MapIcon />} label="Standard" />
              <Tab icon={<Satellite />} label="Satellite" />
              <Tab icon={<Terrain />} label="Terrain" />
            </Tabs>
          </Paper>

          {/* Map Container */}
          <Paper elevation={3} sx={{ height: "70vh", overflow: "hidden", mb: 3 }}>
            <MapContainer
              center={selectedLocation?.coords || [20.5937, 78.9629]}
              zoom={selectedLocation ? 12 : 5}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              {getTileLayer()}
              {selectedLocation && (
                <>
                  <Marker position={selectedLocation.coords}>
                    <Popup>
                      <strong>{selectedLocation.name}</strong>
                      <br />
                      Coordinates: {selectedLocation.coords[0].toFixed(4)},{" "}
                      {selectedLocation.coords[1].toFixed(4)}
                      {landslideProbability !== null && (
                        <>
                          <br />
                          <br />
                          <strong>Landslide Risk: {landslideProbability}%</strong>
                          <br />
                          <Chip
                            label={getRiskLabel(landslideProbability)}
                            color={getRiskColor(landslideProbability)}
                            size="small"
                          />
                        </>
                      )}
                    </Popup>
                  </Marker>
                  {nearbyPlaces.map((place, index) => (
                    <Marker
                      key={index}
                      position={[place.latitude, place.longitude]}
                    >
                      <Popup>
                        <strong>{place.name}</strong>
                        <br />
                        {place.description}
                        <br />
                        <strong>Distance: {place.distance} km</strong>
                      </Popup>
                    </Marker>
                  ))}
                  <ChangeMapView
                    center={selectedLocation.coords}
                    zoom={12}
                  />
                </>
              )}
            </MapContainer>
          </Paper>

          {/* Nearby Places to Visit */}
          {loadingPlaces ? (
            <Paper
              elevation={3}
              sx={{
                p: 4,
                mb: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
              }}
            >
              <CircularProgress size={60} sx={{ mb: 2, color: "primary.main" }} />
              <Typography variant="h6" color="text.secondary">
                Finding Top Places with AI...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Discovering best attractions and destinations nearby
              </Typography>
            </Paper>
          ) : nearbyPlaces.length > 0 ? (
            <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <LocationOn sx={{ fontSize: 28 }} />
                Top Places to Visit Near {selectedLocation?.name}
              </Typography>
              <Grid container spacing={3}>
                {nearbyPlaces.map((place, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      sx={{
                        height: "320px",
                        display: "flex",
                        flexDirection: "column",
                        transition: "all 0.3s ease",
                        border: "2px solid",
                        borderColor: "grey.300",
                        borderRadius: 3,
                        background: "linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)",
                        "&:hover": {
                          transform: "translateY(-8px) scale(1.02)",
                          boxShadow: "0 12px 24px rgba(27, 94, 32, 0.2)",
                          borderColor: "primary.main",
                          background: "linear-gradient(135deg, #ffffff 0%, #e8f5e9 100%)",
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            mb: 2,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
                            <Box
                              sx={{
                                bgcolor: "primary.main",
                                borderRadius: "50%",
                                p: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <LocationOn sx={{ color: "white", fontSize: 24 }} />
                            </Box>
                            <Typography
                              variant="h6"
                              component="h3"
                              sx={{
                                fontWeight: 700,
                                color: "primary.dark",
                                fontSize: "1.1rem",
                              }}
                            >
                              {place.name}
                            </Typography>
                          </Box>
                          <Chip
                            icon={<LocationOn sx={{ fontSize: 16 }} />}
                            label={`${place.distance} km`}
                            color="primary"
                            size="small"
                            sx={{ 
                              ml: 1,
                              fontWeight: 600,
                              bgcolor: "primary.main",
                              color: "white",
                            }}
                          />
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ 
                            mt: 1,
                            lineHeight: 1.7,
                            display: "-webkit-box",
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flexGrow: 1,
                            fontSize: "0.95rem",
                          }}
                        >
                          {place.description}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 2.5, pt: 1 }}>
                        <Button
                          size="medium"
                          variant="contained"
                          color="primary"
                          fullWidth
                          onClick={async () => {
                            setPlaceDetailsOpen(true);
                            setLoadingPlaceDetails(true);
                            await fetchPlaceDetails(place);
                          }}
                          sx={{
                            background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                            fontWeight: 600,
                            py: 1.2,
                            borderRadius: 2,
                            textTransform: "none",
                            fontSize: "0.95rem",
                            "&:hover": {
                              background: "linear-gradient(135deg, #0d3e10 0%, #1b5e20 100%)",
                              transform: "scale(1.02)",
                            },
                          }}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ) : null}

          {/* Place Details Dialog */}
          <Dialog
            open={placeDetailsOpen}
            onClose={() => setPlaceDetailsOpen(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 3,
              },
            }}
          >
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 2.5,
              }}
            >
              <LocationOn sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {selectedPlaceDetails?.name}
                </Typography>
                {selectedPlaceDetails && (
                  <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                    {selectedPlaceDetails.distance} km from {selectedLocation?.name}
                  </Typography>
                )}
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 4, mt: 2 }}>
              {loadingPlaceDetails ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 6 }}>
                  <CircularProgress size={50} />
                  <Typography variant="body1" sx={{ ml: 2 }}>
                    Fetching details...
                  </Typography>
                </Box>
              ) : selectedPlaceDetails?.details ? (
                <Box
                  sx={{
                    whiteSpace: "pre-line",
                    lineHeight: 1.8,
                    "& strong": {
                      color: "primary.main",
                      fontWeight: 600,
                    },
                  }}
                >
                  {selectedPlaceDetails.details.split("\n").map((line, index) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      // Bold heading
                      const text = line.replace(/\*\*/g, "");
                      return (
                        <Typography
                          key={index}
                          variant="h6"
                          sx={{
                            mt: index > 0 ? 3 : 0,
                            mb: 1.5,
                            fontWeight: 600,
                            color: "primary.main",
                          }}
                        >
                          {text}
                        </Typography>
                      );
                    } else if (line.startsWith("•")) {
                      // Bullet point
                      return (
                        <Typography
                          key={index}
                          variant="body1"
                          sx={{ mb: 1, ml: 2, color: "text.secondary" }}
                        >
                          {line}
                        </Typography>
                      );
                    } else if (line.trim() === "") {
                      // Empty line
                      return <br key={index} />;
                    } else {
                      // Regular text
                      return (
                        <Typography key={index} variant="body1" sx={{ mb: 1.5, color: "text.secondary" }}>
                          {line}
                        </Typography>
                      );
                    }
                  })}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  No details available for this place.
                </Typography>
              )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setPlaceDetailsOpen(false)}
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Close
              </Button>
              {selectedPlaceDetails && (
                <Button
                  variant="contained"
                  onClick={async () => {
                    setPlaceDetailsOpen(false);
                    setSelectedLocation({
                      name: selectedPlaceDetails.name,
                      coords: [selectedPlaceDetails.latitude, selectedPlaceDetails.longitude],
                    });
                    setSearchQuery(selectedPlaceDetails.name);
                    setLoading(true);
                    setWeatherData(null);
                    setLandslideProbability(null);
                    setHistoricalSummary(null);
                    setNearbyPlaces([]);

                    try {
                      let weatherDataResponse = null;
                      try {
                        const weatherResponse = await fetch(
                          `https://api.open-meteo.com/v1/forecast?latitude=${selectedPlaceDetails.latitude}&longitude=${selectedPlaceDetails.longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=auto&forecast_days=1`
                        );
                        
                        if (weatherResponse.ok) {
                          weatherDataResponse = await weatherResponse.json();
                        }
                      } catch (error) {
                        console.error("Error fetching weather:", error);
                        weatherDataResponse = {
                          hourly: {
                            temperature_2m: [25, 24, 23, 22],
                            relative_humidity_2m: [65, 70, 75, 80],
                            wind_speed_10m: [5, 6, 7, 8],
                            precipitation: [0, 0, 2, 5]
                          }
                        };
                      }

                      if (
                        weatherDataResponse?.hourly &&
                        weatherDataResponse.hourly.temperature_2m &&
                        weatherDataResponse.hourly.temperature_2m.length > 0
                      ) {
                        const lastIndex = weatherDataResponse.hourly.temperature_2m.length - 1;

                        const currentWeather = {
                          temperature: weatherDataResponse.hourly.temperature_2m[lastIndex],
                          humidity: weatherDataResponse.hourly.relative_humidity_2m[lastIndex],
                          windSpeed: weatherDataResponse.hourly.wind_speed_10m[lastIndex],
                          precipitation: weatherDataResponse.hourly.precipitation[lastIndex],
                        };

                        setWeatherData(currentWeather);

                        const risk = await predictLandslideRisk(
                          weatherDataResponse.hourly,
                          selectedPlaceDetails.latitude,
                          selectedPlaceDetails.longitude,
                          selectedPlaceDetails.name
                        );

                        let pincode = null;
                        let district = null;
                        try {
                          const reverseGeoResponse = await fetch(
                            `https://api.opencagedata.com/geocode/v1/json?q=${selectedPlaceDetails.latitude},${selectedPlaceDetails.longitude}&key=${OPENCAGE_API_KEY}&limit=1`
                          );
                          if (reverseGeoResponse.ok) {
                            const reverseGeoData = await reverseGeoResponse.json();
                            if (reverseGeoData.results && reverseGeoData.results.length > 0) {
                              const comp = reverseGeoData.results[0].components || {};
                              pincode = comp.postcode || null;
                              district = getDistrictFromComponents(comp);
                            }
                          }
                        } catch (error) {
                          console.error("Error getting location data:", error);
                        }

                        await saveRiskPrediction(
                          selectedPlaceDetails.name,
                          selectedPlaceDetails.latitude,
                          selectedPlaceDetails.longitude,
                          risk,
                          pincode,
                          district
                        );

                        setLoadingHistorical(true);
                        const summary = await createHistoricalSummary(
                          [selectedPlaceDetails.latitude, selectedPlaceDetails.longitude],
                          selectedPlaceDetails.name,
                          risk
                        );
                        setHistoricalSummary(summary);
                        setLoadingHistorical(false);

                        setLoadingPlaces(true);
                        await fetchNearbyPlaces([selectedPlaceDetails.latitude, selectedPlaceDetails.longitude], selectedPlaceDetails.name);
                        setLoadingPlaces(false);
                      }
                    } catch (error) {
                      console.error("Error fetching place data:", error);
                    }

                    setLoading(false);
                  }}
                  sx={{
                    background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                    fontWeight: 600,
                  }}
                >
                  View Weather & Risk
                </Button>
              )}
            </DialogActions>
          </Dialog>

          {/* Quick Access Destinations */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Quick Access Destinations
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              {destinations.map((location, idx) => (
                <Button
                  key={idx}
                  variant={
                    selectedLocation?.name === location.name
                      ? "contained"
                      : "outlined"
                  }
                  onClick={() => handleLocationClick(location)}
                  disabled={loading}
                  sx={{
                    background:
                      selectedLocation?.name === location.name
                        ? "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)"
                        : "transparent",
                    borderColor: "primary.main",
                    color:
                      selectedLocation?.name === location.name
                        ? "white"
                        : "primary.main",
                    "&:hover": {
                      bgcolor:
                        selectedLocation?.name === location.name
                          ? "primary.dark"
                          : "primary.light",
                      color: "white",
                    },
                  }}
                >
                  {location.name}
                </Button>
              ))}
            </Box>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default SearchDestination;
