# PHASE 2: Media Upload and Smart Search + Map Integration

## Implementation Summary

This document outlines all changes made for Phase 2, including media uploads, geolocation, enhanced search filters, and map-based browsing.

---

## 📋 Modified/Created Files

### Backend Files

#### 1. **`api/models/listing.model.js`** (Modified)
- Added `documents: [String]` field for document URLs
- Added `virtualTourUrl: String` field for 360° tour links
- Added `location` field with GeoJSON format:
  ```js
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] } // [longitude, latitude]
  }
  ```
- Added 2dsphere index for geospatial queries: `listingSchema.index({ location: "2dsphere" })`

#### 2. **`api/utils/geocode.js`** (NEW)
- Utility function `geocodeAddress(address)` using OpenStreetMap Nominatim API
- Returns `{ latitude, longitude }` or `null` if geocoding fails
- Includes commented alternative for Google Geocoding API

#### 3. **`api/utils/upload.js`** (NEW)
- Multer configuration for file uploads
- Supports images (JPEG, PNG, WebP) and documents (PDF, DOC, DOCX)
- Max file size: 5MB
- Stores files in `api/uploads/` directory

#### 4. **`api/controllers/upload.controller.js`** (NEW)
- `uploadFile`: Handles single file upload
- `uploadFiles`: Handles multiple file uploads (max 10)
- Returns file URLs for client use

#### 5. **`api/routes/upload.route.js`** (NEW)
- `POST /api/upload/single` - Single file upload (protected)
- `POST /api/upload/multiple` - Multiple files upload (protected)

#### 6. **`api/controllers/listing.controller.js`** (Modified)
- **`createListing`**: 
  - Automatically geocodes address on creation
  - Sets `status: "pending"` and `location` coordinates
- **`updateListing`**: 
  - Geocodes address if it was changed
  - Updates location coordinates
- **`getListings`**: Enhanced search with:
  - Price range filters (`minPrice`, `maxPrice`)
  - Geospatial search (`lat`, `lng`, `radiusKm`)
  - Maintains approval status filtering

#### 7. **`api/index.js`** (Modified)
- Added upload router: `app.use("/api/upload", uploadRouter)`
- Added static file serving: `app.use("/uploads", express.static(...))`

#### 8. **`package.json`** (Modified)
- Added `multer: "^1.4.5-lts.1"` dependency

### Frontend Files

#### 9. **`client/src/pages/Map.jsx`** (NEW)
- React Leaflet map component
- Displays property markers with popups
- Sidebar with listing cards
- Click markers to navigate to listing details
- Auto-centers map based on listing locations

#### 10. **`client/src/pages/Search.jsx`** (Modified)
- Added price range filters (`minPrice`, `maxPrice`)
- Updated URL params handling for price filters
- Fixed `onShowMoreClick` to use `api` instead of `fetch`

#### 11. **`client/src/pages/CreateListing.jsx`** (Modified)
- Added `virtualTourUrl` field to form state
- Added virtual tour URL input field in form

#### 12. **`client/src/pages/UpdateListing.jsx`** (Modified)
- Added `virtualTourUrl` field to form state
- Added virtual tour URL input field in form

#### 13. **`client/src/App.jsx`** (Modified)
- Added route: `<Route path='/map' element={<Map />} />`

#### 14. **`client/package.json`** (Modified)
- Added `leaflet: "^1.9.4"`
- Added `react-leaflet: "^4.2.1"`

---

## 🔌 API Routes Summary

### New Routes

| Method | Path | Controller | Description | Auth Required |
|--------|------|------------|-------------|----------------|
| POST | `/api/upload/single` | `uploadFile` | Upload single file | ✅ |
| POST | `/api/upload/multiple` | `uploadFiles` | Upload multiple files | ✅ |

### Updated Routes

| Method | Path | Controller | Changes |
|--------|------|------------|---------|
| POST | `/api/listing/create` | `createListing` | Auto-geocodes address, sets location |
| PUT | `/api/listing/update/:id` | `updateListing` | Geocodes address if changed |
| GET | `/api/listing/get` | `getListings` | Added price range & geospatial filters |

### Search Query Parameters

**GET `/api/listing/get`** now supports:
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `lat` (number): Latitude for radius search
- `lng` (number): Longitude for radius search
- `radiusKm` (number): Search radius in kilometers
- All existing filters: `searchTerm`, `type`, `parking`, `furnished`, `offer`, `sort`, `order`, `limit`, `startIndex`

---

## 🧪 Test Checklist

