const User = require("../models/User");

// Get architects locations for clients
const getArchitectsLocations = async (req, res) => {
  try {
    const architects = await User.find(
      {
        role: "architect",
        "location.coordinates.coordinates": { $exists: true, $ne: [] },
      },
      {
        _id: 1,
        pseudo: 1,
        nomDeFamille: 1,
        prenom: 1,
        profilePicture: 1,
        phoneNumber: 1,
        email: 1,
        location: 1,
      }
    );

    const architectsWithCoordinates = architects.map((architect) => ({
      id: architect._id,
      name:
        `${architect.prenom || ""} ${architect.nomDeFamille || ""}`.trim() ||
        architect.pseudo,
      email: architect.email,
      phone: architect.phoneNumber,
      profilePicture: architect.profilePicture,
      coordinates: architect.location.coordinates.coordinates,
      region: architect.location.region,
      country: architect.location.country,
    }));

    res.status(200).json({
      success: true,
      architects: architectsWithCoordinates,
    });
  } catch (error) {
    console.error("Error fetching architects locations:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching architects locations",
    });
  }
};

// Get all users locations and stats for admin
const getUsersLocationStats = async (req, res) => {
  try {
    // Get all users with locations
    const users = await User.find(
      {
        "location.coordinates.coordinates": { $exists: true, $ne: [] },
      },
      {
        _id: 1,
        pseudo: 1,
        nomDeFamille: 1,
        prenom: 1,
        email: 1,
        role: 1,
        location: 1,
        createdAt: 1,
      }
    );

    // Prepare user data for map
    const usersForMap = users.map((user) => ({
      id: user._id,
      name:
        `${user.prenom || ""} ${user.nomDeFamille || ""}`.trim() || user.pseudo,
      email: user.email,
      role: user.role,
      coordinates: user.location.coordinates.coordinates,
      region: user.location.region,
      country: user.location.country,
      joinedAt: user.createdAt,
    }));

    // Calculate regional statistics
    const regionStats = {};
    const roleStats = { client: 0, architect: 0, admin: 0 };
    let totalUsers = users.length;

    users.forEach((user) => {
      const region = user.location.region || "Unknown";

      // Count by region
      if (!regionStats[region]) {
        regionStats[region] = {
          count: 0,
          clients: 0,
          architects: 0,
          admins: 0,
        };
      }
      regionStats[region].count++;
      regionStats[region][`${user.role}s`]++;

      // Count by role
      roleStats[user.role]++;
    });

    // Convert to percentage and format for frontend
    const regionPercentages = Object.keys(regionStats)
      .map((region) => ({
        region,
        count: regionStats[region].count,
        percentage: ((regionStats[region].count / totalUsers) * 100).toFixed(1),
        clients: regionStats[region].clients,
        architects: regionStats[region].architects,
        admins: regionStats[region].admins,
      }))
      .sort((a, b) => b.count - a.count);

    // Geo data for Nivo Geo chart (Tunisia regions)
    const geoData = regionPercentages.map((item) => ({
      id: item.region,
      value: item.count,
      percentage: item.percentage,
    }));

    res.status(200).json({
      success: true,
      data: {
        users: usersForMap,
        totalUsers,
        regionStats: regionPercentages,
        roleStats: {
          clients: roleStats.client,
          architects: roleStats.architect,
          admins: roleStats.admin,
        },
        geoData,
        summary: {
          totalUsersWithLocation: totalUsers,
          topRegion: regionPercentages[0] || null,
          regionsCount: regionPercentages.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users location stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users location statistics",
    });
  }
};

// Get nearby architects (for clients)
const getNearbyArchitects = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 50000 } = req.query; // maxDistance in meters

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: "Longitude and latitude are required",
      });
    }

    const nearbyArchitects = await User.find(
      {
        role: "architect",
        "location.coordinates": {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)],
            },
            $maxDistance: parseInt(maxDistance),
          },
        },
      },
      {
        _id: 1,
        pseudo: 1,
        nomDeFamille: 1,
        prenom: 1,
        profilePicture: 1,
        phoneNumber: 1,
        email: 1,
        location: 1,
      }
    );

    const architectsData = nearbyArchitects.map((architect) => ({
      id: architect._id,
      name:
        `${architect.prenom || ""} ${architect.nomDeFamille || ""}`.trim() ||
        architect.pseudo,
      email: architect.email,
      phone: architect.phoneNumber,
      profilePicture: architect.profilePicture,
      coordinates: architect.location.coordinates.coordinates,
      region: architect.location.region,
      country: architect.location.country,
    }));

    res.status(200).json({
      success: true,
      architects: architectsData,
      count: architectsData.length,
    });
  } catch (error) {
    console.error("Error fetching nearby architects:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby architects",
    });
  }
};

module.exports = {
  getArchitectsLocations,
  getUsersLocationStats,
  getNearbyArchitects,
};
