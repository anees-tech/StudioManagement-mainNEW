const express = require("express")
const router = express.Router()
const photographerController = require("../controllers/photographer.controller")

// Get all photographers
router.get("/", photographerController.getAllPhotographers)

// Get featured photographers
router.get("/featured", photographerController.getFeaturedPhotographers)

// Get photographer by ID
router.get("/:id", photographerController.getPhotographerById)

// Create photographer profile
router.post("/", photographerController.createPhotographer)

// Update photographer profile
router.put("/:id", photographerController.updatePhotographer)

// Add portfolio item
router.post("/:id/portfolio", photographerController.addPortfolioItem)

// Update portfolio item
router.put("/:id/portfolio/:portfolioIndex", photographerController.updatePortfolioItem)

// Delete portfolio item
router.delete("/:id/portfolio/:portfolioIndex", photographerController.deletePortfolioItem)

// Add availability
router.post("/:id/availability", photographerController.addAvailability)

// Update availability
router.put("/:id/availability/:availabilityIndex", photographerController.updateAvailability)

// Delete availability
router.delete("/:id/availability/:availabilityIndex", photographerController.deleteAvailability)

module.exports = router
