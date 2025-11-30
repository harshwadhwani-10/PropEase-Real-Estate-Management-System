# Phase 1: Core Authentication, RBAC, Listing Approval, and Security Hardening

## ✅ Status: COMPLETED

All Phase 1 tasks have been successfully implemented.

---

## 📝 Modified/Created Files

### Modified Files (8)
1. **api/models/user.model.js** - Added `role` field with enum ["buyer", "owner", "admin"], default "buyer"
2. **api/models/listing.model.js** - Added `status`, `approvedBy`, `approvedAt` fields
3. **api/utils/verifyUser.js** - Enhanced with `verifyRole()` and `verifyAdmin()` middleware, updated `verifyToken()` to include role
4. **api/controllers/auth.controller.js** - Added express-validator validation, default role "buyer" on signup
5. **api/controllers/listing.controller.js** - Set status "pending" on create, owner/admin checks for update/delete, approval filtering
6. **api/routes/auth.route.js** - Added validation middleware to signup route
7. **api/index.js** - Added helmet, xss-clean, rate limiting, and admin routes

### Created Files (2)
8. **api/controllers/admin.controller.js** - New admin controller with pending listings, approve, reject functions
9. **api/routes/admin.route.js** - New admin routes with verifyAdmin protection

---

## 🔧 Key Changes

### 1. User Model - Role-Based Access
```javascript
role: {
  type: String,
  enum: ["buyer", "owner", "admin"],
  default: "buyer",
}
```

### 2. Listing Model - Approval Workflow
```javascript
status: {
  type: String,
  enum: ["pending", "approved", "rejected"],
  default: "pending",
},
approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
approvedAt: { type: Date },
```

### 3. Enhanced Authentication Middleware
- `verifyToken()` now fetches user from DB and includes role
- `verifyRole(...allowedRoles)` - Flexible role checking
- `verifyAdmin` - Admin-only access shortcut

### 4. Input Validation
- Username: 3-30 chars, alphanumeric + underscore
- Email: Valid email format
- Password: Min 6 chars, must contain uppercase, lowercase, and number

### 5. Security Middleware
- **Helmet**: Security headers
- **XSS-Clean**: XSS protection
- **Rate Limiting**: 100 requests per 15 minutes per IP

### 6. Listing Approval Flow
- New listings automatically set to "pending"
- Only approved listings visible to public
- Owners and admins can see their own/all listings
- Admin can approve/reject listings

---

## 🛣️ New/Updated Routes

### Admin Routes (NEW)
| Method | Path | Controller | Protection |
|--------|------|------------|------------|
| GET | `/api/admin/listings/pending` | `getPendingListings` | verifyToken + verifyAdmin |
| POST | `/api/admin/listings/:id/approve` | `approveListing` | verifyToken + verifyAdmin |
| POST | `/api/admin/listings/:id/reject` | `rejectListing` | verifyToken + verifyAdmin |

### Updated Routes
| Method | Path | Changes |
|--------|------|---------|
| POST | `/api/auth/signup` | Added validation middleware |
| POST | `/api/listing/create` | Sets status to "pending" |
| GET | `/api/listing/get` | Only shows approved listings (unless admin with showAll=true) |
| GET | `/api/listing/get/:id` | Checks approval status |
| POST | `/api/listing/update/:id` | Owner or admin can update |
| DELETE | `/api/listing/delete/:id` | Owner or admin can delete |

---

## 🧪 Test Checklist

### Prerequisites
1. Start MongoDB
2. Start backend: `npm run dev`
3. Have a test database with at least one admin user

### Test 1: Buyer Signup (Default Role)
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testbuyer",
    "email": "buyer@test.com",
    "password": "Test123"
  }'

# Expected: 201 Created
# Verify in DB: role should be "buyer"
```

### Test 2: Validation - Invalid Password
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@test.com",
    "password": "weak"
  }'

# Expected: 400 Bad Request
# Error: "Password must be at least 6 characters long"
```

### Test 3: Validation - Invalid Email
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "invalid-email",
    "password": "Test123"
  }'

# Expected: 400 Bad Request
# Error: "Please provide a valid email address"
```

### Test 4: Owner Create Listing (Status Pending)
```bash
# First, sign in as owner (or buyer who will create listing)
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "owner@test.com",
    "password": "Test123"
  }'

# Create listing
curl -X POST http://localhost:5000/api/listing/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Test Property",
    "description": "Test description",
    "address": "123 Test St",
    "regularPrice": 1000,
    "discountPrice": 0,
    "bathrooms": 2,
    "bedrooms": 3,
    "furnished": true,
    "parking": true,
    "type": "rent",
    "offer": false,
    "imageUrls": ["https://example.com/image.jpg"],
    "userRef": "USER_ID_HERE"
  }'

