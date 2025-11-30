import mongoose from "mongoose";
import dotenv from "dotenv";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:5000";

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
  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    await Listing.deleteMany({});
    console.log("🗑️  Cleared existing listings");

    // Create Admin User
    let adminUser = await User.findOne({ email: "admin@realestate.com" });
    if (!adminUser) {
      const hashedPassword = bcryptjs.hashSync("Admin123", 10);
      adminUser = new User({
        username: "admin",
        email: "admin@realestate.com",
        password: hashedPassword,
        role: "admin",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      });
      await adminUser.save();
      console.log("👑 Created admin user (admin@realestate.com / Admin123)");
    } else {
      adminUser.role = "admin";
      await adminUser.save();
      console.log("👑 Updated existing user to admin");
    }

    // Create 4 Owners
    const owners = [];
    const ownerData = [
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
        console.log(`👤 Created owner: ${ownerInfo.username}`);
      } else {
        owner.role = ownerInfo.role;
        await owner.save();
        console.log(`👤 Updated existing user to owner: ${ownerInfo.username}`);
      }
      owners.push(owner);
    }

    // Create listings for each owner (2-3 listings per owner)
    const allListings = [];

    // Owner 1: John - Mix of rent and sale, various price ranges
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
        imageUrls: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
        ],
        userRef: owners[0]._id.toString(),
        status: "pending",
      }
    );

    // Owner 2: Sarah - Family homes, suburban areas
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
        imageUrls: [
          "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop",
        ],
        userRef: owners[1]._id.toString(),
        status: "pending",
      }
    );

    // Owner 3: Mike - Luxury properties, high-end
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

    // Owner 4: Emily - Affordable rentals, diverse options
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

    // Insert all listings
    const insertedListings = await Listing.insertMany(allListings);
    console.log(`\n✅ Successfully created ${insertedListings.length} listings (all pending approval)`);

    // Approve all listings as admin
    console.log("\n🔐 Approving all listings as admin...");
    
    // Try to get admin token from sign-in or cookie file
    let accessToken = null;
    
    // Method 1: Try to sign in as admin
    try {
      const signInResponse = await axios.post(
        `${API_URL}/api/auth/signin`,
        {
          email: "admin@realestate.com",
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
    } catch (signInError) {
      // If sign-in fails, try reading from cookie file
      console.log("   Sign-in failed, trying cookie file...");
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
          process.stdout.write(`\r   ✅ Approved ${approvedCount}/${insertedListings.length} listings...`);
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
    console.log("\n" + "=".repeat(60));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`👑 Admin User: admin@realestate.com (password: Admin123)`);
    console.log(`👤 Owners Created: ${owners.length}`);
    owners.forEach((owner, idx) => {
      const ownerListings = insertedListings.filter(l => l.userRef === owner._id.toString());
      console.log(`   ${idx + 1}. ${owner.username} (${owner.email}) - ${ownerListings.length} listings`);
    });
    console.log(`\n📋 Total Listings: ${insertedListings.length}`);
    console.log(`   - For Rent: ${insertedListings.filter(l => l.type === 'rent').length}`);
    console.log(`   - For Sale: ${insertedListings.filter(l => l.type === 'sale').length}`);
    console.log(`   - With Offers: ${insertedListings.filter(l => l.offer === true).length}`);
    console.log(`   - Furnished: ${insertedListings.filter(l => l.furnished === true).length}`);
    console.log(`   - With Parking: ${insertedListings.filter(l => l.parking === true).length}`);
    
    // Verify approval status
    const approvedListings = await Listing.find({ status: "approved" });
    console.log(`\n✅ Approved Listings: ${approvedListings.length}/${insertedListings.length}`);
    
    if (approvedListings.length === insertedListings.length) {
      console.log("🎉 All listings have been approved and are ready for search/filter testing!");
    } else {
      console.log("⚠️  Some listings may still be pending. Check database.");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🧪 TEST CREDENTIALS");
    console.log("=".repeat(60));
    console.log("Admin: admin@realestate.com / Admin123");
    console.log("Owners:");
    owners.forEach(owner => {
      console.log(`  - ${owner.email} / Owner123`);
    });
    console.log("\n✅ Database seeding completed successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error);
    if (error.response) {
      console.error("   API Error:", error.response.data);
    }
    process.exit(1);
  }
};
