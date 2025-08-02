const Review = require("../models/review.model")
const User = require("../models/user.model")
const Photographer = require("../models/photographer.model")
const Booking = require("../models/booking.model")
const mongoose = require("mongoose")

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { clientId, photographerId, bookingId, rating, title, comment, serviceType } = req.body

    // Validate required fields
    if (!clientId || !photographerId || !rating || !title || !comment) {
      return res.status(400).json({ 
        message: "Missing required fields",
        required: ["clientId", "photographerId", "rating", "title", "comment"]
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

    // Check if review already exists for this booking (if bookingId provided)
    if (bookingId) {
      const existingReview = await Review.findOne({ bookingId })
      if (existingReview) {
        return res.status(400).json({ message: "Review already exists for this booking" })
      }

      // Verify booking exists and is completed
      const booking = await Booking.findById(bookingId)
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" })
      }
      if (booking.status !== "completed") {
        return res.status(400).json({ message: "Can only review completed bookings" })
      }
    }

    // Create new review
    const newReview = new Review({
      clientId,
      photographerId,
      bookingId,
      rating,
      title,
      comment,
      serviceType: serviceType || "General Photography",
      isVerified: bookingId ? true : false, // Verified if from a booking
    })

    await newReview.save()

    // Update photographer's rating
    await updatePhotographerRating(photographerId)

    // Populate the review with client and photographer details
    const populatedReview = await Review.findById(newReview._id)
      .populate("clientId", "username email profileImage")
      .populate("photographerId", "userId")

    res.status(201).json({
      message: "Review created successfully",
      review: populatedReview,
    })
  } catch (error) {
    console.error("Error creating review:", error)
    res.status(500).json({ 
      message: "Server error while creating review",
      error: error.message 
    })
  }
}

// Get all reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("clientId", "username email profileImage")
      .populate("photographerId", "userId")
      .sort({ createdAt: -1 })

    res.status(200).json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    res.status(500).json({ message: "Server error while fetching reviews" })
  }
}

// Get reviews by photographer ID
exports.getReviewsByPhotographer = async (req, res) => {
  try {
    const { photographerId } = req.params

    const reviews = await Review.find({ photographerId })
      .populate("clientId", "username email profileImage")
      .sort({ createdAt: -1 })

    res.status(200).json({
      reviews,
      totalReviews: reviews.length
    })
  } catch (error) {
    console.error("Error fetching photographer reviews:", error)
    res.status(500).json({ message: "Server error while fetching photographer reviews" })
  }
}

// Get reviews by client ID
exports.getReviewsByClient = async (req, res) => {
  try {
    const { clientId } = req.params

    const reviews = await Review.find({ clientId })
      .populate("photographerId", "userId specialization")
      .sort({ createdAt: -1 })

    res.status(200).json(reviews)
  } catch (error) {
    console.error("Error fetching client reviews:", error)
    res.status(500).json({ message: "Server error while fetching client reviews" })
  }
}

