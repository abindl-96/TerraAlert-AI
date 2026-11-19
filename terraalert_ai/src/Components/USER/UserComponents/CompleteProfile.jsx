import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Person, Edit } from "@mui/icons-material";
import axios from "axios";

const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam",
  "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode",
  "Wayanad", "Kannur", "Kasaragod",
];

const CompleteProfile = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    location: "",
    district: "",
    password: "",
  });

  const fetchProfile = async () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (!userData?.id) return;

    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8081/api/get/getUserById?id=${userData.id}`);
      const u = res.data.data;
      setForm({
        name: u.name || "",
        email: u.email || "",
        phone_number: u.phone_number || "",
        location: u.location || "",
        district: u.district || "",
        password: "",
      });
    } catch (error) {
      setStatusMsg({ type: "error", text: error.response?.data?.error || "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchProfile();
  }, [open]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatusMsg({ type: "", text: "" });
  };

  const handleSave = async () => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    if (!userData?.id) {
      setStatusMsg({ type: "error", text: "Please login first" });
      return;
    }

    setSaving(true);
    setStatusMsg({ type: "", text: "" });
    try {
      await axios.put(`http://localhost:8081/api/update/UpdateUser/${userData.id}`, {
        id: userData.id,
        name: form.name,
        email: form.email,
        phone_number: form.phone_number,
        location: form.location,
        district: form.district,
        password: form.password || undefined,
        usertype: userData.usertype || "user",
      });

      localStorage.setItem("userData", JSON.stringify({ ...userData, ...form, password: undefined }));
      setStatusMsg({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => {
        setOpen(false);
        setStatusMsg({ type: "", text: "" });
      }, 1500);
    } catch (error) {
      const err = error.response?.data?.error || error.message || "Failed to update profile";
      setStatusMsg({ type: "error", text: err });
    } finally {
      setSaving(false);
    }
  };

  const isAuthenticated = () => {
    return localStorage.getItem("isAuthenticated") === "true" && localStorage.getItem("userData");
  };

  if (!isAuthenticated()) return null;

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 2,
          background: "linear-gradient(135deg, #1b5e2015 0%, #0d3e1015 100%)",
          border: "1px solid",
          borderColor: "primary.light",
          cursor: "pointer",
          transition: "all 0.3s",
          "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
        }}
        onClick={() => setOpen(true)}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              bgcolor: "primary.main",
              borderRadius: 2,
              p: 1.5,
              color: "white",
            }}
          >
            <Edit sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.dark" }}>
              Complete Your Profile
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add or update your location and district for better alerts
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          <Person sx={{ mr: 1, verticalAlign: "middle" }} />
          Complete Profile
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {statusMsg.text && (
            <Alert severity={statusMsg.type} sx={{ mb: 2 }}>
              {statusMsg.text}
            </Alert>
          )}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="name"
                  label="Full Name"
                  value={form.name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="phone_number"
                  label="Phone Number"
                  value={form.phone_number}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="location"
                  label="Location / Address"
                  value={form.location}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>District</InputLabel>
                  <Select
                    name="district"
                    label="District"
                    value={form.district}
                    onChange={handleChange}
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <MenuItem key={d} value={d}>{d}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="password"
                  label="New Password (leave blank to keep current)"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || saving}
            sx={{ background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)" }}
          >
            {saving ? <CircularProgress size={24} /> : "Save Profile"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompleteProfile;
