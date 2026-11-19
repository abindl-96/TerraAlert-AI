import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  DialogActions
} from "@mui/material";
import {
  Warning,
  LocationOn,
  TrendingUp,
  Map as MapIcon,
  Error,
  CheckCircle,
} from "@mui/icons-material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Fix for default marker icons
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
  else if (riskPercentage >= 31) color = "#f57c00"; // Dark Orange (Moderate)

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

function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

const GovernmentDashboardHome = ({onNavigate}) => {

  const [riskPredictions, setRiskPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(5);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
  });
  const [highRiskZones, setHighRiskZones] = useState([]);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [alertForm, setAlertForm] = useState({
    title: "",
    message: "",
    type: "warning",
    priority: "high",
  });

  useEffect(() => {
    fetchRiskPredictions();
  }, []);

  const fetchRiskPredictions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8081/api/get/getRiskPredictions");
      const predictions = response.data.data || [];
      setRiskPredictions(predictions);
      setError(null);

      // Calculate statistics
      const newStats = {
        total: predictions.length,
        critical: predictions.filter((p) => parseFloat(p.risk_percentage) >= 86).length,
        high: predictions.filter(
          (p) =>
            parseFloat(p.risk_percentage) >= 61 && parseFloat(p.risk_percentage) < 86
        ).length,
        moderate: predictions.filter(
          (p) =>
            parseFloat(p.risk_percentage) >= 31 && parseFloat(p.risk_percentage) < 61
        ).length,
        low: predictions.filter((p) => parseFloat(p.risk_percentage) < 31).length,
      };
      setStats(newStats);

      // Filter high-risk zones
      const highRisk = predictions
        .filter((p) => parseFloat(p.risk_percentage) >= 61)
        .sort((a, b) => parseFloat(b.risk_percentage) - parseFloat(a.risk_percentage));
      setHighRiskZones(highRisk);

      // Set map center based on predictions
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

  // Get high-risk zones (>= 61%) - already computed in fetchRiskPredictions
  const displayedHighRiskZones = highRiskZones.slice(0, 10);

  const handleIssuePublicAlert = () => {
    setAlertForm({
      title: "Public Landslide Alert",
      message: "Please stay alert and follow safety guidelines. Monitor weather conditions and avoid high-risk areas.",
      type: "warning",
      priority: "high",
    });
    setOpenAlertDialog(true);
  };

  const handleCreateNotification = async () => {
    try {
      const authorityData = JSON.parse(localStorage.getItem("userData") || "{}");

      await axios.post("http://localhost:8081/api/add/createNotification", {
        ...alertForm,
        created_by: authorityData.id,
        created_by_type: "government",
      });

      alert("Public alert issued successfully!");
      setOpenAlertDialog(false);
      setAlertForm({
        title: "",
        message: "",
        type: "warning",
        priority: "high",
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      alert("Failed to issue alert. Please try again.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "primary.main" }}>
        Landslide Risk Zones Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              bgcolor: "primary.main",
              color: "white",
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2">Total Zones</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              bgcolor: "error.main",
              color: "white",
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.critical}
              </Typography>
              <Typography variant="body2">Critical Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              bgcolor: "warning.main",
              color: "white",
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.high}
              </Typography>
              <Typography variant="body2">High Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              bgcolor: "info.main",
              color: "white",
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.moderate}
              </Typography>
              <Typography variant="body2">Moderate Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              bgcolor: "success.main",
              color: "white",
              height: "100%",
              transition: "transform 0.3s",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          >
            <CardContent>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stats.low}
              </Typography>
              <Typography variant="body2">Low Risk</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Map */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden", mb: 3 }}>
            <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                <MapIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Interactive Risk Map
              </Typography>
            </Box>
            <Box sx={{ height: "500px", position: "relative" }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : (
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
                  {riskPredictions.map((prediction) => (
                    <Marker
                      key={prediction.id}
                      position={[
                        parseFloat(prediction.latitude),
                        parseFloat(prediction.longitude),
                      ]}
                      icon={createCustomIcon(parseFloat(prediction.risk_percentage))}
                    >
                      <Popup>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {prediction.location_name}
                          </Typography>
                          <Chip
                            label={`${parseFloat(prediction.risk_percentage).toFixed(1)}% - ${getRiskLabel(parseFloat(prediction.risk_percentage))}`}
                            color={getRiskColor(parseFloat(prediction.risk_percentage))}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {new Date(prediction.created_at).toLocaleString()}
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
              )}
            </Box>
          </Paper>
        </Grid>

        {/* High Risk Zones List */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 2,
              maxHeight: "500px",
              overflow: "auto",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "error.main" }}>
              <Warning sx={{ mr: 1, verticalAlign: "middle" }} />
              High-Risk Zones
            </Typography>
            {displayedHighRiskZones.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                No high-risk zones currently
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {displayedHighRiskZones.map((zone) => (
                  <Card
                    key={zone.id}
                    sx={{
                      p: 1.5,
                      borderLeft: `4px solid ${parseFloat(zone.risk_percentage) >= 86
                          ? "#d32f2f"
                          : "#ed6c02"
                        }`,
                      "&:hover": {
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {zone.location_name}
                      </Typography>
                      <Chip
                        label={`${parseFloat(zone.risk_percentage).toFixed(1)}%`}
                        color={getRiskColor(parseFloat(zone.risk_percentage))}
                        size="small"
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {zone.pincode && `📍 ${zone.pincode} • `}
                      {new Date(zone.created_at).toLocaleDateString()}
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Risk Predictions Table */}
      <Paper elevation={3} sx={{ borderRadius: 2, mt: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2, bgcolor: "primary.main", color: "white" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Recent Risk Predictions
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.100" }}>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Risk %</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pincode</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {riskPredictions.slice(0, 10).map((prediction) => (
                <TableRow key={prediction.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: "primary.main" }} />
                      {prediction.location_name}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={`${parseFloat(prediction.risk_percentage).toFixed(1)}%`}
                      color={getRiskColor(parseFloat(prediction.risk_percentage))}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{prediction.pincode || "N/A"}</TableCell>
                  <TableCell>
                    {new Date(prediction.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {parseFloat(prediction.risk_percentage) >= 61 ? (
                      <Chip
                        icon={<Error />}
                        label="Action Required"
                        color="error"
                        size="small"
                      />
                    ) : (
                      <Chip
                        icon={<CheckCircle />}
                        label="Monitoring"
                        color="success"
                        size="small"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Quick Statistics & Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Quick Statistics */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Quick Statistics
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "error.main" }}>
                  {highRiskZones.filter((z) => parseFloat(z.risk_percentage) >= 86).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Critical Risk Zones
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.main" }}>
                  {highRiskZones.filter(
                    (z) =>
                      parseFloat(z.risk_percentage) >= 61 &&
                      parseFloat(z.risk_percentage) < 86
                  ).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High Risk Zones
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "info.main" }}>
                  {riskPredictions.filter(
                    (z) =>
                      parseFloat(z.risk_percentage) >= 31 &&
                      parseFloat(z.risk_percentage) < 61
                  ).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Moderate Risk Zones
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            
              <Button
                variant="contained"
                color="error"
                fullWidth
                startIcon={<Warning />}
                sx={{ mb: 1, py: 1.5 }}
              >
                Emergency Response
              </Button>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<TrendingUp />}
                onClick={() => {
                  onNavigate && onNavigate("reports")
                }}
                sx={{ py: 1.5 }}
              >
                Generate Report
              </Button>

              <Button
                variant="outlined"
                color="primary"
                fullWidth
                startIcon={<Warning />}
                onClick={handleIssuePublicAlert}
                sx={{ py: 1.5 }}
              >
                Issue Public Alert
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Issue Public Alert Dialog */}
      <Dialog
        open={openAlertDialog}
        onClose={() => setOpenAlertDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          Issue Public Alert
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Alert Title"
            value={alertForm.title}
            onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <TextField
            fullWidth
            label="Alert Message"
            multiline
            rows={6}
            value={alertForm.message}
            onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
            sx={{ mb: 2 }}
            required
          />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={alertForm.type}
                  onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={alertForm.priority}
                  onChange={(e) => setAlertForm({ ...alertForm, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenAlertDialog(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleCreateNotification}
            variant="contained"
            disabled={!alertForm.title || !alertForm.message}
          >
            Issue Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernmentDashboardHome;
