import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGlobalOptions,
  createGlobalOption,
  updateGlobalOption,
  deleteGlobalOption,
  resetFormStatus,
} from "../../../../redux/slices/globalOptionsSlice";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Alert,
  Snackbar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const CertificationManagement = () => {
  const dispatch = useDispatch();
  const { options, loading, error, formLoading, formError, formSuccess } =
    useSelector((state) => state.globalOptions);

  // Filter only certification type options
  const certifications = options.filter(
    (option) => option.type === "certification"
  );

  // Local state for form handling
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOption, setCurrentOption] = useState({ name: "", id: null });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    dispatch(fetchGlobalOptions());
  }, [dispatch]);

  useEffect(() => {
    if (formSuccess) {
      setOpenDialog(false);
      setSnackbarMessage(
        isEditing
          ? "Certification updated successfully"
          : "Certification added successfully"
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      dispatch(resetFormStatus());
    }

    if (formError) {
      setSnackbarMessage(formError);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      dispatch(resetFormStatus());
    }
  }, [formSuccess, formError, isEditing, dispatch]);

  const handleOpenDialog = (option = null) => {
    if (option) {
      setIsEditing(true);
      setCurrentOption({ name: option.name, id: option._id });
    } else {
      setIsEditing(false);
      setCurrentOption({ name: "", id: null });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentOption({ name: "", id: null });
  };

  const handleSubmit = () => {
    if (!currentOption.name.trim()) {
      setSnackbarMessage("Certification name cannot be empty");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (isEditing) {
      dispatch(
        updateGlobalOption({
          id: currentOption.id,
          optionData: { name: currentOption.name, type: "certification" },
        })
      );
    } else {
      dispatch(
        createGlobalOption({ name: currentOption.name, type: "certification" })
      );
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this certification?")) {
      dispatch(deleteGlobalOption(id))
        .unwrap()
        .then(() => {
          setSnackbarMessage("Certification deleted successfully");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        })
        .catch((err) => {
          setSnackbarMessage(err || "Failed to delete certification");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Certification Name", flex: 2 },
    {
      field: "createdAt",
      headerName: "Created At",
      flex: 1,
      renderCell: ({ row }) => new Date(row.createdAt).toLocaleDateString(),
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: ({ row }) => (
        <Box>
          <IconButton color="primary" onClick={() => handleOpenDialog(row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row.id)}>
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  const rows = certifications.map((cert) => ({
    id: cert._id,
    name: cert.name,
    createdAt: cert.createdAt,
    updatedAt: cert.updatedAt,
  }));

  return (
    <Box m="20px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold">
          Certification Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Certification
        </Button>
      </Box>

      {/* Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Certification" : "Add New Certification"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Certification Name"
            type="text"
            fullWidth
            variant="outlined"
            value={currentOption.name}
            onChange={(e) =>
              setCurrentOption({ ...currentOption, name: e.target.value })
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Data Grid */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
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
            "& .MuiCheckbox-root": {},
          }}
        >
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            loading={loading}
            disableSelectionOnClick
          />
        </Box>
      )}
    </Box>
  );
};

export default CertificationManagement;
