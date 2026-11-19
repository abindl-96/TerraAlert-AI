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
  NotificationsActive,
  Warning,
  Assessment,
  Person,
} from "@mui/icons-material";

const GovernmentSidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <Dashboard />,
      description: "Landslide Risk Zones",
    },
    {
      id: "alerts",
      label: "Email Alerts",
      icon: <NotificationsActive />,
      description: "View Admin Alerts",
    },
    {
      id: "disaster",
      label: "Disaster Management",
      icon: <Warning />,
      description: "Preventive Action Planning",
    },
    {
      id: "reports",
      label: "Generate Report",
      icon: <Assessment />,
      description: "Generate System Reports",
    },
    {
      id: "profile",
      label: "Profile Management",
      icon: <Person />,
      description: "Manage your profile",
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
                      ? "rgba(25, 118, 210, 0.1)"
                      : "transparent",
                  color: activePage === item.id ? "primary.main" : "text.primary",
                  "&:hover": {
                    backgroundColor:
                      activePage === item.id
                        ? "rgba(25, 118, 210, 0.15)"
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
            background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
            color: "white",
            textAlign: "center",
          }}
        >
          <Warning sx={{ fontSize: 40, mb: 1, opacity: 0.9 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Emergency Ready
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Monitor & Respond
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default GovernmentSidebar;
