const mongoose = require("mongoose");
const User = require("../models/user.model");
const Photographer = require("../models/photographer.model");
const Booking = require("../models/booking.model");
const config = require("../config/config");

// Connect to MongoDB
mongoose
  .connect(`mongodb+srv://hello:hello123@restaurant.8j8yw.mongodb.net/studio-management`)
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Clear existing data
const clearDatabase = async () => {
  await User.deleteMany({});
  await Photographer.deleteMany({});
  await Booking.deleteMany({});
  console.log("Cleared existing data");
};

// Seed Users
const seedUsers = async () => {
  const users = [
    {
      username: "admin",
      email: "admin@example.com",
      password: "admin123",
      role: "admin",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
      phone: "+1234567890",
      address: "123 Admin St, Admin City",
    },
    {
      username: "john_client",
      email: "john@example.com",
      password: "password123",
      role: "client",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
      phone: "+1987654321",
      address: "456 Client Ave, Client City",
    },
    {
      username: "sarah_client",
      email: "sarah@example.com",
      password: "password123",
      role: "client",
      profileImage: "https://randomuser.me/api/portraits/women/1.jpg",
      phone: "+1555666777",
      address: "789 Client Blvd, Client Town",
    },
    {
      username: "mike_photographer",
      email: "mike@example.com",
      password: "password123",
      role: "photographer",
      profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
      phone: "+1222333444",
      address: "101 Photo Lane, Photo City",
    },
    {
      username: "lisa_photographer",
      email: "lisa@example.com",
      password: "password123",
      role: "photographer",
      profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
      phone: "+1999888777",
      address: "202 Camera Road, Picture Town",
    },
    {
      username: "david_photographer",
      email: "david@example.com",
      password: "password123",
      role: "photographer",
      profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
      phone: "+1777888999",
      address: "303 Lens Avenue, Shutter City",
    },
  ];

  const createdUsers = await User.insertMany(users);
  console.log(`${createdUsers.length} users created`);
  return createdUsers;
};

// Seed Photographers
const seedPhotographers = async (users) => {
  const photographers = users.filter(user => user.role === "photographer");
  
  const photographerProfiles = photographers.map((photographer, index) => {
    const isLisa = photographer.username === "lisa_photographer";
    const isDavid = photographer.username === "david_photographer";
    
    return {
      userId: photographer._id,
      specialization: isLisa ? "Portrait Photography" : isDavid ? "Wedding Photography" : "Nature Photography",
      services: isLisa 
        ? ["Wedding Photography", "Engagement Photography", "Photo Editing"] 
        : isDavid 
        ? ["Wedding Photography", "Videography", "Photo Shoot Retouching"] 
        : ["Nature Photography", "Photo Editing", "Studio Lighting Services"],
      description: `Professional photographer with years of experience in ${isLisa ? "portrait and wedding" : isDavid ? "wedding and engagement" : "nature and landscape"} photography.`,
      experience: isLisa ? 5 : isDavid ? 8 : 3,
      portfolio: [
        {
          title: `${index + 1} Sample Work 1`,
          description: "Beautiful photograph taken during a session",
          imageUrl: `https://source.unsplash.com/random/300x200?photography,${index + 1}`,
          category: "Portrait",
        },
        {
          title: `${index + 1} Sample Work 2`,
          description: "Amazing landscape photograph",
          imageUrl: `https://source.unsplash.com/random/300x200?landscape,${index + 1}`,
          category: "Landscape",
        },
      ],
      pricing: [
        {
          service: "Basic Session",
          price: isLisa ? 150 : isDavid ? 200 : 100,
          description: "1 hour photo session with basic editing",
        },
        {
          service: "Premium Package",
          price: isLisa ? 300 : isDavid ? 400 : 250,
          description: "3 hour photo session with advanced editing and prints",
        },
      ],
      availability: [
        {
          date: new Date(Date.now() + 86400000), // tomorrow
          timeSlots: [
            { start: "09:00", end: "11:00", isBooked: false },
            { start: "13:00", end: "15:00", isBooked: false },
            { start: "16:00", end: "18:00", isBooked: false },
          ],
        },
        {
          date: new Date(Date.now() + 172800000), // day after tomorrow
          timeSlots: [
            { start: "10:00", end: "12:00", isBooked: false },
            { start: "14:00", end: "16:00", isBooked: false },
          ],
        },
      ],
      rating: isLisa ? 4.8 : isDavid ? 4.9 : 4.5,
      reviewCount: isLisa ? 15 : isDavid ? 20 : 8,
      reviews: [
        {
          userId: users.find(u => u.role === "client")._id,
          rating: 5,
          comment: "Amazing work! Highly recommended!",
          date: new Date(),
        },
      ],
      featured: isLisa || isDavid,
    };
  });

  const createdPhotographers = await Photographer.insertMany(photographerProfiles);
  console.log(`${createdPhotographers.length} photographer profiles created`);
  return createdPhotographers;
};

// Seed Bookings
const seedBookings = async (users, photographers) => {
  const clients = users.filter(user => user.role === "client");
  
  const bookings = [];
  const statuses = ["pending", "confirmed", "completed", "cancelled"];
  const services = ["Wedding Shoot", "Portrait Session", "Family Photos", "Product Photography"];
  const locations = ["Studio", "Outdoor Park", "Client's Home", "Beach", "Downtown"];
  
  // Create some bookings for each client
  clients.forEach(client => {
    photographers.forEach(photographer => {
      // Create 1-2 bookings per client-photographer pair
      const bookingCount = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < bookingCount; i++) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomService = services[Math.floor(Math.random() * services.length)];
        const randomLocation = locations[Math.floor(Math.random() * locations.length)];
        const randomPrice = Math.floor(Math.random() * 200) + 100;
        
        // Random date in the next 30 days
        const randomDays = Math.floor(Math.random() * 30) + 1;
        const bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + randomDays);
        
        bookings.push({
          clientId: client._id,
          photographerId: photographer._id,
          service: randomService,
          date: bookingDate,
          timeSlot: {
            start: "10:00",
            end: "12:00",
          },
          location: randomLocation,
          status: randomStatus,
          price: randomPrice,
          notes: "Please arrive 15 minutes early.",
          createdAt: new Date(),
        });
      }
    });
  });
  
  const createdBookings = await Booking.insertMany(bookings);
  console.log(`${createdBookings.length} bookings created`);
  return createdBookings;
};

// Main seeding function
const seedData = async () => {
  try {
    await clearDatabase();
    const users = await seedUsers();
    const photographers = await seedPhotographers(users);
    const bookings = await seedBookings(users, photographers);
    
    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
};

// Run the seeding
seedData();