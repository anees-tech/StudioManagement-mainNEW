const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")

// Get user profile
router.get("/:id", userController.getUserProfile)

// Update user profile
router.put("/:id", userController.updateUserProfile)

// Upload profile photo
router.post("/:id/upload-photo", userController.uploadProfilePhotoMiddleware, userController.uploadProfilePhoto)

// Delete user
router.delete("/:id", userController.deleteUser)

module.exports = router