# Expected: 201 Created
# Verify in DB: status should be "pending"
```

### Test 5: Listing Not Visible Until Approved
```bash
# Try to get listing (should fail if not approved and not owner/admin)
curl http://localhost:5000/api/listing/get/LISTING_ID

# Expected: 403 Forbidden
# Error: "This listing is pending approval"

# Try to search listings
curl "http://localhost:5000/api/listing/get?type=rent"

# Expected: 200 OK
# Verify: Pending listing should NOT appear in results
```

### Test 6: Admin Get Pending Listings
```bash
# Sign in as admin
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c admin_cookies.txt \
  -d '{
    "email": "admin@test.com",
    "password": "Admin123"
  }'

# Get pending listings
curl http://localhost:5000/api/admin/listings/pending \
  -b admin_cookies.txt

# Expected: 200 OK
# Response: Array of pending listings
```

### Test 7: Admin Approve Listing
```bash
# Approve a pending listing
curl -X POST http://localhost:5000/api/admin/listings/LISTING_ID/approve \
  -b admin_cookies.txt

# Expected: 200 OK
# Response: { message: "Listing approved successfully", listing: {...} }
# Verify in DB: status="approved", approvedBy=admin_id, approvedAt=timestamp
```

### Test 8: Listing Visible After Approval
```bash
# Now try to get the approved listing
curl http://localhost:5000/api/listing/get/LISTING_ID

# Expected: 200 OK
# Response: Listing details

# Search listings
curl "http://localhost:5000/api/listing/get?type=rent"

# Expected: 200 OK
# Verify: Approved listing SHOULD appear in results
```

### Test 9: Admin Reject Listing
```bash
# Reject a pending listing
curl -X POST http://localhost:5000/api/admin/listings/LISTING_ID/reject \
  -b admin_cookies.txt

# Expected: 200 OK
# Response: { message: "Listing rejected successfully", listing: {...} }
# Verify in DB: status="rejected"
```

### Test 10: Owner/Admin Can Update/Delete
```bash
# Owner updates their own listing
curl -X POST http://localhost:5000/api/listing/update/LISTING_ID \
  -H "Content-Type: application/json" \
  -b owner_cookies.txt \
  -d '{"name": "Updated Name"}'

# Expected: 200 OK (if owner)
# Expected: 401 Unauthorized (if different user)

# Admin can update any listing
curl -X POST http://localhost:5000/api/listing/update/LISTING_ID \
  -H "Content-Type: application/json" \
  -b admin_cookies.txt \
  -d '{"name": "Admin Updated Name"}'

# Expected: 200 OK
```

### Test 11: Security Headers (Helmet)
```bash
curl -I http://localhost:5000/api/auth/signin

# Expected Headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# (and other security headers)
```

### Test 12: Rate Limiting
```bash
# Make 101 requests quickly
for i in {1..101}; do
  curl http://localhost:5000/api/listing/get
done

# Expected: First 100 succeed, 101st returns 429 Too Many Requests
```

### Test 13: Non-Admin Cannot Access Admin Routes
```bash
# Buyer tries to access admin route
curl http://localhost:5000/api/admin/listings/pending \
  -b buyer_cookies.txt

# Expected: 403 Forbidden
# Error: "Forbidden: Insufficient permissions"
```

---

## 📊 Summary

### Implemented Features
✅ Role-based access control (buyer, owner, admin)  
✅ User model with role field  
✅ Listing approval workflow (pending → approved/rejected)  
✅ Admin controller and routes  
✅ Input validation with express-validator  
✅ Security middleware (helmet, xss-clean, rate limiting)  
✅ Enhanced authentication with role checking  
✅ Owner/admin permissions for listing management  
✅ Approval filtering in listing queries  

### Security Enhancements
✅ Helmet.js for security headers  
✅ XSS protection with xss-clean  
✅ Rate limiting (100 req/15min)  
✅ Input validation and sanitization  
✅ Role-based route protection  

### Code Quality
✅ Consistent ES module syntax  
✅ Proper error handling  
✅ Middleware separation  
✅ Controller-based architecture  

---

## 🚀 Next Steps

1. **Create Admin User**: Manually set a user's role to "admin" in database for testing
2. **Test All Scenarios**: Run through the test checklist above
3. **Frontend Integration**: Update frontend to handle approval workflow
4. **Admin Dashboard**: Build UI for admin to manage listings

---

## ⚠️ Important Notes

1. **Existing Users**: Users created before this update will have `role: undefined`. You may need to run a migration script to set default roles.

2. **Existing Listings**: Listings created before this update will have `status: undefined`. You may need to set them to "approved" manually or via migration.

3. **Admin Creation**: To create an admin user, manually update the database:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

4. **JWT Tokens**: Existing tokens won't have role information. Users need to sign in again to get updated tokens.

---

**Phase 1 Implementation Complete!** 🎉