### 1. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd client
npm install
```

### 2. Environment Variables

**Backend (`api/.env`):**
```env
# Existing variables
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Optional: Google Geocoding API (for better accuracy)
# If not set, OpenStreetMap Nominatim will be used (free, no key required)
GOOGLE_MAPS_API_KEY=your_google_api_key_here
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

**Note:** 
- OpenStreetMap Nominatim is used by default (no API key required)
- For production, consider using Google Geocoding API for better accuracy
- File uploads are stored locally in `api/uploads/` - migrate to cloud storage for production

### 3. Test Geocoding

```bash
# Create a listing with address
curl -X POST http://localhost:5000/api/listing/create \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -d '{
    "name": "Test Property",
    "description": "A test property",
    "address": "1600 Amphitheatre Parkway, Mountain View, CA",
    "regularPrice": 500000,
    "discountPrice": 450000,
    "bedrooms": 3,
    "bathrooms": 2,
    "parking": true,
    "furnished": false,
    "type": "sale",
    "offer": true,
    "imageUrls": ["https://example.com/image.jpg"],
    "userRef": "USER_ID"
  }'

# Verify location coordinates in response
```

### 4. Test File Upload

```bash
# Single file upload
curl -X POST http://localhost:5000/api/upload/single \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf"

# Multiple files upload
curl -X POST http://localhost:5000/api/upload/multiple \
  -H "Cookie: access_token=YOUR_TOKEN" \
  -F "files=@/path/to/file1.jpg" \
  -F "files=@/path/to/file2.pdf"
```

### 5. Test Enhanced Search

```bash
# Search with price range
curl "http://localhost:5000/api/listing/get?minPrice=100000&maxPrice=500000&type=sale"

# Search with geospatial radius (5km from coordinates)
curl "http://localhost:5000/api/listing/get?lat=37.4224764&lng=-122.0842499&radiusKm=5"

# Combined filters
curl "http://localhost:5000/api/listing/get?minPrice=200000&maxPrice=800000&type=rent&furnished=true&parking=true"
```

### 6. Test Map Page

1. Navigate to `http://localhost:5173/map`
2. Verify map loads with OpenStreetMap tiles
3. Check that listing markers appear
4. Click a marker to see popup
5. Click "View Details" to navigate to listing page

### 7. Test Virtual Tour

1. Create/update a listing with virtual tour URL
2. Verify URL is saved in database
3. Display virtual tour link on listing detail page (if implemented)

---

## 📝 Notes

### Geocoding
- **Default:** OpenStreetMap Nominatim (free, no API key)
- **Alternative:** Google Geocoding API (better accuracy, requires API key)
- Geocoding happens automatically on listing create/update
- If geocoding fails, coordinates default to `[0, 0]`

### File Uploads
- Files stored locally in `api/uploads/`
- **Production:** Consider migrating to cloud storage (AWS S3, Cloudinary, Firebase)
- Max file size: 5MB per file
- Supported formats: Images (JPEG, PNG, WebP), Documents (PDF, DOC, DOCX)

### Map Integration
- Uses React Leaflet with OpenStreetMap tiles
- Markers show property name, address, price
- Click marker to view details
- Map auto-centers based on listing locations

### Search Enhancements
- Price range filters work with both `regularPrice` and `discountPrice`
- Geospatial search uses MongoDB `$near` operator
- Radius search requires `lat`, `lng`, and `radiusKm` parameters
- All filters can be combined

### Database Index
- **Important:** The 2dsphere index must be created for geospatial queries to work
- Run: `db.listings.createIndex({ location: "2dsphere" })` in MongoDB shell
- Or let Mongoose create it automatically on first query

---

## 🚀 Next Steps

1. **Cloud Storage Integration:** Migrate file uploads to cloud storage for production
2. **Map Clustering:** Add marker clustering for better performance with many listings
3. **Advanced Filters:** Add more filters (square footage, year built, etc.)
4. **Virtual Tour Display:** Add iframe/embed for virtual tour URLs on listing page
5. **Document Viewer:** Add document preview/download functionality
6. **Location Autocomplete:** Add address autocomplete using Google Places API

---

## ✅ Completion Status

- [x] Listing model updated with documents, virtualTourUrl, location
- [x] Geocoding utility created
- [x] File upload endpoints created
- [x] Enhanced search with price range and geospatial filters
- [x] Map page with React Leaflet
- [x] Price range filters in Search page
- [x] Virtual tour field in CreateListing/UpdateListing
- [x] All routes documented
- [x] Test checklist provided

---

**Phase 2 Implementation Complete!** 🎉

