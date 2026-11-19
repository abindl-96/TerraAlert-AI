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
  MenuItem,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Close,
  Person,
  Email,
  Phone,
  LocationOn,
  Block,
  CheckCircle,
} from "@mui/icons-material";
import axios from "axios";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    location: "",
    pincode: "",
    password: "",
    usertype: "user",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8081/api/get/getAllUsers");
      setUsers(response.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage({
        type: "error",
        text: "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditMode(true);
      setFormData({
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        location: user.location || "",
        pincode: user.pincode || "",
        password: user.password || "",
        usertype: user.usertype || "user",
      });
    } else {
      setEditMode(false);
      setFormData({
        name: "",
        email: "",
        phone_number: "",
        location: "",
        pincode: "",
        password: "",
        usertype: "user",
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
      email: "",
      phone_number: "",
      location: "",
      pincode: "",
      password: "",
      usertype: "user",
    });
    setMessage({ type: "", text: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.phone_number) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields (Name, Email, Phone)",
      });
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:8081/api/update/UpdateUser/${formData.id}`,
          formData
        );
        setMessage({ type: "success", text: "User updated successfully!" });
      } else {
        if (!formData.password) {
          setMessage({
            type: "error",
            text: "Password is required for new users",
          });
          return;
        }
        await axios.post("http://localhost:8081/api/add/adduser", {
          name: formData.name,
          email: formData.email,
          phone: formData.phone_number,
          location: formData.location,
          pincode: formData.pincode,
          password: formData.password,
        });
        setMessage({ type: "success", text: "User added successfully!" });
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchUsers();
      }, 1500);
    } catch (error) {
      console.error("Error saving user:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save user",
      });
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm("Are you sure you want to block this user?")) {
      return;
    }

    try {
      await axios.put(`http://localhost:8081/api/update/blockUser/${id}`);
      fetchUsers();
      setMessage({ type: "success", text: "User blocked successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error blocking user:", error);
      setMessage({
        type: "error",
        text: "Failed to block user",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Are you sure you want to unblock this user?")) {
      return;
    }

    try {
      await axios.put(`http://localhost:8081/api/update/unblockUser/${id}`);
      fetchUsers();
      setMessage({ type: "success", text: "User unblocked successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error unblocking user:", error);
      setMessage({
        type: "error",
        text: "Failed to unblock user",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
          Manage Users
        </Typography>

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
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>District</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Pincode</TableCell>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow
                    key={user.id}
                    hover
                    sx={{
                      bgcolor: user.isBlocked ? "rgba(244, 67, 54, 0.05)" : "transparent",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Person sx={{ color: "primary.main" }} />
                        <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                        {user.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                        {user.phone_number}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {user.district ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                          {user.district}
                        </Box>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {user.pincode || "N/A"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={user.isBlocked ? "Blocked" : "Active"}
                        color={user.isBlocked ? "error" : "success"}
                        size="small"
                        icon={user.isBlocked ? <Block /> : <CheckCircle />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(user)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      {user.isBlocked ? (
                        <IconButton
                          color="success"
                          onClick={() => handleUnblock(user.id)}
                          size="small"
                        >
                          <CheckCircle />
                        </IconButton>
                      ) : (
                        <IconButton
                          color="error"
                          onClick={() => handleBlock(user.id)}
                          size="small"
                        >
                          <Block />
                        </IconButton>
                      )}
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
            {editMode ? "Edit User" : "Add User"}
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
                label="Location"
                name="location"
                value={formData.location}
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
                label={editMode ? "Password (leave blank to keep current)" : "Password *"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required={!editMode}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="User Type"
                name="usertype"
                value={formData.usertype}
                onChange={handleChange}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
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

export default ManageUsers;
