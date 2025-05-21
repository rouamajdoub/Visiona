import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProjectReviews,
  getProductReviews,
  getAppReviews,
  getSuspiciousReviews,
  updateReviewStatus,
  deleteReview,
  selectProjectReviews,
  selectProductReviews,
  selectAppReviews,
  selectSuspiciousReviews,
  selectReviewsLoading,
  selectReviewsError,
  selectReviewsSuccess,
  selectReviewsMessage,
} from "../../../../redux/slices/reviewsSlice";
import {
  Box,
  Typography,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  IconButton,
  Stack,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const ReviewManagement = () => {
  const dispatch = useDispatch();

  // Select data from the new reviews slice
  const projectReviews = useSelector(selectProjectReviews);
  const productReviews = useSelector(selectProductReviews);
  const appReviews = useSelector(selectAppReviews);
  const suspiciousReviews = useSelector(selectSuspiciousReviews);
  const loading = useSelector(selectReviewsLoading);
  const error = useSelector(selectReviewsError);
  const success = useSelector(selectReviewsSuccess);
  const message = useSelector(selectReviewsMessage);

  // Component state
  const [reviewType, setReviewType] = useState("all");
  const [aiFilter, setAiFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Prepare and merge reviews from different sources
  const prepareReviews = () => {
    const projectReviewsWithType = (projectReviews || []).map((r) => ({
      ...r,
      type: "Project",
    }));

    const productReviewsWithType = (productReviews || []).map((r) => ({
      ...r,
      type: "Product",
    }));

    const appReviewsWithType = (appReviews || []).map((r) => ({
      ...r,
      type: "App",
    }));

    return [
      ...projectReviewsWithType,
      ...productReviewsWithType,
      ...appReviewsWithType,
    ];
  };

  const mergedReviews = prepareReviews();

  // Filter reviews based on selected filters
  const getFilteredReviews = () => {
    let filtered = mergedReviews;

    // Filter by review type
    if (reviewType !== "all") {
      filtered = filtered.filter((r) => r.type === reviewType);
    }

    // Filter by AI feedback
    if (aiFilter === "suspicious") {
      filtered = suspiciousReviews || [];
    } else if (aiFilter === "clean") {
      filtered = filtered.filter(
        (r) => r.aiFeedback && !r.aiFeedback.startsWith("suspicious:")
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    return filtered;
  };

  const filteredReviews = getFilteredReviews();

  // Fetch all reviews on component mount
  useEffect(() => {
    dispatch(getProjectReviews());
    dispatch(getProductReviews());
    dispatch(getAppReviews());
    dispatch(getSuspiciousReviews());
  }, [dispatch]);

  // Show success message when an action completes
  useEffect(() => {
    if (success && message) {
      setSnackbarOpen(true);
    }
  }, [success, message]);

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleViewReview = (review) => {
    setCurrentReview(review);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      dispatch(deleteReview(id));
    }
  };

  const handlePublishReview = (reviewId) => {
    dispatch(
      updateReviewStatus({
        reviewId,
        statusData: { status: "published" },
      })
    );
  };

  const handleOpenRejectDialog = (review) => {
    setCurrentReview(review);
    setOpenRejectDialog(true);
  };

  const handleCloseRejectDialog = () => {
    setOpenRejectDialog(false);
    setRejectionReason("");
  };

  const handleRejectReview = () => {
    if (currentReview && rejectionReason.trim()) {
      dispatch(
        updateReviewStatus({
          reviewId: currentReview._id,
          statusData: {
            status: "rejected",
            rejectionReason,
          },
        })
      );
      handleCloseRejectDialog();
    }
  };

  // Format AI feedback for display
  const getFormattedAIFeedback = (feedback) => {
    if (!feedback) return "No AI analysis";

    if (feedback.startsWith("suspicious:")) {
      return feedback.replace("suspicious:", "⚠️ Suspicious: ");
    }

    return feedback;
  };

  // Get appropriate color for status chip
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "published":
        return "success";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  // DataGrid columns configuration
  const columns = [
    { field: "_id", headerName: "ID", flex: 0.7, minWidth: 200 },
    {
      field: "reviewer",
      headerName: "Author",
      flex: 0.8,
      renderCell: ({ row }) => (
        <Typography>{row.reviewer?.pseudo || "Unknown"}</Typography>
      ),
    },
    { field: "type", headerName: "Type", flex: 0.5, minWidth: 100 },
    {
      field: "rating",
      headerName: "Rating",
      flex: 0.3,
      minWidth: 80,
      renderCell: ({ row }) => <Typography>{row.rating}/5</Typography>,
    },
    {
      field: "comment",
      headerName: "Comment",
      flex: 1.5,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Tooltip title={row.comment} arrow placement="top-start">
          <Typography
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.comment.length > 50
              ? `${row.comment.substring(0, 50)}...`
              : row.comment}
          </Typography>
        </Tooltip>
      ),
    },
    {
      field: "aiFeedback",
      headerName: "AI Analysis",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => {
        const isSuspicious = row.aiFeedback?.startsWith("suspicious:");
        return (
          <Tooltip title={row.aiFeedback || "No AI analysis"} arrow>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {isSuspicious && (
                <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
              )}
              <Typography
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.aiFeedback
                  ? row.aiFeedback.length > 20
                    ? `${row.aiFeedback
                        .replace("suspicious:", "")
                        .substring(0, 20)}...`
                    : row.aiFeedback.replace("suspicious:", "")
                  : "No AI analysis"}
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      flex: 0.6,
      minWidth: 120,
      renderCell: ({ row }) => (
        <Chip
          label={row.status || "pending"}
          color={getStatusColor(row.status || "pending")}
          size="small"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Date",
      flex: 0.7,
      minWidth: 120,
      renderCell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 200,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View details">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewReview(row)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>

          {row.status !== "published" && (
            <Tooltip title="Publish review">
              <IconButton
                size="small"
                color="success"
                onClick={() => handlePublishReview(row._id)}
              >
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
          )}

          {row.status !== "rejected" && (
            <Tooltip title="Reject review">
              <IconButton
                size="small"
                color="warning"
                onClick={() => handleOpenRejectDialog(row)}
              >
                <CancelIcon />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Delete review">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(row._id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" mb={3}>
        Review Management
      </Typography>

      {/* Filter controls */}
      <Box
        mb={4}
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Review Type</InputLabel>
          <Select
            value={reviewType}
            onChange={(e) => setReviewType(e.target.value)}
            label="Review Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="Product">Product Reviews</MenuItem>
            <MenuItem value="Project">Project Reviews</MenuItem>
            <MenuItem value="App">App Reviews</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>AI Analysis</InputLabel>
          <Select
            value={aiFilter}
            onChange={(e) => setAiFilter(e.target.value)}
            label="AI Analysis"
          >
            <MenuItem value="all">All Reviews</MenuItem>
            <MenuItem value="suspicious">Suspicious Only</MenuItem>
            <MenuItem value="clean">Clean Only</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Stats */}
      <Box mb={3} sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Chip
          icon={<WarningAmberIcon />}
          label={`${suspiciousReviews?.length || 0} Suspicious Reviews`}
          color="warning"
          variant="outlined"
        />
        <Chip
          label={`${
            mergedReviews.filter((r) => r.status === "pending").length
          } Pending Reviews`}
          color="warning"
          variant="outlined"
        />
        <Chip
          label={`${
            mergedReviews.filter((r) => r.status === "published").length
          } Published Reviews`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${
            mergedReviews.filter((r) => r.status === "rejected").length
          } Rejected Reviews`}
          color="error"
          variant="outlined"
        />
      </Box>

      {/* Data Grid */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "background.alt",
              borderBottom: "none",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: "background.alt",
            },
          }}
        >
          <DataGrid
            rows={filteredReviews}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
          />
        </Box>
      )}

      {/* View Review Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Review Details</DialogTitle>
        <DialogContent dividers>
          {currentReview && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {currentReview.type} Review by{" "}
                {currentReview.reviewer?.pseudo || "Unknown"}
              </Typography>

              <Box
                mb={2}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Typography variant="subtitle1">Status:</Typography>
                <Chip
                  label={currentReview.status || "pending"}
                  color={getStatusColor(currentReview.status || "pending")}
                />
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Rating: {currentReview.rating}/5
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Date: {new Date(currentReview.createdAt).toLocaleString()}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                Comment:
              </Typography>
              <Typography
                paragraph
                sx={{
                  backgroundColor: "background.alt",
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {currentReview.comment}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                AI Analysis:
              </Typography>
              <Alert
                severity={
                  currentReview.aiFeedback?.startsWith("suspicious:")
                    ? "warning"
                    : "info"
                }
                sx={{ mb: 2 }}
              >
                {getFormattedAIFeedback(currentReview.aiFeedback)}
              </Alert>

              {currentReview.status === "rejected" &&
                currentReview.rejectionReason && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Rejection Reason:
                    </Typography>
                    <Alert severity="error">
                      {currentReview.rejectionReason}
                    </Alert>
                  </>
                )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
          {currentReview && currentReview.status !== "published" && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                handlePublishReview(currentReview._id);
                handleCloseViewDialog();
              }}
            >
              Publish
            </Button>
          )}
          {currentReview && currentReview.status !== "rejected" && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => {
                handleCloseViewDialog();
                handleOpenRejectDialog(currentReview);
              }}
            >
              Reject
            </Button>
          )}
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              const id = currentReview._id;
              handleCloseViewDialog();
              handleDelete(id);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Review Dialog */}
      <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog}>
        <DialogTitle>Reject Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for rejecting this review:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rejectionReason"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectDialog}>Cancel</Button>
          <Button
            onClick={handleRejectReview}
            variant="contained"
            color="warning"
            disabled={!rejectionReason.trim()}
          >
            Reject Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={success ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReviewManagement;
