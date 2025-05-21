const User = require("../models/User");
const {
  sendApprovalEmail,
  sendRejectionEmail,
} = require("../utils/emailService");
const fs = require("fs");
const path = require("path");

// Get all architect requests
exports.getArchitectRequests = async (req, res) => {
  try {
    const requests = await User.find({
      role: "architect",
      status: "pending",
    }).select("-password -authTokens");

    console.log(`Retrieved ${requests.length} pending architect requests`);
    res.json(requests);
  } catch (error) {
    console.error("Error fetching architect requests:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get detailed architect information by ID
exports.getArchitectDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the architect by ID, ensuring they have the architect role
    const architect = await User.findOne({
      _id: id,
      role: "architect",
    }).select("-password -authTokens");

    if (!architect) {
      return res.status(404).json({ error: "Architect not found" });
    }

    // Return the architect data including file paths
    res.json({
      message: "Architect details retrieved successfully",
      architect,
    });
  } catch (error) {
    console.error("Error fetching architect details:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get architect document file (patent PDF or CIN image)
exports.getArchitectDocument = async (req, res) => {
  const { id, docType } = req.params;

  if (!["patenteFile", "cinFile"].includes(docType)) {
    return res.status(400).json({ error: "Invalid document type requested" });
  }

  try {
    // Find the architect by ID
    const architect = await User.findOne({
      _id: id,
      role: "architect",
    }).select(docType);

    if (!architect) {
      return res.status(404).json({ error: "Architect not found" });
    }

    const filePath = architect[docType];

    if (!filePath) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Resolve the absolute path to the file
    // Assuming files are stored in a 'uploads' directory relative to the project root
    const absolutePath = path.resolve(process.cwd(), filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream"; // Default content type

    if (ext === ".pdf") {
      contentType = "application/pdf";
    } else if ([".jpg", ".jpeg"].includes(ext)) {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    }

    // Set content type header and send file
    res.setHeader("Content-Type", contentType);
    res.sendFile(absolutePath);
  } catch (error) {
    console.error(`Error retrieving ${docType}:`, error);
    res
      .status(500)
      .json({ error: "Failed to retrieve document", details: error.message });
  }
};

// Approve or reject architect
exports.updateArchitectStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason, customReason } = req.body;

  console.log(`Updating architect ${id} status to: ${status}`);

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  // Validate rejection reason if status is rejected
  if (status === "rejected" && !rejectionReason) {
    return res.status(400).json({ error: "Rejection reason is required" });
  }

  try {
    // Prepare update data
    const updateData = { status };

    // Add rejection details if applicable
    if (status === "rejected") {
      updateData.rejectionDetails = {
        reason: rejectionReason,
        customReason: customReason || "",
        rejectedAt: new Date(),
      };
    }

    // Find and update using the base User model with role filter
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: id,
        role: "architect",
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -authTokens");

    if (!updatedUser) {
      console.log(`Architect with ID ${id} not found or not an architect`);
      return res.status(404).json({ error: "Architect not found" });
    }

    // Send appropriate email notification
    let emailResult = { success: false };

    if (status === "approved") {
      console.log(`Sending approval email to architect: ${updatedUser.email}`);
      emailResult = await sendApprovalEmail(updatedUser);
    } else if (status === "rejected") {
      console.log(`Sending rejection email to architect: ${updatedUser.email}`);
      emailResult = await sendRejectionEmail(updatedUser);
    }

    if (!emailResult.success) {
      console.warn(
        `Email notification failed: ${JSON.stringify(emailResult.error)}`
      );
    } else {
      console.log(
        `${
          status === "approved" ? "Approval" : "Rejection"
        } email sent successfully to ${updatedUser.email}`
      );
    }

    res.json({
      message: `Architect status updated to ${status}`,
      user: updatedUser,
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      error: "Failed to update architect status",
      details: error.message,
    });
  }
};

// Get architect statistics for admin dashboard
exports.getArchitectStats = async (req, res) => {
  try {
    // Get counts for each status
    const [pending, approved, rejected] = await Promise.all([
      User.countDocuments({ role: "architect", status: "pending" }),
      User.countDocuments({ role: "architect", status: "approved" }),
      User.countDocuments({ role: "architect", status: "rejected" }),
    ]);

    // Get rejection reason statistics
    const rejectionReasons = await User.aggregate([
      {
        $match: {
          role: "architect",
          status: "rejected",
          "rejectionDetails.reason": { $exists: true },
        },
      },
      { $group: { _id: "$rejectionDetails.reason", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Convert to a more readable format
    const formattedReasons = rejectionReasons.map((reason) => ({
      reason: reason._id,
      count: reason.count,
    }));

    res.json({
      total: pending + approved + rejected,
      pending,
      approved,
      rejected,
      rejectionReasons: formattedReasons,
    });
  } catch (error) {
    console.error("Error fetching architect statistics:", error);
    res.status(500).json({ message: error.message });
  }
};
