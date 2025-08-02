const User = require("../models/user.model")
const Photographer = require("../models/photographer.model")
const Booking = require("../models/booking.model")
const Review = require("../models/review.model")
const Setting = require("../models/setting.model")

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments()

    // Get total photographers
    const totalPhotographers = await Photographer.countDocuments()

    // Get total bookings
    const totalBookings = await Booking.countDocuments()

    // Get recent bookings with proper population and null checks
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage",
        },
      })
      .lean()

    // Filter and format recent bookings, handling null values
    const formattedRecentBookings = recentBookings
      .filter(booking => booking.clientId && booking.photographerId && booking.photographerId.userId)
      .map((booking) => ({
        _id: booking._id,
        clientName: booking.clientId.username || "Unknown Client",
        clientEmail: booking.clientId.email || "",
        clientImage: booking.clientId.profileImage || null,
        photographerName: booking.photographerId.userId.username || "Unknown Photographer",
        photographerEmail: booking.photographerId.userId.email || "",
        photographerImage: booking.photographerId.userId.profileImage || null,
        service: booking.service || "Unknown Service",
        date: booking.date,
        status: booking.status,
        price: booking.price || 0,
        location: booking.location || "Not specified",
        createdAt: booking.createdAt,
      }))

    // Calculate total revenue from completed bookings
    const completedBookings = await Booking.find({ 
      status: { $in: ["completed"] } 
    }).select("price")
    
    const revenue = completedBookings.reduce((total, booking) => total + (booking.price || 0), 0)

    // Get monthly stats for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ])

    // Get booking status distribution
    const statusStats = await Booking.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ])

    // Get top photographers by bookings
    const topPhotographers = await Booking.aggregate([
      {
        $group: {
          _id: "$photographerId",
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $lookup: {
          from: "photographers",
          localField: "_id",
          foreignField: "_id",
          as: "photographer"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "photographer.userId",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $match: {
          "photographer.0": { $exists: true },
          "user.0": { $exists: true }
        }
      },
      {
        $project: {
          totalBookings: 1,
          totalRevenue: 1,
          completedBookings: 1,
          photographerName: { $arrayElemAt: ["$user.username", 0] },
          photographerEmail: { $arrayElemAt: ["$user.email", 0] },
          photographerImage: { $arrayElemAt: ["$user.profileImage", 0] },
          specialization: { $arrayElemAt: ["$photographer.specialization", 0] },
          rating: { $arrayElemAt: ["$photographer.rating", 0] }
        }
      },
      {
        $sort: { totalBookings: -1 }
      },
      {
        $limit: 5
      }
    ])

    // Get recent reviews
    const recentReviews = await Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("clientId", "username profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username profileImage"
        }
      })
      .lean()

    const formattedRecentReviews = recentReviews
      .filter(review => review.clientId && review.photographerId && review.photographerId.userId)
      .map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        clientName: review.clientId.username,
        clientImage: review.clientId.profileImage,
        photographerName: review.photographerId.userId.username,
        photographerImage: review.photographerId.userId.profileImage,
        createdAt: review.createdAt
      }))

    res.status(200).json({
      totalUsers,
      totalPhotographers,
      totalBookings,
      revenue,
      recentBookings: formattedRecentBookings,
      monthlyStats,
      statusStats,
      topPhotographers,
      recentReviews: formattedRecentReviews,
      summary: {
        pendingBookings: await Booking.countDocuments({ status: "pending" }),
        confirmedBookings: await Booking.countDocuments({ status: "confirmed" }),
        completedBookings: await Booking.countDocuments({ status: "completed" }),
        cancelledBookings: await Booking.countDocuments({ status: "cancelled" }),
        totalReviews: await Review.countDocuments(),
        averageRating: await Review.aggregate([
          { $group: { _id: null, avgRating: { $avg: "$rating" } } }
        ]).then(result => result[0]?.avgRating || 0)
      }
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ message: "Server error while fetching dashboard stats" })
  }
}

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean()
    
    res.status(200).json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error while fetching users" })
  }
}

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    res.status(200).json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Server error while fetching user" })
  }
}

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body
    
    // Remove password from update data for security
    delete updateData.password
    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password")
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }
    
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Server error while updating user" })
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if user exists
    const user = await User.findById(id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    
    // If user is a photographer, also delete photographer profile
    if (user.role === "photographer") {
      await Photographer.findOneAndDelete({ userId: id })
    }
    
    // Delete user bookings
    await Booking.deleteMany({ 
      $or: [
        { clientId: id },
        { photographerId: { $in: await Photographer.find({ userId: id }).select("_id") } }
      ]
    })
    
    // Delete user reviews
    await Review.deleteMany({ clientId: id })
    
    // Delete the user
    await User.findByIdAndDelete(id)
    
    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Server error while deleting user" })
  }
}

// Photographer Management
exports.getAllPhotographers = async (req, res) => {
  try {
    const photographers = await Photographer.find()
      .populate("userId", "username email profileImage phone address createdAt")
      .sort({ createdAt: -1 })
      .lean()
    
    res.status(200).json(photographers)
  } catch (error) {
    console.error("Error fetching photographers:", error)
    res.status(500).json({ message: "Server error while fetching photographers" })
  }
}

