import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  createQuote,
  updateQuote,
  fetchQuoteById,
  clearCurrentQuote,
  convertToInvoice,
  generatePDF,
} from "../../../../../redux/slices/quotesSlice";
import { fetchClients } from "../../../../../redux/slices/clientsSlice";
import { fetchAllProjects } from "../../../../../redux/slices/ProjectSlice";
import {
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
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Divider,
  CircularProgress,
  Box,
  Card,
  CardHeader,
  CardContent,
} from "@mui/material";
import {
  Save as SaveIcon,
  Receipt as ReceiptIcon,
  GetApp as GetAppIcon,
  Close as CloseIcon,
  Send as SendIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

// Create styled components with the new color scheme
const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#ff919d",
  color: "white",
  "&:hover": {
    backgroundColor: "#e57f8a",
  },
}));

const OutlinedStyledButton = styled(Button)(({ theme }) => ({
  color: "#ff919d",
  borderColor: "#ff919d",
  "&:hover": {
    borderColor: "#e57f8a",
  },
}));

// Custom styled TextField with blue text color
const StyledTextField = styled(TextField)({
  "& .MuiInputBase-input": {
    color: "#242d49", // Set text color to blue as requested
  },
  "& .MuiInputLabel-root": {
    color: "#242d49",
  },
  "& .MuiOutlinedInput-root": {
    "&.Mui-focused fieldset": {
      borderColor: "#ff919d",
    },
  },
});

// Custom styled Select with blue text color
const StyledSelect = styled(Select)({
  "& .MuiSelect-select": {
    color: "#242d49", // Set text color to blue
  },
});

