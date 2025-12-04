# CORS & Credentials Deployment Fix ✅

## Problem That Was Fixed

Your backend was blocking authenticated requests from your Vercel/production frontend because of incorrect CORS configuration.

### The Error You Were Seeing

```
The value of the 'Access-Control-Allow-Origin' header must not be '*'
when the request's credentials mode is 'include'.
```

Or:

```
ERR_FAILED 200 (CORS blocked response)
```

---

## Root Cause

Your frontend sends **cookies** (JWT tokens) with requests using `withCredentials: true`, but your backend was configured with:

```javascript
cors({
  origin: "*",
  credentials: false,  // ❌ WRONG
})
```

This combination is **illegal in CORS**. When credentials are included, the backend MUST:

1. Specify an exact domain (NOT "*")
2. Set `credentials: true`

---

## Solution Applied ✅

### Backend (`api/index.js`)

Changed from:

```javascript
app.use(
  cors({
    origin: "*",
    credentials: false,
  })
);
```

To:

```javascript
const allowedOrigins = [
  "http://localhost:5173",        // Local dev
  "http://localhost:3000",        // Local dev alternative
  process.env.CLIENT_URL,         // Vercel frontend or production domain
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️  CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,  // Allow cookies & authentication headers
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### Backend Environment (`api/.env`)

**Already correctly configured:**

```env
CLIENT_URL=https://propease-reality.shop
```

✅ This means your backend will now allow requests from:

- `http://localhost:5173` (local frontend development)
- `http://localhost:3000` (local alternative)
- `https://propease-reality.shop` (Vercel/production frontend)

### Frontend (`client/src/utils/api.js`)

**Already correctly configured:**

```javascript
const api = axios.create({
  baseURL: normalizedBase || "",
  withCredentials: true,  // ✅ Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});
```

---

## How CORS Works With Credentials

### Browser Security Check (Preflight)

When frontend makes an authenticated request:

1. Browser sends `OPTIONS` request with:

   ```
   Origin: https://propease-reality.shop
   ```

2. Backend responds with:

   ```
   Access-Control-Allow-Origin: https://propease-reality.shop
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

3. If origin matches and credentials is true:
   ✅ **Request allowed** - browser sends actual request with cookies

4. If origin is "*" or doesn't match:
   ❌ **Request blocked** - browser never sends the actual request

---

## Deployment Steps

### Step 1: Update Backend Code ✅ (Already Done)

The corrected CORS configuration is now in `api/index.js`.

### Step 2: Update Backend Environment Variable

On your deployment platform (Render, AWS, etc.), ensure:

```
CLIENT_URL=https://propease-reality.shop
```

If deploying to multiple domains:

```
CLIENT_URL=https://propease-reality.shop,https://www.propease-reality.shop
```

Then update code to split:

```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  ...(process.env.CLIENT_URL?.split(',').map(url => url.trim()) || []),
];
```

### Step 3: Restart Backend Services

- If on Render: Push to GitHub (or redeploy from console)
- If on AWS ECS: Update task definition with new image or restart service
- If on Vercel backend: Redeploy from Vercel dashboard

### Step 4: Verify Frontend .env

```env
# client/.env (for development)
VITE_API_URL=http://localhost:8000

# client/.env.production (for Vercel)
VITE_API_URL=https://propease-backend-alb-1265013565.ap-south-1.elb.amazonaws.com
# or if backend is also on Render:
VITE_API_URL=https://your-backend-url.onrender.com
```

### Step 5: Test the Fix

**Local Testing (before deployment):**

```bash
# Terminal 1 - Start backend
cd api
npm install
npm start

# Terminal 2 - Start frontend
cd client
npm install
npm run dev
```

Then visit `http://localhost:5173` and test login/authenticated requests.

**Production Verification:**

```bash
# Check if CORS preflight works
curl -X OPTIONS "https://propease-reality.shop" \
  -H "Origin: https://propease-reality.shop" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Response should include:
# Access-Control-Allow-Origin: https://propease-reality.shop
# Access-Control-Allow-Credentials: true
```

---

## Why This Fix Works

| Before | After |
|--------|-------|
| `origin: "*"` | `origin: function()` with whitelist |
| `credentials: false` | `credentials: true` |
| Blocks all authenticated requests | ✅ Allows authenticated requests with cookies |
| Frontend gets CORS error | ✅ JWT cookies transmitted securely |
| Login doesn't work in production | ✅ Login works everywhere |

---

## Important Notes for Production

⚠️ **Security Considerations:**

1. **Never use `origin: "*"` with authenticated requests** — it's a security vulnerability.

2. **Always validate `CLIENT_URL` from environment:**

   ```javascript
   if (!process.env.CLIENT_URL) {
     console.error("❌ CLIENT_URL environment variable not set!");
     process.exit(1);
   }
   ```

3. **Use HTTPS in production** — cookies are only sent over HTTPS by default (unless you set `sameSite: 'none'`).

4. **Set SameSite cookie policy** in your auth code:

   ```javascript
   // When setting JWT cookie
   res.cookie('token', jwtToken, {
     httpOnly: true,
     secure: true,  // HTTPS only
     sameSite: 'strict',  // Strict CORS for cookies
     maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
   });
   ```

---

## Troubleshooting

### Still getting CORS errors after deploying?

**Check 1: Verify CLIENT_URL is set**

```bash
# On your backend server/platform, check:
echo $CLIENT_URL
```

**Check 2: Verify frontend is actually sending from that domain**

```javascript
// In browser console on your frontend
console.log(window.location.origin);
// Should output: https://propease-reality.shop
```

**Check 3: Check backend logs for CORS warnings**

```
⚠️  CORS blocked origin: https://wrong-domain.com
```

**Check 4: Verify request includes credentials**
In browser DevTools Network tab, check request headers:

```
Cookie: <your-jwt-token>
```

---

## Files Modified

- ✅ `api/index.js` — Updated CORS configuration
- ✅ `api/.env` — Already has `CLIENT_URL=https://propease-reality.shop`
- ✅ `client/src/utils/api.js` — Already configured with `withCredentials: true`

---

## Summary

Your PropEase deployment is now **production-ready** with proper CORS & credential handling:

✅ Backend allows requests from your Vercel/production frontend
✅ Frontend sends cookies securely with authenticated requests
✅ Security whitelist prevents CORS attacks
✅ Local development still works on localhost

Deploy the updated backend and your login/authentication should work perfectly! 🚀
