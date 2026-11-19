import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Close,
  Business,
  Email,
  Phone,
  LocationOn,
} from "@mui/icons-material";
import axios from "axios";

const GovernmentAuthorities = () => {
  const [authorities, setAuthorities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    email: "",
    phone_number: "",
    password: "",
    address: "",
    district: "",
    state: "",
    pincode: "",
    designation: "",
    status: "active",
  });
  const [message, setMessage] = useState({ type: "", text: "" });
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchAuthorities();
  }, []);

  const fetchAuthorities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8081/api/get/getAllGovernmentAuthorities"
      );
      setAuthorities(response.data.data || []);
    } catch (error) {
      console.error("Error fetching authorities:", error);
      setMessage({
        type: "error",
        text: "Failed to load government authorities",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (authority = null) => {
    if (authority) {
      setEditMode(true);
      setFormData({
        id: authority.id,
        name: authority.name || "",
        department: authority.department || "",
        email: authority.email || "",
        phone_number: authority.phone_number || "",
        password: "", // Don't show existing password
        address: authority.address || "",
        district: authority.district || "",
        state: authority.state || "",
        pincode: authority.pincode || "",
        designation: authority.designation || "",
        status: authority.status || "active",
      });
    } else {
      setEditMode(false);
      setFormData({
        name: "",
        department: "",
        email: "",
        phone_number: "",
        password: "",
        address: "",
        district: "",
        state: "",
        pincode: "",
        designation: "",
        status: "active",
      });
    }
    setOpenDialog(true);
    setMessage({ type: "", text: "" });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setFormData({
      name: "",
      department: "",
      email: "",
      phone_number: "",
      address: "",
      district: "",
      state: "",
      pincode: "",
      designation: "",
      status: "active",
    });
    setMessage({ type: "", text: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.department || !formData.email || !formData.phone_number) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields (Name, Department, Email, Phone)",
      });
      return;
    }

    // Password required for new authorities
    if (!editMode && !formData.password) {
      setMessage({
        type: "error",
        text: "Password is required for new authorities",
      });
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:8081/api/update/updateGovernmentAuthority/${formData.id}`,
          formData
        );
        setMessage({ type: "success", text: "Government authority updated successfully!" });
      } else {
        await axios.post(
          "http://localhost:8081/api/add/addGovernmentAuthority",
          formData
        );
        setMessage({ type: "success", text: "Government authority added successfully!" });
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchAuthorities();
      }, 1500);
    } catch (error) {
      console.error("Error saving authority:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save government authority",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this government authority?")) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:8081/api/delete/deleteGovernmentAuthority/${id}`
      );
      fetchAuthorities();
      setMessage({ type: "success", text: "Government authority deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting authority:", error);
      setMessage({
        type: "error",
        text: "Failed to delete government authority",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
          Manage Government Authorities
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #0d3e10 0%, #1b5e20 100%)",
            },
          }}
        >
          Add Authority
        </Button>
      </Box>

      {message.text && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage({ type: "", text: "" })}>
          {message.text}
        </Alert>
      )}

      <Paper elevation={3} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Department</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>District</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>State</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : authorities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No government authorities found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                authorities.map((authority) => (
                  <TableRow key={authority.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Business sx={{ color: "primary.main" }} />
                        <Typography sx={{ fontWeight: 500 }}>{authority.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{authority.department}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                        {authority.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                        {authority.phone_number}
                      </Box>
                    </TableCell>
                    <TableCell>{authority.district || "N/A"}</TableCell>
                    <TableCell>{authority.state || "N/A"}</TableCell>
                    <TableCell>
                      <Chip
                        label={authority.status || "active"}
                        color={authority.status === "active" ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(authority)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(authority.id)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {editMode ? "Edit Government Authority" : "Add Government Authority"}
          </Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3, mt: 2 }}>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department *"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number *"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={editMode ? "Password (leave blank to keep current)" : "Password *"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!editMode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="District"
                name="district"
                value={formData.district}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #1b5e20 0%, #0d3e10 100%)",
            }}
          >
            {editMode ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernmentAuthorities;
