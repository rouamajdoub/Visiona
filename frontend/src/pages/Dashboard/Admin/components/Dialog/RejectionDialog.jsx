import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Box,
  Typography,
} from "@mui/material";

const rejectionReasons = [
  "Incomplete Documentation",
  "Invalid Professional Credentials",
  "Insufficient Portfolio Quality",
  "Duplicate Account",
  "Inappropriate Content",
  "Terms Violation",
  "Other",
];

const RejectionDialog = ({ open, onClose, onSubmit, architectName }) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!rejectionReason) {
      setError("Please select a rejection reason");
      return;
    }

    if (rejectionReason === "Other" && !customReason.trim()) {
      setError("Please provide details for 'Other' reason");
      return;
    }

    onSubmit({ rejectionReason, customReason });
    handleReset();
  };

  const handleReset = () => {
    setRejectionReason("");
    setCustomReason("");
    setError("");
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "#f5f5f5", color: "#333" }}>
        Reject Architect Application
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box mb={2}>
          <Typography variant="body1">
            Please specify a reason for rejecting{" "}
            {architectName || "this architect"}'s application. This information
            will be sent to the architect via email.
          </Typography>
        </Box>

        <FormControl fullWidth required error={!!error} sx={{ mb: 3 }}>
          <InputLabel id="rejection-reason-label">Rejection Reason</InputLabel>
          <Select
            labelId="rejection-reason-label"
            id="rejection-reason"
            value={rejectionReason}
            label="Rejection Reason"
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setError("");
            }}
          >
            {rejectionReasons.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText>{error}</FormHelperText>}
        </FormControl>

        {rejectionReason === "Other" && (
          <TextField
            fullWidth
            label="Please specify details"
            multiline
            rows={4}
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            error={rejectionReason === "Other" && error && !customReason}
            helperText={
              rejectionReason === "Other" && error && !customReason
                ? "Additional details are required"
                : ""
            }
            sx={{ mb: 2 }}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, bgcolor: "#f5f5f5" }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="error">
          Reject Application
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionDialog;
