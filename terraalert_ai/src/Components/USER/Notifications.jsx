import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  Chip,
  Grid,
  Tabs,
  Tab,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Warning,
  Info,
  CheckCircle,
  Delete,
} from "@mui/icons-material";
import Navbar from "./UserComponents/Navbar";
import Footer from "./UserComponents/Footer";

const Notifications = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const userId = userData.id;

      if (!userId) {
        setError("Please login to view notifications");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `http://localhost:8081/api/get/getUserNotifications?user_id=${userId}`
      );
      
      const formattedNotifications = (response.data.data || []).map((notif) => ({
        id: notif.id,
        type: notif.type || "info",
        title: notif.title,
        message: notif.message,
        timestamp: formatTimestamp(notif.created_at),
        location: notif.location_name || "General",
        riskLevel: notif.risk_level || "N/A",
        read: notif.is_read === 1,
      }));

      setNotifications(formattedNotifications);
      setError(null);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      await axios.post("http://localhost:8081/api/update/markNotificationAsRead", {
        user_id: userData.id,
        notification_id: notificationId,
      });

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "warning":
        return <Warning color="warning" />;
      case "info":
        return <Info color="info" />;
      case "success":
        return <CheckCircle color="success" />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  const filteredNotifications =
    tabValue === 0
      ? notifications
      : tabValue === 1
      ? notifications.filter((n) => !n.read)
      : notifications.filter((n) => n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5", pb: 4 }}>
        <Container maxWidth="lg" sx={{ pt: 4 }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                mb: 1,
                background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Notifications
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with the latest landslide alerts and warnings
            </Typography>
          </Box>

          <Paper elevation={3} sx={{ mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ borderBottom: 1, borderColor: "divider" }}
            >
              <Tab
                label={`All Notifications (${notifications.length})`}
                icon={<NotificationsIcon />}
                iconPosition="start"
              />
              <Tab
                label={`Unread (${unreadCount})`}
                icon={<Warning />}
                iconPosition="start"
              />
              <Tab label="Read" icon={<CheckCircle />} iconPosition="start" />
            </Tabs>
          </Paper>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          ) : filteredNotifications.length === 0 ? (
            <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
              <NotificationsIcon sx={{ fontSize: 60, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No notifications found
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {filteredNotifications.map((notification) => (
                <Grid item xs={12} key={notification.id}>
                  <Card
                    elevation={3}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      cursor: "pointer",
                      opacity: notification.read ? 0.8 : 1,
                      borderLeft: notification.read
                        ? "none"
                        : "4px solid",
                      borderLeftColor:
                        notification.type === "warning"
                          ? "warning.main"
                          : notification.type === "info"
                          ? "info.main"
                          : "success.main",
                      "&:hover": {
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                          <Box sx={{ mt: 0.5 }}>
                            {getNotificationIcon(notification.type)}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="h6"
                              component="h3"
                              sx={{
                                fontWeight: notification.read ? 400 : 600,
                                mb: 1,
                              }}
                            >
                              {notification.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mb: 2 }}
                            >
                              {notification.message}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1,
                                flexWrap: "wrap",
                                alignItems: "center",
                              }}
                            >
                              <Chip
                                label={notification.location}
                                size="small"
                                icon={<NotificationsIcon />}
                              />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {notification.timestamp}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <IconButton
                          onClick={() => handleDelete(notification.id)}
                          color="error"
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {unreadCount > 0 && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              You have {unreadCount} unread notification
              {unreadCount > 1 ? "s" : ""}. Please review them for important
              safety information.
            </Alert>
          )}
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default Notifications;

