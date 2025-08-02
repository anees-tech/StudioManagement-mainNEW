const PhotoEditRequest = require("../models/photoEditRequest.model")
const User = require("../models/user.model")
const Photographer = require("../models/photographer.model")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/photo-edit-requests')
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'photo-edit-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'))
    }
  }
})

// Create new photo edit request
exports.createPhotoEditRequest = async (req, res) => {
  try {
    const { clientId, title, description, clientNotes, priority, deadline } = req.body
    
    // Validate client exists
    const client = await User.findById(clientId)
    if (!client || client.role !== 'client') {
      return res.status(404).json({ message: "Client not found" })
    }

    // Handle uploaded photos
    const originalPhotos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : []

    const newRequest = new PhotoEditRequest({
      clientId,
      title,
      description,
      clientNotes: clientNotes || "",
      priority: priority || "medium",
      deadline: deadline ? new Date(deadline) : null,
      originalPhotos
    })

    await newRequest.save()
    
    const populatedRequest = await PhotoEditRequest.findById(newRequest._id)
      .populate("clientId", "username email profileImage")

    res.status(201).json({
      message: "Photo edit request created successfully",
      request: populatedRequest
    })
  } catch (error) {
    console.error("Error creating photo edit request:", error)
    res.status(500).json({ message: "Server error while creating photo edit request" })
  }
}

// Get all photo edit requests (Admin view)
exports.getAllPhotoEditRequests = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query
    
    let filter = {}
    if (status) filter.status = status
    if (priority) filter.priority = priority

    const skip = (page - 1) * limit
    
    const requests = await PhotoEditRequest.find(filter)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage"
        }
      })
      .populate("assignedBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await PhotoEditRequest.countDocuments(filter)

    res.status(200).json({
      requests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    })
  } catch (error) {
    console.error("Error fetching photo edit requests:", error)
    res.status(500).json({ message: "Server error while fetching photo edit requests" })
  }
}

// Get photo edit requests by client
exports.getPhotoEditRequestsByClient = async (req, res) => {
  try {
    const { clientId } = req.params
    
    const requests = await PhotoEditRequest.find({ clientId })
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage"
        }
      })
      .sort({ createdAt: -1 })

    res.status(200).json(requests)
  } catch (error) {
    console.error("Error fetching client photo edit requests:", error)
    res.status(500).json({ message: "Server error while fetching client photo edit requests" })
  }
}

// Get photo edit requests by photographer
exports.getPhotoEditRequestsByPhotographer = async (req, res) => {
  try {
    const { photographerId } = req.params
    
    const requests = await PhotoEditRequest.find({ photographerId })
      .populate("clientId", "username email profileImage")
      .sort({ createdAt: -1 })

    res.status(200).json(requests)
  } catch (error) {
    console.error("Error fetching photographer photo edit requests:", error)
    res.status(500).json({ message: "Server error while fetching photographer photo edit requests" })
  }
}

// Get single photo edit request
exports.getPhotoEditRequestById = async (req, res) => {
  try {
    const { id } = req.params
    
    const request = await PhotoEditRequest.findById(id)
      .populate("clientId", "username email profileImage phone")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage phone"
        }
      })
      .populate("assignedBy", "username email")

    if (!request) {
      return res.status(404).json({ message: "Photo edit request not found" })
    }

    res.status(200).json(request)
  } catch (error) {
    console.error("Error fetching photo edit request:", error)
    res.status(500).json({ message: "Server error while fetching photo edit request" })
  }
}

// Assign photographer to request (Admin only)
exports.assignPhotographer = async (req, res) => {
  try {
    const { id } = req.params
    const { photographerId, assignedBy, estimatedCost, deadline } = req.body
    
    // Validate photographer exists
    const photographer = await Photographer.findById(photographerId)
    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    const request = await PhotoEditRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: "Photo edit request not found" })
    }

    request.photographerId = photographerId
    request.assignedBy = assignedBy
    request.status = "assigned"
    request.estimatedCost = estimatedCost || 0
    if (deadline) request.deadline = new Date(deadline)

    await request.save()

    const updatedRequest = await PhotoEditRequest.findById(id)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage"
        }
      })

    res.status(200).json({
      message: "Photographer assigned successfully",
      request: updatedRequest
    })
  } catch (error) {
    console.error("Error assigning photographer:", error)
    res.status(500).json({ message: "Server error while assigning photographer" })
  }
}

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, photographerNotes, finalCost } = req.body
    
    const request = await PhotoEditRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: "Photo edit request not found" })
    }

    request.status = status
    if (photographerNotes) request.photographerNotes = photographerNotes
    if (finalCost !== undefined) request.finalCost = finalCost
    
    if (status === "completed") {
      request.completedAt = new Date()
    } else if (status === "delivered") {
      request.deliveredAt = new Date()
    }

    await request.save()

    const updatedRequest = await PhotoEditRequest.findById(id)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage"
        }
      })

    res.status(200).json({
      message: "Request status updated successfully",
      request: updatedRequest
    })
  } catch (error) {
    console.error("Error updating request status:", error)
    res.status(500).json({ message: "Server error while updating request status" })
  }
}