// Get review statistics for a photographer
exports.getReviewStats = async (req, res) => {
  try {
    const { photographerId } = req.params

    // Check if photographer exists
    const photographer = await Photographer.findById(photographerId)
    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    // Get all reviews for this photographer
    const reviews = await Review.find({ photographerId })

    // Calculate basic stats
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0

    // Calculate rating breakdown
    const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => {
      const count = reviews.filter(review => review.rating === rating).length
      return { _id: rating, count }
    })

    // Calculate additional stats
    const verifiedReviews = reviews.filter(review => review.isVerified).length
    const recentReviews = reviews.filter(review => {
      const reviewDate = new Date(review.createdAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return reviewDate >= thirtyDaysAgo
    }).length

    const stats = {
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      ratingBreakdown,
      verifiedReviews,
      recentReviews,
      responseRate: calculateResponseRate(reviews), // You can implement this
    }

    res.status(200).json({ stats })
  } catch (error) {
    console.error("Error fetching review stats:", error)
    res.status(500).json({ message: "Server error while fetching review stats" })
  }
}

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params
    const { rating, title, comment, serviceType } = req.body

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Update fields
    if (rating !== undefined) review.rating = rating
    if (title) review.title = title
    if (comment) review.comment = comment
    if (serviceType) review.serviceType = serviceType

    review.updatedAt = new Date()
    await review.save()

    // Update photographer's rating
    await updatePhotographerRating(review.photographerId)

    // Populate the updated review
    const updatedReview = await Review.findById(id)
      .populate("clientId", "username email profileImage")
      .populate("photographerId", "userId")

    res.status(200).json({
      message: "Review updated successfully",
      review: updatedReview,
    })
  } catch (error) {
    console.error("Error updating review:", error)
    res.status(500).json({ message: "Server error while updating review" })
  }
}

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    const photographerId = review.photographerId
    await Review.findByIdAndDelete(id)

    // Update photographer's rating after deletion
    await updatePhotographerRating(photographerId)

    res.status(200).json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Error deleting review:", error)
    res.status(500).json({ message: "Server error while deleting review" })
  }
}

// Add helpful vote to review
exports.addHelpfulVote = async (req, res) => {
  try {
    const { id } = req.params

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    review.helpfulVotes = (review.helpfulVotes || 0) + 1
    await review.save()

    res.status(200).json({
      message: "Helpful vote added successfully",
      helpfulVotes: review.helpfulVotes,
    })
  } catch (error) {
    console.error("Error adding helpful vote:", error)
    res.status(500).json({ message: "Server error while adding helpful vote" })
  }
}

// Add photographer response to review
exports.addPhotographerResponse = async (req, res) => {
  try {
    const { id } = req.params
    const { message, photographerId } = req.body

    const review = await Review.findById(id)
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Verify that the photographer is responding to their own review
    if (review.photographerId.toString() !== photographerId) {
      return res.status(403).json({ message: "You can only respond to your own reviews" })
    }

    // Check if response already exists
    if (review.photographerResponse) {
      return res.status(400).json({ message: "Response already exists for this review" })
    }

    review.photographerResponse = {
      message,
      respondedAt: new Date(),
    }

    await review.save()

    // Populate the updated review
    const updatedReview = await Review.findById(id)
      .populate("clientId", "username email profileImage")
      .populate("photographerId", "userId")

    res.status(200).json({
      message: "Response added successfully",
      review: updatedReview,
    })
  } catch (error) {
    console.error("Error adding photographer response:", error)
    res.status(500).json({ message: "Server error while adding response" })
  }
}

// Helper function to update photographer's overall rating
const updatePhotographerRating = async (photographerId) => {
  try {
    const reviews = await Review.find({ photographerId })
    
    if (reviews.length === 0) {
      await Photographer.findByIdAndUpdate(photographerId, {
        rating: 0,
        reviewCount: 0,
      })
      return
    }

    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    
    await Photographer.findByIdAndUpdate(photographerId, {
      rating: Number(averageRating.toFixed(1)),
      reviewCount: reviews.length,
    })
  } catch (error) {
    console.error("Error updating photographer rating:", error)
  }
}

// Helper function to calculate response rate
const calculateResponseRate = (reviews) => {
  if (reviews.length === 0) return 0
  
  const reviewsWithResponse = reviews.filter(review => review.photographerResponse).length
  return Number(((reviewsWithResponse / reviews.length) * 100).toFixed(1))
}

module.exports = {
  createReview: exports.createReview,
  getAllReviews: exports.getAllReviews,
  getReviewsByPhotographer: exports.getReviewsByPhotographer,
  getReviewsByClient: exports.getReviewsByClient,
  getReviewStats: exports.getReviewStats,
  updateReview: exports.updateReview,
  deleteReview: exports.deleteReview,
  addHelpfulVote: exports.addHelpfulVote,
  addPhotographerResponse: exports.addPhotographerResponse,
}