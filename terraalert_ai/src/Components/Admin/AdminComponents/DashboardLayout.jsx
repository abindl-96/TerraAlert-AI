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
  AdminPanelSettings,
  Logout,
  Notifications,
  AccountCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

import Sidebar from "./Sidebar.jsx";
import DashboardHome from "./DashboardHome.jsx";
import ManageUsers from "./ManageUsers.jsx";
import GovernmentAuthorities from "./GovernmentAuthorities.jsx";
import SendAlerts from "./SendAlerts.jsx";
import ManageNotifications from "./ManageNotifications.jsx";
import Guidlines from "./Guidlines.jsx";
import Reports from "./Reports.jsx";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("dashboard");
  const [anchorEl, setAnchorEl] = useState(null);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("userData");
    if (storedData) {
      try {
        setAdminData(JSON.parse(storedData));
      } catch (error) {
        console.error("Error parsing admin data:", error);
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

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <DashboardHome />;
      case "users":
        return <ManageUsers />;
      case "government":
        return <GovernmentAuthorities />;
      case "sendAlerts":
        return <SendAlerts />;
      case "notifications":
        return <ManageNotifications />;
      case "guidelines":
        return <Guidlines />;
      case "reports":
        return <Reports />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Top Navigation Bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AdminPanelSettings sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              TerraAlert Admin
            </Typography>
            <Chip
              label="Dashboard"
              color="success"
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
                {adminData?.name?.charAt(0).toUpperCase() || "A"}
              </Avatar>
              <Typography variant="body2" sx={{ color: "white" }}>
                {adminData?.name || "Admin"}
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
            {adminData?.name?.charAt(0).toUpperCase() || "A"}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {adminData?.name || "Admin"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {adminData?.email || ""}
            </Typography>
          </Box>
        </Box>
        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <Logout sx={{ mr: 2 }} /> Logout
        </MenuItem>
      </Menu>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", mt: "64px" }}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

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

export default DashboardLayout;
