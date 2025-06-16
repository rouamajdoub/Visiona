import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectStyles.css";

import {
  TextField,
  Button,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  CircularProgress,
  Box,
  Typography,
  Divider,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  Card,
  CardMedia,
  Chip,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  AddCircleOutline as AddIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  createProject,
  resetProjectState,
  clearErrors,
  fetchServiceCategories,
  fetchServiceSubcategories,
  clearServiceSubcategories,
} from "../../../../../redux/slices/ProjectSlice";
import { fetchClients } from "../../../../../redux/slices/clientsSlice";

const AddProject = ({ onCancel }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { clients, loading: clientsLoading } = useSelector(
    (state) => state.clients
  );

  // Updated to use the new state structure from your slice
  const {
    loading: isLoading,
    error,
    success,
    message,
    projectState,
    serviceCategories,
    selectedCategorySubcategories,
    categoriesLoading,
    subcategoriesLoading,
  } = useSelector((state) => state.projects);

  const [projectData, setProjectData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: "",
    subcategory: "",
    budget: "",
    startDate: "",
    endDate: "",
    coverImage: null,
    isPublic: false,
    showroomStatus: "normal",
    clientId: "",
    status: "pending",
    tags: [],
  });

  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [tag, setTag] = useState("");

  // Fetch architect's clients and service categories when component mounts
  useEffect(() => {
    if (user && user._id) {
      dispatch(fetchClients());
      dispatch(fetchServiceCategories());
    }

    // Clean up on unmount
    return () => {
      dispatch(resetProjectState());
      dispatch(clearServiceSubcategories());
    };
  }, [dispatch, user]);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory && selectedCategory._id) {
      dispatch(fetchServiceSubcategories(selectedCategory._id));
      // Reset subcategory selection when category changes
      setSelectedSubcategory(null);
      setProjectData((prev) => ({ ...prev, subcategory: "" }));
    } else {
      dispatch(clearServiceSubcategories());
    }
  }, [selectedCategory, dispatch]);

  // Show snackbar when operation succeeds and redirect
  useEffect(() => {
    if (success && message) {
      setSnackbarOpen(true);
      // Clean up state after successful creation
      setTimeout(() => {
        dispatch(resetProjectState()); // Reset state before closing
        if (onCancel) {
          onCancel();
        }
      }, 2000);
    }
  }, [success, message, navigate, onCancel, dispatch]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProjectData({
      ...projectData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle client selection
  const handleClientSelect = (event, client) => {
    setSelectedClient(client);
    setProjectData({
      ...projectData,
      clientId: client ? client._id : "",
    });
  };

  // Handle category selection
  const handleCategorySelect = (event, category) => {
    setSelectedCategory(category);
    setProjectData({
      ...projectData,
      category: category ? category._id : "",
    });
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (event, subcategory) => {
    setSelectedSubcategory(subcategory);
    setProjectData({
      ...projectData,
      subcategory: subcategory ? subcategory._id : "",
    });
  };

  // Handle cover image upload
  const handleCoverImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Create preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setCoverImagePreview(previewUrl);

      // Update projectData with the file
      setProjectData({
        ...projectData,
        coverImage: file,
      });
    }
  };

  // Handle before photos upload
  const handleBeforePhotosChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Create preview URLs for the selected files
      const newPhotos = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setBeforePhotos([...beforePhotos, ...newPhotos]);
    }
  };

  // Handle after photos upload
  const handleAfterPhotosChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Create preview URLs for the selected files
      const newPhotos = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setAfterPhotos([...afterPhotos, ...newPhotos]);
    }
  };

  // Remove cover image
  const removeCoverImage = () => {
    if (coverImagePreview) {
      URL.revokeObjectURL(coverImagePreview);
    }
    setCoverImagePreview(null);
    setProjectData({
      ...projectData,
      coverImage: null,
    });
  };

  // Remove a photo from the before list
  const removeBeforePhoto = (index) => {
    const updatedPhotos = [...beforePhotos];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPhotos[index].preview);

    updatedPhotos.splice(index, 1);
    setBeforePhotos(updatedPhotos);
  };

  // Remove a photo from the after list
  const removeAfterPhoto = (index) => {
    const updatedPhotos = [...afterPhotos];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(updatedPhotos[index].preview);

    updatedPhotos.splice(index, 1);
    setAfterPhotos(updatedPhotos);
  };

  // Handle tag input
  const handleTagChange = (e) => {
    setTag(e.target.value);
  };

  // Add new tag
  const addTag = () => {
    if (tag.trim() && !projectData.tags.includes(tag.trim())) {
      setProjectData({
        ...projectData,
        tags: [...projectData.tags, tag.trim()],
      });
      setTag("");
    }
  };

  // Remove a tag
  const removeTag = (tagToRemove) => {
    setProjectData({
      ...projectData,
      tags: projectData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle key press for tag input
  const handleTagKeyPress = (e) => {
    if (e.key === "Enter" && tag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors
    dispatch(clearErrors());

    // Create the project data object that matches your Redux slice expectations
    const formDataObject = {
      // Basic project data
      title: projectData.title,
      shortDescription: projectData.shortDescription,
      description: projectData.description,
      budget: projectData.budget,
      startDate: projectData.startDate,
      endDate: projectData.endDate,
      isPublic: projectData.isPublic,
      showroomStatus: projectData.showroomStatus,
      clientId: projectData.clientId,
      status: projectData.status,
      tags: projectData.tags,
      category: selectedCategory?._id || "",
      subcategory: selectedSubcategory?._id || "",
      // Files - extract just the file objects
      coverImage: projectData.coverImage,
      beforePhotos: beforePhotos.map((photo) => photo.file),
      afterPhotos: afterPhotos.map((photo) => photo.file),
    };

    // Dispatch the action - your Redux slice will handle FormData creation
    dispatch(createProject(formDataObject));
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (coverImagePreview) URL.revokeObjectURL(coverImagePreview);
      beforePhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
      afterPhotos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    };
  }, [coverImagePreview, beforePhotos, afterPhotos]);

  // Helper function to safely render error messages
  const getErrorMessage = (error) => {
    if (typeof error === "string") return error;
    if (error && typeof error === "object") {
      return error.message || JSON.stringify(error) || "An error occurred";
    }
    return "An error occurred";
  };

  // Helper function to safely render success/info messages
  const getSuccessMessage = (msg) => {
    if (typeof msg === "string") return msg;
    if (msg && typeof msg === "object") {
      return msg.message || "Operation completed successfully!";
    }
    return "Operation completed successfully!";
  };

  // Safe array check helper
  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

  return (
    <Paper
      elevation={3}
      className="add-project-container"
      sx={{
        p: 3,
        backgroundColor: "#f9f9f9",
        borderRadius: 2,
        position: "relative",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" component="h1">
          Create New Project
        </Typography>
        {onCancel && (
          <IconButton
            onClick={onCancel}
            size="small"
            aria-label="close"
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "text.secondary",
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <Divider sx={{ mb: 4 }} />

      {/* Error handling - Fixed to prevent object rendering */}
      {(error || projectState?.error) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {getErrorMessage(error || projectState?.error)}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Client Information Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Client Information
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Autocomplete
            id="client-select"
            options={safeArray(clients)}
            getOptionLabel={(option) => option?.name || ""}
            value={selectedClient}
            onChange={handleClientSelect}
            loading={clientsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Client"
                variant="outlined"
                required
                fullWidth
                margin="normal"
                error={!projectData.clientId && projectData.title.length > 0}
                helperText={
                  !projectData.clientId && projectData.title.length > 0
                    ? "Client is required"
                    : ""
                }
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {clientsLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => (
              <li {...props}>
                <Box>
                  <Typography variant="body1">{option?.name || ""}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option?.email || ""}
                  </Typography>
                </Box>
              </li>
            )}
          />

          {safeArray(clients).length === 0 && !clientsLoading && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 1, display: "block" }}
            >
              You don't have any clients yet. Please add clients from the client
              management page first.
            </Typography>
          )}
        </Box>

        {/* Project Details Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Project Details
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={projectData.title}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>

            {/* Service Category Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                id="category-select"
                options={safeArray(serviceCategories)}
                getOptionLabel={(option) => option?.name || ""}
                value={selectedCategory}
                onChange={handleCategorySelect}
                loading={categoriesLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Service Category"
                    variant="outlined"
                    required
                    fullWidth
                    margin="normal"
                    error={
                      !projectData.category && projectData.title.length > 0
                    }
                    helperText={
                      !projectData.category && projectData.title.length > 0
                        ? "Service category is required"
                        : ""
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {categoriesLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option?.name || ""}
                      </Typography>
                      {option?.description && (
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
              />
            </Grid>

            {/* Service Subcategory Selection */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                id="subcategory-select"
                options={safeArray(selectedCategorySubcategories)}
                getOptionLabel={(option) => option?.name || ""}
                value={selectedSubcategory}
                onChange={handleSubcategorySelect}
                loading={subcategoriesLoading}
                disabled={!selectedCategory}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Service Subcategory"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    helperText={
                      !selectedCategory
                        ? "Please select a category first"
                        : safeArray(selectedCategorySubcategories).length ===
                            0 && !subcategoriesLoading
                        ? "No subcategories available for selected category"
                        : ""
                    }
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {subcategoriesLoading ? (
                            <CircularProgress color="inherit" size={20} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="body1">
                        {option?.name || ""}
                      </Typography>
                      {option?.description && (
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  </li>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description"
                name="shortDescription"
                value={projectData.shortDescription}
                onChange={handleChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={projectData.description}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={4}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Budget ($)"
                name="budget"
                type="number"
                value={projectData.budget}
                onChange={handleChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={projectData.status}
                onChange={handleChange}
                margin="normal"
                required
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={projectData.startDate}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={projectData.endDate}
                onChange={handleChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Tags section */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <TextField
                  fullWidth
                  label="Add Tags"
                  value={tag}
                  onChange={handleTagChange}
                  onKeyPress={handleTagKeyPress}
                  margin="normal"
                  sx={{ mr: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={addTag}
                  disabled={!tag.trim()}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
                {safeArray(projectData.tags).map((tagItem, index) => (
                  <Chip
                    key={index}
                    label={tagItem}
                    onDelete={() => removeTag(tagItem)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="isPublic"
                    checked={projectData.isPublic}
                    onChange={handleChange}
                  />
                }
                label="Make Public (Showroom)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Showroom Status"
                name="showroomStatus"
                value={projectData.showroomStatus}
                onChange={handleChange}
                margin="normal"
                disabled={!projectData.isPublic}
              >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="trending">Trending</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>

        {/* Cover Image Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Cover Image
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              sx={{ mb: 2 }}
            >
              Upload Cover Image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleCoverImageChange}
              />
            </Button>
          </Box>

          {coverImagePreview && (
            <Box sx={{ mt: 2, mb: 3, maxWidth: "300px" }}>
              <Card>
                <CardMedia
                  component="img"
                  height="180"
                  image={coverImagePreview}
                  alt="Cover image preview"
                />
                <Button
                  fullWidth
                  size="small"
                  color="error"
                  onClick={removeCoverImage}
                  startIcon={<DeleteIcon />}
                >
                  Remove
                </Button>
              </Card>
            </Box>
          )}
        </Box>

        {/* Before & After Photos Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Before & After Photos
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {/* Before Photos */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Before Photos
            </Typography>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Upload Before Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleBeforePhotosChange}
                />
              </Button>
            </Box>

            {beforePhotos.length > 0 && (
              <Grid container spacing={2}>
                {beforePhotos.map((photo, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="120"
                        image={photo.preview}
                        alt={`Before photo ${index + 1}`}
                      />
                      <Button
                        fullWidth
                        size="small"
                        color="error"
                        onClick={() => removeBeforePhoto(index)}
                        startIcon={<DeleteIcon />}
                      >
                        Remove
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          {/* After Photos */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              After Photos
            </Typography>

            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Upload After Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleAfterPhotosChange}
                />
              </Button>
            </Box>

            {afterPhotos.length > 0 && (
              <Grid container spacing={2}>
                {afterPhotos.map((photo, index) => (
                  <Grid item xs={6} sm={4} md={3} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="120"
                        image={photo.preview}
                        alt={`After photo ${index + 1}`}
                      />
                      <Button
                        fullWidth
                        size="small"
                        color="error"
                        onClick={() => removeAfterPhoto(index)}
                        startIcon={<DeleteIcon />}
                      >
                        Remove
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Box>

        {/* Form Actions */}
        <Box
          sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading || projectState?.loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              isLoading ||
              projectState?.loading ||
              !projectData.clientId ||
              !projectData.title ||
              !projectData.category
            }
          >
            {isLoading || projectState?.loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </Button>
        </Box>
      </form>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {getSuccessMessage(message || projectState?.message)}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddProject;
