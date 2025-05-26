const express = require("express");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const projectController = require("../controllers/projectsController");

const router = express.Router();

// Protect routes, allowing only authenticated architects
router.use(protect, restrictTo("architect"));

// Project search route (should be before parameterized routes)
router.get("/search", projectController.searchProjects);

// Project management routes
router.post("/", projectController.createProject);
router.get("/", projectController.getProjects);
router.put("/:projectId", projectController.updateProject);
router.delete("/:projectId", projectController.deleteProject);
router.get("/:projectId", projectController.getProjectById);

// Client-specific projects
router.get("/client/:clientId", projectController.getProjectsByClient);

// Like/Unlike routes
router.post("/:projectId/like", projectController.likeProject);
router.get("/:projectId/likes", projectController.getProjectLikesCount);

// NEW: Project file management routes
router.post("/:projectId/files", projectController.addProjectFile);
router.put("/:projectId/files/:fileId", projectController.updateProjectFile);
router.delete("/:projectId/files/:fileId", projectController.deleteProjectFile);

// Milestone management routes
router.post("/:projectId/milestones", projectController.addMilestone);
router.put(
  "/:projectId/milestones/:milestoneId",
  projectController.updateMilestone
);
router.delete(
  "/:projectId/milestones/:milestoneId",
  projectController.deleteMilestone
);

// Progress management route
router.put("/:projectId/progress", projectController.updateProjectProgress);

// Payment management routes
router.post("/:projectId/payments", projectController.addPayment);
router.put("/:projectId/payment-status", projectController.updatePaymentStatus);
router.delete(
  "/:projectId/payments/:paymentId",
  projectController.deletePayment
);

module.exports = router;
