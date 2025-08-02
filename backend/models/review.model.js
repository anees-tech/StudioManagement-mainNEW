const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema({
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  photographerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Photographer",
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    default: null,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  comment: {
    type: String,
    required: true,
    maxLength: 1000,
  },
  serviceType: {
    type: String,
    required: true,
  },
  helpfulVotes: {
    type: Number,
    default: 0,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  photographerResponse: {
    message: {
      type: String,
      maxLength: 500,
    },
    respondedAt: {
      type: Date,
    },
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
reviewSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

// Index for better query performance
reviewSchema.index({ photographerId: 1, createdAt: -1 })
reviewSchema.index({ clientId: 1, createdAt: -1 })
reviewSchema.index({ bookingId: 1 })

module.exports = mongoose.model("Review", reviewSchema)