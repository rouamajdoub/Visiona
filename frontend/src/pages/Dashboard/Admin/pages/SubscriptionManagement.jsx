import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSubscriptions,
  deleteSubscription,
} from "../../../../redux/slices/adminSlice";
import { Box, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const SubscriptionManagement = () => {
  const dispatch = useDispatch();
  const {
    subscriptions = [],
    loading,
    error,
  } = useSelector((state) => state.admin);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  useEffect(() => {
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  const handleEdit = (subscription) => {
    setSelectedSubscription(subscription);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this subscription?"
    );
    if (confirmDelete) {
      dispatch(deleteSubscription(id));
    }
  };

  const handleCloseModal = () => {
    setSelectedSubscription(null);
  };

  if (loading) return <p>Loading...</p>;
  if (error)
    return <p>Error: {error.message || "An unknown error occurred"}</p>;

  // Define columns for the DataGrid
  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "architect",
      headerName: "Architect",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>
          {row.architectId?.pseudo ||
            `${row.architectId?.nomDeFamille} ${row.architectId?.prenom}`}
        </Typography>
      ),
    },
    { field: "plan", headerName: "Plan", flex: 1 },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      renderCell: ({ value }) => new Date(value).toLocaleDateString(),
    },
    {
      field: "endDate",
      headerName: "End Date",
      flex: 1,
      renderCell: ({ row }) => (
        <Typography>
          {row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A"}
        </Typography>
      ),
    },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <IconButton
            onClick={() => handleEdit(row)}
            sx={{ color: "blue" }}
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => handleDelete(row.id)}
            sx={{ color: "red" }}
            aria-label="delete"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Map subscriptions to the format expected by DataGrid
  const rows = (subscriptions || []).map((sub) => ({
    id: sub._id,
    architectId: sub.architectId,
    plan: sub.plan,
    startDate: sub.startDate,
    endDate: sub.endDate,
    status: sub.status,
    price: sub.price,
  }));
  return (
    <Box m="20px">
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {},
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
          checkboxSelection
          rows={rows} // Use the mapped subscriptions as rows
          columns={columns} // Use the defined columns
        />
      </Box>
    </Box>
  );
};

export default SubscriptionManagement;
