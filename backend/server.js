const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const config = require("./config/config")

// Import routes
const authRoutes = require("./routes/auth.routes")
const userRoutes = require("./routes/user.routes")
const photographerRoutes = require("./routes/photographer.routes")
const bookingRoutes = require("./routes/booking.routes")
const adminRoutes = require("./routes/admin.routes")
const reviewRoutes = require("./routes/review.routes")
const testimonialRoutes = require("./routes/testimonial.routes")
const photoEditRequestRoutes = require("./routes/photoEditRequest.routes")

const app = express()

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static files (including uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Database connection
mongoose
  .connect("mongodb+srv://stiduo:hamza123@cluster0.qorzsx0.mongodb.net/StudioDB")
  .then(() => {
    console.log("✅ Connected to MongoDB successfully")
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error)
    process.exit(1)
  })

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/photographers", photographerRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/testimonials", testimonialRoutes)
app.use("/api/users", userRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/photo-edit-requests", photoEditRequestRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Server is running successfully",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack)
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// Handle 404 routes
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" })
})

// Start server
const PORT = process.env.PORT || 5000
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📍 Server URL: http://localhost:${PORT}`)
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...")
  server.close(() => {
    console.log("Process terminated")
    mongoose.connection.close()
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...")
  server.close(() => {
    console.log("Process terminated")
    mongoose.connection.close()
  })
})

module.exports = app
