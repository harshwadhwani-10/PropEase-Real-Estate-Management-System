# Database Seeder Documentation

## Overview

The seeder creates a comprehensive test dataset with:
- **1 Admin user** (for approval workflow)
- **4 Owner users** (each with 2-3 listings)
- **11 Total listings** (diverse properties for testing search/filter)
- **All listings approved** (ready for search/filter testing)

---

## What Gets Created

### Admin User
- **Email:** `admin@realestate.com`
- **Password:** `Admin123`
- **Role:** `admin`
- **Purpose:** Approve all listings

### Owner Users (4 owners)

1. **John Property** (`john@property.com` / `Owner123`)
   - 3 listings: Downtown loft, Luxury penthouse, Studio near university
   - Mix of rent/sale, various price ranges

2. **Sarah Homes** (`sarah@homes.com` / `Owner123`)
   - 3 listings: Family home, Townhouse, Starter home
   - Family-oriented properties, suburban areas

3. **Mike Estates** (`mike@estates.com` / `Owner123`)
   - 2 listings: Beachfront condo, Luxury estate
   - High-end luxury properties

4. **Emily Realty** (`emily@realty.com` / `Owner123`)
   - 3 listings: Affordable apartment, Arts district loft, Luxury apartment
   - Diverse rental options

### Listings Distribution

- **Total:** 11 listings
- **For Rent:** 6 listings
- **For Sale:** 5 listings
- **With Offers:** 7 listings
- **Furnished:** 6 listings
- **With Parking:** 9 listings
- **Price Range:** $750 - $1,150,000
- **Bedrooms:** 1-5 bedrooms
- **Bathrooms:** 1-5 bathrooms

---

## How to Run

### Prerequisites
1. MongoDB must be running
2. Backend server should be running (optional - seeder has fallback)
3. Install dependencies: `npm install`

### Run Seeder
```bash
npm run seed
```

Or directly:
```bash
node api/seed.js
```

### What Happens
1. ✅ Connects to MongoDB
2. ✅ Clears existing listings (keeps users)
3. ✅ Creates/updates admin user
4. ✅ Creates/updates 4 owner users
5. ✅ Creates 11 listings (status: pending)
6. ✅ Attempts to approve via API (if server running)
7. ✅ Falls back to direct DB update if API unavailable
8. ✅ Shows comprehensive summary

---

## Approval Process

The seeder tries multiple methods to approve listings:

1. **Method 1:** Sign in as admin via API and get token
2. **Method 2:** Read token from `admin_cookies.txt` file
3. **Method 3:** Direct database update (fallback)

This ensures listings are approved even if the API server isn't running.

---

## Test Data Details

### Listing Types for Testing

**Rent Listings:**
- Studio ($750)
- 1-bedroom ($900)
- 2-bedroom lofts ($1,600-$2,600)
- 2-bedroom luxury ($3,100-$3,400)
- 3-bedroom townhouse ($3,100)

**Sale Listings:**
- Starter home ($275,000)
- Family home ($400,000)
- Beachfront condo ($580,000)
- Luxury penthouse ($900,000)
- Estate home ($1,100,000)

### Filter Testing Coverage

✅ **Type:** Both rent and sale  
✅ **Price Range:** Wide variety ($750 - $1.15M)  
✅ **Bedrooms:** 1, 2, 3, 4, 5  
✅ **Bathrooms:** 1, 2, 3, 5  
✅ **Furnished:** Both true and false  
✅ **Parking:** Both true and false  
✅ **Offers:** Both with and without offers  
✅ **Locations:** Downtown, Suburban, Beachfront, University, Arts District  

---

## Verification

After seeding, verify the data:

```bash
# Check listings count
curl http://localhost:5000/api/listing/get

# Check specific filters
curl "http://localhost:5000/api/listing/get?type=rent"
curl "http://localhost:5000/api/listing/get?type=sale"
curl "http://localhost:5000/api/listing/get?offer=true"
curl "http://localhost:5000/api/listing/get?furnished=true"
curl "http://localhost:5000/api/listing/get?parking=true"

# Check admin can see pending (should be 0 after approval)
curl -b admin_cookies.txt http://localhost:5000/api/admin/listings/pending
```

---

## Test Credentials Summary

| Role | Email | Password | Listings |
|------|-------|----------|----------|
| Admin | admin@realestate.com | Admin123 | N/A |
| Owner | john@property.com | Owner123 | 3 |
| Owner | sarah@homes.com | Owner123 | 3 |
| Owner | mike@estates.com | Owner123 | 2 |
| Owner | emily@realty.com | Owner123 | 3 |

---

## Notes

1. **Existing Users:** The seeder updates existing users if they already exist (sets role correctly)
2. **Listings:** All existing listings are cleared before seeding
3. **Approval:** All listings are automatically approved (ready for search/filter testing)
4. **Images:** All listings use Unsplash placeholder images
5. **Status:** All listings start as "pending" then get approved

---

## Troubleshooting

### Seeder fails to connect to MongoDB
- Check MongoDB is running
- Verify `MONGO` environment variable in `.env`

### API approval fails
- This is OK! Seeder falls back to direct DB update
- Check server is running if you want API approval

### Token not found
- Seeder will use direct DB update
- Or manually sign in as admin and update `admin_cookies.txt`

---

**Seeder is ready for Phase 2 testing!** 🎉

