import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchSubcategories,
  deleteCategory,
  deleteSubcategory,
  selectAllCategories,
  selectAllSubcategories,
  selectServiceCategoriesStatus,
  resetStatus,
  createCategory,
  updateCategory,
  createSubcategory,
  updateSubcategory,
} from "../../../../redux/slices/serviceCategoriesSlice";

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const ServiceManagement = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const subcategories = useSelector(selectAllSubcategories);
  const { loading, error, success, message } = useSelector(
    selectServiceCategoriesStatus
  );

  // Local state
  const [activeTab, setActiveTab] = useState(0);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSubcategoryDialog, setOpenSubcategoryDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // "add" or "edit"
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [subcategoryForm, setSubcategoryForm] = useState({
    name: "",
    description: "",
    parentCategory: "",
  });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [viewSubcategoriesFor, setViewSubcategoriesFor] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubcategories());
  }, [dispatch]);

  // Handle status changes
  useEffect(() => {
    if (success) {
      setSnackbarMessage(
        typeof message === "object"
          ? JSON.stringify(message)
          : message || "Operation successful"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      // Reset forms and close dialogs on success
      if (openCategoryDialog) {
        setCategoryForm({ name: "", description: "" });
        setOpenCategoryDialog(false);
      }
      if (openSubcategoryDialog) {
        setSubcategoryForm({ name: "", description: "", parentCategory: "" });
        setOpenSubcategoryDialog(false);
      }

      // Refresh data
      dispatch(fetchCategories());
      dispatch(fetchSubcategories());
      dispatch(resetStatus());
    }

    if (error) {
      setSnackbarMessage(
        typeof error === "object"
          ? JSON.stringify(error)
          : error || "An error occurred"
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      dispatch(resetStatus());
    }
  }, [
    success,
    error,
    message,
    dispatch,
    openCategoryDialog,
    openSubcategoryDialog,
  ]);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setViewSubcategoriesFor(null);
  };

  // Category dialog handlers
  const handleOpenCategoryDialog = (mode, category = null) => {
    setDialogMode(mode);
    if (mode === "edit" && category) {
      setCategoryForm({
        name: category.name,
        description: category.description || "",
      });
      setSelectedCategory(category);
    } else {
      setCategoryForm({ name: "", description: "" });
      setSelectedCategory(null);
    }
    setOpenCategoryDialog(true);
  };

  const handleCloseCategoryDialog = () => {
    setOpenCategoryDialog(false);
    setCategoryForm({ name: "", description: "" });
  };

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySubmit = () => {
    if (dialogMode === "add") {
      dispatch(createCategory(categoryForm));
    } else {
      dispatch(
        updateCategory({
          categoryId: selectedCategory._id,
          categoryData: categoryForm,
        })
      );
    }
  };

  // Subcategory dialog handlers
  const handleOpenSubcategoryDialog = (mode, subcategory = null) => {
    setDialogMode(mode);
    if (mode === "edit" && subcategory) {
      setSubcategoryForm({
        name: subcategory.name,
        description: subcategory.description || "",
        parentCategory: subcategory.parentCategory,
      });
      setSelectedSubcategory(subcategory);
    } else {
      setSubcategoryForm({
        name: "",
        description: "",
        parentCategory: viewSubcategoriesFor || "", // Pre-select the category if we're viewing subcategories for a specific category
      });
      setSelectedSubcategory(null);
    }
    setOpenSubcategoryDialog(true);
  };

  const handleCloseSubcategoryDialog = () => {
    setOpenSubcategoryDialog(false);
    setSubcategoryForm({ name: "", description: "", parentCategory: "" });
  };

  const handleSubcategoryInputChange = (e) => {
    const { name, value } = e.target;
    setSubcategoryForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubcategorySubmit = () => {
    if (dialogMode === "add") {
      dispatch(createSubcategory(subcategoryForm));
    } else {
      dispatch(
        updateSubcategory({
          subcategoryId: selectedSubcategory._id,
          subcategoryData: subcategoryForm,
        })
      );
    }
  };

  // Delete handlers
  const handleDeleteCategory = (categoryId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All associated subcategories will also be deleted."
      )
    ) {
      dispatch(deleteCategory(categoryId));
    }
  };

  const handleDeleteSubcategory = (subcategoryId) => {
    if (window.confirm("Are you sure you want to delete this subcategory?")) {
      dispatch(deleteSubcategory(subcategoryId));
    }
  };

  // View subcategories handler
  const handleViewSubcategories = (categoryId) => {
    setViewSubcategoriesFor(categoryId);
    setActiveTab(1); // Switch to subcategories tab
  };

  // Snackbar close handler
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // We can remove this function since we no longer use it
  // Keeping getCategoryName for the subcategory view

  // Helper to get category name by ID
  const getCategoryName = (categoryId) => {
    const category = Array.isArray(categories)
      ? categories.find((cat) => cat._id === categoryId)
      : null;
    return category ? category.name : "";
  };

  // We can keep this function as it's still used in the UI when viewing subcategories for a specific category
  // Even though we removed it from the table columns

  // DataGrid columns for categories - Removed subcategoriesCount column
  const categoryColumns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" gap="8px">
          <Tooltip title="View Subcategories">
            <IconButton
              size="small"
              onClick={() => handleViewSubcategories(params.row._id)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleOpenCategoryDialog("edit", params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteCategory(params.row._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // DataGrid columns for subcategories - Removed parent category column
  const subcategoryColumns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" gap="8px">
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => handleOpenSubcategoryDialog("edit", params.row)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteSubcategory(params.row._id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  // Prepare rows for DataGrid - Fixed to ensure valid data
  const categoryRows = Array.isArray(categories)
    ? categories.map((category) => ({
        id: category._id || String(Math.random()),
        _id: category._id || "",
        name: category.name || "",
        description: category.description || "",
      }))
    : [];

  // Filter subcategories if a category is selected for viewing - Fixed filtering
  const subcategoryRows = Array.isArray(subcategories)
    ? subcategories
        .filter(
          (subcategory) =>
            !viewSubcategoriesFor ||
            subcategory.parentCategory === viewSubcategoriesFor
        )
        .map((subcategory) => ({
          id: subcategory._id || String(Math.random()),
          _id: subcategory._id || "",
          name: subcategory.name || "",
          description: subcategory.description || "",
          parentCategory: subcategory.parentCategory || "",
        }))
    : [];

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight="bold">
          Service Management
        </Typography>
        <Box>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenCategoryDialog("add")}
            >
              Add Category
            </Button>
          )}
          {activeTab === 1 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenSubcategoryDialog("add")}
            >
              Add Subcategory
            </Button>
          )}
        </Box>
      </Box>

      {viewSubcategoriesFor && activeTab === 1 && (
        <Box mb={2}>
          <Typography variant="h6">
            Viewing subcategories for: {getCategoryName(viewSubcategoriesFor)}
            <Button
              sx={{ ml: 2 }}
              size="small"
              onClick={() => setViewSubcategoriesFor(null)}
            >
              Show All
            </Button>
          </Typography>
        </Box>
      )}

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Categories" />
        <Tab label="Subcategories" />
      </Tabs>

      <Box
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
          },
        }}
      >
        {activeTab === 0 ? (
          <DataGrid
            rows={categoryRows}
            columns={categoryColumns}
            loading={loading}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
          />
        ) : (
          <DataGrid
            rows={subcategoryRows}
            columns={subcategoryColumns}
            loading={loading}
            getRowId={(row) => row.id}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </Box>

      {/* Category Dialog */}
      <Dialog
        open={openCategoryDialog}
        onClose={handleCloseCategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "add" ? "Add New Category" : "Edit Category"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Category Name"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryForm.name}
            onChange={handleCategoryInputChange}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={categoryForm.description}
            onChange={handleCategoryInputChange}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
          <Button
            onClick={handleCategorySubmit}
            variant="contained"
            disabled={!categoryForm.name}
          >
            {dialogMode === "add" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog
        open={openSubcategoryDialog}
        onClose={handleCloseSubcategoryDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "add" ? "Add New Subcategory" : "Edit Subcategory"}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2, mt: 1 }}>
            <InputLabel id="parent-category-label">Parent Category</InputLabel>
            <Select
              labelId="parent-category-label"
              name="parentCategory"
              value={subcategoryForm.parentCategory}
              onChange={handleSubcategoryInputChange}
              label="Parent Category"
            >
              {Array.isArray(categories) &&
                categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="name"
            label="Subcategory Name"
            type="text"
            fullWidth
            variant="outlined"
            value={subcategoryForm.name}
            onChange={handleSubcategoryInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={subcategoryForm.description}
            onChange={handleSubcategoryInputChange}
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubcategoryDialog}>Cancel</Button>
          <Button
            onClick={handleSubcategorySubmit}
            variant="contained"
            disabled={!subcategoryForm.name || !subcategoryForm.parentCategory}
          >
            {dialogMode === "add" ? "Add" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ServiceManagement;
