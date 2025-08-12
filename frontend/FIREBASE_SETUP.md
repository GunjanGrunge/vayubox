# Firebase Configuration Setup Guide

You need to add the following Firebase client-side configuration values to your `.env` file.

## Where to find these values:

1. Go to your Firebase Console: https://console.firebase.google.com/
2. Select your project: **backupapp-bbf71**
3. Click on the "Settings" gear icon → "Project settings"
4. Scroll down to "Your apps" section
5. If you don't have a web app, click "Add app" and select the web icon (</>)
6. If you already have a web app, click on it

## You need to replace these placeholder values in your .env file:

```bash
# Replace these with actual values from Firebase Console:
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here  
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# These should already be correct based on your project ID:
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=backupapp-bbf71.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=backupapp-bbf71
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=backupapp-bbf71.appspot.com
```

## Expected Firebase config object format:
The values you find will look like this in the Firebase Console:
```javascript
const firebaseConfig = {
  apiKey: "AIza...", // This goes to NEXT_PUBLIC_FIREBASE_API_KEY
  authDomain: "backupapp-bbf71.firebaseapp.com",
  projectId: "backupapp-bbf71", 
  storageBucket: "backupapp-bbf71.appspot.com",
  messagingSenderId: "123456789", // This goes to NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abcdef" // This goes to NEXT_PUBLIC_FIREBASE_APP_ID
};
```

## NextAuth Secret:
For NEXTAUTH_SECRET, you can generate a random 32+ character string:
```bash
# You can use this command to generate one:
openssl rand -base64 32
```

Or use this temporary one for development:
```
NEXTAUTH_SECRET=dev-secret-key-minimum-32-chars-long-abcdef1234567890
```

## After updating the .env file:
1. Restart your development server
2. The application should now be able to connect to Firebase and AWS properly
