import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "./models/listing.model.js";
import User from "./models/user.model.js";
import bcryptjs from "bcryptjs";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:5000";

// Gujarat cities with coordinates [lat, lng]
const gujaratCities = [
  { name: "Ahmedabad", lat: 23.0225, lng: 72.5714 },
  { name: "Surat", lat: 21.1702, lng: 72.8311 },
  { name: "Vadodara", lat: 22.3072, lng: 73.1812 },
  { name: "Rajkot", lat: 22.3039, lng: 70.8022 },
  { name: "Gandhinagar", lat: 23.2156, lng: 72.6369 },
  { name: "Bhavnagar", lat: 21.7645, lng: 72.1519 },
  { name: "Jamnagar", lat: 22.4707, lng: 70.0587 },
  { name: "Anand", lat: 22.5645, lng: 72.9289 },
  { name: "Mehsana", lat: 23.5880, lng: 72.3693 },
  { name: "Bharuch", lat: 21.7051, lng: 72.9959 },
  { name: "Navsari", lat: 20.9469, lng: 72.9280 },
  { name: "Junagadh", lat: 21.5222, lng: 70.4579 },
];

// Generic city coordinates (for seed.js listings)
const genericCities = [
  { name: "Downtown", lat: 40.7128, lng: -74.0060 },
  { name: "Suburban", lat: 40.7589, lng: -73.9851 },
  { name: "Beachfront", lat: 25.7617, lng: -80.1918 },
  { name: "University", lat: 40.8075, lng: -73.9625 },
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB for seeding!");
    seedDatabase();
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

const seedDatabase = async () => {
  const startTime = Date.now();
  console.log("\n" + "=".repeat(70));
  console.log("🌱 PROP-EASE FINAL SEEDER - STARTING DATABASE SEEDING");
  console.log("=".repeat(70));

  try {
    // Clear existing data
    console.log("\n📋 Step 1: Clearing existing listings...");
    await Listing.deleteMany({});
    console.log("   ✅ Cleared existing listings");

    // Create Admin User
    console.log("\n📋 Step 2: Creating/Updating Admin User...");
    let adminUser = await User.findOne({ email: "admin@test.com" });
    if (!adminUser) {
      const hashedPassword = bcryptjs.hashSync("Admin123", 10);
      adminUser = new User({
        username: "admin",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      });
      await adminUser.save();
      console.log("   ✅ Created admin user (admin@test.com / Admin123)");
    } else {
      adminUser.role = "admin";
      await adminUser.save();
      console.log("   ✅ Updated existing user to admin");
    }

    // Create All Owners (12 total: 4 from seed.js + 8 from seeder2.js)
    console.log("\n📋 Step 3: Creating/Updating Owner Users...");
    const owners = [];
    const ownerData = [
      // From seed.js
      {
        username: "johnproperty",
        email: "john@property.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      },
      {
        username: "sarahhomes",
        email: "sarah@homes.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      },
      {
        username: "mikeestates",
        email: "mike@estates.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      },
      {
        username: "emilyrealty",
        email: "emily@realty.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      },
      // From seeder2.js
      {
        username: "patelproperties",
        email: "patel@property.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      },
      {
        username: "shahrealty",
        email: "shah@realty.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      },
      {
        username: "desaihomes",
        email: "desai@homes.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      },
      {
        username: "mehtaproperties",
        email: "mehta@property.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      },
      {
        username: "jainestates",
        email: "jain@estates.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      },
      {
        username: "gujaratihomes",
        email: "gujarati@homes.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop",
      },
      {
        username: "amdavadproperties",
        email: "amdavad@property.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      },
      {
        username: "suratrealty",
        email: "surat@realty.com",
        password: "Owner123",
        role: "owner",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      },
    ];

    for (const ownerInfo of ownerData) {
      let owner = await User.findOne({ email: ownerInfo.email });
      if (!owner) {
        const hashedPassword = bcryptjs.hashSync(ownerInfo.password, 10);
        owner = new User({
          username: ownerInfo.username,
          email: ownerInfo.email,
          password: hashedPassword,
          role: ownerInfo.role,
          avatar: ownerInfo.avatar,
        });
        await owner.save();
        console.log(`   ✅ Created owner: ${ownerInfo.username} (${ownerInfo.email})`);
      } else {
        owner.role = ownerInfo.role;
        await owner.save();
        console.log(`   ✅ Updated existing user to owner: ${ownerInfo.username}`);
      }
      owners.push(owner);
    }
    console.log(`\n   📊 Total Owners: ${owners.length}`);

    // Helper function to add slight variation to coordinates
    const addVariation = (coord, range = 0.1) => {
      return coord + (Math.random() - 0.5) * range;
    };

    // Create all listings
    console.log("\n📋 Step 4: Creating Property Listings...");
    const allListings = [];

    // ============================================
    // LISTINGS FROM SEED.JS (Updated with coordinates)
    // ============================================

    // Owner 1: John Property - Mix of rent and sale
    allListings.push(
      {
        name: "Modern Downtown Loft Apartment",
        description: "Stylish 2-bedroom loft in the heart of downtown. Features exposed brick walls, high ceilings, modern kitchen with stainless steel appliances, and large windows with city views. Perfect for young professionals. Walking distance to restaurants, bars, and public transport.",
        address: "123 Main Street, Downtown District, City Center",
        regularPrice: 2800,
        discountPrice: 2600,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[0].lng, 0.05), addVariation(genericCities[0].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[0]._id.toString(),
        status: "pending",
      },
      {
        name: "Luxury Penthouse with City Views",
        description: "Stunning 3-bedroom penthouse on the 25th floor with panoramic city views. Features include marble floors, gourmet kitchen, master suite with walk-in closet, private balcony, and concierge service. Building amenities include gym, pool, and rooftop terrace.",
        address: "456 Skyline Boulevard, Financial District, High-Rise Tower",
        regularPrice: 950000,
        discountPrice: 900000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[0].lng, 0.05), addVariation(genericCities[0].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
        ],
        userRef: owners[0]._id.toString(),
        status: "pending",
      },
      {
        name: "Cozy Studio Near University Campus",
        description: "Perfect studio apartment for students. Compact but efficient layout with kitchenette, bathroom, and sleeping area. Close to university, cafes, and public transport. Includes utilities and high-speed internet. Pet-friendly building.",
        address: "789 College Avenue, University District, Campus Area",
        regularPrice: 750,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: true,
        parking: false,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[3].lng, 0.05), addVariation(genericCities[3].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[0]._id.toString(),
        status: "pending",
      }
    );

    // Owner 2: Sarah Homes - Family homes
    allListings.push(
      {
        name: "Spacious 4-Bedroom Family Home",
        description: "Beautiful family home in quiet suburban neighborhood. Features 4 bedrooms, 3 bathrooms, large kitchen with island, formal dining room, living room with fireplace, finished basement, and large backyard perfect for kids. Excellent school district nearby.",
        address: "321 Oak Street, Suburban Heights, Family Neighborhood",
        regularPrice: 425000,
        discountPrice: 400000,
        bathrooms: 3,
        bedrooms: 4,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[1].lng, 0.05), addVariation(genericCities[1].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
        ],
        userRef: owners[1]._id.toString(),
        status: "pending",
      },
      {
        name: "Modern Townhouse with Garage",
        description: "Contemporary 3-bedroom townhouse in gated community. Open floor plan, updated kitchen with granite countertops, master suite, private patio, and 2-car garage. Community amenities include pool, playground, and walking trails.",
        address: "555 Parkview Circle, Gated Community, Suburban Area",
        regularPrice: 3100,
        discountPrice: 0,
        bathrooms: 2,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[1].lng, 0.05), addVariation(genericCities[1].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        ],
        userRef: owners[1]._id.toString(),
        status: "pending",
      },
      {
        name: "Starter Home in Great Location",
        description: "Well-maintained 3-bedroom starter home perfect for first-time buyers. Updated kitchen and bathrooms, large backyard, 2-car garage. Located in excellent school district. Move-in ready!",
        address: "666 Elm Street, Family Neighborhood, School District",
        regularPrice: 275000,
        discountPrice: 0,
        bathrooms: 2,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "sale",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[1].lng, 0.05), addVariation(genericCities[1].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
        ],
        userRef: owners[1]._id.toString(),
        status: "pending",
      }
    );

    // Owner 3: Mike Estates - Luxury properties
    allListings.push(
      {
        name: "Beachfront Luxury Condo",
        description: "Stunning beachfront 2-bedroom condo with direct ocean views. Features include updated kitchen, spacious balcony, access to private beach, and resort-style amenities. Perfect for vacation rental or year-round living. Close to restaurants and entertainment.",
        address: "777 Coastal Highway, Beachfront District, Ocean View",
        regularPrice: 625000,
        discountPrice: 580000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[2].lng, 0.05), addVariation(genericCities[2].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[2]._id.toString(),
        status: "pending",
      },
      {
        name: "Elegant 5-Bedroom Estate",
        description: "Magnificent estate home on 2 acres of landscaped grounds. Features include grand foyer, formal dining room, library, home theater, wine cellar, outdoor pool, and guest house. Perfect for entertaining. Located in prestigious neighborhood.",
        address: "999 Estate Drive, Luxury Estates, Exclusive Area",
        regularPrice: 1150000,
        discountPrice: 1100000,
        bathrooms: 5,
        bedrooms: 5,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[1].lng, 0.05), addVariation(genericCities[1].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
        ],
        userRef: owners[2]._id.toString(),
        status: "pending",
      }
    );

    // Owner 4: Emily Realty - Affordable rentals
    allListings.push(
      {
        name: "Affordable 1-Bedroom Apartment",
        description: "Clean and well-maintained 1-bedroom apartment in quiet building. Great for first-time renters or professionals. Includes basic appliances and utilities. Pet-friendly building with laundry facilities on-site. Close to public transport.",
        address: "222 Maple Street, Residential Area, Midtown",
        regularPrice: 900,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: false,
        parking: false,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[0].lng, 0.05), addVariation(genericCities[0].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[3]._id.toString(),
        status: "pending",
      },
      {
        name: "Renovated Loft in Arts District",
        description: "Stylish converted loft in the trendy arts district. Features exposed brick walls, high ceilings, large windows, and open concept living. Close to galleries, restaurants, and nightlife. Perfect for artists or creative professionals.",
        address: "444 Artist Alley, Arts District, Cultural Quarter",
        regularPrice: 1750,
        discountPrice: 1600,
        bathrooms: 1,
        bedrooms: 2,
        furnished: true,
        parking: false,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[0].lng, 0.05), addVariation(genericCities[0].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        ],
        userRef: owners[3]._id.toString(),
        status: "pending",
      },
      {
        name: "Luxury 2-Bedroom Apartment with Balcony",
        description: "High-end 2-bedroom apartment in luxury building. Features include premium finishes, stainless steel appliances, in-unit laundry, and private balcony. Building amenities include concierge, gym, and rooftop terrace.",
        address: "888 Premium Plaza, Luxury Tower, Uptown District",
        regularPrice: 3400,
        discountPrice: 3100,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(genericCities[0].lng, 0.05), addVariation(genericCities[0].lat, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        ],
        userRef: owners[3]._id.toString(),
        status: "pending",
      }
    );

    // ============================================
    // LISTINGS FROM SEEDER2.JS (Gujarat Properties)
    // ============================================

    // Owner 5: Patel Properties - Ahmedabad & Gandhinagar (4 listings)
    allListings.push(
      {
        name: "Luxury 3BHK Apartment in Satellite, Ahmedabad",
        description: "Premium 3-bedroom apartment in upscale Satellite area. Features modern interiors, modular kitchen, marble flooring, 3 balconies, and premium fixtures. Close to schools, hospitals, and shopping malls. Gated society with 24/7 security, clubhouse, and parking.",
        address: "Satellite Road, Near ISKCON Temple, Ahmedabad, Gujarat 380015",
        regularPrice: 8500000,
        discountPrice: 8000000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.5714, 0.05), addVariation(23.0225, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        ],
        userRef: owners[4]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Flat for Rent in Prahladnagar, Ahmedabad",
        description: "Well-furnished 2-bedroom flat in prime Prahladnagar location. Spacious living room, modern kitchen with appliances, 2 bathrooms, and covered parking. Close to corporate offices, restaurants, and entertainment. Available immediately.",
        address: "Prahladnagar, Near Cinepolis, Ahmedabad, Gujarat 380015",
        regularPrice: 18000,
        discountPrice: 16500,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.5714, 0.05), addVariation(23.0225, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[4]._id.toString(),
        status: "pending",
      },
      {
        name: "4BHK Independent Villa in Gandhinagar",
        description: "Spacious 4-bedroom independent villa in peaceful Gandhinagar. Large plot, modern architecture, 4 bathrooms, drawing room, dining area, and private garden. Perfect for large families. Near government offices and educational institutions.",
        address: "Sector 21, Near Infocity, Gandhinagar, Gujarat 382021",
        regularPrice: 12500000,
        discountPrice: 11800000,
        bathrooms: 4,
        bedrooms: 4,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.6369, 0.05), addVariation(23.2156, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[4]._id.toString(),
        status: "pending",
      },
      {
        name: "1BHK Studio Apartment in Vastrapur, Ahmedabad",
        description: "Compact and cozy 1-bedroom studio apartment ideal for singles or couples. Fully furnished with modern amenities, kitchenette, and attached bathroom. Close to Vastrapur Lake, restaurants, and public transport.",
        address: "Vastrapur, Near Vastrapur Lake, Ahmedabad, Gujarat 380015",
        regularPrice: 12000,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: true,
        parking: false,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(72.5714, 0.05), addVariation(23.0225, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[4]._id.toString(),
        status: "pending",
      }
    );

    // Owner 6: Shah Realty - Surat & Vadodara (4 listings)
    allListings.push(
      {
        name: "3BHK Flat in Adajan, Surat",
        description: "Beautiful 3-bedroom flat in Adajan area. Well-ventilated, modern design, 3 bathrooms, spacious kitchen, and living area. Close to Surat Diamond Bourse, schools, and hospitals. Gated society with amenities.",
        address: "Adajan Gam, Near Surat Diamond Bourse, Surat, Gujarat 395009",
        regularPrice: 5500000,
        discountPrice: 5200000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.8311, 0.05), addVariation(21.1702, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[5]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Apartment for Rent in Vesu, Surat",
        description: "Fully furnished 2-bedroom apartment in upscale Vesu area. Premium location, modern amenities, 2 bathrooms, modular kitchen, and covered parking. Near Dumas Beach, shopping complexes, and restaurants.",
        address: "Vesu, Near Dumas Beach, Surat, Gujarat 395007",
        regularPrice: 22000,
        discountPrice: 20000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.8311, 0.05), addVariation(21.1702, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[5]._id.toString(),
        status: "pending",
      },
      {
        name: "4BHK Duplex in Alkapuri, Vadodara",
        description: "Luxurious 4-bedroom duplex apartment in premium Alkapuri area. Spread over 2 floors, 4 bathrooms, large living spaces, modern kitchen, and private terrace. Close to Sayaji Baug, shopping malls, and business district.",
        address: "Alkapuri, Near Sayaji Baug, Vadodara, Gujarat 390005",
        regularPrice: 9800000,
        discountPrice: 9200000,
        bathrooms: 4,
        bedrooms: 4,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(73.1812, 0.05), addVariation(22.3072, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
        ],
        userRef: owners[5]._id.toString(),
        status: "pending",
      },
      {
        name: "1BHK Flat in Manjalpur, Vadodara",
        description: "Affordable 1-bedroom flat in Manjalpur area. Clean and well-maintained, suitable for students or working professionals. Basic amenities, close to MSU University, markets, and public transport.",
        address: "Manjalpur, Near MSU University, Vadodara, Gujarat 390011",
        regularPrice: 8500,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: false,
        parking: false,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(73.1812, 0.05), addVariation(22.3072, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[5]._id.toString(),
        status: "pending",
      }
    );

    // Owner 7: Desai Homes - Rajkot & Jamnagar (4 listings)
    allListings.push(
      {
        name: "3BHK Independent House in Kalawad Road, Rajkot",
        description: "Spacious 3-bedroom independent house in prime Kalawad Road area. Large plot, 3 bathrooms, drawing room, dining hall, modern kitchen, and private garden. Near schools, hospitals, and shopping areas.",
        address: "Kalawad Road, Near Race Course, Rajkot, Gujarat 360005",
        regularPrice: 6500000,
        discountPrice: 6200000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(70.8022, 0.05), addVariation(22.3039, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
        ],
        userRef: owners[6]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Apartment for Rent in University Road, Rajkot",
        description: "Well-furnished 2-bedroom apartment near university area. Modern amenities, 2 bathrooms, fully equipped kitchen, and covered parking. Ideal for families or professionals. Close to RK University and business centers.",
        address: "University Road, Near RK University, Rajkot, Gujarat 360005",
        regularPrice: 15000,
        discountPrice: 14000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(70.8022, 0.05), addVariation(22.3039, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[6]._id.toString(),
        status: "pending",
      },
      {
        name: "5BHK Bungalow in Bedi, Jamnagar",
        description: "Luxurious 5-bedroom bungalow in Bedi area. Grand architecture, 5 bathrooms, large living spaces, modern kitchen, home theater, wine cellar, outdoor pool, and guest house. Perfect for entertaining. Located in prestigious neighborhood.",
        address: "Bedi Area, Near Marine National Park, Jamnagar, Gujarat 361008",
        regularPrice: 18500000,
        discountPrice: 17500000,
        bathrooms: 5,
        bedrooms: 5,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(70.0587, 0.05), addVariation(22.4707, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
        ],
        userRef: owners[6]._id.toString(),
        status: "pending",
      },
      {
        name: "1BHK Studio in City Center, Jamnagar",
        description: "Compact 1-bedroom studio apartment in city center. Fully furnished, modern kitchenette, attached bathroom, and basic amenities. Close to markets, restaurants, and public transport. Perfect for students or working professionals.",
        address: "City Center, Near City Police Station, Jamnagar, Gujarat 361001",
        regularPrice: 8000,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: true,
        parking: false,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(70.0587, 0.05), addVariation(22.4707, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[6]._id.toString(),
        status: "pending",
      }
    );

    // Owner 8: Mehta Properties - Bhavnagar & Anand (4 listings)
    allListings.push(
      {
        name: "4BHK Villa in Nilambag, Bhavnagar",
        description: "Elegant 4-bedroom villa in prestigious Nilambag area. Modern architecture, 4 bathrooms, spacious interiors, private garden, and covered parking. Close to Takhteshwar Temple, beaches, and business district.",
        address: "Nilambag, Near Takhteshwar Temple, Bhavnagar, Gujarat 364001",
        regularPrice: 7500000,
        discountPrice: 7200000,
        bathrooms: 4,
        bedrooms: 4,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.1519, 0.05), addVariation(21.7645, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[7]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Flat for Rent in Waghawadi, Bhavnagar",
        description: "Well-maintained 2-bedroom flat in Waghawadi area. Semi-furnished, 2 bathrooms, modern kitchen, and covered parking. Close to schools, hospitals, and shopping areas. Available for immediate occupancy.",
        address: "Waghawadi Road, Near Central Bank, Bhavnagar, Gujarat 364001",
        regularPrice: 13000,
        discountPrice: 12000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.1519, 0.05), addVariation(21.7645, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[7]._id.toString(),
        status: "pending",
      },
      {
        name: "3BHK Apartment in Anand City",
        description: "Modern 3-bedroom apartment in Anand city center. Well-designed layout, 3 bathrooms, modular kitchen, and covered parking. Close to Amul Dairy, educational institutions, and business centers.",
        address: "Anand City, Near Amul Dairy, Anand, Gujarat 388001",
        regularPrice: 4200000,
        discountPrice: 4000000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.9289, 0.05), addVariation(22.5645, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[7]._id.toString(),
        status: "pending",
      },
      {
        name: "1BHK Studio Apartment in Anand",
        description: "Affordable 1-bedroom studio in Anand. Basic amenities, kitchenette, attached bathroom, and parking space. Ideal for students or working professionals. Close to colleges and markets.",
        address: "Anand City, Near Charotar University, Anand, Gujarat 388001",
        regularPrice: 7000,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: false,
        parking: true,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(72.9289, 0.05), addVariation(22.5645, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[7]._id.toString(),
        status: "pending",
      }
    );

    // Owner 9: Jain Estates - Mehsana & Bharuch (4 listings)
    allListings.push(
      {
        name: "3BHK Independent House in Mehsana",
        description: "Spacious 3-bedroom independent house in Mehsana city. Large plot, 3 bathrooms, drawing room, dining area, modern kitchen, and private garden. Near government offices, schools, and hospitals.",
        address: "Mehsana City, Near Collectorate Office, Mehsana, Gujarat 384001",
        regularPrice: 4800000,
        discountPrice: 4500000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.3693, 0.05), addVariation(23.5880, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
        ],
        userRef: owners[8]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Flat for Rent in Mehsana",
        description: "Well-furnished 2-bedroom flat in Mehsana. Modern amenities, 2 bathrooms, fully equipped kitchen, and covered parking. Close to markets, schools, and public transport.",
        address: "Mehsana City, Near Bus Stand, Mehsana, Gujarat 384001",
        regularPrice: 11000,
        discountPrice: 10000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.3693, 0.05), addVariation(23.5880, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[8]._id.toString(),
        status: "pending",
      },
      {
        name: "4BHK Bungalow in Bharuch",
        description: "Luxurious 4-bedroom bungalow in Bharuch. Premium location, 4 bathrooms, large living spaces, modern kitchen, and landscaped garden. Close to Narmada River, industrial area, and business centers.",
        address: "Bharuch City, Near Narmada River, Bharuch, Gujarat 392001",
        regularPrice: 6800000,
        discountPrice: 6500000,
        bathrooms: 4,
        bedrooms: 4,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.9959, 0.05), addVariation(21.7051, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
        ],
        userRef: owners[8]._id.toString(),
        status: "pending",
      },
      {
        name: "1BHK Apartment in Bharuch",
        description: "Compact 1-bedroom apartment in Bharuch city. Clean and well-maintained, suitable for singles or couples. Basic amenities, close to markets and public transport.",
        address: "Bharuch City, Near Railway Station, Bharuch, Gujarat 392001",
        regularPrice: 9000,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: false,
        parking: false,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(72.9959, 0.05), addVariation(21.7051, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[8]._id.toString(),
        status: "pending",
      }
    );

    // Owner 10: Gujarati Homes - Navsari & Junagadh (4 listings)
    allListings.push(
      {
        name: "3BHK Flat in Navsari City",
        description: "Modern 3-bedroom flat in Navsari. Well-designed layout, 3 bathrooms, modular kitchen, and covered parking. Close to schools, hospitals, and shopping areas.",
        address: "Navsari City, Near Railway Station, Navsari, Gujarat 396445",
        regularPrice: 3800000,
        discountPrice: 3600000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.9280, 0.05), addVariation(20.9469, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[9]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Apartment for Rent in Navsari",
        description: "Fully furnished 2-bedroom apartment in Navsari. Modern amenities, 2 bathrooms, fully equipped kitchen, and covered parking. Close to markets and public transport.",
        address: "Navsari City, Near Bus Stand, Navsari, Gujarat 396445",
        regularPrice: 14000,
        discountPrice: 13000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.9280, 0.05), addVariation(20.9469, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[9]._id.toString(),
        status: "pending",
      },
      {
        name: "4BHK Independent House in Junagadh",
        description: "Spacious 4-bedroom independent house in Junagadh. Large plot, 4 bathrooms, drawing room, dining area, modern kitchen, and private garden. Near Girnar Hill, Uparkot Fort, and educational institutions.",
        address: "Junagadh City, Near Girnar Hill, Junagadh, Gujarat 362001",
        regularPrice: 5200000,
        discountPrice: 5000000,
        bathrooms: 4,
        bedrooms: 4,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(70.4579, 0.05), addVariation(21.5222, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[9]._id.toString(),
        status: "pending",
      },
      {
        name: "1BHK Studio in Junagadh",
        description: "Affordable 1-bedroom studio in Junagadh. Basic amenities, kitchenette, attached bathroom, and parking. Ideal for students or working professionals. Close to colleges and markets.",
        address: "Junagadh City, Near University, Junagadh, Gujarat 362001",
        regularPrice: 7500,
        discountPrice: 0,
        bathrooms: 1,
        bedrooms: 1,
        furnished: false,
        parking: true,
        type: "rent",
        offer: false,
        location: {
          type: "Point",
          coordinates: [addVariation(70.4579, 0.05), addVariation(21.5222, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[9]._id.toString(),
        status: "pending",
      }
    );

    // Owner 11: Amdavad Properties - Ahmedabad & Gandhinagar (5 listings)
    allListings.push(
      {
        name: "5BHK Luxury Penthouse in Bodakdev, Ahmedabad",
        description: "Ultra-luxurious 5-bedroom penthouse in premium Bodakdev area. Top floor, panoramic city views, 5 bathrooms, premium finishes, private terrace, and concierge service. Building amenities include gym, pool, and rooftop lounge.",
        address: "Bodakdev, Near ISKCON Crossroads, Ahmedabad, Gujarat 380054",
        regularPrice: 18500000,
        discountPrice: 17500000,
        bathrooms: 5,
        bedrooms: 5,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.5714, 0.05), addVariation(23.0225, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
        ],
        userRef: owners[10]._id.toString(),
        status: "pending",
      },
      {
        name: "3BHK Flat for Rent in Navrangpura, Ahmedabad",
        description: "Premium 3-bedroom flat in Navrangpura area. Fully furnished, modern interiors, 3 bathrooms, modular kitchen, and covered parking. Close to Law Garden, C.G. Road, and business district.",
        address: "Navrangpura, Near Law Garden, Ahmedabad, Gujarat 380009",
        regularPrice: 28000,
        discountPrice: 26000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.5714, 0.05), addVariation(23.0225, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        ],
        userRef: owners[10]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Apartment in Maninagar, Ahmedabad",
        description: "Well-maintained 2-bedroom apartment in Maninagar. Semi-furnished, 2 bathrooms, modern kitchen, and covered parking. Close to Kankaria Lake, schools, and hospitals.",
        address: "Maninagar, Near Kankaria Lake, Ahmedabad, Gujarat 380008",
        regularPrice: 3200000,
        discountPrice: 3000000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.5714, 0.05), addVariation(23.0225, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[10]._id.toString(),
        status: "pending",
      },
      {
        name: "4BHK Villa in Sector 7, Gandhinagar",
        description: "Elegant 4-bedroom villa in Gandhinagar Sector 7. Modern architecture, 4 bathrooms, spacious interiors, private garden, and covered parking. Near government offices and educational institutions.",
        address: "Sector 7, Near Infocity, Gandhinagar, Gujarat 382007",
        regularPrice: 9500000,
        discountPrice: 9000000,
        bathrooms: 4,
        bedrooms: 4,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.6369, 0.05), addVariation(23.2156, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[10]._id.toString(),
        status: "pending",
      },
      {
        name: "1BHK Flat for Rent in Gandhinagar",
        description: "Compact 1-bedroom flat in Gandhinagar. Fully furnished, modern kitchenette, attached bathroom, and parking. Close to government offices and public transport.",
        address: "Sector 21, Gandhinagar, Gujarat 382021",
        regularPrice: 10000,
        discountPrice: 9500,
        bathrooms: 1,
        bedrooms: 1,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.6369, 0.05), addVariation(23.2156, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[10]._id.toString(),
        status: "pending",
      }
    );

    // Owner 12: Surat Realty - Surat & Vadodara (5 listings)
    allListings.push(
      {
        name: "4BHK Duplex in Pal, Surat",
        description: "Luxurious 4-bedroom duplex apartment in Pal area. Spread over 2 floors, 4 bathrooms, large living spaces, modern kitchen, and private terrace. Close to Surat Airport, shopping malls, and business district.",
        address: "Pal Area, Near Surat Airport, Surat, Gujarat 395007",
        regularPrice: 12000000,
        discountPrice: 11500000,
        bathrooms: 4,
        bedrooms: 4,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.8311, 0.05), addVariation(21.1702, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop",
        ],
        userRef: owners[11]._id.toString(),
        status: "pending",
      },
      {
        name: "3BHK Flat for Rent in Piplod, Surat",
        description: "Premium 3-bedroom flat in Piplod area. Fully furnished, modern amenities, 3 bathrooms, modular kitchen, and covered parking. Close to Dumas Beach, shopping complexes, and restaurants.",
        address: "Piplod, Near Dumas Beach, Surat, Gujarat 395007",
        regularPrice: 25000,
        discountPrice: 23000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.8311, 0.05), addVariation(21.1702, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
        ],
        userRef: owners[11]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Apartment in Varachha, Surat",
        description: "Well-maintained 2-bedroom apartment in Varachha area. Semi-furnished, 2 bathrooms, modern kitchen, and covered parking. Close to diamond market, schools, and hospitals.",
        address: "Varachha, Near Diamond Market, Surat, Gujarat 395006",
        regularPrice: 2800000,
        discountPrice: 2650000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(72.8311, 0.05), addVariation(21.1702, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[11]._id.toString(),
        status: "pending",
      },
      {
        name: "3BHK Flat in Gotri, Vadodara",
        description: "Modern 3-bedroom flat in Gotri area. Well-designed layout, 3 bathrooms, modular kitchen, and covered parking. Close to MSU University, shopping malls, and business centers.",
        address: "Gotri, Near MSU University, Vadodara, Gujarat 390021",
        regularPrice: 4500000,
        discountPrice: 4300000,
        bathrooms: 3,
        bedrooms: 3,
        furnished: false,
        parking: true,
        type: "sale",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(73.1812, 0.05), addVariation(22.3072, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
        ],
        userRef: owners[11]._id.toString(),
        status: "pending",
      },
      {
        name: "2BHK Flat for Rent in Akota, Vadodara",
        description: "Fully furnished 2-bedroom flat in Akota area. Modern amenities, 2 bathrooms, fully equipped kitchen, and covered parking. Close to Akota Stadium, schools, and hospitals.",
        address: "Akota, Near Akota Stadium, Vadodara, Gujarat 390020",
        regularPrice: 16000,
        discountPrice: 15000,
        bathrooms: 2,
        bedrooms: 2,
        furnished: true,
        parking: true,
        type: "rent",
        offer: true,
        location: {
          type: "Point",
          coordinates: [addVariation(73.1812, 0.05), addVariation(22.3072, 0.05)],
        },
        imageUrls: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
        ],
        userRef: owners[11]._id.toString(),
        status: "pending",
      }
    );

    // Insert all listings
    console.log(`\n   📝 Inserting ${allListings.length} listings into database...`);
    const insertedListings = await Listing.insertMany(allListings);
    console.log(`   ✅ Successfully created ${insertedListings.length} listings (all pending approval)`);

    // Approve all listings as admin
    console.log("\n📋 Step 5: Approving all listings as admin...");
    
    // Try to get admin token from sign-in or cookie file
    let accessToken = null;
    
    // Method 1: Try to sign in as admin
    try {
      const signInResponse = await axios.post(
        `${API_URL}/api/auth/signin`,
        {
          email: "admin@test.com",
          password: "Admin123",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          maxRedirects: 0,
        }
      );

      // Extract cookie from response headers
      const setCookieHeader = signInResponse.headers["set-cookie"];
      if (setCookieHeader) {
        const cookieArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        for (const cookie of cookieArray) {
          if (cookie.includes("access_token=")) {
            accessToken = cookie.split("access_token=")[1]?.split(";")[0];
            break;
          }
        }
      }
      console.log("   ✅ Successfully signed in as admin");
    } catch (signInError) {
      // If sign-in fails, try reading from cookie file
      console.log("   ⚠️  Sign-in failed, trying cookie file...");
    }

    // Method 2: Try reading from admin_cookies.txt file
    if (!accessToken) {
      try {
        const cookieFile = path.join(process.cwd(), "admin_cookies.txt");
        if (fs.existsSync(cookieFile)) {
          const cookieContent = fs.readFileSync(cookieFile, "utf-8");
          // Try different cookie file formats
          const patterns = [
            /access_token[=\t]([^\s;]+)/,
            /access_token\t([^\s]+)/,
            /access_token=([^\s;]+)/,
          ];
          
          for (const pattern of patterns) {
            const match = cookieContent.match(pattern);
            if (match && match[1]) {
              accessToken = match[1];
              console.log("   📄 Using token from admin_cookies.txt");
              break;
            }
          }
        }
      } catch (err) {
        console.log("   ⚠️  Could not read admin_cookies.txt");
      }
    }

    // Approve listings
    if (accessToken) {
      // Try API approval first
      console.log("   ✅ Got admin token, approving via API...");
      let approvedCount = 0;
      let failedCount = 0;

      for (const listing of insertedListings) {
        try {
          await axios.post(
            `${API_URL}/api/admin/listings/${listing._id}/approve`,
            {},
            {
              headers: {
                Cookie: `access_token=${accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          approvedCount++;
          if (approvedCount % 10 === 0) {
            process.stdout.write(`\r   ✅ Approved ${approvedCount}/${insertedListings.length} listings...`);
          }
        } catch (error) {
          failedCount++;
          // Fallback: approve directly in database
          listing.status = "approved";
          listing.approvedBy = adminUser._id;
          listing.approvedAt = new Date();
          await listing.save();
        }
      }
      console.log(`\n   ✅ Successfully approved ${approvedCount} listings via API`);
      if (failedCount > 0) {
        console.log(`   ⚠️  ${failedCount} listings approved directly in database (API failed)`);
      }
    } else {
      // Fallback: approve directly in database
      console.log("   ⚠️  No admin token found. Approving listings directly in database...");
      for (const listing of insertedListings) {
        listing.status = "approved";
        listing.approvedBy = adminUser._id;
        listing.approvedAt = new Date();
        await listing.save();
      }
      console.log(`   ✅ Approved ${insertedListings.length} listings directly in database`);
    }

    // Final Summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log("\n" + "=".repeat(70));
    console.log("📊 FINAL SEEDING SUMMARY");
    console.log("=".repeat(70));
    console.log(`👑 Admin User: admin@test.com (password: Admin123)`);
    console.log(`👤 Total Owners Created: ${owners.length}`);
    console.log("\n📋 Owner Details:");
    owners.forEach((owner, idx) => {
      const ownerListings = insertedListings.filter(l => l.userRef === owner._id.toString());
      console.log(`   ${idx + 1}. ${owner.username.padEnd(20)} (${owner.email.padEnd(25)}) - ${ownerListings.length} listings`);
    });
    
    console.log(`\n📋 Total Listings: ${insertedListings.length}`);
    console.log(`   - For Rent: ${insertedListings.filter(l => l.type === 'rent').length}`);
    console.log(`   - For Sale: ${insertedListings.filter(l => l.type === 'sale').length}`);
    console.log(`   - With Offers: ${insertedListings.filter(l => l.offer === true).length}`);
    console.log(`   - Furnished: ${insertedListings.filter(l => l.furnished === true).length}`);
    console.log(`   - With Parking: ${insertedListings.filter(l => l.parking === true).length}`);
    
    // Count listings by city (Gujarat cities)
    console.log(`\n📍 Listings by City (Gujarat):`);
    const cityCounts = {};
    insertedListings.forEach(listing => {
      const address = listing.address.toLowerCase();
      for (const city of gujaratCities) {
        if (address.includes(city.name.toLowerCase())) {
          cityCounts[city.name] = (cityCounts[city.name] || 0) + 1;
          break;
        }
      }
    });
    Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([city, count]) => {
        console.log(`   - ${city.padEnd(15)}: ${count} listings`);
      });
    
    // Verify approval status
    const approvedListings = await Listing.find({ status: "approved" });
    console.log(`\n✅ Approval Status: ${approvedListings.length}/${insertedListings.length} listings approved`);
    
    if (approvedListings.length === insertedListings.length) {
      console.log("🎉 All listings have been approved and are ready for search/filter testing!");
    } else {
      console.log("⚠️  Some listings may still be pending. Check database.");
    }
    
    console.log("\n" + "=".repeat(70));
    console.log("🧪 TEST CREDENTIALS");
    console.log("=".repeat(70));
    console.log("Admin: admin@test.com / Admin123");
    console.log("\nOwners (all passwords: Owner123):");
    owners.forEach((owner, idx) => {
      console.log(`   ${idx + 1}. ${owner.email}`);
    });
    
    console.log("\n" + "=".repeat(70));
    console.log("✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log(`⏱️  Total Time: ${duration} seconds`);
    console.log(`📍 Properties located in: Gujarat, India & Generic Locations`);
    console.log("=".repeat(70));
    
    // Close database connection
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("\n" + "=".repeat(70));
    console.error("❌ ERROR DURING SEEDING");
    console.error("=".repeat(70));
    console.error("Error Details:", error.message);
    if (error.response) {
      console.error("   API Error:", error.response.data);
    }
    if (error.stack) {
      console.error("\nStack Trace:");
      console.error(error.stack);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
};