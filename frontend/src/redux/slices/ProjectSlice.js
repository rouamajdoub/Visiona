import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// API base URL
const API_URL = "/api/projects";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Async thunks for API calls

// Fetch all projects (renamed from getProjects)
export const fetchAllProjects = createAsyncThunk(
  "projects/fetchAllProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Fetch project by ID (renamed from getProjectById)
export const fetchProjectById = createAsyncThunk(
  "projects/fetchProjectById",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Fetch projects by client (renamed from getProjectsByClient)
export const fetchProjectsByClient = createAsyncThunk(
  "projects/fetchProjectsByClient",
  async (clientId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/client/${clientId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Create a new project
export const createProject = createAsyncThunk(
  "projects/createProject",
  async (projectData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append text fields
      Object.keys(projectData).forEach((key) => {
        if (
          key !== "coverImage" &&
          key !== "beforePhotos" &&
          key !== "afterPhotos" &&
          key !== "projectFiles"
        ) {
          if (
            typeof projectData[key] === "object" &&
            projectData[key] !== null
          ) {
            formData.append(key, JSON.stringify(projectData[key]));
          } else {
            formData.append(key, projectData[key]);
          }
        }
      });

      // Append files
      if (projectData.coverImage) {
        formData.append("coverImage", projectData.coverImage);
      }

      if (projectData.beforePhotos) {
        projectData.beforePhotos.forEach((file) => {
          formData.append("beforePhotos", file);
        });
      }

      if (projectData.afterPhotos) {
        projectData.afterPhotos.forEach((file) => {
          formData.append("afterPhotos", file);
        });
      }

      if (projectData.projectFiles) {
        projectData.projectFiles.forEach((file) => {
          formData.append("projectFiles", file);
        });
      }

      const response = await axios.post(API_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Update project
export const updateProject = createAsyncThunk(
  "projects/updateProject",
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Append text fields
      Object.keys(projectData).forEach((key) => {
        if (
          key !== "coverImage" &&
          key !== "beforePhotos" &&
          key !== "afterPhotos" &&
          key !== "projectFiles"
        ) {
          if (
            typeof projectData[key] === "object" &&
            projectData[key] !== null
          ) {
            formData.append(key, JSON.stringify(projectData[key]));
          } else {
            formData.append(key, projectData[key]);
          }
        }
      });

      // Append files
      if (projectData.coverImage) {
        formData.append("coverImage", projectData.coverImage);
      }

      if (projectData.beforePhotos) {
        projectData.beforePhotos.forEach((file) => {
          formData.append("beforePhotos", file);
        });
      }

      if (projectData.afterPhotos) {
        projectData.afterPhotos.forEach((file) => {
          formData.append("afterPhotos", file);
        });
      }

      if (projectData.projectFiles) {
        projectData.projectFiles.forEach((file) => {
          formData.append("projectFiles", file);
        });
      }

      const response = await axios.put(`${API_URL}/${projectId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Delete project
export const deleteProject = createAsyncThunk(
  "projects/deleteProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/${projectId}`);
      return { ...response.data, projectId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Search projects
export const searchProjects = createAsyncThunk(
  "projects/searchProjects",
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/search`, {
        params: searchParams,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Like/Unlike project
export const likeProject = createAsyncThunk(
  "projects/likeProject",
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/${projectId}/like`, {
        userId,
      });
      return { ...response.data, projectId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Get project likes count
export const getProjectLikesCount = createAsyncThunk(
  "projects/getProjectLikesCount",
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/${projectId}/likes`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Project file management
export const addProjectFile = createAsyncThunk(
  "projects/addProjectFile",
  async ({ projectId, file, fileType, description }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("projectFile", file);
      if (fileType) formData.append("fileType", fileType);
      if (description) formData.append("description", description);

      const response = await axios.post(
        `${API_URL}/${projectId}/files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateProjectFile = createAsyncThunk(
  "projects/updateProjectFile",
  async ({ projectId, fileId, description, fileType }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}/files/${fileId}`,
        {
          description,
          fileType,
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const deleteProjectFile = createAsyncThunk(
  "projects/deleteProjectFile",
  async ({ projectId, fileId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${projectId}/files/${fileId}`
      );
      return { ...response.data, fileId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Milestone management
export const addMilestone = createAsyncThunk(
  "projects/addMilestone",
  async ({ projectId, milestoneData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/${projectId}/milestones`,
        milestoneData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updateMilestone = createAsyncThunk(
  "projects/updateMilestone",
  async ({ projectId, milestoneId, milestoneData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}/milestones/${milestoneId}`,
        milestoneData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const deleteMilestone = createAsyncThunk(
  "projects/deleteMilestone",
  async ({ projectId, milestoneId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${projectId}/milestones/${milestoneId}`
      );
      return { ...response.data, milestoneId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Progress management
export const updateProjectProgress = createAsyncThunk(
  "projects/updateProjectProgress",
  async ({ projectId, progressPercentage }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/${projectId}/progress`, {
        progressPercentage,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Payment management
export const addPayment = createAsyncThunk(
  "projects/addPayment",
  async ({ projectId, paymentData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/${projectId}/payments`,
        paymentData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const updatePaymentStatus = createAsyncThunk(
  "projects/updatePaymentStatus",
  async ({ projectId, paymentStatus }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${API_URL}/${projectId}/payment-status`,
        { paymentStatus }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

export const deletePayment = createAsyncThunk(
  "projects/deletePayment",
  async ({ projectId, paymentId }, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_URL}/${projectId}/payments/${paymentId}`
      );
      return { ...response.data, paymentId };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: error.message }
      );
    }
  }
);

// Fetch service categories
export const fetchServiceCategories = createAsyncThunk(
  "projects/fetchServiceCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/service-categories");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch service categories"
      );
    }
  }
);

// Fetch service subcategories by category ID
export const fetchServiceSubcategories = createAsyncThunk(
  "projects/fetchServiceSubcategories",
  async (categoryId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/admin/service-categories/${categoryId}/subcategories`
      );
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch service subcategories"
      );
    }
  }
);

// Fetch all service subcategories (if needed)
export const fetchAllServiceSubcategories = createAsyncThunk(
  "projects/fetchAllServiceSubcategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/admin/service-subcategories");
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to fetch service subcategories"
      );
    }
  }
);

// Initial state
const initialState = {
  projects: [],
  currentProject: null,
  searchResults: [],
  clientProjects: [],
  serviceCategories: [],
  serviceSubcategories: [],
  selectedCategorySubcategories: [], // subcategories for selected category
  categoriesLoading: false,
  subcategoriesLoading: false,
  loading: false,
  error: null,
  success: false,
  message: "",
  likesCount: 0,
  searchParams: {},
  // Separate states for different operations
  projectState: {
    loading: false,
    error: null,
    success: false,
    message: "",
  },
  paymentState: {
    loading: false,
    error: null,
    success: false,
    message: "",
  },
  milestoneState: {
    loading: false,
    error: null,
    success: false,
    message: "",
  },
  fileState: {
    loading: false,
    error: null,
    success: false,
    message: "",
  },
};

// Projects slice
const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    // Clear all errors
    clearErrors: (state) => {
      state.error = null;
      state.projectState.error = null;
      state.paymentState.error = null;
      state.milestoneState.error = null;
      state.fileState.error = null;
    },

    // Legacy clear error (for backward compatibility)
    clearError: (state) => {
      state.error = null;
    },

    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },

    clearCurrentProject: (state) => {
      state.currentProject = null;
    },

    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchParams = {};
    },

    clearClientProjects: (state) => {
      state.clientProjects = [];
    },

    // Reset specific states
    resetProjectState: (state) => {
      state.projectState = {
        loading: false,
        error: null,
        success: false,
        message: "",
      };
    },

    resetPaymentState: (state) => {
      state.paymentState = {
        loading: false,
        error: null,
        success: false,
        message: "",
      };
    },

    resetMilestoneState: (state) => {
      state.milestoneState = {
        loading: false,
        error: null,
        success: false,
        message: "",
      };
    },

    resetFileState: (state) => {
      state.fileState = {
        loading: false,
        error: null,
        success: false,
        message: "",
      };
    },
    clearServiceCategories: (state) => {
      state.serviceCategories = [];
      state.selectedCategorySubcategories = [];
    },

    clearServiceSubcategories: (state) => {
      state.serviceSubcategories = [];
      state.selectedCategorySubcategories = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all projects
      .addCase(fetchAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projectState.loading = true;
        state.projectState.error = null;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.projectState.loading = false;
        state.projectState.success = true;
      })
      .addCase(fetchAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch projects";
        state.projectState.loading = false;
        state.projectState.error =
          action.payload?.message || "Failed to fetch projects";
      })

      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projectState.loading = true;
        state.projectState.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload.project;
        state.projectState.loading = false;
        state.projectState.success = true;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch project";
        state.projectState.loading = false;
        state.projectState.error =
          action.payload?.message || "Failed to fetch project";
      })

      // Fetch projects by client
      .addCase(fetchProjectsByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projectState.loading = true;
        state.projectState.error = null;
      })
      .addCase(fetchProjectsByClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clientProjects = action.payload.projects;
        state.projectState.loading = false;
        state.projectState.success = true;
      })
      .addCase(fetchProjectsByClient.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to fetch client projects";
        state.projectState.loading = false;
        state.projectState.error =
          action.payload?.message || "Failed to fetch client projects";
      })

      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projectState.loading = true;
        state.projectState.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.projects.unshift(action.payload.project);
        state.projectState.loading = false;
        state.projectState.success = true;
        state.projectState.message = action.payload.message;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create project";
        state.projectState.loading = false;
        state.projectState.error =
          action.payload?.message || "Failed to create project";
      })

      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projectState.loading = true;
        state.projectState.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;

        // Update in projects array
        const index = state.projects.findIndex(
          (p) => p._id === action.payload.project._id
        );
        if (index !== -1) {
          state.projects[index] = action.payload.project;
        }

        // Update current project if it's the same
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.project._id
        ) {
          state.currentProject = action.payload.project;
        }

        state.projectState.loading = false;
        state.projectState.success = true;
        state.projectState.message = action.payload.message;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update project";
        state.projectState.loading = false;
        state.projectState.error =
          action.payload?.message || "Failed to update project";
      })

      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projectState.loading = true;
        state.projectState.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.projects = state.projects.filter(
          (p) => p._id !== action.payload.projectId
        );

        // Clear current project if it was deleted
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.projectId
        ) {
          state.currentProject = null;
        }

        state.projectState.loading = false;
        state.projectState.success = true;
        state.projectState.message = action.payload.message;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete project";
        state.projectState.loading = false;
        state.projectState.error =
          action.payload?.message || "Failed to delete project";
      })

      // Search projects
      .addCase(searchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.projects;
        state.searchParams = action.payload.searchParams || {};
      })
      .addCase(searchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to search projects";
      })

      // Like project
      .addCase(likeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(likeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;

        // Update likes in current project
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.projectId
        ) {
          state.currentProject.likes = action.payload.likes || [];
          state.currentProject.likesCount = action.payload.likesCount || 0;
        }

        // Update likes in projects array
        const projectIndex = state.projects.findIndex(
          (p) => p._id === action.payload.projectId
        );
        if (projectIndex !== -1) {
          state.projects[projectIndex].likes = action.payload.likes || [];
          state.projects[projectIndex].likesCount =
            action.payload.likesCount || 0;
        }
      })
      .addCase(likeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to like project";
      })

      // Get project likes count
      .addCase(getProjectLikesCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectLikesCount.fulfilled, (state, action) => {
        state.loading = false;
        state.likesCount = action.payload.likesCount || 0;
      })
      .addCase(getProjectLikesCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to get likes count";
      })

      // Add project file
      .addCase(addProjectFile.pending, (state) => {
        state.fileState.loading = true;
        state.fileState.error = null;
      })
      .addCase(addProjectFile.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.fileState.loading = false;
        state.fileState.success = true;
        state.fileState.message = action.payload.message;

        // Update current project files
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.projectId
        ) {
          state.currentProject.projectFiles =
            state.currentProject.projectFiles || [];
          state.currentProject.projectFiles.push(action.payload.file);
        }
      })
      .addCase(addProjectFile.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to add project file";
        state.fileState.loading = false;
        state.fileState.error =
          action.payload?.message || "Failed to add project file";
      })

      // Update project file
      .addCase(updateProjectFile.pending, (state) => {
        state.fileState.loading = true;
        state.fileState.error = null;
      })
      .addCase(updateProjectFile.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.fileState.loading = false;
        state.fileState.success = true;
        state.fileState.message = action.payload.message;

        // Update file in current project
        if (state.currentProject && state.currentProject.projectFiles) {
          const fileIndex = state.currentProject.projectFiles.findIndex(
            (file) => file._id === action.payload.file._id
          );
          if (fileIndex !== -1) {
            state.currentProject.projectFiles[fileIndex] = action.payload.file;
          }
        }
      })
      .addCase(updateProjectFile.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to update project file";
        state.fileState.loading = false;
        state.fileState.error =
          action.payload?.message || "Failed to update project file";
      })

      // Delete project file
      .addCase(deleteProjectFile.pending, (state) => {
        state.fileState.loading = true;
        state.fileState.error = null;
      })
      .addCase(deleteProjectFile.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.fileState.loading = false;
        state.fileState.success = true;
        state.fileState.message = action.payload.message;

        // Remove file from current project
        if (state.currentProject && state.currentProject.projectFiles) {
          state.currentProject.projectFiles =
            state.currentProject.projectFiles.filter(
              (file) => file._id !== action.payload.fileId
            );
        }
      })
      .addCase(deleteProjectFile.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to delete project file";
        state.fileState.loading = false;
        state.fileState.error =
          action.payload?.message || "Failed to delete project file";
      })

      // Add milestone
      .addCase(addMilestone.pending, (state) => {
        state.milestoneState.loading = true;
        state.milestoneState.error = null;
      })
      .addCase(addMilestone.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.milestoneState.loading = false;
        state.milestoneState.success = true;
        state.milestoneState.message = action.payload.message;

        // Update current project milestones
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.projectId
        ) {
          state.currentProject.milestones =
            state.currentProject.milestones || [];
          state.currentProject.milestones.push(action.payload.milestone);
        }
      })
      .addCase(addMilestone.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to add milestone";
        state.milestoneState.loading = false;
        state.milestoneState.error =
          action.payload?.message || "Failed to add milestone";
      })

      // Update milestone
      .addCase(updateMilestone.pending, (state) => {
        state.milestoneState.loading = true;
        state.milestoneState.error = null;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.milestoneState.loading = false;
        state.milestoneState.success = true;
        state.milestoneState.message = action.payload.message;

        // Update milestone in current project
        if (state.currentProject && state.currentProject.milestones) {
          const milestoneIndex = state.currentProject.milestones.findIndex(
            (milestone) => milestone._id === action.payload.milestone._id
          );
          if (milestoneIndex !== -1) {
            state.currentProject.milestones[milestoneIndex] =
              action.payload.milestone;
          }
        }
      })
      .addCase(updateMilestone.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to update milestone";
        state.milestoneState.loading = false;
        state.milestoneState.error =
          action.payload?.message || "Failed to update milestone";
      })

      // Delete milestone
      .addCase(deleteMilestone.pending, (state) => {
        state.milestoneState.loading = true;
        state.milestoneState.error = null;
      })
      .addCase(deleteMilestone.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.milestoneState.loading = false;
        state.milestoneState.success = true;
        state.milestoneState.message = action.payload.message;

        // Remove milestone from current project
        if (state.currentProject && state.currentProject.milestones) {
          state.currentProject.milestones =
            state.currentProject.milestones.filter(
              (milestone) => milestone._id !== action.payload.milestoneId
            );
        }
      })
      .addCase(deleteMilestone.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete milestone";
        state.milestoneState.loading = false;
        state.milestoneState.error =
          action.payload?.message || "Failed to delete milestone";
      })

      // Update project progress
      .addCase(updateProjectProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.projectState.loading = true;
        state.projectState.error = null;
      })
      .addCase(updateProjectProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.projectState.loading = false;
        state.projectState.success = true;
        state.projectState.message = action.payload.message;

        // Update progress in current project
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.project._id
        ) {
          state.currentProject.progressPercentage =
            action.payload.project.progressPercentage;
          state.currentProject.status = action.payload.project.status;
        }

        // Update progress in projects array
        const projectIndex = state.projects.findIndex(
          (p) => p._id === action.payload.project._id
        );
        if (projectIndex !== -1) {
          state.projects[projectIndex].progressPercentage =
            action.payload.project.progressPercentage;
          state.projects[projectIndex].status = action.payload.project.status;
        }
      })
      .addCase(updateProjectProgress.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.message || "Failed to update project progress";
        state.projectState.loading = false;
        state.projectState.error =
          action.payload?.message || "Failed to update project progress";
      })

      // Add payment
      .addCase(addPayment.pending, (state) => {
        state.paymentState.loading = true;
        state.paymentState.error = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.paymentState.loading = false;
        state.paymentState.success = true;
        state.paymentState.message = action.payload.message;

        // Update current project payments
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.projectId
        ) {
          state.currentProject.paymentHistory =
            state.currentProject.paymentHistory || [];
          state.currentProject.paymentHistory.push(action.payload.payment);
          state.currentProject.paymentStatus = action.payload.paymentStatus;
          state.currentProject.totalPaid = action.payload.totalPaid;
          state.currentProject.remainingBalance =
            action.payload.remainingBalance;
        }
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to add payment";
        state.paymentState.loading = false;
        state.paymentState.error =
          action.payload?.message || "Failed to add payment";
      })

      // Update payment status
      .addCase(updatePaymentStatus.pending, (state) => {
        state.paymentState.loading = true;
        state.paymentState.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.paymentState.loading = false;
        state.paymentState.success = true;
        state.paymentState.message = action.payload.message;

        // Update payment status in current project
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.project._id
        ) {
          state.currentProject.paymentStatus =
            action.payload.project.paymentStatus;
        }

        // Update payment status in projects array
        const projectIndex = state.projects.findIndex(
          (p) => p._id === action.payload.project._id
        );
        if (projectIndex !== -1) {
          state.projects[projectIndex].paymentStatus =
            action.payload.project.paymentStatus;
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.error =
          action.payload?.message || "Failed to update payment status";
        state.paymentState.loading = false;
        state.paymentState.error =
          action.payload?.message || "Failed to update payment status";
      })

      // Delete payment
      .addCase(deletePayment.pending, (state) => {
        state.paymentState.loading = true;
        state.paymentState.error = null;
      })
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.success = true;
        state.message = action.payload.message;
        state.paymentState.loading = false;
        state.paymentState.success = true;
        state.paymentState.message = action.payload.message;

        // Update current project payments
        if (
          state.currentProject &&
          state.currentProject._id === action.payload.projectId
        ) {
          state.currentProject.paymentHistory =
            state.currentProject.paymentHistory.filter(
              (payment) => payment._id !== action.payload.paymentId
            );
          state.currentProject.paymentStatus = action.payload.paymentStatus;
          state.currentProject.totalPaid = action.payload.totalPaid;
          state.currentProject.remainingBalance =
            action.payload.remainingBalance;
        }
      })

      // Fetch service categories
      .addCase(fetchServiceCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.serviceCategories = action.payload;
      })
      .addCase(fetchServiceCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.error = action.payload;
      })

      // Fetch service subcategories by category
      .addCase(fetchServiceSubcategories.pending, (state) => {
        state.subcategoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchServiceSubcategories.fulfilled, (state, action) => {
        state.subcategoriesLoading = false;
        state.selectedCategorySubcategories = action.payload;
      })
      .addCase(fetchServiceSubcategories.rejected, (state, action) => {
        state.subcategoriesLoading = false;
        state.error = action.payload;
      })

      // Fetch all service subcategories
      .addCase(fetchAllServiceSubcategories.pending, (state) => {
        state.subcategoriesLoading = true;
        state.error = null;
      })
      .addCase(fetchAllServiceSubcategories.fulfilled, (state, action) => {
        state.subcategoriesLoading = false;
        state.serviceSubcategories = action.payload;
      })
      .addCase(fetchAllServiceSubcategories.rejected, (state, action) => {
        state.subcategoriesLoading = false;
        state.error = action.payload;
      })
      .addCase(deletePayment.rejected, (state, action) => {
        state.error = action.payload?.message || "Failed to delete payment";
        state.paymentState.loading = false;
        state.paymentState.error =
          action.payload?.message || "Failed to delete payment";
      });
  },
});

export const {
  clearErrors,
  clearError,
  clearSuccess,
  clearCurrentProject,
  clearSearchResults,
  clearClientProjects,
  resetProjectState,
  resetPaymentState,
  resetMilestoneState,
  clearServiceCategories,
  clearServiceSubcategories,
  resetFileState,
} = projectsSlice.actions;

export default projectsSlice.reducer;
