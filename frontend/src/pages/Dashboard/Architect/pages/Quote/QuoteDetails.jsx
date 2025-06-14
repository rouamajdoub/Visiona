import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Fab,
} from "@mui/material";
import {
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import {
  sendQuoteEmail,
  clearEmailError,
  clearEmailSuccess,
} from "../../../../../redux/slices/quotesSlice";
import axios from "axios";
import FileDownload from "js-file-download";

const QuoteDetails = ({ quote, onClose, isDialog = false }) => {
  const dispatch = useDispatch();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Status badge component
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
        label={status?.charAt(0).toUpperCase() + status?.slice(1)}
        color={getStatusColor()}
        size="medium"
      />
    );
  };

  // Handle email sending
  const handleSendEmail = async () => {
    try {
      setEmailLoading(true);
      setEmailError(null);

      await dispatch(
        sendQuoteEmail({
          id: quote._id,
          message: emailMessage,
        })
      ).unwrap();

      setEmailSuccess(true);
      setEmailDialogOpen(false);
      setEmailMessage("");
    } catch (error) {
      setEmailError(error.message || "Failed to send email");
    } finally {
      setEmailLoading(false);
    }
  };

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    try {
      setPdfLoading(true);
      const response = await axios.get(`/api/quotes/${quote._id}/pdf`, {
        responseType: "blob",
      });

      const filename = `quote-${quote._id.substring(quote._id.length - 8)}.pdf`;
      FileDownload(response.data, filename);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setEmailSuccess(false);
    setEmailError(null);
  };

  if (!quote) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const actionButtons = (
    <Box display="flex" gap={2} mb={3}>
      <Button
        variant="contained"
        startIcon={<EmailIcon />}
        onClick={() => setEmailDialogOpen(true)}
        disabled={!quote.clientEmail}
      >
        Send Email
      </Button>
      <Button
        variant="outlined"
        startIcon={pdfLoading ? <CircularProgress size={20} /> : <PdfIcon />}
        onClick={handleGeneratePDF}
        disabled={pdfLoading}
      >
        Download PDF
      </Button>
    </Box>
  );

  const content = (
    <Box p={isDialog ? 3 : 0}>
      {!isDialog && actionButtons}

      {/* Quote Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Quote #{quote._id?.substring(quote._id.length - 8)}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Typography variant="h6">Status:</Typography>
              <QuoteStatusBadge status={quote.status} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box textAlign={{ xs: "left", md: "right" }}>
              <Typography variant="h5" color="primary" gutterBottom>
                {formatCurrency(quote.totalAmount)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Issue Date: {formatDate(quote.issueDate)}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Valid Until: {formatDate(quote.validUntil)}
              </Typography>
              {quote.sentDate && (
                <Typography variant="body1" color="text.secondary">
                  Sent: {formatDate(quote.sentDate)}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Client Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Client Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Client Name
            </Typography>
            <Typography variant="body1" gutterBottom>
              {quote.clientName || "Not specified"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" gutterBottom>
              {quote.clientEmail || "Not specified"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1" gutterBottom>
              {quote.clientPhone || "Not specified"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Company
            </Typography>
            <Typography variant="body1" gutterBottom>
              {quote.clientCompany || "Not specified"}
            </Typography>
          </Grid>
          {quote.clientAddress && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1" gutterBottom>
                {quote.clientAddress}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Project Information */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Project Information
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Project Title
            </Typography>
            <Typography variant="body1" gutterBottom>
              {quote.projectTitle || "Not specified"}
            </Typography>
          </Grid>
          {quote.projectDescription && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" gutterBottom>
                {quote.projectDescription}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Line Items */}
      {quote.lineItems && quote.lineItems.length > 0 && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Line Items
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Rate</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quote.lineItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.description}
                      </Typography>
                      {item.details && (
                        <Typography variant="caption" color="text.secondary">
                          {item.details}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.rate)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(item.quantity * item.rate)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Totals */}
          <Box mt={2}>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={8} />
              <Grid item xs={12} md={4}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Subtotal:</Typography>
                  <Typography variant="body2">
                    {formatCurrency(quote.subtotal || 0)}
                  </Typography>
                </Box>
                {quote.taxRate > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">
                      Tax ({quote.taxRate}%):
                    </Typography>
                    <Typography variant="body2">
                      {formatCurrency(quote.taxAmount || 0)}
                    </Typography>
                  </Box>
                )}
                {quote.discount > 0 && (
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">Discount:</Typography>
                    <Typography variant="body2">
                      -{formatCurrency(quote.discount)}
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">Total:</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(quote.totalAmount)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Terms and Notes */}
      {(quote.terms || quote.notes) && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Terms & Notes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {quote.terms && (
            <Box mb={2}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Terms & Conditions
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {quote.terms}
              </Typography>
            </Box>
          )}
          {quote.notes && (
            <Box>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Notes
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {quote.notes}
              </Typography>
            </Box>
          )}
        </Paper>
      )}

      {/* Email Dialog */}
      <Dialog
        open={emailDialogOpen}
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Send Quote to {quote.clientName}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Email will be sent to: {quote.clientEmail}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Additional Message (Optional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={emailMessage}
            onChange={(e) => setEmailMessage(e.target.value)}
            placeholder="Add a personal message to include with the quote..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEmailDialogOpen(false)}
            disabled={emailLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendEmail}
            variant="contained"
            startIcon={
              emailLoading ? <CircularProgress size={20} /> : <SendIcon />
            }
            disabled={emailLoading || !quote.clientEmail}
          >
            {emailLoading ? "Sending..." : "Send Quote"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbars */}
      <Snackbar
        open={emailSuccess}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Quote sent successfully to {quote.clientEmail}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!emailError}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleSnackbarClose} severity="error">
          {emailError}
        </Alert>
      </Snackbar>

      {/* Floating Action Button for Dialog Mode */}
      {isDialog && (
        <Fab
          color="primary"
          sx={{ position: "fixed", bottom: 16, right: 16 }}
          onClick={() => setEmailDialogOpen(true)}
          disabled={!quote.clientEmail}
        >
          <EmailIcon />
        </Fab>
      )}
    </Box>
  );

  return isDialog ? (
    content
  ) : (
    <Card>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default QuoteDetails;
