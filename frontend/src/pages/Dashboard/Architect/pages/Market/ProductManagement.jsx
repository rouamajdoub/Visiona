import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  clearProductError,
  resetCurrentProduct,
} from "../../../../../redux/slices/marketplaceSlice";
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const ProductManagement = () => {
  const dispatch = useDispatch();
  const {
    products: { list: products = [], loading, error },
    categories: { list: categories = [] },
  } = useSelector((state) => state.marketplace);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    dimensions: "",
    materials: "",
    tags: "",
    images: [],
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price || "",
        categoryId:
          selectedProduct.categoryId?._id || selectedProduct.categoryId || "",
        stock: selectedProduct.stock || "",
        dimensions: selectedProduct.dimensions || "",
        materials: selectedProduct.materials || "",
        tags: Array.isArray(selectedProduct.tags)
          ? selectedProduct.tags.join(", ")
          : "",
        images: selectedProduct.images || [],
      });
      setPreviewImages(selectedProduct.images || []);
    }
  }, [selectedProduct]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      stock: "",
      dimensions: "",
      materials: "",
      tags: "",
      images: [],
    });
    setImageFiles([]);
    setPreviewImages([]);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    resetForm();
    setOpenModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (confirmDelete) {
      dispatch(deleteProduct(id));
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
    resetForm();
    dispatch(clearProductError());
    dispatch(resetCurrentProduct());
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("categoryId", formData.categoryId);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("dimensions", formData.dimensions);
    formDataToSend.append("materials", formData.materials);

    // Handle tags as array
    if (formData.tags) {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
      tagsArray.forEach((tag) => formDataToSend.append("tags", tag));
    }

    // FIXED: Change 'images' to 'productImages' to match backend
    imageFiles.forEach((file) => {
      formDataToSend.append("productImages", file);
    });

    // Debug: Log the FormData contents
    console.log("FormData contents:");
    for (let [key, value] of formDataToSend.entries()) {
      console.log(key, value);
    }

    try {
      if (selectedProduct) {
        await dispatch(
          updateProduct({ id: selectedProduct._id, formData: formDataToSend })
        ).unwrap();
      } else {
        await dispatch(createProduct(formDataToSend)).unwrap();
      }
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 80,
      renderCell: ({ row }) => (
        <Avatar
          src={
            row.images && row.images.length > 0
              ? row.images[0]
              : "/placeholder-image.png"
          }
          alt={row.name}
          variant="rounded"
          sx={{ width: 50, height: 50 }}
        />
      ),
    },
    { field: "name", headerName: "Product Name", flex: 1 },
    {
      field: "category",
      headerName: "Category",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>{row.categoryId?.name || "No Category"}</Typography>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 120,
      renderCell: ({ row }) => (
        <Typography fontWeight="bold" color="primary">
          {formatPrice(row.price)}
        </Typography>
      ),
    },
    {
      field: "stock",
      headerName: "Stock",
      width: 100,
      renderCell: ({ row }) => (
        <Chip
          label={row.stock}
          color={
            row.stock > 10 ? "success" : row.stock > 0 ? "warning" : "error"
          }
          size="small"
        />
      ),
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: ({ row }) => (
        <Chip
          label={row.status || "Active"}
          color={row.status === "active" ? "success" : "default"}
          size="small"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      width: 120,
      renderCell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(row)}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(row._id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const rows = (products || []).map((product) => ({
    id: product._id,
    _id: product._id,
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    stock: product.stock,
    status: product.status,
    images: product.images,
    createdAt: product.createdAt,
    ...product,
  }));

  if (loading) return <CircularProgress />;

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4" fontWeight="bold">
          Product Management
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreate}>
          Add New Product
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            borderBottom: "none",
            backgroundColor: "#f5f5f5",
          },
          "& .MuiDataGrid-virtualScroller": {},
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>

      {/* Product Form Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Dimensions"
                  name="dimensions"
                  value={formData.dimensions}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Materials"
                  name="materials"
                  value={formData.materials}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Tags (comma separated)"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  helperText="Enter tags separated by commas (e.g., modern, luxury, outdoor)"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Product Images
                </Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ marginBottom: "10px" }}
                />

                {previewImages.length > 0 && (
                  <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                    {previewImages.map((image, index) => (
                      <Avatar
                        key={index}
                        src={image}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedProduct ? "Update" : "Create"} Product
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
