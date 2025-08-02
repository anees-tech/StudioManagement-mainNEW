const mongoose = require("mongoose")

const photographerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  services: [
    {
      type: String,
       enum: [
        "Wedding Photography",
        "Portrait Photography",
        "Event Photography", 
        "Commercial Photography",
        "Nature Photography",
        "Fashion Photography",
        "Photo Editing",
        "Videography",
        "Video Editing",
        "Photo Shoot Retouching",
        "Studio Lighting Services",
        "Underwater Photography",
        "Engagement Photography",
      ],
    },
  ],
  description: {
    type: String,
    required: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  portfolio: [
    {
      title: String,
      description: String,
      imageUrl: String,
      category: String,
    },
  ],
  pricing: [
    {
      service: String,
      price: Number,
      description: String,
    },
  ],
  availability: [
    {
      date: Date,
      timeSlots: [
        {
          start: String,
          end: String,
          isBooked: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },
  ],
  rating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      rating: Number,
      comment: String,
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  featured: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Photographer = mongoose.model("Photographer", photographerSchema)

module.exports = Photographer
