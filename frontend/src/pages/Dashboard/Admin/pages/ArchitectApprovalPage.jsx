import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchArchitectRequests,
  fetchArchitectDetails,
  updateArchitectStatus,
  getDocumentUrl,
  clearSelectedArchitect,
} from "../../../../redux/slices/architectApprovalSlice";

// Updated Material UI imports with correct component names
import {
  Button,
  Card,
  CardContent,
  Modal,
  CircularProgress,
  Tabs,
  Tab,
  Alert,
  Box,
  Typography,
  Table,
  TableBody,
  TableRow,
  TableCell,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
  Grid,
  Avatar,
  Chip,
} from "@mui/material";

const ArchitectApprovalPage = () => {
  const dispatch = useDispatch();
  const {
    requests,
    selectedArchitect,
    loading,
    detailsLoading,
    updateLoading,
    error,
  } = useSelector((state) => state.architectApproval);

  // Local state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documentView, setDocumentView] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Fetch architect requests on component mount
  useEffect(() => {
    dispatch(fetchArchitectRequests());
  }, [dispatch]);

  // Handle view details
  const handleViewDetails = (architectId) => {
    dispatch(fetchArchitectDetails(architectId)).then(() => {
      setShowDetailsModal(true);
    });
  };

  // Handle document view
  const handleViewDocument = (docType) => {
    if (!selectedArchitect) return;

    const documentUrl = getDocumentUrl(selectedArchitect._id, docType);
    setDocumentView({
      type: docType,
      url: documentUrl,
      title: docType === "patenteFile" ? "Patent Document" : "CIN Document",
    });
  };

  // Handle close details modal
  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setDocumentView(null);
    dispatch(clearSelectedArchitect());
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle approve architect
  const handleApprove = (architectId) => {
    dispatch(
      updateArchitectStatus({
        architectId,
        status: "approved",
      })
    ).then(() => {
      handleCloseDetails();
      dispatch(fetchArchitectRequests());
    });
  };

  // Handle reject architect - open modal
  const handleOpenRejectModal = () => {
    setShowRejectModal(true);
  };

  // Handle reject submit
  const handleRejectSubmit = () => {
    if (!rejectionReason) {
      // Show validation error
      return;
    }

    dispatch(
      updateArchitectStatus({
        architectId: selectedArchitect._id,
        status: "rejected",
        rejectionReason,
        customReason,
      })
    ).then(() => {
      setShowRejectModal(false);
      handleCloseDetails();
      dispatch(fetchArchitectRequests());
      // Reset form
      setRejectionReason("");
      setCustomReason("");
    });
  };

  // Render rejection reason options
  const rejectionOptions = [
    "Incomplete Documentation",
    "Invalid Professional Credentials",
    "Insufficient Portfolio Quality",
    "Duplicate Account",
    "Inappropriate Content",
    "Terms Violation",
    "Other",
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "16rem",
        }}
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading architect requests...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Architect Approval Dashboard
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string" ? error : "An error occurred"}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "medium" }}>
          Pending Requests ({requests.length})
        </Typography>
      </Box>

      {requests.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            p: 4,
            bgcolor: "grey.100",
            borderRadius: 1,
          }}
        >
          <Typography>No pending architect requests found.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {requests.map((architect) => (
            <Grid item xs={12} md={6} lg={4} key={architect._id}>
              <Card sx={{ boxShadow: 1 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    {architect.profilePicture ? (
                      <Avatar
                        src={architect.profilePicture}
                        alt={`${architect.prenom} ${architect.nomDeFamille}`}
                        sx={{ width: 48, height: 48, mr: 1.5 }}
                      />
                    ) : (
                      <Avatar
                        sx={{
                          width: 48,
                          height: 48,
                          mr: 1.5,
                          bgcolor: "grey.300",
                        }}
                      >
                        {architect.prenom?.charAt(0) || ""}
                        {architect.nomDeFamille?.charAt(0) || ""}
                      </Avatar>
                    )}
                    <Box>
                      <Typography sx={{ fontWeight: "medium" }}>
                        {architect.prenom} {architect.nomDeFamille}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {architect.email}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ fontSize: "0.875rem", mb: 1.5 }}>
                    <Typography variant="body2">
                      <span style={{ fontWeight: 500 }}>Company:</span>{" "}
                      {architect.companyName || "Not specified"}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: 500 }}>Experience:</span>{" "}
                      {architect.experienceYears
                        ? `${architect.experienceYears} years`
                        : "Not specified"}
                    </Typography>
                    <Typography variant="body2">
                      <span style={{ fontWeight: 500 }}>Patente:</span>{" "}
                      {architect.patenteNumber || "Not specified"}
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => handleViewDetails(architect._id)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Architect Details Modal */}
      <Modal
        open={showDetailsModal}
        onClose={handleCloseDetails}
        aria-labelledby="architect-details-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            maxWidth: 1000,
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <Typography
            id="architect-details-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            {selectedArchitect
              ? `${selectedArchitect.prenom} ${selectedArchitect.nomDeFamille}`
              : "Architect Details"}
          </Typography>

          {detailsLoading ? (
            <Box sx={{ textAlign: "center", p: 2 }}>
              <CircularProgress />
              <Typography sx={{ mt: 1 }}>
                Loading architect details...
              </Typography>
            </Box>
          ) : documentView ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                {documentView.title}
              </Typography>
              <Box
                sx={{
                  border: 1,
                  borderColor: "grey.300",
                  borderRadius: 1,
                  mb: 1.5,
                  p: 1,
                }}
              >
                {documentView.type === "patenteFile" ? (
                  <iframe
                    src={documentView.url}
                    title="Patent Document"
                    width="100%"
                    height="500px"
                    style={{ border: 0 }}
                  />
                ) : (
                  <img
                    src={documentView.url}
                    alt="CIN Document"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      margin: "0 auto",
                      display: "block",
                    }}
                  />
                )}
              </Box>
              <Button variant="outlined" onClick={() => setDocumentView(null)}>
                Back to Details
              </Button>
            </Box>
          ) : selectedArchitect ? (
            <Box>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="architect details tabs"
                >
                  <Tab label="Personal Info" />
                  <Tab label="Professional Info" />
                  <Tab label="Portfolio & Services" />
                  <Tab label="Contact Info" />
                </Tabs>
              </Box>

              {/* Personal Info Tab */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium", mb: 1 }}
                    >
                      Basic Information
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: "medium", width: "40%" }}
                          >
                            First Name:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.prenom || "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Last Name:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.nomDeFamille || "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Email:
                          </TableCell>
                          <TableCell>{selectedArchitect.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Phone Number:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.phoneNumber || "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Location:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.location?.country ||
                              "Not provided"}
                            {selectedArchitect.location?.region
                              ? `, ${selectedArchitect.location.region}`
                              : ""}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium", mb: 1 }}
                    >
                      Documents
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          Patent Document
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDocument("patenteFile")}
                        >
                          View Patent Document
                        </Button>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          CIN Document
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewDocument("cinFile")}
                        >
                          View CIN Document
                        </Button>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </TabPanel>

              {/* Professional Info Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium", mb: 1 }}
                    >
                      Professional Details
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: "medium", width: "40%" }}
                          >
                            Company Name:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.companyName || "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Experience:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.experienceYears
                              ? `${selectedArchitect.experienceYears} years`
                              : "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Patente Number:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.patenteNumber || "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Specialization:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.specialization?.join(", ") ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Specialty:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.specialty || "Not provided"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium", mb: 1 }}
                    >
                      Education & Skills
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: "medium", width: "40%" }}
                          >
                            Degree:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.education?.degree ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Institution:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.education?.institution ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Graduation Year:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.education?.graduationYear ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Certifications:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.certifications?.join(", ") ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "medium", mb: 1 }}
                  >
                    Bio
                  </Typography>
                  <Box sx={{ bgcolor: "grey.100", p: 1.5, borderRadius: 1 }}>
                    <Typography variant="body2">
                      {selectedArchitect.bio || "No bio provided."}
                    </Typography>
                  </Box>
                </Box>
              </TabPanel>

              {/* Portfolio & Services Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "medium", mb: 1 }}
                  >
                    Project Types
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {selectedArchitect.projectTypes?.length > 0 ? (
                      selectedArchitect.projectTypes.map((type, index) => (
                        <Chip
                          key={index}
                          label={type}
                          size="small"
                          sx={{ bgcolor: "grey.100" }}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No project types specified
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "medium", mb: 1 }}
                  >
                    Portfolio
                  </Typography>
                  {selectedArchitect.portfolio?.length > 0 ? (
                    <Grid container spacing={2}>
                      {selectedArchitect.portfolio.map((image, index) => (
                        <Grid item xs={6} md={4} key={index}>
                          <Box
                            sx={{ position: "relative", paddingTop: "100%" }}
                          >
                            <img
                              src={image}
                              alt={`Portfolio item ${index + 1}`}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No portfolio images provided
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: "medium", mb: 1 }}
                  >
                    Services
                  </Typography>
                  {selectedArchitect.services?.length > 0 ? (
                    <Box component="ul" sx={{ pl: 2.5 }}>
                      {selectedArchitect.services.map((service, index) => (
                        <Box component="li" key={index} sx={{ mb: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "medium" }}
                          >
                            {service.category?.name || "Service"}
                          </Typography>
                          {service.description && (
                            <Typography variant="body2" color="text.secondary">
                              {service.description}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No services specified
                    </Typography>
                  )}
                </Box>
              </TabPanel>

              {/* Contact Info Tab */}
              <TabPanel value={tabValue} index={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium", mb: 1 }}
                    >
                      Contact Information
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: "medium", width: "40%" }}
                          >
                            Email:
                          </TableCell>
                          <TableCell>{selectedArchitect.email}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Phone:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.phoneNumber || "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Website:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.website || "Not provided"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "medium", mb: 1 }}
                    >
                      Social Media
                    </Typography>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell
                            sx={{ fontWeight: "medium", width: "40%" }}
                          >
                            LinkedIn:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.socialMedia?.linkedin ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Instagram:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.socialMedia?.instagram ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Facebook:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.socialMedia?.facebook ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "medium" }}>
                            Twitter:
                          </TableCell>
                          <TableCell>
                            {selectedArchitect.socialMedia?.twitter ||
                              "Not provided"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </TabPanel>
            </Box>
          ) : (
            <Box sx={{ textAlign: "center", p: 2 }}>
              <Typography>No architect selected</Typography>
            </Box>
          )}

          {selectedArchitect && !documentView && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 3,
                pt: 2,
                borderTop: 1,
                borderColor: "grey.300",
              }}
            >
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenRejectModal}
                disabled={updateLoading}
              >
                Reject Application
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApprove(selectedArchitect._id)}
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Processing...
                  </>
                ) : (
                  "Approve Architect"
                )}
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        open={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        aria-labelledby="rejection-modal"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 1,
          }}
        >
          <Typography
            id="rejection-modal"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Reject Architect Application
          </Typography>

          <FormControl fullWidth sx={{ mb: 2 }} error={rejectionReason === ""}>
            <InputLabel id="rejection-reason-label">
              Rejection Reason*
            </InputLabel>
            <Select
              labelId="rejection-reason-label"
              value={rejectionReason}
              label="Rejection Reason*"
              onChange={(e) => setRejectionReason(e.target.value)}
            >
              <MenuItem value="">Select a reason</MenuItem>
              {rejectionOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
            {rejectionReason === "" && (
              <Typography color="error" variant="caption">
                Please select a rejection reason
              </Typography>
            )}
          </FormControl>

          {rejectionReason === "Other" && (
            <TextField
              label="Custom Reason Details*"
              multiline
              rows={3}
              fullWidth
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please specify the reason for rejection"
              error={rejectionReason === "Other" && !customReason}
              helperText={
                rejectionReason === "Other" && !customReason
                  ? "Please provide details for the rejection"
                  : ""
              }
              sx={{ mb: 2 }}
            />
          )}

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            <Button onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleRejectSubmit}
              disabled={
                updateLoading ||
                !rejectionReason ||
                (rejectionReason === "Other" && !customReason)
              }
            >
              {updateLoading ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Processing...
                </>
              ) : (
                "Confirm Rejection"
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

// TabPanel component for Material UI tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`architect-tabpanel-${index}`}
      aria-labelledby={`architect-tab-${index}`}
      {...other}
      style={{ padding: "16px 0" }}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default ArchitectApprovalPage;
