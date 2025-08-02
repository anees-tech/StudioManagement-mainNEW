const User = require("../models/user.model")
const path = require('path')
const fs = require('fs')
const multer = require('multer')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/profiles')
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueName = `profile-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    return cb(null, true)
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'))
  }
}

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
})
 
// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ message: "Server error while fetching user profile" })
  }
}

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, email, phone, address, profileImage } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update fields if provided
    if (username) user.username = username
    if (email) user.email = email
    if (phone) user.phone = phone
    if (address) user.address = address
    if (profileImage) user.profileImage = profileImage

    await user.save()

    // Return user without password
    const updatedUser = await User.findById(req.params.id).select("-password")

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Server error while updating user" })
  }
}

// Upload profile photo middleware
exports.uploadProfilePhotoMiddleware = upload.single('profileImage')

// Upload profile photo
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.id
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../uploads/profiles', path.basename(user.profileImage))
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath)
      }
    }

    // Update user with new profile image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`
    user.profileImage = imageUrl
    await user.save()

    const updatedUser = await User.findById(userId).select("-password")

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      user: updatedUser,
      imageUrl: imageUrl
    })
  } catch (error) {
    console.error("Error uploading profile photo:", error)
    res.status(500).json({ message: "Server error while uploading profile photo" })
  }
}

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Delete profile image if exists
    if (user.profileImage) {
      const imagePath = path.join(__dirname, '../uploads/profiles', path.basename(user.profileImage))
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath)
      }
    }

    await User.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    res.status(500).json({ message: "Server error while deleting user" })
  }
}

module.exports = {
  getUserProfile: exports.getUserProfile,
  updateUserProfile: exports.updateUserProfile,
  uploadProfilePhoto: exports.uploadProfilePhoto,
  uploadProfilePhotoMiddleware: exports.uploadProfilePhotoMiddleware,
  deleteUser: exports.deleteUser,
}
