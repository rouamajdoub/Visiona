const express = require("express");
const router = express.Router();
const {
  createTeam,
  getTeamById,
  getTeams,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  assignProject,
  removeProject,
} = require("../controllers/teamController");
const {
  protect,
  restrictTo,
  requireApproved,
} = require("../middlewares/authMiddleware");
const { body, param, validationResult } = require("express-validator");

// Custom validation middleware to replace the missing validate middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules
const createTeamValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Team name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

const updateTeamValidation = [
  param("teamId").isMongoId().withMessage("Invalid team ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Team name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
];

const addMemberValidation = [
  param("teamId").isMongoId().withMessage("Invalid team ID"),
  body("userId").isMongoId().withMessage("Invalid user ID"),
  body("role")
    .optional()
    .isIn(["designer", "assistant", "project_manager", "collaborator"])
    .withMessage("Invalid role"),
];

const assignProjectValidation = [
  param("teamId").isMongoId().withMessage("Invalid team ID"),
  body("projectId").isMongoId().withMessage("Invalid project ID"),
];

const teamIdValidation = [
  param("teamId").isMongoId().withMessage("Invalid team ID"),
];

const memberIdValidation = [
  param("teamId").isMongoId().withMessage("Invalid team ID"),
  param("memberId").isMongoId().withMessage("Invalid member ID"),
];

const projectIdValidation = [
  param("teamId").isMongoId().withMessage("Invalid team ID"),
  param("projectId").isMongoId().withMessage("Invalid project ID"),
];

// Apply authentication middleware to all routes
router.use(protect);

// Team CRUD routes
router.post(
  "/",
  restrictTo("architect"),
  requireApproved,
  createTeamValidation,
  handleValidationErrors,
  createTeam
);

router.get("/", getTeams);

router.get("/:teamId", teamIdValidation, handleValidationErrors, getTeamById);

router.put(
  "/:teamId",
  updateTeamValidation,
  handleValidationErrors,
  updateTeam
);

router.delete("/:teamId", teamIdValidation, handleValidationErrors, deleteTeam);

// Member management routes
router.post(
  "/:teamId/members",
  addMemberValidation,
  handleValidationErrors,
  addMember
);

router.delete(
  "/:teamId/members/:memberId",
  memberIdValidation,
  handleValidationErrors,
  removeMember
);

// Project assignment routes
router.post(
  "/:teamId/projects",
  assignProjectValidation,
  handleValidationErrors,
  assignProject
);

router.delete(
  "/:teamId/projects/:projectId",
  projectIdValidation,
  handleValidationErrors,
  removeProject
);

module.exports = router;
