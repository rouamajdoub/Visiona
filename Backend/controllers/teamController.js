const Team = require('../models/Team');
const User = require('../models/User');
const Project = require('../models/Project');
const OneSignal = require('onesignal-node');

// Initialize OneSignal client
const client = new OneSignal.Client(process.env.ONESIGNAL_APP_ID, process.env.ONESIGNAL_API_KEY);

// Helper function to send notifications
const sendNotification = async (userIds, title, message, data = {}) => {
  try {
    const notification = {
      contents: { en: message },
      headings: { en: title },
      include_external_user_ids: userIds,
      data: data
    };
    
    await client.createNotification(notification);
  } catch (error) {
    console.error('OneSignal notification error:', error);
  }
};

// Create a new team
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user.id;

    // Check if user is an architect
    if (req.user.role !== 'architect') {
      return res.status(403).json({
        success: false,
        message: 'Only architects can create teams'
      });
    }

    // Check if team name already exists for this architect
    const existingTeam = await Team.findOne({ name, createdBy });
    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: 'Team name already exists'
      });
    }

    const team = new Team({
      name,
      description,
      createdBy
    });

    await team.save();
    await team.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating team',
      error: error.message
    });
  }
};

// Get team by ID
const getTeamById = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .populate('assignedProjects', 'name description status');

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user has access to this team
    if (!team.isOwner(userId) && !team.isMember(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching team',
      error: error.message
    });
  }
};

// Get all teams for current user
const getTeams = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { createdBy: userId },
        { 'members.user': userId }
      ],
      isActive: true
    };

    const teams = await Team.find(query)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Team.countDocuments(query);

    res.json({
      success: true,
      data: teams,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching teams',
      error: error.message
    });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team owner
    if (!team.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can update team'
      });
    }

    // Check if new name conflicts with existing teams
    if (name && name !== team.name) {
      const existingTeam = await Team.findOne({ name, createdBy: userId, _id: { $ne: teamId } });
      if (existingTeam) {
        return res.status(400).json({
          success: false,
          message: 'Team name already exists'
        });
      }
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      teamId,
      { name, description },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('members.user', 'name email');

    // Notify team members about the update
    const memberIds = updatedTeam.members.map(member => member.user._id.toString());
    if (memberIds.length > 0) {
      await sendNotification(
        memberIds,
        'Team Updated',
        `Team "${updatedTeam.name}" has been updated`,
        { type: 'team_updated', teamId: updatedTeam._id }
      );
    }

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating team',
      error: error.message
    });
  }
};

// Delete team (soft delete)
const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId).populate('members.user', 'name email');
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team owner
    if (!team.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can delete team'
      });
    }

    // Soft delete - set isActive to false
    team.isActive = false;
    await team.save();

    // Notify team members about deletion
    const memberIds = team.members.map(member => member.user._id.toString());
    if (memberIds.length > 0) {
      await sendNotification(
        memberIds,
        'Team Deleted',
        `Team "${team.name}" has been deleted`,
        { type: 'team_deleted', teamId: team._id }
      );
    }

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting team',
      error: error.message
    });
  }
};

// Add member to team
const addMember = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { userId: memberUserId, role = 'collaborator' } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team owner
    if (!team.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can add members'
      });
    }

    // Check if user exists
    const memberUser = await User.findById(memberUserId);
    if (!memberUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already a member
    if (team.isMember(memberUserId)) {
      return res.status(400).json({
        success: false,
        message: 'User is already a team member'
      });
    }

    // Add member to team
    team.members.push({
      user: memberUserId,
      role: role
    });

    await team.save();
    await team.populate('members.user', 'name email');

    // Send notification to new member
    await sendNotification(
      [memberUserId],
      'Added to Team',
      `You have been added to team "${team.name}"`,
      { type: 'team_member_added', teamId: team._id }
    );

    res.json({
      success: true,
      message: 'Member added successfully',
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding member',
      error: error.message
    });
  }
};

// Remove member from team
const removeMember = async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team owner
    if (!team.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can remove members'
      });
    }

    // Check if member exists in team
    const memberIndex = team.members.findIndex(member => member.user.toString() === memberId);
    if (memberIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Member not found in team'
      });
    }

    // Remove member
    team.members.splice(memberIndex, 1);
    await team.save();

    // Send notification to removed member
    await sendNotification(
      [memberId],
      'Removed from Team',
      `You have been removed from team "${team.name}"`,
      { type: 'team_member_removed', teamId: team._id }
    );

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing member',
      error: error.message
    });
  }
};

// Assign project to team
const assignProject = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { projectId } = req.body;
    const userId = req.user.id;

    const team = await Team.findById(teamId).populate('members.user', 'name email');
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team owner
    if (!team.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can assign projects'
      });
    }

    // Check if project exists and belongs to the architect
    const project = await Project.findOne({ _id: projectId, createdBy: userId });
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    // Check if project is already assigned to team
    if (team.assignedProjects.includes(projectId)) {
      return res.status(400).json({
        success: false,
        message: 'Project is already assigned to this team'
      });
    }

    // Assign project to team
    team.assignedProjects.push(projectId);
    await team.save();

    // Notify team members about project assignment
    const memberIds = team.members.map(member => member.user._id.toString());
    if (memberIds.length > 0) {
      await sendNotification(
        memberIds,
        'New Project Assigned',
        `Project "${project.name}" has been assigned to team "${team.name}"`,
        { 
          type: 'project_assigned', 
          teamId: team._id, 
          projectId: project._id 
        }
      );
    }

    res.json({
      success: true,
      message: 'Project assigned successfully',
      data: team
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error assigning project',
      error: error.message
    });
  }
};

// Remove project from team
const removeProject = async (req, res) => {
  try {
    const { teamId, projectId } = req.params;
    const userId = req.user.id;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Team not found'
      });
    }

    // Check if user is team owner
    if (!team.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Only team owner can remove projects'
      });
    }

    // Remove project from team
    team.assignedProjects = team.assignedProjects.filter(
      project => project.toString() !== projectId
    );
    
    await team.save();

    res.json({
      success: true,
      message: 'Project removed from team successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing project',
      error: error.message
    });
  }
};

module.exports = {
  createTeam,
  getTeamById,
  getTeams,
  updateTeam,
  deleteTeam,
  addMember,
  removeMember,
  assignProject,
  removeProject
};