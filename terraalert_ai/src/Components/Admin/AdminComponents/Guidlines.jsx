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
  Article,
  Description,
  Category,
} from "@mui/icons-material";
import axios from "axios";

const Guidlines = () => {
  const [guidelines, setGuidelines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
  });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchGuidelines();
  }, []);

  const fetchGuidelines = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:8081/api/get/getGuidlines");
      setGuidelines(response.data.data || []);
    } catch (error) {
      console.error("Error fetching guidelines:", error);
      setMessage({
        type: "error",
        text: "Failed to load guidelines",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (guideline = null) => {
    if (guideline) {
      setEditMode(true);
      setFormData({
        id: guideline.id,
        title: guideline.title || "",
        description: guideline.description || "",
        type: guideline.type || "",
      });
    } else {
      setEditMode(false);
      setFormData({
        title: "",
        description: "",
        type: "",
      });
    }
    setOpenDialog(true);
    setMessage({ type: "", text: "" });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setFormData({
      title: "",
      description: "",
      type: "",
    });
    setMessage({ type: "", text: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.type) {
      setMessage({
        type: "error",
        text: "Please fill in all required fields (Title, Description, Type)",
      });
      return;
    }

    try {
      if (editMode) {
        await axios.put(
          `http://localhost:8081/api/update/updateGuidlines/${formData.id}`,
          formData
        );
        setMessage({ type: "success", text: "Guideline updated successfully!" });
      } else {
        await axios.post("http://localhost:8081/api/add/addGuidlines", formData);
        setMessage({ type: "success", text: "Guideline added successfully!" });
      }

      setTimeout(() => {
        handleCloseDialog();
        fetchGuidelines();
      }, 1500);
    } catch (error) {
      console.error("Error saving guideline:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to save guideline",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this guideline?")) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8081/api/delete/deleteGuidline/${id}`);
      fetchGuidelines();
      setMessage({ type: "success", text: "Guideline deleted successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error deleting guideline:", error);
      setMessage({
        type: "error",
        text: "Failed to delete guideline",
      });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "before":
        return "Before Landslide";
      case "during":
        return "During Landslide";
      case "after":
        return "After Landslide";
      default:
        return type;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "before":
        return "info";
      case "during":
        return "warning";
      case "after":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
          Manage Guidelines
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
          Add Guideline
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
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Description</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : guidelines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No guidelines found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                guidelines.map((guideline) => (
                  <TableRow key={guideline.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Article sx={{ color: "primary.main" }} />
                        <Typography sx={{ fontWeight: 500 }}>{guideline.title}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 400,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {guideline.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getTypeLabel(guideline.type)}
                        color={getTypeColor(guideline.type)}
                        size="small"
                        icon={<Category />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(guideline)}
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(guideline.id)}
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
            {editMode ? "Edit Guideline" : "Add Guideline"}
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
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Article sx={{ mr: 1, color: "action.active" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: <Description sx={{ mr: 1, color: "action.active" }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Type *"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                SelectProps={{
                  native: true,
                }}
                InputProps={{
                  startAdornment: <Category sx={{ mr: 1, color: "action.active" }} />,
                }}
              >
                <option value="">Select Type</option>
                <option value="before">Before Landslide</option>
                <option value="during">During Landslide</option>
                <option value="after">After Landslide</option>
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

export default Guidlines;
