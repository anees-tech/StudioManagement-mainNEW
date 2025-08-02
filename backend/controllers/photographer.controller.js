const Photographer = require("../models/photographer.model")
const User = require("../models/user.model")

// Get all photographers
exports.getAllPhotographers = async (req, res) => {
  try {
    const photographers = await Photographer.find().populate("userId", "username email profileImage")
    res.status(200).json(photographers)
  } catch (error) {
    console.error("Error fetching photographers:", error)
    res.status(500).json({ message: "Server error while fetching photographers" })
  }
}

// Get photographer by ID
exports.getPhotographerById = async (req, res) => {
  try {
    const photographer = await Photographer.findById(req.params.id).populate("userId", "username email profileImage")

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    res.status(200).json(photographer)
  } catch (error) {
    console.error("Error fetching photographer:", error)
    res.status(500).json({ message: "Server error while fetching photographer" })
  }
}

// Get featured photographers
exports.getFeaturedPhotographers = async (req, res) => {
  try {
    const photographers = await Photographer.find({ rating: { $gte: 4 } })
      .populate("userId", "username email profileImage")
      .limit(6)
      .sort({ rating: -1 })

    res.status(200).json(photographers)
  } catch (error) {
    console.error("Error fetching featured photographers:", error)
    res.status(500).json({ message: "Server error while fetching featured photographers" })
  }
}

// Create photographer profile
exports.createPhotographer = async (req, res) => {
  try {
    const photographerData = req.body
    const newPhotographer = new Photographer(photographerData)
    await newPhotographer.save()

    const populatedPhotographer = await Photographer.findById(newPhotographer._id).populate(
      "userId",
      "username email profileImage",
    )

    res.status(201).json({
      message: "Photographer profile created successfully",
      photographer: populatedPhotographer,
    })
  } catch (error) {
    console.error("Error creating photographer:", error)
    res.status(500).json({ message: "Server error while creating photographer profile" })
  }
}

// Update photographer profile
exports.updatePhotographer = async (req, res) => {
  try {
    const updatedPhotographer = await Photographer.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(
      "userId",
      "username email profileImage",
    )

    if (!updatedPhotographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    res.status(200).json({
      message: "Photographer profile updated successfully",
      photographer: updatedPhotographer,
    })
  } catch (error) {
    console.error("Error updating photographer:", error)
    res.status(500).json({ message: "Server error while updating photographer profile" })
  }
}

// Portfolio Management
exports.addPortfolioItem = async (req, res) => {
  try {
    const photographer = await Photographer.findById(req.params.id)

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    photographer.portfolio.push(req.body)
    await photographer.save()

    res.status(200).json({
      message: "Portfolio item added successfully",
      portfolio: photographer.portfolio,
    })
  } catch (error) {
    console.error("Error adding portfolio item:", error)
    res.status(500).json({ message: "Server error while adding portfolio item" })
  }
}

exports.updatePortfolioItem = async (req, res) => {
  try {
    const { id, portfolioIndex } = req.params
    const photographer = await Photographer.findById(id)

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    if (portfolioIndex >= photographer.portfolio.length || portfolioIndex < 0) {
      return res.status(404).json({ message: "Portfolio item not found" })
    }

    // Update the portfolio item
    photographer.portfolio[portfolioIndex] = {
      ...photographer.portfolio[portfolioIndex],
      ...req.body,
    }

    await photographer.save()

    res.status(200).json({
      message: "Portfolio item updated successfully",
      portfolio: photographer.portfolio,
    })
  } catch (error) {
    console.error("Error updating portfolio item:", error)
    res.status(500).json({ message: "Server error while updating portfolio item" })
  }
}

exports.deletePortfolioItem = async (req, res) => {
  try {
    const { id, portfolioIndex } = req.params
    const photographer = await Photographer.findById(id)

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    if (portfolioIndex >= photographer.portfolio.length || portfolioIndex < 0) {
      return res.status(404).json({ message: "Portfolio item not found" })
    }

    // Remove the portfolio item
    photographer.portfolio.splice(portfolioIndex, 1)
    await photographer.save()

    res.status(200).json({
      message: "Portfolio item deleted successfully",
      portfolio: photographer.portfolio,
    })
  } catch (error) {
    console.error("Error deleting portfolio item:", error)
    res.status(500).json({ message: "Server error while deleting portfolio item" })
  }
}

// Availability Management
exports.addAvailability = async (req, res) => {
  try {
    const photographer = await Photographer.findById(req.params.id)

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    // Check if availability for this date already exists
    const existingAvailability = photographer.availability.find(
      (avail) => new Date(avail.date).toDateString() === new Date(req.body.date).toDateString()
    )

    if (existingAvailability) {
      return res.status(400).json({ message: "Availability for this date already exists" })
    }

    photographer.availability.push(req.body)
    await photographer.save()

    res.status(200).json({
      message: "Availability added successfully",
      availability: photographer.availability,
    })
  } catch (error) {
    console.error("Error adding availability:", error)
    res.status(500).json({ message: "Server error while adding availability" })
  }
}

exports.updateAvailability = async (req, res) => {
  try {
    const { id, availabilityIndex } = req.params
    const photographer = await Photographer.findById(id)

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    if (availabilityIndex >= photographer.availability.length || availabilityIndex < 0) {
      return res.status(404).json({ message: "Availability not found" })
    }

    // Update the availability item
    photographer.availability[availabilityIndex] = {
      ...photographer.availability[availabilityIndex],
      ...req.body,
    }

    await photographer.save()

    res.status(200).json({
      message: "Availability updated successfully",
      availability: photographer.availability,
    })
  } catch (error) {
    console.error("Error updating availability:", error)
    res.status(500).json({ message: "Server error while updating availability" })
  }
}

exports.deleteAvailability = async (req, res) => {
  try {
    const { id, availabilityIndex } = req.params
    const photographer = await Photographer.findById(id)

    if (!photographer) {
      return res.status(404).json({ message: "Photographer not found" })
    }

    if (availabilityIndex >= photographer.availability.length || availabilityIndex < 0) {
      return res.status(404).json({ message: "Availability not found" })
    }

    // Remove the availability item
    photographer.availability.splice(availabilityIndex, 1)
    await photographer.save()

    res.status(200).json({
      message: "Availability deleted successfully",
      availability: photographer.availability,
    })
  } catch (error) {
    console.error("Error deleting availability:", error)
    res.status(500).json({ message: "Server error while deleting availability" })
  }
}
