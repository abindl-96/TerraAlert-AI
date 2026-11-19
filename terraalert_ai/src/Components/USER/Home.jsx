import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import { PersonAdd, Close } from "@mui/icons-material";
import { Link } from "react-router-dom";
import Navbar from "./UserComponents/Navbar";
import Footer from "./UserComponents/Footer";
import Banner from "./UserComponents/Banner";
import Cards from "./UserComponents/Cards";
import SafetyGuidlines from "./UserComponents/SafetyGuidlines";

const Home = () => {
  const [showCompleteProfileBanner, setShowCompleteProfileBanner] = useState(false);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    const userType = localStorage.getItem("userType") || "";
    const needsProfile = isAuth && userType === "user" && (
      !userData.district || !userData.phone_number
    );
    const dismissed = sessionStorage.getItem("completeProfileBannerDismissed") === "true";
    setShowCompleteProfileBanner(needsProfile && !dismissed);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("completeProfileBannerDismissed", "true");
    setShowCompleteProfileBanner(false);
  };

  return (
    <>
      <Navbar />
      {showCompleteProfileBanner && (
        <Box sx={{ px: 2, pt: 2, position: "relative", zIndex: 10 }}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              background: "linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)",
              borderLeft: "4px solid",
              borderColor: "primary.main",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PersonAdd color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Complete Your Profile
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Add your district and location to receive district-wise landslide alerts
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                component={Link}
                to="/CompleteProfile"
                variant="contained"
                startIcon={<PersonAdd />}
                sx={{
                  background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                  "&:hover": { background: "linear-gradient(135deg, #0d3e10 0%, #1b5e20 100%)" },
                }}
              >
                Complete Profile
              </Button>
              <Button
                size="small"
                onClick={handleDismiss}
                startIcon={<Close />}
                sx={{ color: "text.secondary" }}
              >
                Dismiss
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
      <Banner />
      <Cards />
      <SafetyGuidlines />
      <Footer />
    </>
  );
};

export default Home;