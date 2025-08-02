const express = require("express")
const router = express.Router()
const bookingController = require("../controllers/booking.controller")

// Create a new booking
router.post("/", bookingController.createBooking)

// Get all bookings
router.get("/", bookingController.getAllBookings)

// Get booking by ID
router.get("/:id", bookingController.getBookingById)

// Get bookings by client ID
router.get("/client/:clientId", bookingController.getBookingsByClient)

// Get bookings by photographer ID
router.get("/photographer/:photographerId", bookingController.getBookingsByPhotographer)

// Update booking status
router.put("/:id/status", bookingController.updateBookingStatus)

// Update booking details
router.put("/:id", bookingController.updateBooking)

// Delete booking
router.delete("/:id", bookingController.deleteBooking)

module.exports = router
