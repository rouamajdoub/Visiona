const ArchitectClient = require("../models/Arch_Clients");
const Project = require("../models/Project");
const User = require("../models/User");

/**
 * Get comprehensive statistics for an architect dashboard
 * Shows monthly growth metrics for clients, projects, and profile views
 * @param {*} req
 * @param {*} res
 */
const getArchitectStats = async (req, res) => {
  try {
    const { id } = req.params;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Security check: Ensure architects can only view their own stats
    if (req.user.role === "architect" && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        error: "Vous n'avez pas la permission d'accéder à ces statistiques",
      });
    }

    // Get architect to verify existence and access profile view data
    const architect = await User.findById(id);
    if (!architect || architect.__t !== "architect") {
      return res.status(404).json({
        success: false,
        error: "Architecte non trouvé",
      });
    }

    // Initialize response object with all monthly data points
    const response = {
      clientGrowth: {
        monthlyData: initializeMonthlyData(),
        percentageChange: 0,
        currentMonthCount: 0,
        previousMonthCount: 0,
      },
      activeProjects: {
        monthlyData: initializeMonthlyData(),
        percentageChange: 0,
        currentMonthCount: 0,
        previousMonthCount: 0,
      },
      profileViews: {
        monthlyData: initializeMonthlyData(),
        percentageChange: 0,
        currentMonthCount: 0,
        previousMonthCount: 0,
      },
    };

    // 1. Process Client Growth Statistics
    await processClientGrowth(id, currentYear, response);

    // 2. Process Active Projects Statistics
    await processActiveProjects(id, currentYear, response);

    // 3. Process Profile Views Statistics
    processProfileViews(architect, currentYear, response);

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error getting architect stats:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur lors de la récupération des statistiques",
    });
  }
};

/**
 * Process client growth statistics by month
 */
const processClientGrowth = async (architectId, currentYear, response) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  // Get all clients for this architect
  const clients = await ArchitectClient.find({
    architect: architectId,
    createdAt: {
      $gte: new Date(currentYear, 0, 1), // Start of current year
      $lte: new Date(currentYear, 11, 31, 23, 59, 59), // End of current year
    },
  });

  // Group clients by month
  clients.forEach((client) => {
    const clientMonth = client.createdAt.getMonth();
    response.clientGrowth.monthlyData[clientMonth].count++;
  });

  // Calculate percentage change
  response.clientGrowth.currentMonthCount =
    response.clientGrowth.monthlyData[currentMonth].count;
  response.clientGrowth.previousMonthCount =
    currentMonth > 0
      ? response.clientGrowth.monthlyData[currentMonth - 1].count
      : 0;

  if (response.clientGrowth.previousMonthCount > 0) {
    response.clientGrowth.percentageChange = calculatePercentageChange(
      response.clientGrowth.currentMonthCount,
      response.clientGrowth.previousMonthCount
    );
  }
};

/**
 * Process active projects statistics by month
 */
const processActiveProjects = async (architectId, currentYear, response) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  // For each month, find projects that were active during that month
  for (let month = 0; month <= currentMonth; month++) {
    const startOfMonth = new Date(currentYear, month, 1);
    const endOfMonth = new Date(currentYear, month + 1, 0, 23, 59, 59);

    // A project is considered active in a month if:
    // 1. It was in "in_progress" status during that month
    // 2. It was created before the end of the month
    // 3. It was either completed after the start of the month or is still in progress
    const activeProjectsCount = await Project.countDocuments({
      architectId: architectId,
      status: "in_progress",
      createdAt: { $lte: endOfMonth },
      $or: [{ actualEndDate: { $gte: startOfMonth } }, { actualEndDate: null }],
    });

    response.activeProjects.monthlyData[month].count = activeProjectsCount;
  }

  // Calculate percentage change
  response.activeProjects.currentMonthCount =
    response.activeProjects.monthlyData[currentMonth].count;
  response.activeProjects.previousMonthCount =
    currentMonth > 0
      ? response.activeProjects.monthlyData[currentMonth - 1].count
      : 0;

  response.activeProjects.percentageChange = calculatePercentageChange(
    response.activeProjects.currentMonthCount,
    response.activeProjects.previousMonthCount
  );
};

/**
 * Process profile views statistics by month
 */
const processProfileViews = (architect, currentYear, response) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();

  // Use the architect's profileViewsTimestamps to calculate monthly views
  if (
    architect.profileViewsTimestamps &&
    architect.profileViewsTimestamps.length > 0
  ) {
    architect.profileViewsTimestamps.forEach((timestamp) => {
      if (timestamp.getFullYear() === currentYear) {
        const viewMonth = timestamp.getMonth();
        response.profileViews.monthlyData[viewMonth].count++;
      }
    });
  }

  // Calculate percentage change
  response.profileViews.currentMonthCount =
    response.profileViews.monthlyData[currentMonth].count;
  response.profileViews.previousMonthCount =
    currentMonth > 0
      ? response.profileViews.monthlyData[currentMonth - 1].count
      : 0;

  response.profileViews.percentageChange = calculatePercentageChange(
    response.profileViews.currentMonthCount,
    response.profileViews.previousMonthCount
  );
};

/**
 * Initialize an array with data structures for all 12 months
 */
const initializeMonthlyData = () => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return months.map((month, index) => ({
    month,
    index,
    count: 0,
  }));
};

/**
 * Calculate percentage change between current and previous values
 */
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0; // If previous was 0, and current is positive, that's a 100% increase
  }

  return Math.round(((current - previous) / previous) * 100);
};

module.exports = {
  getArchitectStats,
};
