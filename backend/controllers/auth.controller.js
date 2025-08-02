const User = require("../models/user.model")
const Photographer = require("../models/photographer.model")

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, specialization, services, experience, description } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or username already exists",
      })
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password,
      role: role || "client",
    })

    await newUser.save()

    // If user is a photographer, create photographer profile
    if (role === "photographer") {
      const photographerData = {
        userId: newUser._id,
        specialization: specialization || "General Photography",
        services: services || [],
        experience: experience || 0,
        description: description || "",
        rating: 0,
        reviewCount: 0,
        portfolio: [],
        pricing: [
          {
            service: "Basic Package",
            price: 100,
            description: "Basic photography package",
          },
        ],
        availability: [],
      }

      const newPhotographer = new Photographer(photographerData)
      await newPhotographer.save()
    }

    // Return user without password
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      profileImage: newUser.profileImage,
      phone: newUser.phone,
      address: newUser.address,
    }

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ message: "Server error during registration" })
  }
}

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body

    // Find user by username
    const user = await User.findOne({ username })

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    // Check password (plain text comparison as per requirements)
    if (password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" })
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      phone: user.phone,
      address: user.address,
    }

    res.status(200).json({
      message: "Login successful",
      user: userResponse,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
}
