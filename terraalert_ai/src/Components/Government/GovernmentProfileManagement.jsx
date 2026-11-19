import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Person, Save } from "@mui/icons-material";
import axios from "axios";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
  "Kottayam", "Idukki", "Ernakulam", "Thrissur",
  "Palakkad", "Malappuram", "Kozhikode", "Wayanad",
  "Kannur", "Kasaragod"
];

const GovernmentProfileManagement = () => {
  const [form, setForm] = useState({
    name: "",
    department: "",
    email: "",
    phone_number: "",
    address: "",
    district: "",
    state: "Kerala",
    designation: "",
  });
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setForm({
      name: userData.name || "",
      department: userData.department || "",
      email: userData.email || "",
      phone_number: userData.phone_number || "",
      address: userData.address || "",
      district: userData.district || "",
      state: userData.state || "Kerala",
      designation: userData.designation || "",
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatusMsg("");
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = "Name is required";
    if (!form.department?.trim()) newErrors.department = "Department is required";
    if (!form.email?.trim()) newErrors.email = "Email is required";
    if (!form.phone_number?.trim()) newErrors.phone_number = "Phone is required";
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
      setStatusMsg("Session expired. Please login again.");
      setStatusType("error");
      return;
    }
    try {
      setSaving(true);
      setStatusMsg("");
      await axios.put(
        `http://localhost:8081/api/update/updateGovernmentAuthority/${userData.id}`,
        { ...form, status: userData.status || "active" }
      );
      localStorage.setItem("userData", JSON.stringify({ ...userData, ...form }));
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

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "primary.main" }}>
        <Person sx={{ mr: 1, verticalAlign: "middle" }} />
        Profile Management
      </Typography>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {statusMsg && (
          <Alert severity={statusType} sx={{ mb: 3 }} onClose={() => setStatusMsg("")}>
            {statusMsg}
          </Alert>
        )}
        <Grid container spacing={3}>
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
              name="department"
              label="Department"
              value={form.department}
              onChange={handleChange}
              error={!!errors.department}
              helperText={errors.department}
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
            <FormControl fullWidth>
              <InputLabel>District</InputLabel>
              <Select
                name="district"
                value={form.district}
                onChange={handleChange}
                label="District"
              >
                {KERALA_DISTRICTS.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="designation"
              label="Designation"
              value={form.designation}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="state"
              label="State"
              value={form.state}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="address"
              label="Address"
              multiline
              rows={2}
              value={form.address}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                background: "linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)",
                "&:hover": { background: "linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)" },
              }}
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default GovernmentProfileManagement;
