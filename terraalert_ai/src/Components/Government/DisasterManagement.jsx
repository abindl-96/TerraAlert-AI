import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Warning,
  CheckCircle,
  LocationOn,
  TrendingUp,
  Assessment,
  Emergency,
  Shield,
} from "@mui/icons-material";
import axios from "axios";

const DisasterManagement = () => {
  const [riskPredictions, setRiskPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [highRiskZones, setHighRiskZones] = useState([]);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8081/api/get/getRiskPredictions");
      const predictions = response.data.data || [];
      setRiskPredictions(predictions);

      // Filter high-risk zones (>= 61%)
      const highRisk = predictions
        .filter((p) => parseFloat(p.risk_percentage) >= 61)
        .sort((a, b) => parseFloat(b.risk_percentage) - parseFloat(a.risk_percentage));
      setHighRiskZones(highRisk);
    } catch (error) {
      console.error("Error fetching risk data:", error);
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

  const actionPlans = [
    {
      title: "Immediate Evacuation",
      description: "Coordinate with local authorities for immediate evacuation of high-risk areas",
      priority: "high",
      icon: <Emergency />,
    },
    {
      title: "Monitor Weather Conditions",
      description: "Set up continuous monitoring of weather patterns and rainfall intensity",
      priority: "high",
      icon: <TrendingUp />,
    },
    {
      title: "Deploy Emergency Response Teams",
      description: "Position rescue teams and equipment near high-risk zones",
      priority: "high",
      icon: <Shield />,
    },
    {
      title: "Public Awareness Campaign",
      description: "Issue public warnings and safety guidelines for affected areas",
      priority: "medium",
      icon: <Warning />,
    },
    {
      title: "Infrastructure Assessment",
      description: "Assess and reinforce critical infrastructure in risk zones",
      priority: "medium",
      icon: <Assessment />,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "primary.main" }}>
        Disaster Management & Preventive Action Planning
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* High-Risk Zones Summary */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Warning sx={{ fontSize: 32, color: "error.main", mr: 2 }} />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    High-Risk Zones Requiring Attention
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {highRiskZones.length} zones with risk ≥ 61%
                  </Typography>
                </Box>
              </Box>
              {highRiskZones.length === 0 ? (
                <Alert severity="success" sx={{ mt: 2 }}>
                  No high-risk zones currently. All areas are within safe parameters.
                </Alert>
              ) : (
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {highRiskZones.slice(0, 6).map((zone) => (
                    <Grid item xs={12} sm={6} md={4} key={zone.id}>
                      <Card
                        sx={{
                          borderLeft: `4px solid ${
                            parseFloat(zone.risk_percentage) >= 86 ? "#d32f2f" : "#ed6c02"
                          }`,
                          "&:hover": {
                            boxShadow: 4,
                          },
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {zone.location_name}
                            </Typography>
                            <Chip
                              label={`${parseFloat(zone.risk_percentage).toFixed(1)}%`}
                              color={getRiskColor(parseFloat(zone.risk_percentage))}
                              size="small"
                            />
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                            <LocationOn sx={{ fontSize: 14, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {zone.pincode || "Coordinates: " + parseFloat(zone.latitude).toFixed(4) + ", " + parseFloat(zone.longitude).toFixed(4)}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(zone.created_at).toLocaleDateString()}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Preventive Action Plans */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                Recommended Preventive Actions
              </Typography>
              <List>
                {actionPlans.map((plan, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      sx={{
                        bgcolor: plan.priority === "high" ? "error.light" : "warning.light",
                        borderRadius: 2,
                        mb: 1,
                        py: 2,
                      }}
                    >
                      <ListItemIcon>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: "50%",
                            bgcolor: "white",
                            color: plan.priority === "high" ? "error.main" : "warning.main",
                          }}
                        >
                          {plan.icon}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {plan.title}
                            </Typography>
                            <Chip
                              label={plan.priority}
                              color={plan.priority === "high" ? "error" : "warning"}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={plan.description}
                      />
                    </ListItem>
                    {index < actionPlans.length - 1 && <Divider sx={{ my: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DisasterManagement;
