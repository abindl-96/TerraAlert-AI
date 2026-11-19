import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from "@mui/material";
import {
  Home,
  Search,
  Notifications,
  Person,
  Menu as MenuIcon,
  Logout,
  Edit,
  Map as MapIcon,
} from "@mui/icons-material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const authStatus = localStorage.getItem("isAuthenticated");
    
    if (authStatus === "true" && storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setIsAuthenticated(true);
        // Fetch unread notification count
        fetchUnreadCount(parsedData.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      setUnreadCount(0);
    }
  }, [location]);

  const fetchUnreadCount = async (userId) => {
    if (!userId) return;
    
    try {
      const response = await axios.get(
        `http://localhost:8081/api/get/getUserNotifications?user_id=${userId}`
      );
      const notifications = response.data.data || [];
      const unread = notifications.filter((notif) => notif.is_read === 0 || !notif.is_read);
      setUnreadCount(unread.length);
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      setUnreadCount(0);
    }
  };

  // Refresh count when navigating to notifications page or home page
  useEffect(() => {
    if (isAuthenticated && userData) {
      if (location.pathname === "/Notifications") {
        // Refresh count after a short delay to allow for read status updates
        const timer = setTimeout(() => {
          fetchUnreadCount(userData.id);
        }, 1000);
        return () => clearTimeout(timer);
      } else if (location.pathname === "/Home") {
        // Refresh count when returning to home
        fetchUnreadCount(userData.id);
      }
    }
  }, [location.pathname, isAuthenticated, userData]);

  // Periodic refresh of notification count (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated || !userData) return;

    const interval = setInterval(() => {
      fetchUnreadCount(userData.id);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, userData]);

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
    setIsAuthenticated(false);
    setUserData(null);
    handleMenuClose();
    navigate("/Login");
  };

  const navItems = [
    { label: "Home", path: "/Home", icon: <Home /> },
    { label: "Search Destination", path: "/SearchDestination", icon: <Search /> },
    { label: "Risk Dashboard", path: "/RiskDashboard", icon: <MapIcon /> },
    { label: "Notifications", path: "/Notifications", icon: <Notifications /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
        boxShadow: 3,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Typography
          variant="h5"
          component={Link}
          to="/Home"
          sx={{
            fontWeight: 700,
            textDecoration: "none",
            color: "inherit",
            mr: 4,
          }}
        >
          TERRAALERT
        </Typography>

        {/* Desktop Navigation */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            gap: 1,
            alignItems: "center",
          }}
        >
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              startIcon={item.icon}
              sx={{
                color: "white",
                fontWeight: isActive(item.path) ? 700 : 400,
                bgcolor: isActive(item.path) ? "rgba(255, 255, 255, 0.2)" : "transparent",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.15)",
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        {/* Right side icons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            component={Link}
            to="/Notifications"
            sx={{ color: "white" }}
            onClick={() => {
              // Refresh count when clicking notifications
              if (isAuthenticated && userData) {
                setTimeout(() => fetchUnreadCount(userData.id), 500);
              }
            }}
          >
            <Badge badgeContent={isAuthenticated ? unreadCount : 0} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          <IconButton
            onClick={handleMenuOpen}
            sx={{ color: "white" }}
          >
            <Person />
          </IconButton>

          {/* Mobile Menu Button */}
          <IconButton
            sx={{ display: { xs: "block", md: "none" }, color: "white" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <MenuIcon />
          </IconButton>
        </Box>

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
            },
          }}
        >
          {isAuthenticated && userData ? (
            <Box>
              <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  {userData.name?.charAt(0).toUpperCase() || "U"}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {userData.name || "User"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {userData.email || ""}
                  </Typography>
                </Box>
              </Box>
              <Divider />
              <MenuItem
                component={Link}
                to="/CompleteProfile"
                onClick={handleMenuClose}
                sx={{ py: 1.5 }}
              >
                <Person sx={{ mr: 2 }} /> Complete / Edit Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: "error.main" }}>
                <Logout sx={{ mr: 2 }} /> Logout
              </MenuItem>
            </Box>
          ) : (
            <Box>
              <MenuItem component={Link} to="/Login" onClick={handleMenuClose}>
                Login
              </MenuItem>
              <MenuItem component={Link} to="/Register" onClick={handleMenuClose}>
                Register
              </MenuItem>
            </Box>
          )}
        </Menu>
      </Toolbar>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            flexDirection: "column",
            p: 2,
            bgcolor: "rgba(0, 0, 0, 0.1)",
          }}
        >
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              startIcon={item.icon}
              fullWidth
              sx={{
                color: "white",
                justifyContent: "flex-start",
                mb: 1,
                bgcolor: isActive(item.path) ? "rgba(255, 255, 255, 0.2)" : "transparent",
              }}
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Button>
          ))}
        </Box>
      )}
    </AppBar>
  );
};

export default Navbar;
