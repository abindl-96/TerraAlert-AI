import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
} from "@mui/material";
import {
  Warning,
  TrendingUp,
  LocationOn,
  Info,
  Map as MapIcon,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import "./Cards.css";

const Cards = () => {
  const features = [
    {
      title: "Real-Time Monitoring",
      description:
        "Advanced AI-powered system continuously monitors geological and weather data to predict landslide risks",
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: "primary",
    },
    {
      title: "Early Warning System",
      description:
        "Get instant alerts and notifications about potential landslide threats in your area before they occur",
      icon: <Warning sx={{ fontSize: 40 }} />,
      color: "warning",
    },
    {
      title: "Location-Based Alerts",
      description:
        "Personalized risk assessments based on your exact location with detailed safety recommendations",
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      color: "success",
    },
    {
      title: "Interactive Maps",
      description:
        "Explore risk zones with interactive maps showing real-time data and historical landslide patterns",
      icon: <MapIcon sx={{ fontSize: 40 }} />,
      color: "info",
    },
  ];

  const stats = [
    { label: "Monitored Regions", value: "500+", color: "primary" },
    { label: "Active Alerts", value: "24/7", color: "warning" },
    { label: "Accuracy Rate", value: "92%", color: "success" },
    { label: "Users Protected", value: "10K+", color: "info" },
  ];

  return (
    <Box
      sx={{
        py: 6,
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Terraalert AI Features
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: "auto" }}>
            A comprehensive landslide early prediction system powered by artificial
            intelligence and real-time data analysis
          </Typography>
        </Box>

        <Grid container justifyContent="center" spacing={3} sx={{ mb: 5,display:"grid",gridTemplateColumns:"repeat(2,1fr)" }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} sx={{width:"100%"}}  key={index}>
              <Card
                elevation={4}
                sx={{
                  height: "100%",
                  
                  textAlign: "center",
                  p: 3,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    color: `${feature.color}.main`,
                    mb: 2,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #1b5e2015 0%, #0d3e1015 100%)",
            borderRadius: 3,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: "center" }}>
            System Statistics
          </Typography>
          <Grid container spacing={3}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} sx={{display:"flex",justifyContent:"center"}} key={index}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: `${stat.color}.main`,
                      mb: 1,
                    }}
                  >
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ textAlign: "center", mt: 4, display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            component={Link}
            to="/SearchDestination"
            variant="contained"
            size="large"
            sx={{
              px: 4,
              py: 1.5,
              background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #0d3e10 0%, #1b5e20 100%)",
              },
            }}
          >
            Search Your Destination
          </Button>
          <Button
            component={Link}
            to="/RiskDashboard"
            variant="outlined"
            size="large"
            startIcon={<MapIcon />}
            sx={{
              px: 4,
              py: 1.5,
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "primary.light",
              },
            }}
          >
            View Risk Dashboard
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Cards;
