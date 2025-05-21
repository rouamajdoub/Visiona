// src/pages/UserManagement.js
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../../../../redux/slices/adminSlice"; // Import actions from your slice
import { Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users = [], loading, error } = useSelector((state) => state.admin); // Adjust based on your Redux state

  useEffect(() => {
    dispatch(fetchUsers()); // Fetch users when the component mounts
  }, [dispatch]);

  const handleDelete = (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      dispatch(deleteUser(id)); // Dispatch delete user action
    }
  };

  // Define the columns for the DataGrid
  const columns = [
    {
      field: "pseudo",
      headerName: "Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: ({ row }) => (
        <Box
          width="60%"
          m="0 auto"
          p="5px"
          display="flex"
          justifyContent="center"
          backgroundColor={row.role === "admin"}
          borderRadius="4px"
        >
          {row.role === "admin" && <AdminPanelSettingsOutlinedIcon />}
          {row.role === "manager" && <SecurityOutlinedIcon />}
          {row.role === "user" && <LockOpenOutlinedIcon />}
          <Typography sx={{ ml: "5px" }}>{row.role}</Typography>
        </Box>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: ({ row }) => (
        <button className="btn-delete" onClick={() => handleDelete(row._id)}>
          Supprimer
        </button>
      ),
    },
  ];

  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p>Erreur : {error}</p>;

  // Map users to the format expected by DataGrid
  const rows = users.map((user) => ({
    id: user._id, // Assuming _id is the unique identifier
    pseudo: user.pseudo,
    email: user.email,
    role: user.role, // Adjust based on your user object structure
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
          rows={rows} // Use the mapped users as rows
          columns={columns} // Use the defined columns
        />
      </Box>
    </Box>
  );
};

export default UserManagement;
