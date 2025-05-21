import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Delete, Add } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import {
  fetchClients,
  createClient,
  deleteClient,
  clearClientState,
} from "../../../../../redux/slices/clientsSlice";

const ClientManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { clients, loading, error, success, message } = useSelector(
    (state) => state.clients
  );

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      region: "",
      country: "",
      postalCode: "",
    },
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (user?.role === "architect") {
      dispatch(fetchClients());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (success) {
      dispatch(fetchClients());
      dispatch(clearClientState());
      setOpenAddDialog(false);
    }
  }, [success, dispatch]);

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
    setNewClient({
      name: "",
      email: "",
      phone: "",
      address: {
        street: "",
        city: "",
        region: "",
        country: "",
        postalCode: "",
      },
      notes: "",
    });
    setFormErrors({});
  };

  const handleCloseAddDialog = () => setOpenAddDialog(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setNewClient((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setNewClient((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newClient.name.trim()) errors.name = "Name is required";
    if (!newClient.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(newClient.email)) {
      errors.email = "Invalid email format";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClient = () => {
    if (validateForm()) {
      dispatch(createClient(newClient));
    }
  };

  const handleRemoveClient = (clientId) => {
    if (window.confirm("Are you sure you want to remove this client?")) {
      dispatch(deleteClient(clientId));
    }
  };

  const formatAddress = (address) => {
    if (!address) return "N/A";
    return [
      address.street,
      address.city,
      address.region,
      address.country,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 220 },
    { field: "name", headerName: "Client Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "phone",
      headerName: "Phone",
      flex: 1,
      valueGetter: (params) =>
        params.row && params.row.phone ? params.row.phone : "N/A",
    },
    {
      field: "address",
      headerName: "Address",
      flex: 1.5,
      valueGetter: (params) =>
        params.row ? formatAddress(params.row.address) : "N/A",
    },
    {
      field: "notes",
      headerName: "Notes",
      flex: 1,
      valueGetter: (params) =>
        params.row && params.row.notes ? params.row.notes : "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.7,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => params.row && handleRemoveClient(params.row._id)}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" component="h2">
          Client Management
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenAddDialog}
          sx={{ ml: 2 }}
        >
          Add New Client
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#ffebee" }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {message && !error && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: "#e8f5e9" }}>
          <Typography color="success.main">{message}</Typography>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          height="75vh"
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .MuiDataGrid-columnHeaders": {
              borderBottom: "none",
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
            },
          }}
        >
          {clients?.length > 0 ? (
            <DataGrid
              rows={clients || []}
              columns={columns}
              getRowId={(row) =>
                row && row._id ? row._id : Math.random().toString()
              }
              components={{ Toolbar: GridToolbar }}
              componentsProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 500 },
                },
              }}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
            />
          ) : (
            <Paper sx={{ p: 4, textAlign: "center", height: "100%" }}>
              <Typography color="text.secondary">
                No clients found. Start by adding your first client.
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {/* Add Client Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={newClient.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={newClient.email}
                onChange={handleInputChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={newClient.phone}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1">Address</Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street"
                name="address.street"
                value={newClient.address.street}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="City"
                name="address.city"
                value={newClient.address.city}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Region"
                name="address.region"
                value={newClient.address.region}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Country"
                name="address.country"
                value={newClient.address.country}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Postal Code"
                name="address.postalCode"
                value={newClient.address.postalCode}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                name="notes"
                value={newClient.notes}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button onClick={handleAddClient} variant="contained">
            Add Client
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClientManagement;
