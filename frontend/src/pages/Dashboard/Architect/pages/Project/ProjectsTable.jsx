import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import "./ProjectStyles.css";
import {
  fetchAllProjects,
  deleteProject,
  searchProjects,
  resetProjectState,
  fetchProjectById,
} from "../../../../../redux/slices/ProjectSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  Box,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Snackbar,
  LinearProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Clear as ClearIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import AddProjects from "./AddProject";
import ProjectDetails from "./ProjectDetails";
import EditProject from "./EditProject";

const ProjectsTable = () => {
  const dispatch = useDispatch();
  const { projects, searchResults, isLoading, error, success, message } =
    useSelector((state) => state.projects);
  const { user } = useSelector((state) => state.auth);

  // Local state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [addProjectDialogOpen, setAddProjectDialogOpen] = useState(false);

  // State to track if filters are applied
  const [isFiltered, setIsFiltered] = useState(false);
  // State to store filtered projects locally if API filtering doesn't work
  const [filteredProjects, setFilteredProjects] = useState([]);

  // New state for view and edit dialogs
  const [viewProjectDialogOpen, setViewProjectDialogOpen] = useState(false);
  const [editProjectDialogOpen, setEditProjectDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const clearSearch = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    setIsFiltered(false);
    setFilteredProjects([]);
    dispatch(resetProjectState());
    dispatch(fetchAllProjects());
  };

  // Fetch projects on component mount
  useEffect(() => {
    // If we need to fetch architect-specific projects, we can use the user ID
    if (user && user.role === "architect") {
      dispatch(fetchAllProjects());
    } else {
      dispatch(fetchAllProjects());
    }

    // Cleanup on component unmount
    return () => {
      dispatch(resetProjectState());
    };
  }, [dispatch, user]);

  // Show snackbar when operation succeeds
  useEffect(() => {
    if (success && message) {
      setSnackbarOpen(true);
      setAddProjectDialogOpen(false); // Close form on success
      setEditProjectDialogOpen(false); // Also close edit form on success
      setTimeout(() => {
        dispatch(resetProjectState());
      }, 3000);
    }
  }, [success, message, dispatch]);

  // Handle search with server-side API
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const searchParams = {};

    if (searchTerm) searchParams.query = searchTerm;
    if (categoryFilter) searchParams.category = categoryFilter;
    if (statusFilter) searchParams.status = statusFilter;

    // Only dispatch if we have at least one search parameter
    if (Object.keys(searchParams).length > 0) {
      dispatch(searchProjects(searchParams));
      setIsFiltered(true);
    } else {
      // If no search params, fetch all projects
      dispatch(fetchAllProjects());
      setIsFiltered(false);
      setFilteredProjects([]);
    }
    setFilterDialogOpen(false);
  };

  // Fallback client-side filtering if server-side filtering doesn't work
  const handleLocalFilter = () => {
    if (!projects || projects.length === 0) return;

    let results = [...projects];

    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      results = results.filter(
        (project) =>
          project.title.toLowerCase().includes(lowercaseSearch) ||
          (project.description &&
            project.description.toLowerCase().includes(lowercaseSearch))
      );
    }

    if (categoryFilter) {
      results = results.filter(
        (project) => project.category === categoryFilter
      );
    }

    if (statusFilter) {
      results = results.filter((project) => project.status === statusFilter);
    }

    setFilteredProjects(results);
    setIsFiltered(true);
    setFilterDialogOpen(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("");
    setStatusFilter("");
    setIsFiltered(false);
    setFilteredProjects([]);
    dispatch(fetchAllProjects());
    setFilterDialogOpen(false);
  };

  // Handle delete confirmation
  const openDeleteDialog = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (projectToDelete) {
      dispatch(deleteProject(projectToDelete._id));
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  // Open view project dialog
  const openViewProjectDialog = (projectId) => {
    setSelectedProjectId(projectId);
    dispatch(fetchProjectById(projectId));
    setViewProjectDialogOpen(true);
  };

  // Open edit project dialog
  const openEditProjectDialog = (projectId) => {
    setSelectedProjectId(projectId);
    dispatch(fetchProjectById(projectId));
    setEditProjectDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "completed":
        return "success";
      case "canceled":
        return "error";
      default:
        return "default";
    }
  };

  // Toggle add project dialog
  const toggleAddProjectDialog = () => {
    setAddProjectDialogOpen(!addProjectDialogOpen);
  };

  // Determine which projects to display based on filters and search
  const displayProjects = () => {
    if (isFiltered) {
      if (searchResults && searchResults.length > 0) {
        return searchResults; // Use API results if available
      } else if (filteredProjects.length > 0) {
        return filteredProjects; // Use local filtering results as fallback
      }
      return []; // No results found
    }
    return projects || []; // Default to all projects
  };

  return (
    <Box sx={{ width: "100%" }} className="projects-container">
      {/* Header section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <h2>Projects Management</h2>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSearch(e);
                // Fallback to client-side filtering if needed
                if (!searchResults || searchResults.length === 0) {
                  handleLocalFilter();
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <>
                  <IconButton
                    onClick={() => {
                      handleSearch();
                      // Fallback to client-side filtering if needed
                      if (!searchResults || searchResults.length === 0) {
                        handleLocalFilter();
                      }
                    }}
                    size="small"
                  >
                    <SearchIcon />
                  </IconButton>
                  {searchTerm && (
                    <IconButton
                      onClick={() => {
                        setSearchTerm("");
                        clearSearch();
                      }}
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                </>
              ),
            }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setFilterDialogOpen(true)}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={toggleAddProjectDialog}
            className="add-project-btn"
          >
            New Project
          </Button>
        </Box>
      </Box>

      {/* Active filters display */}
      {(statusFilter || categoryFilter) && (
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <Typography variant="body2">Active filters:</Typography>
          {statusFilter && (
            <Chip
              label={`Status: ${statusFilter}`}
              size="small"
              onDelete={() => {
                setStatusFilter("");
                handleSearch();
              }}
            />
          )}
          {categoryFilter && (
            <Chip
              label={`Category: ${categoryFilter}`}
              size="small"
              onDelete={() => {
                setCategoryFilter("");
                handleSearch();
              }}
            />
          )}
          {(statusFilter || categoryFilter) && (
            <Button
              size="small"
              onClick={handleResetFilters}
              startIcon={<ClearIcon />}
            >
              Clear all
            </Button>
          )}
        </Box>
      )}

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || "An error occurred"}
        </Alert>
      )}

      {/* Projects table */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {displayProjects().length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{ mb: 4 }}
              className="transparent-table"
            >
              <Table aria-label="projects table">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Milestones</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell align="center">Public</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayProjects().map((project) => (
                    <TableRow
                      key={project._id}
                      component={motion.tr}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TableCell component="th" scope="row">
                        {project.title}
                      </TableCell>
                      <TableCell>
                        {project.clientId
                          ? project.clientId.name || "Unknown Client"
                          : "Unknown Client"}
                      </TableCell>
                      <TableCell>{project.category}</TableCell>
                      <TableCell>
                        <Chip
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {project.milestones?.length || 0}
                        <Typography variant="caption" display="block">
                          {
                            project.milestones?.filter(
                              (m) => m.status === "completed"
                            ).length
                          }{" "}
                          completed
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <LinearProgress
                            variant="determinate"
                            value={project.progressPercentage || 0}
                            sx={{ width: "80%", mr: 1 }}
                          />
                          <Typography variant="body2">
                            {Math.round(project.progressPercentage || 0)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(project.endDate)}</TableCell>
                      <TableCell align="center">
                        {project.isPublic ? "✓" : "✗"}
                      </TableCell>
                      <TableCell align="right">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <Tooltip title="View">
                            <IconButton
                              onClick={() => openViewProjectDialog(project._id)}
                              size="small"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() => openEditProjectDialog(project._id)}
                              size="small"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              onClick={() => openDeleteDialog(project)}
                              color="error"
                              size="small"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <Typography variant="body1" color="text.secondary">
                {isFiltered
                  ? "No matching projects found for your filter criteria."
                  : "No projects found. Create a new project to get started."}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
                onClick={toggleAddProjectDialog}
                className="add-project-btn"
              >
                Create Project
              </Button>
              {isFiltered && (
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  sx={{ mt: 2, ml: 2 }}
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          )}
        </>
      )}

      {/* Add Project Dialog */}
      <Dialog
        open={addProjectDialogOpen}
        onClose={toggleAddProjectDialog}
        maxWidth="lg"
        fullWidth
        className="add-project-dialog"
      >
        <DialogTitle>
          Add New Project
          <IconButton
            aria-label="close"
            onClick={toggleAddProjectDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="add-project-content">
          <AddProjects onCancel={toggleAddProjectDialog} />
        </DialogContent>
      </Dialog>

      {/* View Project Dialog */}
      <Dialog
        open={viewProjectDialogOpen}
        onClose={() => setViewProjectDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        className="view-project-dialog"
      >
        <DialogTitle>
          Project Details
          <IconButton
            aria-label="close"
            onClick={() => setViewProjectDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="view-project-content" sx={{ p: 0 }}>
          {selectedProjectId && (
            <ProjectDetails
              projectId={selectedProjectId}
              isDialog={true}
              onClose={() => setViewProjectDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog
        open={editProjectDialogOpen}
        onClose={() => setEditProjectDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        className="edit-project-dialog"
      >
        <DialogTitle>
          Edit Project
          <IconButton
            aria-label="close"
            onClick={() => setEditProjectDialogOpen(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="edit-project-content" sx={{ p: 0 }}>
          {selectedProjectId && (
            <EditProject
              projectId={selectedProjectId}
              isDialog={true}
              onClose={() => setEditProjectDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Filter dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
      >
        <DialogTitle>Filter Projects</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search term"
            fullWidth
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              value={categoryFilter}
              label="Category"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Residential">Residential</MenuItem>
              <MenuItem value="Commercial">Commercial</MenuItem>
              <MenuItem value="Interior Design">Interior Design</MenuItem>
              <MenuItem value="Landscape">Landscape</MenuItem>
              <MenuItem value="Industrial">Industrial</MenuItem>
              <MenuItem value="Urban Planning">Urban Planning</MenuItem>
            </Select>
          </FormControl>

          {/*<FormControl fullWidth margin="dense">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="canceled">Canceled</MenuItem>
            </Select>
          </FormControl> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetFilters} startIcon={<ClearIcon />}>
            Reset
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleSearch();
              // Also try client-side filtering as fallback
              handleLocalFilter();
            }}
            variant="contained"
            startIcon={<SearchIcon />}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project "
            {projectToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success message snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={() => setSnackbarOpen(false)}
          severity="success"
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProjectsTable;
