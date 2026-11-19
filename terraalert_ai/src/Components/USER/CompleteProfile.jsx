import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Person, Save } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./UserComponents/Navbar";
import Footer from "./UserComponents/Footer";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur",
  "Palakkad", "Malappuram", "Kozhikode", "Wayanad",
  "Kannur", "Kasaragod"
];

const CompleteProfile = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    district: "",
    pincode: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (!userData.id) {
      navigate("/Login");
      return;
    }
    fetchProfile(userData.id);
  }, [navigate]);

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8081/api/get/getUserById/${userId}`);
      const user = res.data.data;
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number ? String(user.phone_number) : "",
        district: user.district || "",
        pincode: user.pincode || "",
      });
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem("userData") || "{}");
      setForm({
        name: stored.name || "",
        email: stored.email || "",
        phone_number: stored.phone_number || "",
        district: stored.district || "",
        pincode: stored.pincode || "",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatusMsg("");
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = "Name is required";
    if (!form.email?.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email";
    if (!form.phone_number?.trim()) newErrors.phone_number = "Phone is required";
    else if (!/^[0-9]{10}$/.test(form.phone_number.replace(/\s/g, ""))) newErrors.phone_number = "Enter 10-digit phone";
    if (!form.district) newErrors.district = "Select district";
    if (!form.pincode?.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(form.pincode.trim())) newErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setStatusMsg("Please fix errors before saving.");
      setStatusType("error");
      return;
    }
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (!userData.id) {
      navigate("/Login");
      return;
    }
    try {
      setSaving(true);
      setStatusMsg("");
      await axios.put(
        `http://localhost:8081/api/update/UpdateUser/${userData.id}`,
        { ...form, location: form.district, password: userData.password, usertype: userData.usertype || "user" }
      );
      localStorage.setItem(
        "userData",
        JSON.stringify({ ...userData, ...form, location: form.district })
      );
      setStatusMsg("Profile updated successfully!");
      setStatusType("success");
    } catch (err) {
      setStatusMsg(
        err.response?.data?.error || err.response?.data?.message || "Failed to update profile."
      );
      setStatusType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Box sx={{ minHeight: "80vh", py: 4, bgcolor: "#f5f5f5" }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}>
              <Person sx={{ mr: 1, verticalAlign: "middle" }} />
              Complete Your Profile
            </Typography>
            {statusMsg && (
              <Alert severity={statusType} sx={{ mb: 2 }} onClose={() => setStatusMsg("")}>
                {statusMsg}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="phone_number"
                  label="Phone Number"
                  value={form.phone_number}
                  onChange={handleChange}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.district}>
                  <InputLabel>District (Kerala)</InputLabel>
                  <Select
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    label="District (Kerala)"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                  {errors.district && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.district}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="pincode"
                  label="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  error={!!errors.pincode}
                  helperText={errors.pincode}
                />
              </Grid>
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                  onClick={handleSave}
                  disabled={saving}
                  sx={{
                    background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
                    "&:hover": { background: "linear-gradient(135deg, #0d3e10 0%, #1b5e20 100%)" },
                  }}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>
      <Footer />
    </>
  );
};

export default CompleteProfile;
