# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for your MERN Real Estate application using Firebase.

## Prerequisites

- A Google account
- A Firebase account (free tier is sufficient)
- Access to your project's frontend code

---

## Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Add project" or "Create a project"
   - Enter project name: `real-estate-app` (or your preferred name)
   - Click "Continue"
   - Disable Google Analytics (optional) or enable it if you want
   - Click "Create project"
   - Wait for project creation to complete
   - Click "Continue"

---

## Step 2: Enable Google Authentication

1. **Navigate to Authentication**
   - In the Firebase Console, click on "Authentication" in the left sidebar
   - If you see "Get started", click it

2. **Enable Google Sign-In Provider**
   - Click on the "Sign-in method" tab
   - Find "Google" in the list of providers
   - Click on "Google"
   - Toggle "Enable" to ON
   - **Set Project support email**: Enter your email address
   - Click "Save"

3. **Note the Web client ID** (optional, you might not need this for Firebase SDK)

---

## Step 3: Register Your Web App

1. **Add Web App to Firebase**
   - In the Firebase Console, click the gear icon (⚙️) next to "Project Overview"
   - Click "Project settings"
   - Scroll down to "Your apps" section
   - Click the web icon (`</>`) to add a web app

2. **Register App**
   - Enter app nickname: `Real Estate Web App` (or your preferred name)
   - **Do NOT check** "Also set up Firebase Hosting" (unless you want to use it)
   - Click "Register app"

3. **Copy Firebase Configuration**
   - You'll see a configuration object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   ```
   - **Copy this configuration** - you'll need it in the next step

---

## Step 4: Configure Your Application

### Option A: Using Environment Variables (Recommended)

1. **Create/Update `.env` file in `client/` directory**
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```

2. **Update `client/src/firebase.js`**
   ```javascript
   import { initializeApp } from "firebase/app";

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
     storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
     messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
     appId: import.meta.env.VITE_FIREBASE_APP_ID,
   };

   export const app = initializeApp(firebaseConfig);
   ```

### Option B: Direct Configuration (Less Secure)

If you prefer to hardcode (not recommended for production), update `client/src/firebase.js` directly with the values from Firebase Console.

---

## Step 5: Configure Authorized Domains

1. **Add Authorized Domains**
   - In Firebase Console, go to Authentication → Settings
   - Scroll down to "Authorized domains"
   - Add your domains:
     - `localhost` (already added for development)
     - Your production domain (e.g., `yourdomain.com`)
     - Click "Add domain" for each

---

## Step 6: Test the Integration

1. **Start Your Development Server**
   ```bash
   cd client
   npm run dev
   ```

2. **Test Google Sign-In**
   - Navigate to `/sign-in` or `/sign-up`
   - Click "Continue with Google"
   - A popup should appear asking you to select a Google account
   - After selecting, you should be signed in

---

## Troubleshooting

### Issue: "Popup blocked" error
**Solution:**
- Allow popups for your localhost domain
- In Chrome: Click the popup icon in the address bar → Always allow popups

### Issue: "auth/unauthorized-domain" error
**Solution:**
- Make sure `localhost` is in the authorized domains list in Firebase Console
- For production, add your domain to authorized domains

### Issue: "Firebase: Error (auth/popup-closed-by-user)"
**Solution:**
- This is normal if the user closes the popup
- No action needed - the error is handled gracefully

### Issue: "Firebase app not initialized"
**Solution:**
- Check that all environment variables are set correctly
- Make sure `firebase.js` is importing the correct environment variables
- Restart your development server after adding environment variables

### Issue: Google sign-in button not working
**Solution:**
- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure Firebase Authentication is enabled in Firebase Console
- Check that Google sign-in provider is enabled

---

## Security Best Practices

1. **Never commit `.env` files to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables for sensitive data

2. **Restrict API Keys (Production)**
   - In Google Cloud Console, restrict your API key to specific domains
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services → Credentials
   - Click on your API key
   - Under "Application restrictions", add your domains

3. **Use HTTPS in Production**
   - Firebase requires HTTPS for production domains
   - Make sure your production site uses HTTPS

---

## Environment Variables Summary

Add these to your `client/.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

---

## Quick Checklist

- [ ] Firebase project created
- [ ] Google Authentication enabled
- [ ] Web app registered in Firebase
- [ ] Firebase configuration copied
- [ ] Environment variables set in `client/.env`
- [ ] `firebase.js` updated with configuration
- [ ] Authorized domains configured
- [ ] Tested Google sign-in locally
- [ ] `.env` added to `.gitignore`

---

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Firebase Web Setup Guide](https://firebase.google.com/docs/web/setup)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure Firebase project settings match your configuration
4. Check Firebase Console → Authentication → Users to see if sign-ins are being recorded

---

**Note:** The Firebase free tier includes:
- 50,000 monthly active users
- Unlimited authentication methods
- Sufficient for most development and small production applications

