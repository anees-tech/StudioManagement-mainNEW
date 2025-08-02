const mongoose = require("mongoose")

const settingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Uzumaki Studio",
    },
    siteDescription: {
      type: String,
      default: "Professional Photography Studio",
    },
    contactEmail: {
      type: String,
      default: "contact@uzumakistudio.com",
    },
    contactPhone: {
      type: String,
      default: "+1234567890",
    },
    address: {
      type: String,
      default: "123 Photography St, Studio City",
    },
    socialMedia: {
      facebook: {
        type: String,
        default: "https://facebook.com/uzumakistudio",
      },
      instagram: {
        type: String,
        default: "https://instagram.com/uzumakistudio",
      },
      twitter: {
        type: String,
        default: "https://twitter.com/uzumakistudio",
      },
    },
    bookingSettings: {
      minAdvanceHours: {
        type: Number,
        default: 24,
      },
      maxAdvanceDays: {
        type: Number,
        default: 60,
      },
      cancellationHours: {
        type: Number,
        default: 48,
      },
    },
  },
  {
    timestamps: true,
  },
)

const Setting = mongoose.model("Setting", settingSchema)

module.exports = Setting