exports.updatePhotographerFeatured = async (req, res) => {
  try {
    const { id } = req.params
    const { featured } = req.body
    
    const photographer = await Photographer.findByIdAndUpdate(
      id,
      { featured: featured },
      { new: true }
    ).populate("userId", "username email profileImage")
    
    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }
    
    res.status(200).json({
      message: `Photographer ${featured ? "featured" : "unfeatured"} successfully`,
      photographer
    })
  } catch (error) {
    console.error("Error updating photographer featured status:", error)
    res.status(500).json({ message: "Server error while updating photographer" })
  }
}

exports.deletePhotographer = async (req, res) => {
  try {
    const { id } = req.params
    
    // Find photographer and get userId
    const photographer = await Photographer.findById(id)
    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }
    
    // Delete related bookings
    await Booking.deleteMany({ photographerId: id })
    
    // Delete related reviews
    await Review.deleteMany({ photographerId: id })
    
    // Delete photographer profile
    await Photographer.findByIdAndDelete(id)
    
    // Delete user account
    await User.findByIdAndDelete(photographer.userId)
    
    res.status(200).json({ message: "Photographer deleted successfully" })
  } catch (error) {
    console.error("Error deleting photographer:", error)
    res.status(500).json({ message: "Server error while deleting photographer" })
  }
}

// Booking Management
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage"
        }
      })
      .sort({ createdAt: -1 })
      .lean()
    
    // Filter out bookings with null references
    const validBookings = bookings.filter(booking => 
      booking.clientId && booking.photographerId && booking.photographerId.userId
    )
    
    res.status(200).json(validBookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    res.status(500).json({ message: "Server error while fetching bookings" })
  }
}

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("clientId", "username email")
     .populate({
       path: "photographerId",
       populate: {
         path: "userId",
         select: "username email"
       }
     })
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    
    res.status(200).json({
      message: "Booking status updated successfully",
      booking
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ message: "Server error while updating booking" })
  }
}

exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params
    
    const booking = await Booking.findByIdAndDelete(id)
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }
    
    res.status(200).json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    res.status(500).json({ message: "Server error while deleting booking" })
  }
}

// Settings Management
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne()
    
    if (!settings) {
      // Create default settings if none exist
      settings = new Setting({
        siteName: "Doctrine Girls Studio",
        siteDescription: "Professional Photography Services",
        contactEmail: "contact@doctrinegirls.com",
        contactPhone: "+1234567890",
        address: "123 Photography St, City, State 12345",
        socialLinks: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: ""
        },
        bookingSettings: {
          requireApproval: true,
          allowCancellation: true,
          cancellationDeadline: 24,
          maxAdvanceBooking: 90
        },
        emailNotifications: {
          adminNewBooking: true,
          adminBookingCancellation: true,
          clientBookingConfirmation: true,
          clientBookingReminder: true,
          photographerNewBooking: true
        }
      })
      await settings.save()
    }
    
    res.status(200).json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    res.status(500).json({ message: "Server error while fetching settings" })
  }
}

exports.updateSettings = async (req, res) => {
  try {
    const settingsData = req.body
    
    let settings = await Setting.findOne()
    
    if (!settings) {
      settings = new Setting(settingsData)
    } else {
      // Update existing settings
      Object.keys(settingsData).forEach((key) => {
        settings[key] = settingsData[key]
      })
    }
    
    await settings.save()
    
    res.status(200).json({
      message: "Settings updated successfully",
      settings
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    res.status(500).json({ message: "Server error while updating settings" })
  }
}

// Analytics and Reports
exports.getAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query
    
    let dateRange = new Date()
    switch (period) {
      case 'week':
        dateRange.setDate(dateRange.getDate() - 7)
        break
      case 'month':
        dateRange.setMonth(dateRange.getMonth() - 1)
        break
      case 'year':
        dateRange.setFullYear(dateRange.getFullYear() - 1)
        break
      default:
        dateRange.setMonth(dateRange.getMonth() - 1)
    }
    
    const analytics = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: "$price" },
          completedBookings: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ])
    
    res.status(200).json(analytics)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ message: "Server error while fetching analytics" })
  }
}

module.exports = {
  getDashboardStats: exports.getDashboardStats,
  getAllUsers: exports.getAllUsers,
  getUserById: exports.getUserById,
  updateUser: exports.updateUser,
  deleteUser: exports.deleteUser,
  getAllPhotographers: exports.getAllPhotographers,
  updatePhotographerFeatured: exports.updatePhotographerFeatured,
  deletePhotographer: exports.deletePhotographer,
  getAllBookings: exports.getAllBookings,
  updateBookingStatus: exports.updateBookingStatus,
  deleteBooking: exports.deleteBooking,
  getSettings: exports.getSettings,
  updateSettings: exports.updateSettings,
  getAnalytics: exports.getAnalytics
}
