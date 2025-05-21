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
  InputAdornment,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

const SoftwareSkillsManagement = () => {
  const dispatch = useDispatch();
  const { options, loading, error, formLoading, formError, formSuccess } =
    useSelector((state) => state.globalOptions);

  // Filter only software type options
  const softwareSkills = options.filter((option) => option.type === "software");

  // Local state for form handling
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentOption, setCurrentOption] = useState({ name: "", id: null });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchGlobalOptions());
  }, [dispatch]);

  useEffect(() => {
    if (formSuccess) {
      setOpenDialog(false);
      setSnackbarMessage(
        isEditing
          ? "Software skill updated successfully"
          : "Software skill added successfully"
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
      setSnackbarMessage("Software skill name cannot be empty");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (isEditing) {
      dispatch(
        updateGlobalOption({
          id: currentOption.id,
          optionData: { name: currentOption.name, type: "software" },
        })
      );
    } else {
      dispatch(
        createGlobalOption({ name: currentOption.name, type: "software" })
      );
    }
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this software skill?")
    ) {
      dispatch(deleteGlobalOption(id))
        .unwrap()
        .then(() => {
          setSnackbarMessage("Software skill deleted successfully");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        })
        .catch((err) => {
          setSnackbarMessage(err || "Failed to delete software skill");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        });
    }
  };

  // Filter software skills based on search term
  const filteredSkills = softwareSkills.filter((skill) =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Software Skill", flex: 2 },
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

  const rows = filteredSkills.map((skill) => ({
    id: skill._id,
    name: skill.name,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
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
          Software Skills Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Software Skill
        </Button>
      </Box>

      {/* Search field */}
      <Box mb={3}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search software skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Form Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Software Skill" : "Add New Software Skill"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Software Skill Name"
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

      {/* Summary Stats */}
      <Box mb={2}>
        <Typography variant="subtitle1">
          Total Software Skills: {filteredSkills.length}
        </Typography>
      </Box>

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

export default SoftwareSkillsManagement;
