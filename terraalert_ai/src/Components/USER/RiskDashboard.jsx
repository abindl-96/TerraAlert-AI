import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import {
  Map as MapIcon,
  FilterList,
  Refresh,
  Close,
  LocationOn,
  Warning,
  CheckCircle,
  Error,
  Info,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import Navbar from "./UserComponents/Navbar";
import Footer from "./UserComponents/Footer";
import "./RiskDashboard.css";

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

// Custom marker icons based on risk level
const createCustomIcon = (riskPercentage) => {
  let color = "#2e7d32"; // Green (Low)
  if (riskPercentage >= 86) color = "#d32f2f"; // Red (Critical)
  else if (riskPercentage >= 61) color = "#ed6c02"; // Orange (High)
  else if (riskPercentage >= 31) color = "#ed6c02"; // Orange (Moderate)
  else if (riskPercentage >= 10) color = "#f57c00"; // Dark Orange (Low-Moderate)

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">${Math.round(riskPercentage)}</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

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

const RiskDashboard = () => {
  const [riskPredictions, setRiskPredictions] = useState([]);
  const [filteredPredictions, setFilteredPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchRiskPredictions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [riskPredictions, selectedRisk, selectedDate]);

  const fetchRiskPredictions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8081/api/get/getRiskPredictions");
      const predictions = response.data.data || [];
      setRiskPredictions(predictions);
      setFilteredPredictions(predictions);
      setError(null);

      // Set map center based on predictions if available
      if (predictions.length > 0) {
        const avgLat =
          predictions.reduce((sum, p) => sum + parseFloat(p.latitude), 0) /
          predictions.length;
        const avgLng =
          predictions.reduce((sum, p) => sum + parseFloat(p.longitude), 0) /
          predictions.length;
        setMapCenter([avgLat, avgLng]);
        setMapZoom(6);
      }
    } catch (error) {
      console.error("Error fetching risk predictions:", error);
      setError("Failed to load risk predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...riskPredictions];

    // Filter by risk level
    if (selectedRisk !== "all") {
      const riskRanges = {
        low: [0, 30],
        moderate: [31, 60],
        high: [61, 85],
        critical: [86, 100],
      };
      const [min, max] = riskRanges[selectedRisk] || [0, 100];
      filtered = filtered.filter(
        (p) =>
          parseFloat(p.risk_percentage) >= min &&
          parseFloat(p.risk_percentage) <= max
      );
    }

    // Filter by date
    if (selectedDate !== "all") {
      const today = new Date();
      const filterDate = new Date();
      
      switch (selectedDate) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((p) => {
            const predDate = new Date(p.created_at);
            return predDate >= filterDate;
          });
          break;
        case "week":
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter((p) => {
            const predDate = new Date(p.created_at);
            return predDate >= filterDate;
          });
          break;
        case "month":
          filterDate.setMonth(today.getMonth() - 1);
          filtered = filtered.filter((p) => {
            const predDate = new Date(p.created_at);
            return predDate >= filterDate;
          });
          break;
        default:
          break;
      }
    }

    setFilteredPredictions(filtered);
  };

  const getRiskLabel = (risk) => {
    if (risk >= 86) return "CRITICAL";
    if (risk >= 61) return "HIGH";
    if (risk >= 31) return "MODERATE";
    return "LOW";
  };

  const getRiskColor = (risk) => {
    if (risk >= 86) return "error";
    if (risk >= 61) return "warning";
    if (risk >= 31) return "info";
    return "success";
  };

  const handleMarkerClick = (prediction) => {
    setSelectedPrediction(prediction);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedPrediction(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate statistics
  const stats = {
    total: filteredPredictions.length,
    low: filteredPredictions.filter((p) => parseFloat(p.risk_percentage) <= 30).length,
    moderate: filteredPredictions.filter(
      (p) =>
        parseFloat(p.risk_percentage) >= 31 &&
        parseFloat(p.risk_percentage) <= 60
    ).length,
    high: filteredPredictions.filter(
      (p) =>
        parseFloat(p.risk_percentage) >= 61 &&
        parseFloat(p.risk_percentage) <= 85
    ).length,
    critical: filteredPredictions.filter(
      (p) => parseFloat(p.risk_percentage) >= 86
    ).length,
  };

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa", pt: 2, pb: 4 }}>
        <Container maxWidth="xl">
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Interactive Risk Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View all landslide risk predictions on an interactive map
            </Typography>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ bgcolor: "primary.main", color: "white" }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.total}
                  </Typography>
                  <Typography variant="body2">Total Predictions</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ bgcolor: "success.main", color: "white" }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.low}
                  </Typography>
                  <Typography variant="body2">Low Risk</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ bgcolor: "info.main", color: "white" }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.moderate}
                  </Typography>
                  <Typography variant="body2">Moderate Risk</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ bgcolor: "warning.main", color: "white" }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.high}
                  </Typography>
                  <Typography variant="body2">High Risk</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Card sx={{ bgcolor: "error.main", color: "white" }}>
                <CardContent>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.critical}
                  </Typography>
                  <Typography variant="body2">Critical Risk</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <FilterList color="primary" />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Risk Level</InputLabel>
                <Select
                  value={selectedRisk}
                  label="Risk Level"
                  onChange={(e) => setSelectedRisk(e.target.value)}
                >
                  <MenuItem value="all">All Levels</MenuItem>
                  <MenuItem value="low">Low (0-30%)</MenuItem>
                  <MenuItem value="moderate">Moderate (31-60%)</MenuItem>
                  <MenuItem value="high">High (61-85%)</MenuItem>
                  <MenuItem value="critical">Critical (86-100%)</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={selectedDate}
                  label="Date Range"
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchRiskPredictions}
                disabled={loading}
              >
                Refresh
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Chip
                label={`${filteredPredictions.length} locations shown`}
                color="primary"
                icon={<MapIcon />}
              />
            </Box>
          </Paper>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "500px",
              }}
            >
              <CircularProgress size={60} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : filteredPredictions.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <MapIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No risk predictions found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Try adjusting your filters or search for locations to generate predictions.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {/* Map */}
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <Box sx={{ height: "600px", position: "relative" }}>
                    <MapContainer
                      center={mapCenter}
                      zoom={mapZoom}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom={true}
                    >
                      <ChangeMapView center={mapCenter} zoom={mapZoom} />
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      {filteredPredictions.map((prediction) => (
                        <Marker
                          key={prediction.id}
                          position={[
                            parseFloat(prediction.latitude),
                            parseFloat(prediction.longitude),
                          ]}
                          icon={createCustomIcon(
                            parseFloat(prediction.risk_percentage)
                          )}
                          eventHandlers={{
                            click: () => handleMarkerClick(prediction),
                          }}
                        >
                          <Popup>
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {prediction.location_name}
                              </Typography>
                              <Chip
                                label={`${parseFloat(prediction.risk_percentage).toFixed(1)}% - ${getRiskLabel(parseFloat(prediction.risk_percentage))}`}
                                color={getRiskColor(
                                  parseFloat(prediction.risk_percentage)
                                )}
                                size="small"
                                sx={{ mt: 1 }}
                              />
                              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                {formatDate(prediction.created_at)}
                              </Typography>
                              {prediction.pincode && (
                                <Typography variant="caption" display="block">
                                  Pincode: {prediction.pincode}
                                </Typography>
                              )}
                            </Box>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </Box>
                </Paper>
              </Grid>

              {/* Risk List */}
              <Grid item xs={12} md={4}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    maxHeight: "600px",
                    overflow: "auto",
                  }}
                  className="risk-list-container"
                >
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Risk Locations
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {filteredPredictions
                      .sort(
                        (a, b) =>
                          parseFloat(b.risk_percentage) -
                          parseFloat(a.risk_percentage)
                      )
                      .map((prediction) => (
                        <Card
                          key={prediction.id}
                          sx={{
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                              transform: "translateX(4px)",
                              boxShadow: 4,
                            },
                          }}
                          onClick={() => handleMarkerClick(prediction)}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 600, flexGrow: 1 }}
                              >
                                {prediction.location_name}
                              </Typography>
                              <Chip
                                label={`${parseFloat(prediction.risk_percentage).toFixed(1)}%`}
                                color={getRiskColor(
                                  parseFloat(prediction.risk_percentage)
                                )}
                                size="small"
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(prediction.created_at)}
                            </Typography>
                            {prediction.pincode && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                📍 {prediction.pincode}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={handleCloseDetails}
        maxWidth="sm"
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
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Risk Prediction Details
          </Typography>
          <IconButton onClick={handleCloseDetails} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {selectedPrediction && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <LocationOn sx={{ fontSize: 40, color: "primary.main" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedPrediction.location_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(selectedPrediction.created_at)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor:
                        parseFloat(selectedPrediction.risk_percentage) >= 86
                          ? "error.light"
                          : parseFloat(selectedPrediction.risk_percentage) >= 61
                          ? "warning.light"
                          : parseFloat(selectedPrediction.risk_percentage) >= 31
                          ? "info.light"
                          : "success.light",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {parseFloat(selectedPrediction.risk_percentage).toFixed(1)}%
                    </Typography>
                    <Chip
                      label={getRiskLabel(
                        parseFloat(selectedPrediction.risk_percentage)
                      )}
                      color={getRiskColor(
                        parseFloat(selectedPrediction.risk_percentage)
                      )}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Latitude
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parseFloat(selectedPrediction.latitude).toFixed(6)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Longitude
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {parseFloat(selectedPrediction.longitude).toFixed(6)}
                  </Typography>
                </Grid>
                {selectedPrediction.pincode && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Pincode
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {selectedPrediction.pincode}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Prediction ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    #{selectedPrediction.id}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDetails} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Footer />
    </>
  );
};

export default RiskDashboard;
