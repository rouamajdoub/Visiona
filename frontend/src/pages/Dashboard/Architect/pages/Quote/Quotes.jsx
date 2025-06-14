import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuotes,
  deleteQuote,
  setFilters,
  resetFilters,
  fetchQuoteById,
  clearCurrentQuote,
  sendQuoteEmail,
  clearEmailError,
  clearEmailSuccess,
  convertToInvoice,
} from "../../../../../redux/slices/quotesSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Collapse,
  Tooltip,
  AppBar,
  Toolbar,
  Snackbar,
  TextareaAutosize,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  Email as EmailIcon,
  Receipt as InvoiceIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import FileDownload from "js-file-download";
import axios from "axios";
import QuoteForm from "./QuoteForm";
import QuoteDetails from "./QuoteDetails";
import "./Quotes.css";

const Quotes = () => {
  const dispatch = useDispatch();
  const {
    quotes,
    loading,
    error,
    filters,
    currentQuote,
    emailLoading,
    emailSuccess,
    emailError,
    emailMessage,
    success,
    message,
  } = useSelector((state) => state.quotes);

  const [showFilters, setShowFilters] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [convertLoading, setConvertLoading] = useState(false);

  // State for dialogs
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Email dialog state - renamed to avoid conflict
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [localEmailMessage, setLocalEmailMessage] = useState(""); // Renamed from emailMessage
  const [quoteToEmail, setQuoteToEmail] = useState(null);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    dispatch(fetchQuotes(filters));
  }, [dispatch, filters]);

  // Clear quote data when dialogs close
  useEffect(() => {
    if (!openDetailsDialog && !openFormDialog) {
      dispatch(clearCurrentQuote());
    }
  }, [openDetailsDialog, openFormDialog, dispatch]);

  // Handle email success/error feedback
  useEffect(() => {
    if (emailSuccess) {
      setSnackbarMessage(emailMessage || "Quote sent successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      dispatch(clearEmailSuccess());
      setOpenEmailDialog(false);
      setLocalEmailMessage(""); // Updated variable name
    }
  }, [emailSuccess, emailMessage, dispatch]);

  useEffect(() => {
    if (emailError) {
      setSnackbarMessage(emailError);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      dispatch(clearEmailError());
    }
  }, [emailError, dispatch]);

  // Handle general success messages
  useEffect(() => {
    if (success && message) {
      setSnackbarMessage(message);
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    }
  }, [success, message]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    dispatch(setFilters({ [name]: value }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(fetchQuotes(filters));
  };

  const handleDelete = (quote) => {
    setQuoteToDelete(quote);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(deleteQuote(quoteToDelete._id)).then(() => {
      setShowDeleteModal(false);
      setQuoteToDelete(null);
    });
  };

  // Email functionality
  const handleSendEmail = (quote) => {
    setQuoteToEmail(quote);
    setLocalEmailMessage(
      // Updated variable name
      `Hi ${quote.clientName},\n\nPlease find attached your quote for ${quote.projectTitle}.\n\nBest regards,\nYour Company`
    );
    setOpenEmailDialog(true);
  };

  const handleEmailSubmit = () => {
    if (quoteToEmail) {
      dispatch(
        sendQuoteEmail({
          id: quoteToEmail._id,
          message: localEmailMessage, // Updated variable name
        })
      );
    }
  };

  const handleCloseEmailDialog = () => {
    setOpenEmailDialog(false);
    setLocalEmailMessage(""); // Updated variable name
    setQuoteToEmail(null);
  };

  // Convert to invoice functionality
  const handleConvertToInvoice = async (quoteId) => {
    try {
      setConvertLoading(true);
      await dispatch(convertToInvoice(quoteId)).unwrap();
      setSnackbarMessage("Quote converted to invoice successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(error || "Failed to convert quote to invoice");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setConvertLoading(false);
    }
  };

  // Open new quote form dialog
  const handleNewQuote = () => {
    setSelectedQuoteId(null);
    setIsEditMode(false);
    setOpenFormDialog(true);
  };

  // Open edit quote form dialog
  const handleEditQuote = (id) => {
    setSelectedQuoteId(id);
    setIsEditMode(true);
    dispatch(fetchQuoteById(id)).then(() => {
      setOpenFormDialog(true);
    });
  };

  // Open quote details dialog
  const handleViewQuote = (id) => {
    setSelectedQuoteId(id);
    dispatch(fetchQuoteById(id)).then(() => {
      setOpenDetailsDialog(true);
    });
  };

  // Close form dialog
  const handleCloseFormDialog = () => {
    setOpenFormDialog(false);
    setTimeout(() => {
      dispatch(fetchQuotes(filters));
    }, 500);
  };

  // Close details dialog
  const handleCloseDetailsDialog = () => {
    setOpenDetailsDialog(false);
  };

  // Generate PDF for the quote
  const handleGeneratePDF = async (id) => {
    try {
      setPdfLoading(true);
      const response = await axios.get(`/api/quotes/${id}/pdf`, {
        responseType: "blob",
      });

      const filename = `quote-${id.substring(id.length - 8)}.pdf`;
      FileDownload(response.data, filename);
      setPdfLoading(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      setSnackbarMessage("Failed to download PDF");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      setPdfLoading(false);
    }
  };

  // Format currency utility function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date utility function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Quote status badge component
  const QuoteStatusBadge = ({ status }) => {
    const getStatusColor = () => {
      switch (status) {
        case "draft":
          return "default";
        case "sent":
          return "primary";
        case "accepted":
          return "success";
        case "rejected":
          return "error";
        case "revised":
          return "warning";
        case "archived":
          return "secondary";
        default:
          return "default";
      }
    };

    return (
      <Chip
        label={status.charAt(0).toUpperCase() + status.slice(1)}
        color={getStatusColor()}
        size="small"
      />
    );
  };

  // Enhanced Action Buttons Component
  const ActionButtons = ({ quote }) => {
    const canSendEmail = quote.status === "draft" || quote.status === "revised";
    const canConvertToInvoice =
      quote.status === "accepted" && !quote.convertedToInvoice;

    return (
      <Box display="flex" gap={0.5}>
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => handleViewQuote(quote._id)}
            className="quotes-action-btn"
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Edit Quote">
          <IconButton
            size="small"
            onClick={() => handleEditQuote(quote._id)}
            className="quotes-action-btn"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        {canSendEmail && (
          <Tooltip title="Send Email">
            <IconButton
              size="small"
              onClick={() => handleSendEmail(quote)}
              className="quotes-action-btn quotes-email-btn"
              disabled={emailLoading}
            >
              {emailLoading && quoteToEmail?._id === quote._id ? (
                <CircularProgress size={16} />
              ) : (
                <EmailIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}

        {canConvertToInvoice && (
          <Tooltip title="Convert to Invoice">
            <IconButton
              size="small"
              onClick={() => handleConvertToInvoice(quote._id)}
              className="quotes-action-btn quotes-convert-btn"
              disabled={convertLoading}
            >
              {convertLoading ? (
                <CircularProgress size={16} />
              ) : (
                <InvoiceIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Download PDF">
          <IconButton
            size="small"
            onClick={() => handleGeneratePDF(quote._id)}
            disabled={pdfLoading}
            className="quotes-action-btn"
          >
            {pdfLoading ? (
              <CircularProgress size={16} />
            ) : (
              <PdfIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Quote">
          <IconButton
            size="small"
            onClick={() => handleDelete(quote)}
            className="quotes-action-btn quotes-delete-btn"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  // Filter panel component
  const FilterPanel = () => (
    <Card variant="outlined" className="quotes-filter-panel">
      <CardContent>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl
                fullWidth
                size="small"
                className="quotes-filter-panel"
              >
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                  className="quote-form-field"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="revised">Revised</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                id="client"
                name="client"
                label="Client"
                value={filters.client}
                onChange={handleFilterChange}
                placeholder="Filter by client"
                className="quote-form-field"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                id="project"
                name="project"
                label="Project"
                value={filters.project}
                onChange={handleFilterChange}
                placeholder="Filter by project"
                className="quote-form-field"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                id="search"
                name="search"
                label="Search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search quotes"
                className="quote-form-field"
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ mr: 1 }}
                  className="quotes-filter-panel .MuiButton-outlined"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  className="quotes-filter-panel .MuiButton-contained"
                >
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );

  // Email Dialog Component
  const EmailDialog = () => (
    <Dialog
      open={openEmailDialog}
      onClose={handleCloseEmailDialog}
      maxWidth="md"
      fullWidth
      className="quotes-email-dialog"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <EmailIcon />
          Send Quote to {quoteToEmail?.clientName}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Quote: {quoteToEmail?.projectTitle} -{" "}
          {formatCurrency(quoteToEmail?.totalAmount)}
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="email-message"
          label="Email Message"
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          value={localEmailMessage} // Updated variable name
          onChange={(e) => setLocalEmailMessage(e.target.value)} // Updated variable name
          placeholder="Enter your message to the client..."
          className="quote-form-field"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCloseEmailDialog}
          className="quotes-email-dialog-cancel"
        >
          Cancel
        </Button>
        <Button
          onClick={handleEmailSubmit}
          variant="contained"
          startIcon={
            emailLoading ? <CircularProgress size={16} /> : <SendIcon />
          }
          disabled={emailLoading}
          className="quotes-email-dialog-send"
        >
          {emailLoading ? "Sending..." : "Send Email"}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Delete confirmation dialog
  const DeleteConfirmationDialog = () => (
    <Dialog
      open={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      className="quotes-delete-dialog"
    >
      <DialogTitle id="alert-dialog-title">Delete Quote</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete quote for {quoteToDelete?.clientName}?
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setShowDeleteModal(false)}
          className="delete-cancel-btn"
        >
          Cancel
        </Button>
        <Button
          onClick={confirmDelete}
          color="error"
          autoFocus
          className="delete-confirm-btn"
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Form Dialog
  const FormDialog = () => (
    <Dialog
      open={openFormDialog}
      onClose={handleCloseFormDialog}
      fullScreen
      aria-labelledby="form-dialog-title"
      className="quotes-form-dialog"
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleCloseFormDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {isEditMode ? "Edit Quote" : "Create New Quote"}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ padding: 0 }}>
        <QuoteForm
          id={selectedQuoteId}
          onClose={handleCloseFormDialog}
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );

  // Details Dialog
  const DetailsDialog = () => (
    <Dialog
      open={openDetailsDialog}
      onClose={handleCloseDetailsDialog}
      fullScreen
      aria-labelledby="details-dialog-title"
      className="quotes-details-dialog"
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleCloseDetailsDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Quote Details
          </Typography>
          {currentQuote && (
            <>
              <Button
                color="inherit"
                onClick={() => {
                  handleCloseDetailsDialog();
                  handleEditQuote(currentQuote._id);
                }}
                className="quote-details-edit-btn"
              >
                Edit
              </Button>
              <Button
                color="inherit"
                onClick={() => handleGeneratePDF(currentQuote._id)}
                className="quote-details-pdf-btn"
              >
                PDF
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ padding: 0 }}>
        <QuoteDetails
          quote={currentQuote}
          onClose={handleCloseDetailsDialog}
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error: {error}
      </Alert>
    );
  }

  return (
    <Box className="quotes-management-container">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" className="quotes-heading-text">
          Quotes
        </Typography>
        <Box className="quotes-header-button-group">
          <Button
            variant="outlined"
            startIcon={showFilters ? <CloseIcon /> : <FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
            className="quotes-filter-toggle-btn"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleNewQuote}
            className="quotes-new-quote-btn"
          >
            New Quote
          </Button>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <FilterPanel />
      </Collapse>

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          my={5}
          className="quotes-loading-container"
        >
          <CircularProgress className="quotes-loading-spinner" />
        </Box>
      ) : (
        <>
          {quotes.length === 0 ? (
            <Box className="quotes-empty-state">
              <Alert severity="info">
                No quotes found. Create your first quote!
              </Alert>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleNewQuote}
                className="quotes-empty-state-btn"
                sx={{ mt: 2 }}
              >
                Create Quote
              </Button>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              elevation={2}
              className="quotes-table-transparent"
            >
              <Table aria-label="quotes table">
                <TableHead>
                  <TableRow>
                    <TableCell>Quote #</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Project</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotes.map((quote, index) => (
                    <TableRow
                      key={quote._id}
                      hover
                      className="quotes-table-row-animated"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <TableCell>
                        <Button
                          onClick={() => handleViewQuote(quote._id)}
                          className="quote-id-button"
                        >
                          {quote._id.substring(quote._id.length - 8)}
                        </Button>
                      </TableCell>
                      <TableCell>{quote.clientName}</TableCell>
                      <TableCell>{quote.projectTitle}</TableCell>
                      <TableCell>{formatDate(quote.issueDate)}</TableCell>
                      <TableCell>{formatCurrency(quote.totalAmount)}</TableCell>
                      <TableCell>
                        <QuoteStatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell align="right">
                        <ActionButtons quote={quote} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      {/* Dialogs */}
      <DeleteConfirmationDialog />
      <FormDialog />
      <DetailsDialog />
      <EmailDialog />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Quotes;
