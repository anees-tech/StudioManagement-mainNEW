const Booking = require("../models/booking.model")
const User = require("../models/user.model")
const Photographer = require("../models/photographer.model")

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    console.log("Received booking data:", req.body) // Debug log

    const {
      clientId,
      photographerId,
      service,
      date,
      time,
      duration,
      location,
      specialRequests,
      contactInfo,
      totalAmount
    } = req.body

    // Validate required fields
    if (!clientId || !photographerId || !service || !date || !time || !duration || !location) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["clientId", "photographerId", "service", "date", "time", "duration", "location"]
      })
    }

    // Check if client exists
    const client = await User.findById(clientId)
    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    // Check if photographer exists
    const photographer = await Photographer.findById(photographerId)
    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    // Calculate end time based on start time and duration
    const startTime = time
    const startHour = parseInt(time.split(':')[0])
    const endHour = startHour + duration
    const endTime = `${endHour.toString().padStart(2, '0')}:00`

    // Calculate price if not provided
    let finalPrice = totalAmount || 0
    if (finalPrice === 0 && photographer.pricing) {
      const servicePrice = photographer.pricing.find(p => p.service === service)
      if (servicePrice) {
        finalPrice = servicePrice.price * (duration / 2) // Assuming 2-hour base rate
      }
    }

    // Create new booking
    const newBooking = new Booking({
      clientId,
      photographerId,
      service,
      date: new Date(date),
      timeSlot: {
        start: startTime,
        end: endTime,
      },
      duration,
      location,
      notes: specialRequests || "",
      contactInfo: {
        phone: contactInfo.phone,
        email: contactInfo.email,
      },
      price: finalPrice,
      status: "pending",
    })

    console.log("Creating booking:", newBooking) // Debug log

    await newBooking.save()

    // Populate the booking with client and photographer details
    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("clientId", "username email")
      .populate("photographerId")

    console.log("Booking created successfully:", populatedBooking._id) // Debug log

    res.status(201).json({
      message: "Booking created successfully",
      booking: populatedBooking,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    res.status(500).json({ 
      message: "Server error while creating booking",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
}

// Get all bookings
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("clientId", "username email")
      .populate("photographerId")
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    res.status(500).json({ message: "Server error while fetching bookings" })
  }
}

// Get bookings by client ID
exports.getBookingsByClient = async (req, res) => {
  try {
    const { clientId } = req.params

    const bookings = await Booking.find({ clientId })
      .populate("photographerId")
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    console.error("Error fetching client bookings:", error)
    res.status(500).json({ message: "Server error while fetching client bookings" })
  }
}

// Get bookings by photographer ID
exports.getBookingsByPhotographer = async (req, res) => {
  try {
    const { photographerId } = req.params

    const bookings = await Booking.find({ photographerId })
      .populate("clientId", "username email")
      .sort({ createdAt: -1 })

    res.status(200).json(bookings)
  } catch (error) {
    console.error("Error fetching photographer bookings:", error)
    res.status(500).json({ message: "Server error while fetching photographer bookings" })
  }
}

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Update booking status
    booking.status = status
    await booking.save()

    // If booking is confirmed or completed, update photographer availability
    if (status === "confirmed" || status === "completed") {
      const photographer = await Photographer.findById(booking.photographerId)
      if (photographer) {
        // Find the availability for the booking date
        const availabilityIndex = photographer.availability.findIndex(
          (avail) => new Date(avail.date).toDateString() === new Date(booking.date).toDateString()
        )

        if (availabilityIndex !== -1) {
          // Find the time slot and mark it as booked
          const timeSlotIndex = photographer.availability[availabilityIndex].timeSlots.findIndex(
            (slot) => slot.start === booking.timeSlot?.start && slot.end === booking.timeSlot?.end
          )

          if (timeSlotIndex !== -1) {
            photographer.availability[availabilityIndex].timeSlots[timeSlotIndex].isBooked = status === "confirmed" || status === "completed"
            await photographer.save()
          }
        }
      }
    }

    // Populate the updated booking
    const updatedBooking = await Booking.findById(id)
      .populate("clientId", "username email")
      .populate("photographerId")

    res.status(200).json({
      message: "Booking status updated successfully",
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ message: "Server error while updating booking status" })
  }
}

// Update booking details
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    )
      .populate("clientId", "username email")
      .populate("photographerId")

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    })
  } catch (error) {
    console.error("Error updating booking:", error)
    res.status(500).json({ message: "Server error while updating booking" })
  }
}

// Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params

    const booking = await Booking.findById(id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // If booking was confirmed, free up the time slot
    if (booking.status === "confirmed") {
      const photographer = await Photographer.findById(booking.photographerId)
      if (photographer) {
        const availabilityIndex = photographer.availability.findIndex(
          (avail) => new Date(avail.date).toDateString() === new Date(booking.date).toDateString()
        )

        if (availabilityIndex !== -1) {
          const timeSlotIndex = photographer.availability[availabilityIndex].timeSlots.findIndex(
            (slot) => slot.start === booking.timeSlot?.start && slot.end === booking.timeSlot?.end
          )

          if (timeSlotIndex !== -1) {
            photographer.availability[availabilityIndex].timeSlots[timeSlotIndex].isBooked = false
            await photographer.save()
          }
        }
      }
    }

    await Booking.findByIdAndDelete(id)

    res.status(200).json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    res.status(500).json({ message: "Server error while deleting booking" })
  }
}

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params

    const booking = await Booking.findById(id)
      .populate("clientId", "username email")
      .populate("photographerId")

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    res.status(200).json(booking)
  } catch (error) {
    console.error("Error fetching booking:", error)
    res.status(500).json({ message: "Server error while fetching booking" })
  }
}