// Upload edited photos (Photographer only)
exports.uploadEditedPhotos = async (req, res) => {
  try {
    const { id } = req.params
    const { photographerNotes } = req.body
    
    const request = await PhotoEditRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: "Photo edit request not found" })
    }

    // Handle uploaded edited photos
    const editedPhotos = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size
    })) : []

    request.editedPhotos = [...request.editedPhotos, ...editedPhotos]
    request.status = "completed"
    request.completedAt = new Date()
    if (photographerNotes) request.photographerNotes = photographerNotes

    await request.save()

    const updatedRequest = await PhotoEditRequest.findById(id)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage"
        }
      })

    res.status(200).json({
      message: "Edited photos uploaded successfully",
      request: updatedRequest
    })
  } catch (error) {
    console.error("Error uploading edited photos:", error)
    res.status(500).json({ message: "Server error while uploading edited photos" })
  }
}

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { paymentStatus } = req.body
    
    const request = await PhotoEditRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: "Photo edit request not found" })
    }

    request.paymentStatus = paymentStatus
    if (paymentStatus === "paid" && request.status === "completed") {
      request.status = "delivered"
      request.deliveredAt = new Date()
    }

    await request.save()

    const updatedRequest = await PhotoEditRequest.findById(id)
      .populate("clientId", "username email profileImage")
      .populate({
        path: "photographerId",
        populate: {
          path: "userId",
          select: "username email profileImage"
        }
      })

    res.status(200).json({
      message: "Payment status updated successfully",
      request: updatedRequest
    })
  } catch (error) {
    console.error("Error updating payment status:", error)
    res.status(500).json({ message: "Server error while updating payment status" })
  }
}

// Delete photo edit request
exports.deletePhotoEditRequest = async (req, res) => {
  try {
    const { id } = req.params
    
    const request = await PhotoEditRequest.findById(id)
    if (!request) {
      return res.status(404).json({ message: "Photo edit request not found" })
    }

    // Delete associated files
    const allPhotos = [...request.originalPhotos, ...request.editedPhotos]
    allPhotos.forEach(photo => {
      if (fs.existsSync(photo.path)) {
        fs.unlinkSync(photo.path)
      }
    })

    await PhotoEditRequest.findByIdAndDelete(id)

    res.status(200).json({ message: "Photo edit request deleted successfully" })
  } catch (error) {
    console.error("Error deleting photo edit request:", error)
    res.status(500).json({ message: "Server error while deleting photo edit request" })
  }
}

// Get photo edit request statistics
exports.getPhotoEditStats = async (req, res) => {
  try {
    const totalRequests = await PhotoEditRequest.countDocuments()
    const pendingRequests = await PhotoEditRequest.countDocuments({ status: "pending" })
    const assignedRequests = await PhotoEditRequest.countDocuments({ status: "assigned" })
    const inProgressRequests = await PhotoEditRequest.countDocuments({ status: "in_progress" })
    const completedRequests = await PhotoEditRequest.countDocuments({ status: "completed" })
    const deliveredRequests = await PhotoEditRequest.countDocuments({ status: "delivered" })

    const totalRevenue = await PhotoEditRequest.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$finalCost" } } }
    ])

    res.status(200).json({
      totalRequests,
      pendingRequests,
      assignedRequests,
      inProgressRequests,
      completedRequests,
      deliveredRequests,
      totalRevenue: totalRevenue[0]?.total || 0
    })
  } catch (error) {
    console.error("Error fetching photo edit stats:", error)
    res.status(500).json({ message: "Server error while fetching photo edit stats" })
  }
}

// Export multer upload middleware
exports.uploadMiddleware = upload
