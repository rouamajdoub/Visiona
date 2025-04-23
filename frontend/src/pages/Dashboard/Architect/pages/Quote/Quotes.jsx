import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchQuotes,
  deleteQuote,
  setFilters,
  resetFilters,
  generatePDF,
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Add as AddIcon,
  FilterAlt as FilterIcon,
  Close as CloseIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import FileDownload from "js-file-download";
import axios from "axios";

const Quotes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { quotes, loading, error, filters } = useSelector(
    (state) => state.quotes
  );
  const [showFilters, setShowFilters] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchQuotes(filters));
  }, [dispatch, filters]);

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

  // Modify the PDF generation function to download the file instead of opening in a new tab
  const handleGeneratePDF = async (id) => {
    try {
      setPdfLoading(true);
      const response = await axios.get(`/api/quotes/${id}/pdf`, {
        responseType: "blob",
      });

      // Use the quote ID or better yet, get the actual filename from headers if available
      const filename = `quote-${id.substring(id.length - 8)}.pdf`;
      FileDownload(response.data, filename);
      setPdfLoading(false);
    } catch (error) {
      console.error("Error downloading PDF:", error);
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

  // Filter panel component
  const FilterPanel = () => (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <CardContent>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
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
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  sx={{ mr: 1 }}
                >
                  Reset
                </Button>
                <Button type="submit" variant="contained">
                  Apply Filters
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );

  // Delete confirmation dialog
  const DeleteConfirmationDialog = () => (
    <Dialog
      open={showDeleteModal}
      onClose={() => setShowDeleteModal(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Delete Quote</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete quote for {quoteToDelete?.clientName}?
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
        <Button onClick={confirmDelete} color="error" autoFocus>
          Delete
        </Button>
      </DialogActions>
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
    <Box sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Quotes
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={showFilters ? <CloseIcon /> : <FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 1 }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate("/quotes/new")}
          >
            New Quote
          </Button>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <FilterPanel />
      </Collapse>

      {loading ? (
        <Box display="flex" justifyContent="center" my={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {quotes.length === 0 ? (
            <Alert severity="info">
              No quotes found. Create your first quote!
            </Alert>
          ) : (
            <TableContainer component={Paper} elevation={2}>
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
                  {quotes.map((quote) => (
                    <TableRow key={quote._id} hover>
                      <TableCell>
                        <Link
                          to={`/quotes/${quote._id}`}
                          style={{
                            textDecoration: "none",
                            fontWeight: "bold",
                            color: "#1976d2",
                          }}
                        >
                          {quote._id.substring(quote._id.length - 8)}
                        </Link>
                      </TableCell>
                      <TableCell>{quote.clientName}</TableCell>
                      <TableCell>{quote.projectTitle}</TableCell>
                      <TableCell>{formatDate(quote.issueDate)}</TableCell>
                      <TableCell>{formatCurrency(quote.totalAmount)}</TableCell>
                      <TableCell>
                        <QuoteStatusBadge status={quote.status} />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/quotes/${quote._id}`)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Quote">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/quotes/${quote._id}/edit`)
                            }
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Quote">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(quote)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download PDF">
                          <IconButton
                            size="small"
                            onClick={() => handleGeneratePDF(quote._id)}
                            disabled={pdfLoading}
                          >
                            {pdfLoading ? (
                              <CircularProgress size={20} />
                            ) : (
                              <PdfIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}

      <DeleteConfirmationDialog />
    </Box>
  );
};

export default Quotes;
