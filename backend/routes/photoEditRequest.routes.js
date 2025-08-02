const express = require("express")
const router = express.Router()
const photoEditController = require("../controllers/photoEditRequest.controller")

// Create new photo edit request with original photos
router.post("/", photoEditController.uploadMiddleware.array('originalPhotos', 10), photoEditController.createPhotoEditRequest)

// Get all photo edit requests (Admin)
router.get("/", photoEditController.getAllPhotoEditRequests)

// Get photo edit requests by client
router.get("/client/:clientId", photoEditController.getPhotoEditRequestsByClient)

// Get photo edit requests by photographer
router.get("/photographer/:photographerId", photoEditController.getPhotoEditRequestsByPhotographer)

// Get single photo edit request by ID
router.get("/:id", photoEditController.getPhotoEditRequestById)

// Assign photographer to request (Admin)
router.put("/:id/assign", photoEditController.assignPhotographer)

// Update request status
router.put("/:id/status", photoEditController.updateRequestStatus)

// Upload edited photos (Photographer)
router.post("/:id/edited-photos", photoEditController.uploadMiddleware.array('editedPhotos', 20), photoEditController.uploadEditedPhotos)

// Update payment status
router.put("/:id/payment", photoEditController.updatePaymentStatus)

// Delete photo edit request
router.delete("/:id", photoEditController.deletePhotoEditRequest)

// Get photo edit statistics
router.get("/stats/overview", photoEditController.getPhotoEditStats)

module.exports = router
