import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Dashboard,
  People,
  Article,
  Assessment,
  NotificationsActive,
  Business,
} from "@mui/icons-material";

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Dashboard />,
      description: "Overview & Statistics",
    },
    {
      id: "users",
      label: "Manage Users",
      icon: <People />,
      description: "User Management",
    },
    {
      id: "government",
      label: "Government Authorities",
      icon: <Business />,
      description: "Manage Government Authorities",
    },
    {
      id: "sendAlerts",
      label: "Send Alerts",
      icon: <NotificationsActive />,
      description: "Send Alerts to Authorities",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <NotificationsActive />,
      description: "Manage Public Notifications",
    },
    {
      id: "guidelines",
      label: "Guidelines",
      icon: <Article />,
      description: "Safety Guidelines",
    },
    {
      id: "reports",
      label: "Reports",
      icon: <Assessment />,
      description: "View Reports",
    },
  ];

  return (
    <Box
      sx={{
        width: 280,
        height: "calc(100vh - 64px)",
        backgroundColor: "white",
        boxShadow: "2px 0 10px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 64,
      }}
    >
      <List sx={{ pt: 2, pb: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding sx={{ px: 2, mb: 0.5 }}>
            <Tooltip title={item.description} placement="right">
              <ListItemButton
                onClick={() => setActivePage(item.id)}
                sx={{
                  borderRadius: 2,
                  backgroundColor:
                    activePage === item.id
                      ? "rgba(27, 94, 32, 0.1)"
                      : "transparent",
                  color: activePage === item.id ? "primary.main" : "text.primary",
                  "&:hover": {
                    backgroundColor:
                      activePage === item.id
                        ? "rgba(27, 94, 32, 0.15)"
                        : "rgba(0,0,0,0.05)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <ListItemIcon
                  sx={{
                    color: activePage === item.id ? "primary.main" : "text.secondary",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: activePage === item.id ? 600 : 400,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ px: 2, pb: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <NotificationsActive sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            System Status
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            All systems operational
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
