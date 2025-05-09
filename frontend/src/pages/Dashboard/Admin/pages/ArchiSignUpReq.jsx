import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchArchitectRequests,
  approveArchitect,
  rejectArchitect,
} from "../../../../redux/slices/adminSlice";
import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// Import the RejectionDialog correctly
import RejectionDialog from "../../Admin/components/Dialog/RejectionDialog"; // Adjust the path based on your file structure

const ArchitectRequests = () => {
  const dispatch = useDispatch();
  const { architects, loading, error } = useSelector((state) => state.admin);
  const [openRejectionDialog, setOpenRejectionDialog] = useState(false);
  const [selectedArchitect, setSelectedArchitect] = useState(null);

  useEffect(() => {
    dispatch(fetchArchitectRequests());
  }, [dispatch]);

  const handleApprove = (id) => {
    if (window.confirm("Approve this architect?")) {
      dispatch(approveArchitect(id));
    }
  };

  const handleRejectClick = (architect) => {
    setSelectedArchitect(architect);
    setOpenRejectionDialog(true);
  };

  const handleRejectionSubmit = ({ rejectionReason, customReason }) => {
    if (selectedArchitect) {
      dispatch(
        rejectArchitect({
          id: selectedArchitect._id,
          rejectionReason,
          customReason,
        })
      );
      setOpenRejectionDialog(false);
      setSelectedArchitect(null);
    }
  };

  const columns = [
    { field: "_id", headerName: "ID", flex: 1 },
    {
      field: "fullName",
      headerName: "Architect Name",
      flex: 1.5,
      valueGetter: (params) =>
        `${params?.row?.prenom || ""} ${
          params?.row?.nomDeFamille || ""
        }`.trim() || "N/A",
    },
    { field: "email", headerName: "Email", flex: 1.5 },
    {
      field: "experienceYears",
      headerName: "Experience (Years)",
      flex: 1,
      valueGetter: (params) => params?.row?.experienceYears || "N/A",
    },
    {
      field: "companyName",
      headerName: "Company Name",
      flex: 1.5,
      valueGetter: (params) => params?.row?.companyName || "N/A",
    },
    {
      field: "patenteNumber",
      headerName: "Patente Number",
      flex: 1,
      valueGetter: (params) => params?.row?.patenteNumber || "N/A",
    },
    {
      field: "cin",
      headerName: "CIN",
      flex: 1,
      valueGetter: (params) => params?.row?.cin || "N/A",
    },

    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <Typography
          sx={{
            color:
              params?.row?.status === "approved"
                ? "green"
                : params?.row?.status === "rejected"
                ? "red"
                : "orange",
            fontWeight: "bold",
          }}
        >
          {params?.row?.status || "pending"}
        </Typography>
      ),
    },
    {
      field: "createdAt",
      headerName: "Date Requested",
      flex: 1,
      valueGetter: (params) =>
        params?.row?.createdAt
          ? new Date(params.row.createdAt).toLocaleDateString()
          : "N/A",
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      renderCell: (params) => (
        <Box>
          <Button
            variant="contained"
            color="success"
            sx={{ mr: 1 }}
            onClick={() => handleApprove(params?.row?._id)}
            disabled={params?.row?.status === "approved"}
          >
            Approve
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleRejectClick(params.row)}
            disabled={params?.row?.status === "rejected"}
          >
            Reject
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Typography variant="h4" mb={2}>
        Architect Signup Requests
      </Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">
          Error: {error?.message || JSON.stringify(error)}
        </Typography>
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
          }}
        >
          <DataGrid
            rows={architects?.filter((arch) => arch) || []}
            columns={columns}
            getRowId={(row) => row?._id || Math.random()}
            components={{ Toolbar: GridToolbar }}
            componentsProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
          />
        </Box>
      )}

      <RejectionDialog
        open={openRejectionDialog}
        onClose={() => setOpenRejectionDialog(false)}
        onSubmit={handleRejectionSubmit}
        architectName={
          selectedArchitect
            ? `${selectedArchitect.prenom || ""} ${
                selectedArchitect.nomDeFamille || ""
              }`.trim()
            : ""
        }
      />
    </Box>
  );
};

export default ArchitectRequests;
