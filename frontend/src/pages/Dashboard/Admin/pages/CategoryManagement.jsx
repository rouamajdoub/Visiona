import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearCategoryError,
} from "../../../../redux/slices/marketplaceSlice";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const CategoryManagement = () => {
  const dispatch = useDispatch();
  const {
    list: categories,
    loading,
    error,
  } = useSelector((state) => state.marketplace.categories);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("create"); // "create" or "edit"
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    parentCategory: "",
  });

  // Form validation
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
  });

  // Alert state
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    dispatch(fetchCategories());

    return () => {
      dispatch(clearCategoryError());
    };
  }, [dispatch]);

  useEffect(() => {
    // Reset form when dialog opens or changes mode
    if (openDialog) {
      if (dialogMode === "edit" && selectedCategory) {
        setCategoryForm({
          name: selectedCategory.name || "",
          description: selectedCategory.description || "",
          parentCategory: selectedCategory.parentCategory?._id || "",
        });
      } else {
        setCategoryForm({
          name: "",
          description: "",
          parentCategory: "",
        });
      }
      setFormErrors({
        name: "",
        description: "",
      });
    }
  }, [openDialog, dialogMode, selectedCategory]);

  useEffect(() => {
    // Handle error from Redux state
    if (error) {
      setAlert({ show: true, type: "error", message: error });
      setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
      setSubmitting(false);
    }
  }, [error]);

  const validateForm = () => {
    const errors = {
      name: "",
      description: "",
    };

    if (!categoryForm.name.trim()) {
      errors.name = "Category name is required";
    } else if (categoryForm.name.length > 50) {
      errors.name = "Category name cannot be more than 50 characters";
    }

    if (!categoryForm.description.trim()) {
      errors.description = "Category description is required";
    } else if (categoryForm.description.length > 500) {
      errors.description = "Description cannot be more than 500 characters";
    }

    setFormErrors(errors);
    return !errors.name && !errors.description;
  };

  const handleOpenDialog = (mode, category = null) => {
    setDialogMode(mode);
    setSelectedCategory(category);
    setOpenDialog(true);
    dispatch(clearCategoryError());
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm({
      ...categoryForm,
      [name]: value,
    });

    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data - handle empty parentCategory properly
      const categoryData = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
        parentCategory: categoryForm.parentCategory || null,
      };

      if (dialogMode === "create") {
        await dispatch(createCategory(categoryData)).unwrap();
        setAlert({
          show: true,
          type: "success",
          message: "Category created successfully!",
        });
      } else {
        await dispatch(
          updateCategory({
            id: selectedCategory._id,
            categoryData,
          })
        ).unwrap();
        setAlert({
          show: true,
          type: "success",
          message: "Category updated successfully!",
        });
      }
      handleCloseDialog();
      setTimeout(() => setAlert({ show: false, type: "", message: "" }), 5000);
    } catch (err) {
      console.error("Error submitting category:", err);
      setAlert({
        show: true,
        type: "error",
        message: err.message || "An error occurred",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This cannot be undone."
      )
    ) {
      try {
        await dispatch(deleteCategory(id)).unwrap();
        setAlert({
          show: true,
          type: "success",
          message: "Category deleted successfully!",
        });
        setTimeout(
          () => setAlert({ show: false, type: "", message: "" }),
          5000
        );
      } catch (err) {
        setAlert({
          show: true,
          type: "error",
          message: err.message || "An error occurred",
        });
        setTimeout(
          () => setAlert({ show: false, type: "", message: "" }),
          5000
        );
      }
    }
  };

  // DataGrid columns
  const columns = [
    { field: "_id", headerName: "ID", width: 220 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "description", headerName: "Description", flex: 2 },
    {
      field: "parentCategory",
      headerName: "Parent Category",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.parentCategory?.name || "None"}</Typography>
      ),
    },
    {
      field: "subcategories",
      headerName: "Subcategories",
      width: 120,
      renderCell: ({ row }) => (
        <Typography>{row.subcategories?.length || 0}</Typography>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: ({ row }) => (
        <Box>
          <IconButton
            color="primary"
            onClick={() => handleOpenDialog("edit", row)}
          >
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row._id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Convert categories to rows
  const rows = categories.map((category) => ({
    id: category._id, // DataGrid requires a unique 'id' field
    ...category,
  }));

  return (
    <Box m="20px">
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight="bold">
          Category Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog("create")}
        >
          Add Category
        </Button>
      </Box>

      {/* Alert */}
      {alert.show && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.message}
        </Alert>
      )}

      {/* Data Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {},
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
            },
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[5, 10, 20]}
            disableSelectionOnClick
            autoHeight
          />
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "create" ? "Create New Category" : "Edit Category"}
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
            onChange={handleFormChange}
            required
            error={!!formErrors.name}
            helperText={formErrors.name}
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
            onChange={handleFormChange}
            multiline
            rows={3}
            required
            error={!!formErrors.description}
            helperText={formErrors.description}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="parent-category-label">Parent Category</InputLabel>
            <Select
              labelId="parent-category-label"
              name="parentCategory"
              value={categoryForm.parentCategory}
              onChange={handleFormChange}
              label="Parent Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories
                .filter(
                  (cat) =>
                    // Don't show self as parent option when editing
                    dialogMode !== "edit" || cat._id !== selectedCategory?._id
                )
                .map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={24} color="inherit" />
            ) : dialogMode === "create" ? (
              "Create"
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;
