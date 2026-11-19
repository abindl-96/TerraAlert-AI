import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Send,
  Email,
  Warning,
  LocationOn,
} from "@mui/icons-material";
import axios from "axios";

const SendAlerts = () => {
  const [authorities, setAuthorities] = useState([]);
  const [riskPredictions, setRiskPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    authority_id: "",
    subject: "",
    message: "",
    risk_prediction_id: "",
    location_name: "",
    risk_percentage: null,
    priority: "medium",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAuthorities();
    fetchRiskPredictions();
  }, []);

  const fetchAuthorities = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8081/api/get/getAllGovernmentAuthorities"
      );
      setAuthorities(response.data.data || []);
    } catch (error) {
      console.error("Error fetching authorities:", error);
    }
  };

  const fetchRiskPredictions = async () => {
    try {
      const response = await axios.get("http://localhost:8081/api/get/getRiskPredictions");
      const predictions = response.data.data || [];
      // Filter high-risk predictions (>= 61%)
      const highRisk = predictions
        .filter((p) => parseFloat(p.risk_percentage) >= 21)
        .sort((a, b) => parseFloat(b.risk_percentage) - parseFloat(a.risk_percentage));
      setRiskPredictions(highRisk);
    } catch (error) {
      console.error("Error fetching risk predictions:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage({ type: "", text: "" });
  };

  const handleRiskPredictionSelect = (predictionId) => {
    const prediction = riskPredictions.find((p) => p.id === parseInt(predictionId));
    if (prediction) {
      setFormData({
        ...formData,
        risk_prediction_id: predictionId,
        location_name: prediction.location_name,
        risk_percentage: parseFloat(prediction.risk_percentage),
        subject: `High Risk Alert - ${prediction.location_name}`,
        message: `Landslide risk has been detected at ${prediction.location_name} with a risk percentage of ${parseFloat(prediction.risk_percentage).toFixed(1)}%. Immediate attention and preventive measures are recommended.`,
      });
    }
  };

  const handleSubmit = async () => {
    if (!formData.authority_id || !formData.subject || !formData.message) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const adminData = JSON.parse(localStorage.getItem("userData") || "{}");
      await axios.post("http://localhost:8081/api/add/sendGovernmentAlert", {
        ...formData,
        sent_by: adminData.id || null,
      });

      setMessage({ type: "success", text: "Alert sent successfully!" });
      setFormData({
        authority_id: "",
        subject: "",
        message: "",
        risk_prediction_id: "",
        location_name: "",
        risk_percentage: null,
        priority: "medium",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error sending alert:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to send alert",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "primary.main" }}>
        Send Alert to Government Authorities
      </Typography>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 3 }} onClose={() => setMessage({ type: "", text: "" })}>
          {message.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              <Email sx={{ mr: 1, verticalAlign: "middle" }} />
              Compose Alert
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl sx={{width:"200px"}} fullWidth>
                  <InputLabel>Select Government Authority *</InputLabel>
                  <Select
                    name="authority_id"
                    value={formData.authority_id}
                    onChange={handleChange}
                    label="Select Government Authority *"
                  >
                    {authorities
                      .filter((a) => a.status === "active")
                      .map((authority) => (
                        <MenuItem key={authority.id} value={authority.id}>
                          {authority.name} - {authority.department}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl sx={{width:"200px"}} fullWidth>
                  <InputLabel>Select High-Risk Location (Optional)</InputLabel>
                  <Select
                    name="risk_prediction_id"
                    value={formData.risk_prediction_id}
                    onChange={(e) => handleRiskPredictionSelect(e.target.value)}
                    label="Select High-Risk Location (Optional)"
                  >
                    <MenuItem value="">None</MenuItem>
                    {riskPredictions.map((prediction) => (
                      <MenuItem key={prediction.id} value={prediction.id}>
                        {prediction.location_name} - {parseFloat(prediction.risk_percentage).toFixed(1)}% Risk
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Priority *"
                  name="priority"
                  select
                  value={formData.priority}
                  onChange={handleChange}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                {formData.risk_percentage && (
                  <Card sx={{ bgcolor: "error.light", p: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Risk Level: {formData.risk_percentage.toFixed(1)}%
                    </Typography>
                  </Card>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subject *"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message *"
                  name="message"
                  multiline
                  rows={6}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<Send />}
                  onClick={handleSubmit}
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{
                    background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                    py: 1.5,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Send Alert"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* High-Risk Locations */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              <Warning sx={{ mr: 1, verticalAlign: "middle", color: "error.main" }} />
              High-Risk Locations
            </Typography>
            {riskPredictions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No high-risk locations currently
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {riskPredictions.slice(0, 5).map((prediction) => (
                  <Card
                    key={prediction.id}
                    sx={{
                      p: 1.5,
                      cursor: "pointer",
                      borderLeft: `4px solid ${
                        parseFloat(prediction.risk_percentage) >= 86 ? "#d32f2f" : "#ed6c02"
                      }`,
                      "&:hover": {
                        boxShadow: 3,
                      },
                    }}
                    onClick={() => handleRiskPredictionSelect(prediction.id)}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {prediction.location_name}
                      </Typography>
                      <Chip
                        label={`${parseFloat(prediction.risk_percentage).toFixed(1)}%`}
                        color={
                          parseFloat(prediction.risk_percentage) >= 86 ? "error" : "warning"
                        }
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <LocationOn sx={{ fontSize: 12, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {prediction.pincode || "N/A"}
                      </Typography>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SendAlerts;
