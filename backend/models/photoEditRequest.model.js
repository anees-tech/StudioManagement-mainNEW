const mongoose = require("mongoose")

const photoEditRequestSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Photographer",
    default: null, // Will be null initially, then assigned by admin
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin who assigned the photographer
    default: null,
  },
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  originalPhotos: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  editedPhotos: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    }
  }],
  status: {
    type: String,
    enum: ["pending", "assigned", "in_progress", "completed", "delivered", "cancelled"],
    default: "pending",
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  estimatedCost: {
    type: Number,
    default: 0,
  },
  finalCost: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
    default: null,
  },
  clientNotes: {
    type: String,
    maxLength: 1000,
    default: "",
  },
  photographerNotes: {
    type: String,
    maxLength: 1000,
    default: "",
  },
  adminNotes: {
    type: String,
    maxLength: 1000,
    default: "",
  },
  completedAt: {
    type: Date,
    default: null,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
photoEditRequestSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Index for better query performance
photoEditRequestSchema.index({ clientId: 1, createdAt: -1 })
photoEditRequestSchema.index({ photographerId: 1, status: 1 })
photoEditRequestSchema.index({ status: 1, priority: 1 })

module.exports = mongoose.model("PhotoEditRequest", photoEditRequestSchema)
