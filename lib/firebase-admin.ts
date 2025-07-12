import admin from 'firebase-admin';

// Assign environment variables to constants for better type safety and validation
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Check if all required variables are defined
if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    'Missing Firebase environment variables. Ensure FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set in .env.local'
  );
}

// Initialize Firebase Admin SDK only if it hasn’t been initialized yet
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, '\n'), // Safe to call replace now
    }),
  });
}

// Export Firestore and Auth instances
export const db = admin.firestore();
export const auth = admin.auth();