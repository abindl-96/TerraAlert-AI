import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ExpandMore,
  Warning,
  Shield,
  Emergency,
  Info,
  CheckCircle,
} from "@mui/icons-material";
import axios from "axios";
import "./SafetyGuidlines.css";

const SafetyGuidlines = () => {
  const [expanded, setExpanded] = useState(false);
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8081/api/get/getGuidlines");
      setGuidelines(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching guidelines:", err);
      setError("Failed to load guidelines. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Organize guidelines by type
  const organizedGuidelines = {
    before: {
      title: "Before Landslide",
      icon: <Shield color="primary" />,
      color: "primary",
      guidelines: guidelines.filter((g) => g.type === "before"),
    },
    during: {
      title: "During Landslide",
      icon: <Emergency color="error" />,
      color: "error",
      guidelines: guidelines.filter((g) => g.type === "during"),
    },
    after: {
      title: "After Landslide",
      icon: <CheckCircle color="success" />,
      color: "success",
      guidelines: guidelines.filter((g) => g.type === "after"),
    },
  };

  if (loading) {
    return (
      <Box
        sx={{
          py: 6,
          bgcolor: "#f5f5f5",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          py: 6,
          bgcolor: "#f5f5f5",
        }}
      >
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        py: 6,
        bgcolor: "#f5f5f5",
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
            Safety Guidelines
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Comprehensive safety measures to protect yourself and your loved ones
            from landslide risks
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {Object.entries(organizedGuidelines).map(([key, data], index) => (
            <Grid item xs={12} md={4} key={key}>
              <Card
                elevation={4}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: `${data.color}.light`,
                        color: `${data.color}.main`,
                      }}
                    >
                      {data.icon}
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
                      {data.title}
                    </Typography>
                  </Box>

                  {data.guidelines.length > 0 ? (
                    <>
                      <Accordion
                        expanded={expanded === `panel-${index}`}
                        onChange={handleChange(`panel-${index}`)}
                        sx={{ boxShadow: "none", "&:before": { display: "none" } }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMore />}
                          sx={{ px: 0 }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            View {data.guidelines.length} guidelines
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ px: 0 }}>
                          <Box component="ul" sx={{ pl: 2, m: 0 }}>
                            {data.guidelines.map((guideline) => (
                              <Box key={guideline.id} sx={{ mb: 2 }}>
                                <Typography
                                  component="li"
                                  variant="body2"
                                  sx={{
                                    mb: 0.5,
                                    fontWeight: 600,
                                    color: "text.primary",
                                  }}
                                >
                                  {guideline.title}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    ml: 2,
                                    color: "text.secondary",
                                    fontSize: "0.875rem",
                                  }}
                                >
                                  {guideline.description}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                      No guidelines available for this category.
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Chip
                    label={`${data.guidelines.length} Guidelines`}
                    color={data.color}
                    size="small"
                  />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5, textAlign: "center" }}>
          <Card
            elevation={3}
            sx={{
              bgcolor: "warning.light",
              borderLeft: "4px solid",
              borderLeftColor: "warning.main",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Warning color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Important Reminder
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Always follow official instructions from local disaster management
                authorities. These guidelines are general recommendations and should
                be adapted to your specific situation and local conditions.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default SafetyGuidlines;
