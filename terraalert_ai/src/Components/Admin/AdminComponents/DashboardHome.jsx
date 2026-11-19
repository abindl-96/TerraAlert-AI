import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from "@mui/material";
import {
  People,
  Warning,
  CheckCircle,
  TrendingUp,
  LocationOn,
  Notifications,
  Assessment,
} from "@mui/icons-material";
import axios from "axios";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    totalAlerts: 0,
    highRiskLocations: 0,
    resolvedReports: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersRes = await axios.get("http://localhost:8081/api/get/getAllUsers");
      const users = usersRes.data.data || [];

      const activeUsers = users.filter((u) => u.status !== "blocked").length;
      const blockedUsers = users.filter((u) => u.status === "blocked").length;

      setStats({
        totalUsers: users.length,
        activeUsers,
        blockedUsers,
        totalAlerts: 24,
        highRiskLocations: 8,
        resolvedReports: 12,
      });

      // Get recent 5 users
      setRecentUsers(users.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <People />,
      color: "#1976d2",
      bgGradient: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
      change: "+12%",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: <CheckCircle />,
      color: "#2e7d32",
      bgGradient: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
      change: "+8%",
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers,
      icon: <Warning />,
      color: "#d32f2f",
      bgGradient: "linear-gradient(135deg, #d32f2f 0%, #c62828 100%)",
      change: "-3%",
    },
    {
      title: "Total Alerts",
      value: stats.totalAlerts,
      icon: <Notifications />,
      color: "#ed6c02",
      bgGradient: "linear-gradient(135deg, #ed6c02 0%, #e65100 100%)",
      change: "+15%",
    },
    {
      title: "High Risk Locations",
      value: stats.highRiskLocations,
      icon: <LocationOn />,
      color: "#9c27b0",
      bgGradient: "linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)",
      change: "+5%",
    },
    {
      title: "Resolved Reports",
      value: stats.resolvedReports,
      icon: <Assessment />,
      color: "#0288d1",
      bgGradient: "linear-gradient(135deg, #0288d1 0%, #01579b 100%)",
      change: "+20%",
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, color: "#1a1a1a" }}>
        Overview
      </Typography>

      {/* Statistics Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(5, 1fr)",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {statCards.map((card, index) => (
          <Box key={index}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                },
                background: card.bgGradient,
                color: "white",
                minHeight: 180,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "rgba(255,255,255,0.2)",
                      width: 64,
                      height: 64,
                      mb: 2,
                    }}
                  >
                    {card.icon}
                  </Avatar>
                  <Typography
                    variant="h3"
                    sx={{ fontWeight: 700, mb: 1, color: "white" }}
                  >
                    {card.value}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ opacity: 0.9, mb: 1.5, fontSize: "0.875rem" }}
                  >
                    {card.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                    <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.75rem" }}>
                      {card.change} from last month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Recent Users Table */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Recent Users
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentUsers.length > 0 ? (
                      recentUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          sx={{
                            "&:hover": { backgroundColor: "#f9f9f9" },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 500 }}>
                            {user.location || user.name || "N/A"}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                user.status === "blocked" ? "Blocked" : "Active"
                              }
                              color={
                                user.status === "blocked" ? "error" : "success"
                              }
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No users found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardHome;
