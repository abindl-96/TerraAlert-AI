import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { Warning, Search, Notifications } from "@mui/icons-material";
import { Link } from "react-router-dom";
import bannerImage from "../../../assets/banner.png";
import "./Banner.css";

const Banner = () => {
  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${bannerImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: "white",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(135deg, rgba(27, 94, 31, 0.08) 0%, rgba(13, 62, 16, 0.15) 100%)",
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "3rem", md: "4.5rem" },
              textShadow: "2px 2px 8px rgba(0, 0, 0, 0.5)",
            }}
          >
            Terraalert
          </Typography>
          <Typography
            variant="h4"
            component="p"
            sx={{
              mb: 2,
              fontWeight: 400,
              fontSize: { xs: "1.5rem", md: "2rem" },
              textShadow: "1px 1px 4px rgba(0, 0, 0, 0.5)",
            }}
          >
            A Landslide Early Prediction System
          </Typography>
          <Typography
            variant="h6"
            sx={{
              mb: 5,
              maxWidth: 700,
              mx: "auto",
              fontSize: { xs: "1rem", md: "1.25rem" },
              opacity: 0.95,
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.5)",
              lineHeight: 1.6,
            }}
          >
            Stay informed about landslide risks in your region with AI-powered
            predictions and real-time monitoring
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              flexWrap: "wrap",
              mb: 6,
            }}
          >
            <Button
              component={Link}
              to="/SearchDestination"
              variant="contained"
              size="large"
              startIcon={<Search />}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                px: 5,
                py: 1.8,
                fontSize: "1.1rem",
                fontWeight: 600,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                "&:hover": {
                  bgcolor: "primary.dark",
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.4)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Search Destination
            </Button>
            <Button
              component={Link}
              to="/Notifications"
              variant="outlined"
              size="large"
              startIcon={<Notifications />}
              sx={{
                borderColor: "white",
                borderWidth: 2,
                color: "white",
                px: 5,
                py: 1.8,
                fontSize: "1.1rem",
                fontWeight: 600,
                bgcolor: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              View Notifications
            </Button>
          </Box>

          <Box
            sx={{
              maxWidth: 900,
              mx: "auto",
              p: 4,
              bgcolor: "rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(15px)",
              borderRadius: 3,
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2, justifyContent: "center" }}>
              <Warning sx={{ fontSize: 45 }} />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Why Terraalert?
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.95, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Terraalert uses advanced machine learning algorithms and real-time
              geological data to predict landslide risks before they occur. Our
              system monitors weather patterns, soil conditions, and terrain
              characteristics to provide early warnings, helping you stay safe and
              make informed decisions.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Banner;
