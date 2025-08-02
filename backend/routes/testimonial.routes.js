const express = require("express")
const router = express.Router()
const testimonialController = require("../controllers/testimonial.controller")

// Public routes
router.get("/featured", testimonialController.getFeaturedTestimonials)
router.get("/photographer/:photographerId", testimonialController.getTestimonialsByPhotographer)

// Admin routes
router.get("/", testimonialController.getAllTestimonials)
router.get("/available-reviews", testimonialController.getAvailableReviews)
router.post("/", testimonialController.createTestimonialFromReview)
router.put("/:id", testimonialController.updateTestimonial)
router.put("/:id/toggle-featured", testimonialController.toggleTestimonialFeatured)
router.put("/:id/toggle-active", testimonialController.toggleTestimonialActive)
router.delete("/:id", testimonialController.deleteTestimonial)

module.exports = router