import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import {
  Assessment,
  TrendingUp,
  Warning,
  Notifications,
  People,
  Business,
  Download,
} from "@mui/icons-material";
import axios from "axios";

const GenerateReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      const response = await axios.get(
        `http://localhost:8081/api/report/generateReport?${params.toString()}`
      );
      setReport(response.data.report);
    } catch (error) {
      console.error("Error generating report:", error);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;

    const reportText = `
TERRAALERT SYSTEM REPORT
Generated: ${new Date().toLocaleString()}
Date Range: ${startDate || "All Time"} to ${endDate || "All Time"}

=== RISK PREDICTIONS ===
Total Predictions: ${report.risk_predictions?.total_predictions || 0}
Critical Risk: ${report.risk_predictions?.critical_count || 0}
High Risk: ${report.risk_predictions?.high_count || 0}
Moderate Risk: ${report.risk_predictions?.moderate_count || 0}
Low Risk: ${report.risk_predictions?.low_count || 0}
Average Risk: ${parseFloat(report.risk_predictions?.avg_risk || 0).toFixed(2)}%
Max Risk: ${parseFloat(report.risk_predictions?.max_risk || 0).toFixed(2)}%
Min Risk: ${parseFloat(report.risk_predictions?.min_risk || 0).toFixed(2)}%

=== NOTIFICATIONS ===
Total Notifications: ${report.notifications?.total_notifications || 0}
Warning Notifications: ${report.notifications?.warning_count || 0}
Info Notifications: ${report.notifications?.info_count || 0}
High Priority: ${report.notifications?.high_priority_count || 0}
Alert Senders: ${report.notifications?.alert_senders || 0}

=== USERS ===
Total Users: ${report.users?.total_users || 0}
Active Users: ${report.users?.active_users || 0}
Blocked Users: ${report.users?.blocked_users || 0}

=== GOVERNMENT AUTHORITIES ===
Total Authorities: ${report.authorities?.total_authorities || 0}
Active Authorities: ${report.authorities?.active_authorities || 0}
Departments: ${report.authorities?.departments_count || 0}
    `;

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terraalert-report-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "primary.main" }}>
        Generate Report
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateReport}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {report && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Report Results
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleDownloadReport}
            >
              Download Report
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Risk Predictions */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Warning sx={{ mr: 1, color: "error.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Risk Predictions
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Total:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {report.risk_predictions?.total_predictions || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Critical:</Typography>
                      <Chip label={report.risk_predictions?.critical_count || 0} color="error" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>High:</Typography>
                      <Chip label={report.risk_predictions?.high_count || 0} color="warning" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Moderate:</Typography>
                      <Chip label={report.risk_predictions?.moderate_count || 0} color="info" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Low:</Typography>
                      <Chip label={report.risk_predictions?.low_count || 0} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                      <Typography>Avg Risk:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {parseFloat(report.risk_predictions?.avg_risk || 0).toFixed(2)}%
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Notifications */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Notifications sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Notifications
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Total:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {report.notifications?.total_notifications || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Warnings:</Typography>
                      <Typography>{report.notifications?.warning_count || 0}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Info:</Typography>
                      <Typography>{report.notifications?.info_count || 0}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>High Priority:</Typography>
                      <Typography>{report.notifications?.high_priority_count || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Users */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <People sx={{ mr: 1, color: "info.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Users
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Total:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {report.users?.total_users || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Active:</Typography>
                      <Chip label={report.users?.active_users || 0} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Blocked:</Typography>
                      <Chip label={report.users?.blocked_users || 0} color="error" size="small" />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Authorities */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Business sx={{ mr: 1, color: "warning.main" }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Authorities
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Total:</Typography>
                      <Typography sx={{ fontWeight: 600 }}>
                        {report.authorities?.total_authorities || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Active:</Typography>
                      <Chip label={report.authorities?.active_authorities || 0} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Departments:</Typography>
                      <Typography>{report.authorities?.departments_count || 0}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Risk Locations */}
            {report.top_risk_locations && report.top_risk_locations.length > 0 && (
              <Grid item xs={12}>
                <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Top Risk Locations
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Pincode</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Risk %</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Predictions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {report.top_risk_locations.map((location, index) => (
                          <TableRow key={index}>
                            <TableCell>{location.location_name}</TableCell>
                            <TableCell>{location.pincode || "N/A"}</TableCell>
                            <TableCell>
                              <Chip
                                label={`${parseFloat(location.risk_percentage).toFixed(1)}%`}
                                color={
                                  parseFloat(location.risk_percentage) >= 61
                                    ? "error"
                                    : parseFloat(location.risk_percentage) >= 31
                                    ? "warning"
                                    : "info"
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{location.prediction_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>
            )}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default GenerateReport;
