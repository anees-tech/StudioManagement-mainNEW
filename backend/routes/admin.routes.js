const express = require("express")
const router = express.Router()
const adminController = require("../controllers/admin.controller")

// Dashboard stats
router.get("/stats", adminController.getDashboardStats)
router.get("/analytics", adminController.getAnalytics)

// User management
router.get("/users", adminController.getAllUsers)
router.get("/users/:id", adminController.getUserById)
router.put("/users/:id", adminController.updateUser)
router.delete("/users/:id", adminController.deleteUser)

// Photographer management
router.get("/photographers", adminController.getAllPhotographers)
router.put("/photographers/:id/featured", adminController.updatePhotographerFeatured)
router.delete("/photographers/:id", adminController.deletePhotographer)

// Booking management
router.get("/bookings", adminController.getAllBookings)
router.put("/bookings/:id/status", adminController.updateBookingStatus)
router.delete("/bookings/:id", adminController.deleteBooking)

// Testimonials management (proxy to testimonial routes)
router.get("/testimonials", (req, res, next) => {
  req.url = "/testimonials"
  next()
})

// Settings management
router.get("/settings", adminController.getSettings)
router.put("/settings", adminController.updateSettings)

module.exports = router
