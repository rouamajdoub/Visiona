import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createQuote,
  updateQuote,
} from "../../../../../redux/slices/quotesInvoicesSlice";
import { fetchClients } from "../../../../../redux/slices/clientsSlice";
import { fetchAllProjects } from "../../../../../redux/slices/ProjectSlice";

// Components for the form
import {
  Box,
  Button,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const QuoteForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams(); // For editing existing quotes
  const currentUser = useSelector((state) => state.auth.user);
  // Get data from Redux store
  const { clients } = useSelector((state) => state.clients);
  const { projects } = useSelector((state) => state.projects);
  const { quotes } = useSelector((state) => state.quotesInvoices);
  const currentQuote = useSelector(
    (state) => state.quotesInvoices.quotes.currentQuote
  );
  const loading = useSelector((state) => state.quotesInvoices.quotes.loading);

  // Format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  // Form state - Make sure architect is initialized with currentUser._id when available
  const [formData, setFormData] = useState({
    type: "quote",
    client: "",
    clientName: "",
    clientAddress: {
      street: "",
      city: "",
      zipCode: "",
    },
    // Initialize with currentUser._id if available
    architect: currentUser?._id || "",
    project: "",
    projectTitle: "",
    projectDescription: "",
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        category: "design",
      },
    ],
    subtotal: 0,
    taxRate: 19, // Default tax rate for Tunisia (19% VAT)
    taxAmount: 0,
    discount: 0,
    totalAmount: 0,
    issueDate: formatDateForInput(new Date()),
    expirationDate: formatDateForInput(
      new Date(new Date().setDate(new Date().getDate() + 30))
    ), // 30 days from now
    status: "draft",
    termsConditions: "Standard terms and conditions apply.",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  // Set current user as architect when component mounts or when currentUser changes
  useEffect(() => {
    if (currentUser?._id) {
      setFormData((prevData) => ({
        ...prevData,
        architect: currentUser._id,
      }));
      console.log("Quotes: Setting architect ID to:", currentUser._id);
    }
  }, [currentUser]);

  // Fetch clients and projects on component mount
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchAllProjects());

    // If we have an ID, we're editing an existing quote
    if (id) {
      const existingQuote = quotes.items.find((quote) => quote._id === id);

      if (existingQuote) {
        // When editing, preserve the existing architect ID or use currentUser._id as fallback
        setFormData({
          ...existingQuote,
          architect: existingQuote.architect || currentUser?._id || "",
          issueDate: formatDateForInput(existingQuote.issueDate),
          expirationDate: existingQuote.expirationDate
            ? formatDateForInput(existingQuote.expirationDate)
            : "",
        });
      }
    }
  }, [dispatch, id, quotes.items, currentUser]);

  // Update form when currentQuote changes (for editing)
  useEffect(() => {
    if (id && currentQuote && currentQuote._id === id) {
      // When getting the current quote, preserve the architect ID
      setFormData({
        ...currentQuote,
        architect: currentQuote.architect || currentUser?._id || "",
        issueDate: formatDateForInput(currentQuote.issueDate),
        expirationDate: currentQuote.expirationDate
          ? formatDateForInput(currentQuote.expirationDate)
          : "",
      });
    }
  }, [currentQuote, id, currentUser]);

  // Calculate totals when items, taxRate, or discount changes
  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate, formData.discount]);

  // Update client info when client changes
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    const selectedClient = clients.find((client) => client._id === clientId);

    if (selectedClient) {
      setFormData({
        ...formData,
        client: clientId,
        clientName: selectedClient.name,
        clientAddress: {
          street: selectedClient.address?.street || "",
          city: selectedClient.address?.city || "",
          zipCode: selectedClient.address?.zipCode || "",
        },
      });
    }
  };

  // Update project info when project changes
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    const selectedProject = projects.find(
      (project) => project._id === projectId
    );

    if (selectedProject) {
      setFormData({
        ...formData,
        project: projectId,
        projectTitle: selectedProject.title,
        projectDescription: selectedProject.description || "",
      });
    }
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Calculate item total
    if (field === "quantity" || field === "unitPrice") {
      updatedItems[index].total =
        updatedItems[index].quantity * updatedItems[index].unitPrice;
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Add new item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          category: "design",
        },
      ],
    });
  };

  // Remove item
  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Calculate subtotal, tax amount, and total
  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );
    const taxAmount = subtotal * (formData.taxRate / 100);
    const totalAmount = subtotal + taxAmount - formData.discount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      taxAmount,
      totalAmount,
    }));
  };

  // Handle form submission - Fixed to ensure architect is always included
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Make sure the architect ID is definitely set
    const architectId = currentUser?._id || "";

    // Check if architect ID is available
    if (!formData.architect && !architectId) {
      setErrors({
        form: "Architect information is missing. Please try logging in again.",
      });
      return;
    }

    // Prepare data for submission with guaranteed architect field
    const submissionData = {
      ...formData,
      // Use existing architect or fallback to currentUser._id
      architect: formData.architect || architectId,
      issueDate: new Date(formData.issueDate),
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate)
        : null,
    };

    // Log the submission data to debug
    console.log("Submitting quote with data:", submissionData);

    try {
      if (id) {
        // Update existing quote
        await dispatch(updateQuote({ id, quoteData: submissionData })).unwrap();
      } else {
        // Create new quote
        await dispatch(createQuote(submissionData)).unwrap();
      }

      // Navigate to quotes list
      navigate("/architect");
    } catch (error) {
      console.error("Error saving quote:", error);
      setErrors({
        form: error.message || "Failed to save quote. Please try again.",
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.client) errors.client = "Client is required";
    if (!formData.project) errors.project = "Project is required";
    if (!formData.issueDate) errors.issueDate = "Issue date is required";
    // Explicitly check for architect - this is critical
    if (!formData.architect && !currentUser?._id)
      errors.architect = "Architect is required";
    if (!formData.expirationDate)
      errors.expirationDate = "Expiration date is required";

    // Validate items
    const itemErrors = [];
    formData.items.forEach((item, idx) => {
      const error = {};
      if (!item.description) error.description = "Description is required";
      if (!item.quantity || item.quantity <= 0)
        error.quantity = "Valid quantity is required";
      if (!item.unitPrice || item.unitPrice < 0)
        error.unitPrice = "Valid unit price is required";
      if (Object.keys(error).length > 0) itemErrors[idx] = error;
    });

    if (itemErrors.length > 0) errors.items = itemErrors;

    return errors;
  };

  // Generic input change handler
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Add a debug section to display current architect value (you can remove this in production)
  const debugInfo = process.env.NODE_ENV === "development" && (
    <div
      style={{
        margin: "10px 0",
        padding: "10px",
        background: "#f5f5f5",
        borderRadius: "4px",
      }}
    >
      <Typography variant="body2">
        Current Architect ID: {formData.architect || "Not set"}
      </Typography>
      <Typography variant="body2">
        Current User ID: {currentUser?._id || "Not available"}
      </Typography>
    </div>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>

        <Typography variant="h4" gutterBottom>
          {id ? "Edit Quote" : "Create New Quote"}
        </Typography>

        {process.env.NODE_ENV === "development" && debugInfo}

        {/* Hidden architect field to ensure it's always submitted */}
        <input
          type="hidden"
          name="architect"
          value={formData.architect || currentUser?._id || ""}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Client and Project Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Client & Project Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.client}>
                        <InputLabel>Client</InputLabel>
                        <Select
                          name="client"
                          value={formData.client}
                          onChange={handleClientChange}
                          label="Client"
                        >
                          {clients?.map((client) => (
                            <MenuItem key={client._id} value={client._id}>
                              {client.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.client && (
                          <FormHelperText>{errors.client}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth error={!!errors.project}>
                        <InputLabel>Project</InputLabel>
                        <Select
                          name="project"
                          value={formData.project}
                          onChange={handleProjectChange}
                          label="Project"
                        >
                          {projects?.map((project) => (
                            <MenuItem key={project._id} value={project._id}>
                              {project.title}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.project && (
                          <FormHelperText>{errors.project}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Project Description"
                        name="projectDescription"
                        value={formData.projectDescription}
                        onChange={handleChange}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Quote Details Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quote Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Issue Date"
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleChange}
                        error={!!errors.issueDate}
                        helperText={errors.issueDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Expiration Date"
                        type="date"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleChange}
                        error={!!errors.expirationDate}
                        helperText={errors.expirationDate}
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <FormControl component="fieldset">
                        <FormLabel component="legend">Status</FormLabel>
                        <RadioGroup
                          row
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <FormControlLabel
                            value="draft"
                            control={<Radio />}
                            label="Draft"
                          />
                          <FormControlLabel
                            value="sent"
                            control={<Radio />}
                            label="Sent"
                          />
                          <FormControlLabel
                            value="accepted"
                            control={<Radio />}
                            label="Accepted"
                          />
                          <FormControlLabel
                            value="rejected"
                            control={<Radio />}
                            label="Rejected"
                          />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Quote Items Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6">Quote Items</Typography>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addItem}
                    >
                      Add Item
                    </Button>
                  </Box>

                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Description</TableCell>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Unit Price (TND)</TableCell>
                          <TableCell align="right">Total (TND)</TableCell>
                          <TableCell align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {formData.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                fullWidth
                                value={item.description}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                error={
                                  !!errors.items &&
                                  !!errors.items[index]?.description
                                }
                                helperText={
                                  errors.items &&
                                  errors.items[index]?.description
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <FormControl fullWidth>
                                <Select
                                  value={item.category}
                                  onChange={(e) =>
                                    handleItemChange(
                                      index,
                                      "category",
                                      e.target.value
                                    )
                                  }
                                >
                                  <MenuItem value="design">Design</MenuItem>
                                  <MenuItem value="materials">
                                    Materials
                                  </MenuItem>
                                  <MenuItem value="labor">Labor</MenuItem>
                                  <MenuItem value="furniture">
                                    Furniture
                                  </MenuItem>
                                  <MenuItem value="other">Other</MenuItem>
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    Number(e.target.value)
                                  )
                                }
                                inputProps={{ min: 1, step: 1 }}
                                error={
                                  !!errors.items &&
                                  !!errors.items[index]?.quantity
                                }
                                helperText={
                                  errors.items && errors.items[index]?.quantity
                                }
                              />
                            </TableCell>
                            <TableCell align="right">
                              <TextField
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "unitPrice",
                                    Number(e.target.value)
                                  )
                                }
                                inputProps={{ min: 0, step: 0.1 }}
                                error={
                                  !!errors.items &&
                                  !!errors.items[index]?.unitPrice
                                }
                                helperText={
                                  errors.items && errors.items[index]?.unitPrice
                                }
                                InputProps={{
                                  endAdornment: (
                                    <Typography variant="body2">TND</Typography>
                                  ),
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              {item.total.toFixed(2)} TND
                            </TableCell>
                            <TableCell align="center">
                              <IconButton
                                color="error"
                                onClick={() => removeItem(index)}
                                disabled={formData.items.length === 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              </Grid>

              {/* Quote Summary Section */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Quote Summary
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Terms & Conditions"
                        name="termsConditions"
                        value={formData.termsConditions}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          mt: 2,
                        }}
                      >
                        <Grid
                          container
                          spacing={2}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Grid item xs={4} md={2}>
                            <Typography variant="body1">Subtotal:</Typography>
                          </Grid>
                          <Grid item xs={8} md={3}>
                            <Typography variant="body1" align="right">
                              {formData.subtotal.toFixed(2)} TND
                            </Typography>
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          spacing={2}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Grid item xs={4} md={2}>
                            <Typography variant="body1">Tax Rate:</Typography>
                          </Grid>
                          <Grid item xs={8} md={3}>
                            <TextField
                              type="number"
                              value={formData.taxRate}
                              onChange={handleChange}
                              name="taxRate"
                              inputProps={{ min: 0, max: 100, step: 0.1 }}
                              InputProps={{
                                endAdornment: (
                                  <Typography variant="body2">%</Typography>
                                ),
                              }}
                              size="small"
                            />
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          spacing={2}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Grid item xs={4} md={2}>
                            <Typography variant="body1">Tax Amount:</Typography>
                          </Grid>
                          <Grid item xs={8} md={3}>
                            <Typography variant="body1" align="right">
                              {formData.taxAmount.toFixed(2)} TND
                            </Typography>
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          spacing={2}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Grid item xs={4} md={2}>
                            <Typography variant="body1">Discount:</Typography>
                          </Grid>
                          <Grid item xs={8} md={3}>
                            <TextField
                              type="number"
                              value={formData.discount}
                              onChange={handleChange}
                              name="discount"
                              inputProps={{ min: 0, step: 0.1 }}
                              InputProps={{
                                endAdornment: (
                                  <Typography variant="body2">TND</Typography>
                                ),
                              }}
                              size="small"
                            />
                          </Grid>
                        </Grid>

                        <Grid
                          container
                          spacing={2}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Grid item xs={4} md={2}>
                            <Typography variant="h6">Total:</Typography>
                          </Grid>
                          <Grid item xs={8} md={3}>
                            <Typography variant="h6" align="right">
                              {formData.totalAmount.toFixed(2)} TND
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Form actions */}
              <Grid item xs={12}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
                >
                  <Button variant="outlined" onClick={() => navigate(-1)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : id
                      ? "Update Quote"
                      : "Create Quote"}
                  </Button>
                </Box>

                {errors.form && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {errors.form}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </form>
        )}
      </Box>
    </Container>
  );
};

export default QuoteForm;
