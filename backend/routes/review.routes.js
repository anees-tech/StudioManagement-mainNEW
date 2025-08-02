const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/review.controller")

// Create a new review
router.post("/", reviewController.createReview)

// Get all reviews
router.get("/", reviewController.getAllReviews)

// Get reviews by photographer ID
router.get("/photographer/:photographerId", reviewController.getReviewsByPhotographer)

// Get review statistics for a photographer
router.get("/photographer/:photographerId/stats", reviewController.getReviewStats)

// Get reviews by client ID
router.get("/client/:clientId", reviewController.getReviewsByClient)

// Update review
router.put("/:id", reviewController.updateReview)

// Delete review
router.delete("/:id", reviewController.deleteReview)

// Add helpful vote to review
router.put("/:id/helpful", reviewController.addHelpfulVote)

// Add photographer response to review
router.post("/:id/response", reviewController.addPhotographerResponse)

module.exports = router