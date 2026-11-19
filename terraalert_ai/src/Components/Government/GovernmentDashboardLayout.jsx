import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Chip,
} from "@mui/material";
import {
  Business,
  Logout,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./GovernmentDashboard.css";

import GovernmentSidebar from "./GovernmentSidebar.jsx";
import GovernmentDashboardHome from "./GovernmentDashboardHome.jsx";
import GovernmentAlerts from "./GovernmentAlerts.jsx";
import GovernmentProfileManagement from "./GovernmentProfileManagement.jsx";
import DisasterManagement from "./DisasterManagement.jsx";
import GenerateReport from "../Admin/AdminComponents/GenerateReport.jsx";

const GovernmentDashboardLayout = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [anchorEl, setAnchorEl] = useState(null);
  const [authorityData, setAuthorityData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      try {
        setAuthorityData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing authority data:", error);
      }
    }
  }, []);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("userType");
    localStorage.removeItem("isAuthenticated");
    handleMenuClose();
    navigate("/Login");
  };

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <GovernmentDashboardHome onNavigate={handleNavigate} />;
      case "alerts":
        return <GovernmentAlerts />;
      case "disaster":
        return <DisasterManagement />;
      case "reports":
        return <GenerateReport />;
      case "profile":
        return <GovernmentProfileManagement />;
      default:
        return <GovernmentDashboardHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Business sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Government Authority Dashboard
            </Typography>
            <Chip
              label={authorityData?.department || "Authority"}
              color="info"
              size="small"
              sx={{ ml: 2, fontWeight: 600 }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
              }}
              onClick={handleMenuOpen}
            >
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  width: 40,
                  height: 40,
                }}
              >
                {authorityData?.name?.charAt(0).toUpperCase() || "G"}
              </Avatar>
              <Typography variant="body2" sx={{ color: "white" }}>
                {authorityData?.name || "Authority"}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar sx={{ bgcolor: "primary.main" }}>
            {authorityData?.name?.charAt(0).toUpperCase() || "G"}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {authorityData?.name || "Authority"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {authorityData?.email || ""}
            </Typography>
          </Box>
        </Box>
        <Divider />
        <MenuItem onClick={() => { handleNavigate("profile"); handleMenuClose(); }}>
          <AccountCircle sx={{ mr: 2 }} /> Profile Management
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <Logout sx={{ mr: 2 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", mt: "64px" }}>
        <GovernmentSidebar activePage={activePage} setActivePage={setActivePage} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 4,
            ml: "280px",
            backgroundColor: "#f5f7fa",
            minHeight: "calc(100vh - 64px)",
            width: "calc(100% - 280px)",
          }}
        >
          {renderPage()}
        </Box>
      </Box>
    </Box>
  );
};

export default GovernmentDashboardLayout;
