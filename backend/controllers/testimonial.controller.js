const Testimonial = require("../models/testimonial.model")
const Review = require("../models/review.model")
const User = require("../models/user.model")
const Photographer = require("../models/photographer.model")

// Get all testimonials (for admin)
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage",
        },
      })
      .populate("reviewId", "rating comment")
      .populate("approvedBy", "username")
      .sort({ createdAt: -1 })
      .lean()

    // Filter out testimonials with null references
    const validTestimonials = testimonials.filter(testimonial => 
      testimonial.clientId && testimonial.photographerId && testimonial.photographerId.userId
    )

    res.status(200).json(validTestimonials)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    res.status(500).json({ message: "Server error while fetching testimonials" })
  }
}

// Get featured testimonials (for public)
exports.getFeaturedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .populate("clientId", "username profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username profileImage",
        },
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean()

    const validTestimonials = testimonials.filter(testimonial => 
      testimonial.clientId && testimonial.photographerId && testimonial.photographerId.userId
    )

    res.status(200).json(validTestimonials)
  } catch (error) {
    console.error("Error fetching featured testimonials:", error)
    res.status(500).json({ message: "Server error while fetching featured testimonials" })
  }
}

// Create testimonial from review
exports.createTestimonialFromReview = async (req, res) => {
  try {
    const { reviewId, title } = req.body

    // Find the review
    const review = await Review.findById(reviewId)
      .populate("clientId")
      .populate("photographerId")

    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Check if testimonial already exists for this review
    const existingTestimonial = await Testimonial.findOne({ reviewId })
    if (existingTestimonial) {
      return res.status(400).json({ message: "Testimonial already exists for this review" })
    }

    // Create new testimonial
    const testimonial = new Testimonial({
      clientId: review.clientId._id,
      photographerId: review.photographerId._id,
      reviewId: reviewId,
      title: title || "Great Experience",
      content: review.comment,
      rating: review.rating,
      isActive: true,
      isFeatured: false,
    })

    await testimonial.save()

    // Populate the testimonial for response
    const populatedTestimonial = await Testimonial.findById(testimonial._id)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage",
        },
      })
      .populate("reviewId", "rating comment")

    res.status(201).json({
      message: "Testimonial created successfully",
      testimonial: populatedTestimonial
    })
  } catch (error) {
    console.error("Error creating testimonial:", error)
    res.status(500).json({ message: "Server error while creating testimonial" })
  }
}

// Update testimonial
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, isActive, isFeatured } = req.body

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { title, content, isActive, isFeatured },
      { new: true, runValidators: true }
    )
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage",
        },
      })

    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }

    res.status(200).json({
      message: "Testimonial updated successfully",
      testimonial
    })
  } catch (error) {
    console.error("Error updating testimonial:", error)
    res.status(500).json({ message: "Server error while updating testimonial" })
  }
}

// Toggle testimonial featured status
exports.toggleTestimonialFeatured = async (req, res) => {
  try {
    const { id } = req.params

    const testimonial = await Testimonial.findById(id)
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }

    testimonial.isFeatured = !testimonial.isFeatured
    
    if (testimonial.isFeatured) {
      testimonial.approvedBy = req.user?.id || null
      testimonial.approvedAt = new Date()
    }

    await testimonial.save()

    const populatedTestimonial = await Testimonial.findById(id)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage",
        },
      })

    res.status(200).json({
      message: `Testimonial ${testimonial.isFeatured ? "featured" : "unfeatured"} successfully`,
      testimonial: populatedTestimonial
    })
  } catch (error) {
    console.error("Error toggling testimonial featured status:", error)
    res.status(500).json({ message: "Server error while updating testimonial" })
  }
}

// Toggle testimonial active status
exports.toggleTestimonialActive = async (req, res) => {
  try {
    const { id } = req.params

    const testimonial = await Testimonial.findById(id)
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }

    testimonial.isActive = !testimonial.isActive
    await testimonial.save()

    const populatedTestimonial = await Testimonial.findById(id)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage",
        },
      })

    res.status(200).json({
      message: `Testimonial ${testimonial.isActive ? "activated" : "deactivated"} successfully`,
      testimonial: populatedTestimonial
    })
  } catch (error) {
    console.error("Error toggling testimonial active status:", error)
    res.status(500).json({ message: "Server error while updating testimonial" })
  }
}

// Delete testimonial
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params

    const testimonial = await Testimonial.findByIdAndDelete(id)
    if (!testimonial) {
      return res.status(404).json({ message: "Testimonial not found" })
    }

    res.status(200).json({ message: "Testimonial deleted successfully" })
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    res.status(500).json({ message: "Server error while deleting testimonial" })
  }
}

// Get testimonials by photographer
exports.getTestimonialsByPhotographer = async (req, res) => {
  try {
    const { photographerId } = req.params

    const testimonials = await Testimonial.find({ 
      photographerId, 
      isActive: true 
    })
      .populate("clientId", "username profileImage")
      .sort({ createdAt: -1 })
      .lean()

    res.status(200).json(testimonials)
  } catch (error) {
    console.error("Error fetching photographer testimonials:", error)
    res.status(500).json({ message: "Server error while fetching testimonials" })
  }
}

// Get available reviews for testimonial creation
exports.getAvailableReviews = async (req, res) => {
  try {
    // Get all reviews that don't have testimonials yet
    const existingTestimonialReviews = await Testimonial.find().select("reviewId")
    const usedReviewIds = existingTestimonialReviews.map(t => t.reviewId.toString())

    const availableReviews = await Review.find({
      _id: { $nin: usedReviewIds },
      rating: { $gte: 4 } // Only show 4+ star reviews
    })
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage",
        },
      })
      .sort({ createdAt: -1 })
      .lean()

    const validReviews = availableReviews.filter(review => 
      review.clientId && review.photographerId && review.photographerId.userId
    )

    res.status(200).json(validReviews)
  } catch (error) {
    console.error("Error fetching available reviews:", error)
    res.status(500).json({ message: "Server error while fetching available reviews" })
  }
}

module.exports = {
  getAllTestimonials: exports.getAllTestimonials,
  getFeaturedTestimonials: exports.getFeaturedTestimonials,
  createTestimonialFromReview: exports.createTestimonialFromReview,
  updateTestimonial: exports.updateTestimonial,
  toggleTestimonialFeatured: exports.toggleTestimonialFeatured,
  toggleTestimonialActive: exports.toggleTestimonialActive,
  deleteTestimonial: exports.deleteTestimonial,
  getTestimonialsByPhotographer: exports.getTestimonialsByPhotographer,
  getAvailableReviews: exports.getAvailableReviews
}