const User = require("../models/User");
const { sendApprovalEmail } = require("../utils/emailService");

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

// Approve or reject architect
exports.updateArchitectStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`Updating architect ${id} status to: ${status}`);

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    // Find and update using the base User model with role filter
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: id,
        role: "architect",
      },
      { status },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -authTokens");

    if (!updatedUser) {
      console.log(`Architect with ID ${id} not found or not an architect`);
      return res.status(404).json({ error: "Architect not found" });
    }

    // Send email notification if status is approved
    if (status === "approved") {
      console.log(`Sending approval email to architect: ${updatedUser.email}`);
      try {
        const emailResult = await sendApprovalEmail(updatedUser);

        if (!emailResult.success) {
          console.warn(
            `Email notification failed: ${JSON.stringify(emailResult.error)}`
          );
        } else {
          console.log(
            `Approval email sent successfully to ${updatedUser.email}`
          );
        }
      } catch (emailError) {
        console.error("Error sending approval email:", emailError);
        // Continue with the response - we don't want to fail the status update if email fails
      }
    }

    res.json({
      message: `Architect status updated to ${status}`,
      user: updatedUser,
      emailSent: status === "approved" ? true : undefined,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      error: "Failed to update architect status",
      details: error.message,
    });
  }
};
