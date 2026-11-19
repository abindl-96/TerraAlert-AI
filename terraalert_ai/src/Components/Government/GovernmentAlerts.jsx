import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Grid,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Email,
  Warning,
  Close,
  MarkEmailRead,
  LocationOn,
  CalendarToday,
  Person,
  PriorityHigh,
  Send,
  Edit,
  People,
} from "@mui/icons-material";
import axios from "axios";

const GovernmentAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [riskPredictions, setRiskPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [emailContent, setEmailContent] = useState({ subject: "", body: "" });
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [emailMessage, setEmailMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchAlerts();
    fetchRiskPredictions();
  }, []);

  const fetchAlerts = async () => {
    try {
      const authorityData = JSON.parse(localStorage.getItem("userData") || "{}");
      const authorityId = authorityData.id;

      if (!authorityId) {
        setError("Authority ID not found. Please login again.");
        return;
      }

      const response = await axios.get(
        `http://localhost:8081/api/get/getGovernmentAlerts?authority_id=${authorityId}`
      );
      setAlerts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  const fetchRiskPredictions = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8081/api/get/getRiskPredictions");
      setRiskPredictions(response.data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching risk predictions:", error);
      setError("Failed to load risk predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClick = (alert) => {
    setSelectedAlert(alert);
    setOpenDialog(true);

    if (alert.status === "unread") {
      markAsRead(alert.id);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await axios.put(`http://localhost:8081/api/update/markAlertAsRead/${alertId}`);
      setAlerts((prevAlerts) =>
        prevAlerts.map((alert) =>
          alert.id === alertId ? { ...alert, status: "read", read_at: new Date().toISOString() } : alert
        )
      );
    } catch (error) {
      console.error("Error marking alert as read:", error);
    }
  };

  const handleSendAlertToCitizens = async (prediction) => {
    const district = prediction.district || prediction.location_name?.match(/(Thiruvananthapuram|Kollam|Pathanamthitta|Alappuzha|Kottayam|Idukki|Ernakulam|Thrissur|Palakkad|Malappuram|Kozhikode|Wayanad|Kannur|Kasaragod)/i)?.[1];
    if (!district && !prediction.pincode) {
      setEmailMessage({
        type: "error",
        text: "District or pincode not available for this location. Cannot send district-wise alerts.",
      });
      setTimeout(() => setEmailMessage({ type: "", text: "" }), 3000);
      return;
    }

    setSelectedPrediction({ ...prediction, district: district || prediction.district });
    setGeneratingEmail(true);
    setEmailMessage({ type: "", text: "" });

    try {
      const useDistrict = (district || prediction.district);
      const userCountResponse = useDistrict
        ? await axios.get(`http://localhost:8081/api/email/getUsersByDistrict?district=${encodeURIComponent(useDistrict)}`)
        : await axios.get(`http://localhost:8081/api/email/getUsersByPincode?pincode=${prediction.pincode}`);
      const userCount = userCountResponse.data.count || userCountResponse.data.data?.length || 0;
      if (userCount === 0) {
        setEmailMessage({
          type: "error",
          text: useDistrict ? "No users found for this district." : "No users found for this pincode.",
        });
        setGeneratingEmail(false);
        return;
      }
      setUserCount(userCount);

      // Generate AI email content with complete landslide details
      const emailResponse = await axios.post("http://localhost:8081/api/email/generateEmailContent", {
        location_name: prediction.location_name,
        risk_percentage: parseFloat(prediction.risk_percentage),
        latitude: parseFloat(prediction.latitude),
        longitude: parseFloat(prediction.longitude),
        pincode: prediction.pincode,
        district: district || prediction.district,
      });

      setEmailContent({
        subject: emailResponse.data.subject,
        body: emailResponse.data.body,
      });
      setOpenEmailDialog(true);
    } catch (error) {
      console.error("Error generating email content:", error);
      setEmailMessage({
        type: "error",
        text: "Failed to generate email content. Please try again.",
      });
    } finally {
      setGeneratingEmail(false);
    }
  };

  const handleSendEmails = async () => {
    if (!selectedPrediction) return;
    const hasDistrict = selectedPrediction.district;
    const hasPincode = selectedPrediction.pincode;
    if (!hasDistrict && !hasPincode) return;

    setSendingEmail(true);
    setEmailMessage({ type: "", text: "" });

    try {
      const response = await axios.post("http://localhost:8081/api/email/sendEmailsToCitizens", {
        district: selectedPrediction.district || null,
        pincode: selectedPrediction.pincode || null,
        subject: emailContent.subject,
        body: emailContent.body,
        location_name: selectedPrediction.location_name,
        risk_percentage: parseFloat(selectedPrediction.risk_percentage),
      });

      setEmailMessage({
        type: "success",
        text: `Emails sent successfully to ${response.data.successful} users!`,
      });

      setTimeout(() => {
        setOpenEmailDialog(false);
        setEmailMessage({ type: "", text: "" });
        setSelectedPrediction(null);
        setEmailContent({ subject: "", body: "" });
      }, 2000);
    } catch (error) {
      console.error("Error sending emails:", error);
      setEmailMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to send emails. Please try again.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getRiskColor = (risk) => {
    if (risk >= 86) return "error";
    if (risk >= 61) return "warning";
    if (risk >= 31) return "info";
    return "success";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const unreadCount = alerts.filter((a) => a.status === "unread").length;
  const highPriorityCount = alerts.filter((a) => a.priority === "high").length;

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
          Alerts & Citizen Notifications
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} Unread`}
              color="error"
              icon={<Email />}
              sx={{ fontWeight: 600 }}
            />
          )}
          {highPriorityCount > 0 && (
            <Chip
              label={`${highPriorityCount} High Priority`}
              color="warning"
              icon={<PriorityHigh />}
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {emailMessage.text && (
        <Alert
          severity={emailMessage.type}
          sx={{ mb: 3 }}
          onClose={() => setEmailMessage({ type: "", text: "" })}
        >
          {emailMessage.text}
        </Alert>
      )}

      <Paper elevation={3} sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Admin Alerts" icon={<Email />} iconPosition="start" />
          <Tab label="Risk Predictions" icon={<Warning />} iconPosition="start" />
        </Tabs>
      </Paper>

      {tabValue === 0 ? (
        // Admin Alerts Tab
        <>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : alerts.length === 0 ? (
            <Paper elevation={3} sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
              <Email sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No alerts received
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You will receive email alerts from admin regarding high-risk areas.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {alerts.map((alert) => (
                <Grid item xs={12} md={6} key={alert.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.3s",
                      borderLeft: `4px solid ${alert.priority === "high"
                        ? "#d32f2f"
                        : alert.priority === "medium"
                          ? "#ed6c02"
                          : "#1976d2"
                        }`,
                      bgcolor: alert.status === "unread" ? "action.hover" : "background.paper",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6,
                      },
                    }}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <CardContent>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {alert.subject}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {alert.status === "unread" && (
                            <Chip
                              label="New"
                              color="error"
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                          <Chip
                            label={alert.priority || "medium"}
                            color={getPriorityColor(alert.priority)}
                            size="small"
                            icon={<PriorityHigh />}
                          />
                        </Box>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {alert.message}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {alert.location_name && (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                            <Typography variant="caption" color="text.secondary">
                              {alert.location_name}
                            </Typography>
                          </Box>
                        )}
                        {alert.risk_percentage && (
                          <Chip
                            label={`Risk: ${parseFloat(alert.risk_percentage).toFixed(1)}%`}
                            color={
                              parseFloat(alert.risk_percentage) >= 61
                                ? "error"
                                : parseFloat(alert.risk_percentage) >= 31
                                  ? "warning"
                                  : "info"
                            }
                            size="small"
                          />
                        )}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(alert.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        // Risk Predictions Tab
        <>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : riskPredictions.length === 0 ? (
            <Paper elevation={3} sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
              <Warning sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No risk predictions found
              </Typography>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "primary.main" }}>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Risk %</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>District</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Pincode</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {riskPredictions.map((prediction) => (
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
                        <TableCell>
                          {prediction.district ||
                            prediction.location_name?.match(/(Thiruvananthapuram|Kollam|Pathanamthitta|Alappuzha|Kottayam|Idukki|Ernakulam|Thrissur|Palakkad|Malappuram|Kozhikode|Wayanad|Kannur|Kasaragod)/i)?.[1] ||
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          {prediction.pincode || "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(prediction.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Send />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendAlertToCitizens(prediction);
                            }}
                            disabled={(!prediction.district && !prediction.pincode) || generatingEmail}
                            sx={{
                              background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                              "&:hover": {
                                background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)",
                              },
                            }}
                          >
                            {generatingEmail ? "Generating..." : "Send Alert to Citizens"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}

      {/* Alert Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        {selectedAlert && (
          <>
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {selectedAlert.subject}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                  <Chip
                    label={selectedAlert.priority || "medium"}
                    color={getPriorityColor(selectedAlert.priority)}
                    size="small"
                    sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
                  />
                  {selectedAlert.status === "unread" && (
                    <Chip
                      label="New"
                      color="error"
                      size="small"
                      sx={{ color: "white", bgcolor: "rgba(255,255,255,0.2)" }}
                    />
                  )}
                </Box>
              </Box>
              <IconButton onClick={() => setOpenDialog(false)} sx={{ color: "white" }}>
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3, mt: 2 }}>
              <Grid container spacing={2}>
                {selectedAlert.location_name && (
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <LocationOn sx={{ color: "primary.main" }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Location: {selectedAlert.location_name}
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {selectedAlert.risk_percentage && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor:
                          parseFloat(selectedAlert.risk_percentage) >= 61
                            ? "error.light"
                            : parseFloat(selectedAlert.risk_percentage) >= 31
                              ? "warning.light"
                              : "info.light",
                        textAlign: "center",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {parseFloat(selectedAlert.risk_percentage).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2">Risk Level</Typography>
                    </Box>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                    {selectedAlert.message}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        Received: {formatDate(selectedAlert.created_at)}
                      </Typography>
                    </Box>
                    {selectedAlert.sent_by_name && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Person sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          From: {selectedAlert.sent_by_name}
                        </Typography>
                      </Box>
                    )}
                    {selectedAlert.read_at && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <MarkEmailRead sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          Read: {formatDate(selectedAlert.read_at)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setOpenDialog(false)} variant="outlined">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Send Email to Citizens Dialog */}
      <Dialog
        open={openEmailDialog}
        onClose={() => {
          setOpenEmailDialog(false);
          setEmailContent({ subject: "", body: "" });
          setSelectedPrediction(null);
        }}
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
            background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Send Alert to Citizens
            </Typography>
            {selectedPrediction && (
              <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                {selectedPrediction.location_name} - {selectedPrediction.district || "District"}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={() => {
              setOpenEmailDialog(false);
              setEmailContent({ subject: "", body: "" });
              setSelectedPrediction(null);
            }}
            sx={{ color: "white" }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {emailMessage.text && (
            <Alert severity={emailMessage.type} sx={{ mb: 2 }}>
              {emailMessage.text}
            </Alert>
          )}

          {selectedPrediction && (
            <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  <People sx={{ mr: 1, verticalAlign: "middle" }} />
                  Recipients: {userCount} users in {selectedPrediction.district ? `district ${selectedPrediction.district}` : "selected area"}
                </Typography>
                <Chip
                  label={`${parseFloat(selectedPrediction.risk_percentage).toFixed(1)}% Risk`}
                  color={getRiskColor(parseFloat(selectedPrediction.risk_percentage))}
                  size="small"
                />
              </Box>
            </Box>
          )}

          <TextField
            fullWidth
            label="Email Subject"
            value={emailContent.subject}
            onChange={(e) =>
              setEmailContent({ ...emailContent, subject: e.target.value })
            }
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <Edit sx={{ mr: 1, color: "action.active" }} />,
            }}
          />

          <TextField
            fullWidth
            label="Email Body (HTML supported)"
            multiline
            rows={12}
            value={emailContent.body}
            onChange={(e) =>
              setEmailContent({ ...emailContent, body: e.target.value })
            }
            helperText="You can edit the AI-generated content. Use HTML tags for formatting."
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenEmailDialog(false);
              setEmailContent({ subject: "", body: "" });
              setSelectedPrediction(null);
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmails}
            variant="contained"
            disabled={sendingEmail || !emailContent.subject || !emailContent.body}
            startIcon={sendingEmail ? <CircularProgress size={20} /> : <Send />}
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
            }}
          >
            {sendingEmail ? "Sending..." : `Send to ${userCount} Users`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernmentAlerts;