const QuoteFormDialog = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentQuote, loading, error, success } = useSelector(
    (state) => state.quotes
  );
  const { clients } = useSelector((state) => state.clients);
  const { projects } = useSelector((state) => state.projects);

  const [open, setOpen] = useState(true);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [formData, setFormData] = useState({
    client: "",
    clientName: "",
    clientAddress: {
      street: "",
      city: "",
      zipCode: "",
    },
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
    taxRate: 0,
    discount: 0,
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: "draft",
    termsConditions: "",
    notes: "",
  });

  // Format currency utility function for Tunisian Dinar (DT)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-TN", {
      style: "currency",
      currency: "TND",
      currencyDisplay: "symbol",
    }).format(amount);
  };

  // Fetch necessary data
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchAllProjects());

    if (id) {
      dispatch(fetchQuoteById(id));
    }

    return () => {
      dispatch(clearCurrentQuote());
    };
  }, [dispatch, id]);

  // Populate form when editing
  useEffect(() => {
    if (currentQuote && id) {
      setFormData({
        ...currentQuote,
        client: currentQuote.client?._id || currentQuote.client,
        project: currentQuote.project?._id || currentQuote.project,
      });
    }
  }, [currentQuote, id]);

  // Handle client selection
  useEffect(() => {
    if (formData.client && clients.length > 0) {
      const selectedClient = clients.find(
        (client) => client._id === formData.client
      );
      if (selectedClient) {
        setFormData((prevData) => ({
          ...prevData,
          clientName: selectedClient.name,
          clientAddress: {
            street: selectedClient.address?.street || "",
            city: selectedClient.address?.city || "",
            zipCode: selectedClient.address?.zipCode || "",
          },
        }));
      }
    }
  }, [formData.client, clients]);

  // Handle project selection
  useEffect(() => {
    if (formData.project && projects.length > 0) {
      const selectedProject = projects.find(
        (project) => project._id === formData.project
      );
      if (selectedProject) {
        setFormData((prevData) => ({
          ...prevData,
          projectTitle: selectedProject.title,
          projectDescription: selectedProject.description || "",
        }));
      }
    }
  }, [formData.project, projects]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle quote items changes
  const handleItemsChange = (updatedItems) => {
    // Calculate financial values
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    const discount = parseFloat(formData.discount) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;
    const taxAmount = ((subtotal - discount) * (taxRate / 100)).toFixed(2);
    const totalAmount = (subtotal - discount + parseFloat(taxAmount)).toFixed(
      2
    );

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount: parseFloat(taxAmount),
      totalAmount: parseFloat(totalAmount),
    });
  };

  // Handle financial values changes
  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    let updatedFormData = { ...formData, [name]: numValue };

    const subtotal = formData.subtotal;
    const discount = name === "discount" ? numValue : formData.discount;
    const taxRate = name === "taxRate" ? numValue : formData.taxRate;

    const taxAmount = ((subtotal - discount) * (taxRate / 100)).toFixed(2);
    const totalAmount = (subtotal - discount + parseFloat(taxAmount)).toFixed(
      2
    );

    updatedFormData = {
      ...updatedFormData,
      taxAmount: parseFloat(taxAmount),
      totalAmount: parseFloat(totalAmount),
    };

    setFormData(updatedFormData);
  };

  // Submit form
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (id) {
      dispatch(updateQuote({ id, quoteData: formData })).then((result) => {
        if (!result.error) {
          setSnackbar({
            open: true,
            message: "Quote updated successfully",
            severity: "success",
          });
          // No redirection after update
        } else {
          setSnackbar({
            open: true,
            message: "Failed to update quote",
            severity: "error",
          });
        }
      });
    } else {
      dispatch(createQuote(formData)).then((result) => {
        if (!result.error) {
          setSnackbar({
            open: true,
            message: "Quote created successfully",
            severity: "success",
          });
          // No redirection after creation
        } else {
          setSnackbar({
            open: true,
            message: "Failed to create quote",
            severity: "error",
          });
        }
      });
    }
  };

  // Handle quote status change
  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    if (newStatus === "sent") {
      setShowSendModal(true);
    } else {
      updateStatus(newStatus);
    }
  };

  // Update status after confirmation
  const updateStatus = (newStatus) => {
    setFormData({ ...formData, status: newStatus });
    if (id) {
      dispatch(
        updateQuote({
          id,
          quoteData: { status: newStatus },
        })
      ).then(() => {
        setSnackbar({
          open: true,
          message: `Status updated to ${newStatus}`,
          severity: "success",
        });
      });
    }
    setShowSendModal(false);
  };

  // Handle convert to invoice
  const handleConvertToInvoice = () => {
    setShowConvertModal(true);
  };

  // Confirm conversion to invoice
  const confirmConversion = () => {
    dispatch(convertToInvoice(id)).then((result) => {
      if (!result.error) {
        setSnackbar({
          open: true,
          message: "Successfully converted to invoice",
          severity: "success",
        });
        // No redirection after conversion
      } else {
        setSnackbar({
          open: true,
          message: "Failed to convert to invoice",
          severity: "error",
        });
      }
      setShowConvertModal(false);
    });
  };

  // Generate PDF for the quote
  const handleGeneratePDF = () => {
    if (id) {
      dispatch(generatePDF(id)).then(() => {
        setSnackbar({
          open: true,
          message: "PDF generated successfully",
          severity: "success",
        });
      });
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setOpen(false);
    // No redirect on close
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Quote Items Table component
  const QuoteItemsTable = () => {
    const handleAddItem = () => {
      const newItems = [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          category: "design",
        },
      ];
      handleItemsChange(newItems);
    };

    const handleRemoveItem = (index) => {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      handleItemsChange(newItems);
    };

    const handleItemChange = (index, field, value) => {
      const newItems = [...formData.items];
      newItems[index][field] = value;

      // Calculate item total
      if (field === "quantity" || field === "unitPrice") {
        const quantity =
          field === "quantity"
            ? parseFloat(value) || 0
            : parseFloat(newItems[index].quantity) || 0;
        const unitPrice =
          field === "unitPrice"
            ? parseFloat(value) || 0
            : parseFloat(newItems[index].unitPrice) || 0;
        newItems[index].total = Number((quantity * unitPrice).toFixed(2));
      }

      handleItemsChange(newItems);
    };

    return (
      <TableContainer component={Paper} elevation={0} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="40%">Description</TableCell>
              <TableCell width="15%">Category</TableCell>
              <TableCell width="10%" align="center">
                Quantity
              </TableCell>
              <TableCell width="15%" align="right">
                Unit Price
              </TableCell>
              <TableCell width="15%" align="right">
                Total
              </TableCell>
              <TableCell width="5%" align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <StyledTextField
                    fullWidth
                    size="small"
                    value={item.description || ""}
                    onChange={(e) =>
                      handleItemChange(index, "description", e.target.value)
                    }
                    placeholder="Item description"
                  />
                </TableCell>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <StyledSelect
                      value={item.category || "design"}
                      onChange={(e) =>
                        handleItemChange(index, "category", e.target.value)
                      }
                      sx={{ color: "#242d49" }}
                    >
                      <MenuItem value="design">Design</MenuItem>
                      <MenuItem value="materials">Materials</MenuItem>
                      <MenuItem value="labor">Labor</MenuItem>
                      <MenuItem value="furniture">Furniture</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </StyledSelect>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <StyledTextField
                    type="number"
                    size="small"
                    fullWidth
                    value={item.quantity || 0}
                    onChange={(e) =>
                      handleItemChange(index, "quantity", e.target.value)
                    }
                    inputProps={{ min: "0", step: "1" }}
                  />
                </TableCell>
                <TableCell>
                  <StyledTextField
                    type="number"
                    size="small"
                    fullWidth
                    value={item.unitPrice || 0}
                    onChange={(e) =>
                      handleItemChange(index, "unitPrice", e.target.value)
                    }
                    inputProps={{ min: "0", step: "0.01" }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">TND</InputAdornment>
                      ),
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  {formatCurrency(item.total || 0)}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(index)}
                    disabled={formData.items.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={6} align="left">
                <OutlinedStyledButton
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Item
                </OutlinedStyledButton>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Quote Summary component - Redesigned for better layout
  const QuoteSummary = () => {
    return (
      <Card variant="outlined">
        <CardHeader title="Quote Summary" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography fontWeight="bold" color="#242d49">
                Subtotal:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography align="right" color="#242d49">
                {formatCurrency(formData.subtotal)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography fontWeight="bold" color="#242d49">
                Discount:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <StyledTextField
                type="number"
                size="small"
                name="discount"
                value={formData.discount || 0}
                onChange={handleFinancialChange}
                inputProps={{ min: "0", step: "0.01" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">TND</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Typography fontWeight="bold" color="#242d49">
                Tax Rate:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <StyledTextField
                type="number"
                size="small"
                name="taxRate"
                value={formData.taxRate || 0}
                onChange={handleFinancialChange}
                inputProps={{ min: "0", max: "100", step: "0.1" }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={6}>
              <Typography fontWeight="bold" color="#242d49">
                Tax Amount:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography align="right" color="#242d49">
                {formatCurrency(formData.taxAmount)}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={6}>
              <Typography fontWeight="bold" variant="h6" color="#242d49">
                TOTAL:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                fontWeight="bold"
                variant="h6"
                align="right"
                color="#242d49"
              >
                {formatCurrency(formData.totalAmount)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Check if status is "sent" or above to enable convert button
  const canConvert =
    currentQuote && ["sent", "accepted"].includes(currentQuote.status);

  // Check if already converted
  const isConverted = currentQuote && currentQuote.convertedToInvoice;

  // Confirm Dialog component
  const ConfirmDialog = ({ open, title, message, onClose, onConfirm }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <StyledButton onClick={onConfirm} autoFocus>
          Confirm
        </StyledButton>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" color="#242d49">
              {id ? "Edit Quote" : "Create New Quote"}
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {loading && !formData.client ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress style={{ color: "#ff919d" }} />
            </Box>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader title="Client & Project Information" />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel
                              id="client-label"
                              sx={{ color: "#242d49" }}
                            >
                              Client
                            </InputLabel>
                            <StyledSelect
                              labelId="client-label"
                              id="client"
                              name="client"
                              value={formData.client}
                              onChange={handleInputChange}
                              label="Client"
                              required
                            >
                              <MenuItem value="">Select Client</MenuItem>
                              {clients.map((client) => (
                                <MenuItem key={client._id} value={client._id}>
                                  {client.name}
                                </MenuItem>
                              ))}
                            </StyledSelect>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel
                              id="project-label"
                              sx={{ color: "#242d49" }}
                            >
                              Project
                            </InputLabel>
                            <StyledSelect
                              labelId="project-label"
                              id="project"
                              name="project"
                              value={formData.project}
                              onChange={handleInputChange}
                              label="Project"
                              required
                            >
                              <MenuItem value="">Select Project</MenuItem>
                              {projects.map((project) => (
                                <MenuItem key={project._id} value={project._id}>
                                  {project.title}
                                </MenuItem>
                              ))}
                            </StyledSelect>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Client Name"
                            name="clientName"
                            value={formData.clientName}
                            InputProps={{
                              readOnly: true,
                            }}
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Street"
                            name="clientAddress.street"
                            value={formData.clientAddress.street}
                            InputProps={{
                              readOnly: true,
                            }}
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <StyledTextField
                            fullWidth
                            label="City"
                            name="clientAddress.city"
                            value={formData.clientAddress.city}
                            InputProps={{
                              readOnly: true,
                            }}
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={6}>
                          <StyledTextField
                            fullWidth
                            label="Zip Code"
                            name="clientAddress.zipCode"
                            value={formData.clientAddress.zipCode}
                            InputProps={{
                              readOnly: true,
                            }}
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Project Title"
                            name="projectTitle"
                            value={formData.projectTitle}
                            InputProps={{
                              readOnly: true,
                            }}
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Project Description"
                            name="projectDescription"
                            value={formData.projectDescription}
                            multiline
                            rows={3}
                            InputProps={{
                              readOnly: true,
                            }}
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader title="Quote Information" />
                    <CardContent>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth margin="normal">
                            <InputLabel
                              id="status-label"
                              sx={{ color: "#242d49" }}
                            >
                              Status
                            </InputLabel>
                            <StyledSelect
                              labelId="status-label"
                              id="status"
                              name="status"
                              value={formData.status}
                              onChange={handleStatusChange}
                              label="Status"
                              disabled={isConverted}
                              endAdornment={
                                isConverted && (
                                  <InputAdornment position="end">
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        bgcolor: "success.main",
                                        color: "white",
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                      }}
                                    >
                                      Converted to Invoice
                                    </Typography>
                                  </InputAdornment>
                                )
                              }
                            >
                              <MenuItem value="draft">Draft</MenuItem>
                              <MenuItem value="sent">Sent</MenuItem>
                              <MenuItem value="viewed">Viewed</MenuItem>
                              <MenuItem value="accepted">Accepted</MenuItem>
                              <MenuItem value="rejected">Rejected</MenuItem>
                            </StyledSelect>
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Terms & Conditions"
                            name="termsConditions"
                            value={formData.termsConditions || ""}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            placeholder="Terms and conditions for this quote"
                            margin="normal"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <StyledTextField
                            fullWidth
                            label="Notes"
                            name="notes"
                            value={formData.notes || ""}
                            onChange={handleInputChange}
                            multiline
                            rows={2}
                            placeholder="Additional notes or comments"
                            margin="normal"
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>

                  <QuoteSummary />
                </Grid>

                <Grid item xs={12}>
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardHeader title="Quote Items" />
                    <CardContent>
                      <QuoteItemsTable />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
          <Box>
            {id && (
              <>
                <OutlinedStyledButton
                  startIcon={<GetAppIcon />}
                  onClick={handleGeneratePDF}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  Download PDF
                </OutlinedStyledButton>
                {!isConverted && (
                  <OutlinedStyledButton
                    startIcon={<ReceiptIcon />}
                    onClick={handleConvertToInvoice}
                    disabled={!canConvert || loading}
                    sx={{ mr: 1 }}
                  >
                    Convert to Invoice
                  </OutlinedStyledButton>
                )}
                {formData.status === "draft" && (
                  <OutlinedStyledButton
                    startIcon={<SendIcon />}
                    onClick={() => setShowSendModal(true)}
                    disabled={loading}
                    sx={{ mr: 1 }}
                  >
                    Send Quote
                  </OutlinedStyledButton>
                )}
              </>
            )}
          </Box>
          <Box>
            <Button onClick={handleClose} color="inherit" sx={{ mr: 1 }}>
              Cancel
            </Button>
            <StyledButton
              onClick={handleSubmit}
              disabled={loading}
              startIcon={<SaveIcon />}
            >
              {id ? "Update" : "Create"} Quote
            </StyledButton>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Convert to Invoice Confirmation Dialog */}
      <ConfirmDialog
        open={showConvertModal}
        title="Convert to Invoice"
        message="Are you sure you want to convert this quote to an invoice? This action cannot be undone."
        onClose={() => setShowConvertModal(false)}
        onConfirm={confirmConversion}
      />

      {/* Send Quote Confirmation Dialog */}
      <ConfirmDialog
        open={showSendModal}
        title="Send Quote"
        message="Are you sure you want to mark this quote as sent? This will update the status and can trigger email notifications if enabled."
        onClose={() => setShowSendModal(false)}
        onConfirm={() => updateStatus("sent")}
      />
    </>
  );
};

export default QuoteFormDialog;
