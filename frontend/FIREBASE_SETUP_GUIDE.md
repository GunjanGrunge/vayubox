# 🔥 Firebase Configuration Guide

## Current Issue
Your Firebase API key is not valid. You need to get the correct values from your Firebase Console.

## Step-by-Step Instructions

### 1. Access Firebase Console
- Go to [Firebase Console](https://console.firebase.google.com/)
- Login with your Google account

### 2. Select Your Project
- Find and click on your project: **"backupapp-bbf71"**
- If you don't see it, make sure you're logged in with the correct account

### 3. Get Web App Configuration
- Click the gear icon (⚙️) in the left sidebar
- Select **"Project settings"**
- Scroll down to the **"Your apps"** section
- If you don't have a web app yet:
  - Click **"Add app"** 
  - Select **"Web app"** (</> icon)
  - Give it a name like "DropAws Web"
  - Click **"Register app"**

### 4. Copy Configuration Values
You'll see a code snippet like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC-some-long-string-here",
  authDomain: "backupapp-bbf71.firebaseapp.com",
  projectId: "backupapp-bbf71",
  storageBucket: "backupapp-bbf71.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

### 5. Update Your .env File
Replace the placeholder values in your `.env` file with the actual values:

```env
# Replace with YOUR actual Firebase values:
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC-your-actual-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=backupapp-bbf71.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=backupapp-bbf71
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=backupapp-bbf71.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
```

### 6. Enable Authentication
- In Firebase Console, go to **"Authentication"** in the left sidebar
- Click **"Get started"** if you haven't already
- Go to **"Sign-in method"** tab
- Enable the sign-in methods you want to use (Email/Password, Google, etc.)

### 7. Set Up Firestore
- In Firebase Console, go to **"Firestore Database"**
- Click **"Create database"**
- Choose **"Start in test mode"** for development
- Select a location closest to your users

### 8. Set Up Storage
- In Firebase Console, go to **"Storage"**
- Click **"Get started"**
- Choose **"Start in test mode"** for development

### 9. Restart Development Server
After updating your .env file:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## ⚠️ Important Notes

1. **All values must be real**: Don't use placeholder values
2. **Keep NEXT_PUBLIC_ prefix**: This is required for client-side access
3. **API Key is safe**: Firebase API keys are safe to expose publicly
4. **Security through rules**: Use Firebase Security Rules to control access
5. **Save and restart**: Always save .env and restart your dev server

## 🔍 Troubleshooting

- **Still getting API key error?** Double-check you copied the exact values
- **Can't find your project?** Make sure you're logged in with the right Google account
- **No web app?** Create one following step 3 above
- **Still stuck?** Check the browser console for specific error messages

## 📝 Current Status
Your current .env file has these Firebase variables. Replace the placeholder values:
- ✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN (correct)
- ✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID (correct)  
- ✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (correct)
- ❌ NEXT_PUBLIC_FIREBASE_API_KEY (needs real value)
- ❌ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (needs real value)
- ❌ NEXT_PUBLIC_FIREBASE_APP_ID (needs real value)
