import React, { useState } from "react";
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Link,
  Grid,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Shield,
  AdminPanelSettings,
  Gavel,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import bannerImage from "../../assets/banner.png";
import "./Login.css";

const Login = () => {
  const [userType, setUserType] = useState("user"); // 'admin', 'government', 'user'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleUserTypeChange = (event, newValue) => {
    setUserType(newValue);
    setError("");
    setFormData({ email: "", password: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let apiUrl = "";
      let redirectPath = "";

      // Determine API endpoint and redirect path based on user type
      switch (userType) {
        case "admin":
          apiUrl = "http://localhost:8081/api/auth/AdminLogin";
          redirectPath = "/dashboard";
          break;
        case "government":
          // TODO: Implement government authority login endpoint
          apiUrl = "http://localhost:8081/api/auth/GovernmentLogin";
          redirectPath = "/government-dashboard"; // You'll need to create this route
          break;
        case "user":
          apiUrl = "http://localhost:8081/api/auth/UserLogin";
          redirectPath = "/Home";
          break;
        default:
          setError("Invalid user type selected");
          setLoading(false);
          return;
      }

      const res = await axios.post(apiUrl, {
        email: formData.email,
        password: formData.password,
      });

      if (res.data.message === "Login successful" || res.status === 200) {
        // Store user data in localStorage
        localStorage.setItem("userType", userType);
        localStorage.setItem("userData", JSON.stringify(res.data.user || res.data));
        localStorage.setItem("isAuthenticated", "true");

        // Redirect based on user type
        navigate(redirectPath);
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (type) => {
    switch (type) {
      case "admin":
        return <AdminPanelSettings />;
      case "government":
        return <Gavel />;
      case "user":
        return <Person />;
      default:
        return <Person />;
    }
  };

  const getUserTypeLabel = (type) => {
    switch (type) {
      case "admin":
        return "Admin";
      case "government":
        return "Government Authority";
      case "user":
        return "User";
      default:
        return "User";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Image */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${bannerImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(27, 94, 32, 0.3) 0%, rgba(13, 62, 16, 0.4) 100%)",
            zIndex: 1,
          },
        }}
      />

      <Container
        maxWidth="sm"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          py: 4,
        }}
      >
        <Box sx={{ width: "100%" }}>
          {/* Centered Login Form */}
          <Grid container justifyContent="center">
            <Grid item xs={12} sm={10} md={8}>
              <Paper
                elevation={24}
                sx={{
                  padding: { xs: 3, sm: 4, md: 5 },
                  borderRadius: 4,
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Shield sx={{ fontSize: 50, mr: 1, color: "primary.main" }} />
                    <Typography
                      variant="h4"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Terraalert
                    </Typography>
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Sign in to continue
                  </Typography>

                  {/* User Type Selector */}
                  <Tabs
                    value={userType}
                    onChange={handleUserTypeChange}
                    variant="fullWidth"
                    sx={{
                      mb: 3,
                      "& .MuiTab-root": {
                        minHeight: 48,
                        fontSize: "0.875rem",
                      },
                    }}
                  >
                    <Tab
                      icon={getUserTypeIcon("user")}
                      iconPosition="start"
                      label="User"
                      value="user"
                    />
                    <Tab
                      icon={getUserTypeIcon("government")}
                      iconPosition="start"
                      label="Government"
                      value="government"
                    />
                    <Tab
                      icon={getUserTypeIcon("admin")}
                      iconPosition="start"
                      label="Admin"
                      value="admin"
                    />
                  </Tabs>

                  <Chip
                    icon={getUserTypeIcon(userType)}
                    label={`Login as ${getUserTypeLabel(userType)}`}
                    color="primary"
                    sx={{ mb: 2 }}
                  />
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    name="email"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                      boxShadow: "0 4px 15px rgba(27, 94, 32, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0d3e10 0%, #1b5e20 100%)",
                        boxShadow: "0 6px 20px rgba(27, 94, 32, 0.5)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {loading ? "Signing in..." : `LOGIN AS ${getUserTypeLabel(userType).toUpperCase()}`}
                  </Button>

                  {userType === "user" && (
                    <Box sx={{ textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        Don't have an account?{" "}
                        <Link
                          href="/Register"
                          sx={{
                            fontWeight: 600,
                            color: "primary.main",
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          Sign Up
                        </Link>
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
