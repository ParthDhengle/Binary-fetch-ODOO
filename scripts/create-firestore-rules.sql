-- Firestore Security Rules
-- Copy these rules to your Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null; // Allow reading other users for display purposes
    }
    
    // Items rules
    match /items/{itemId} {
      // Anyone can read approved items
      allow read: if resource.data.approved == true;
      // Users can read their own items (approved or not)
      allow read: if request.auth != null && request.auth.uid == resource.data.uploaderId;
      // Users can create items
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uploaderId;
      // Users can update their own items
      allow update: if request.auth != null && request.auth.uid == resource.data.uploaderId;
      // Admins can read and update any item
      allow read, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      // Admins can delete items
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Swaps rules
    match /swaps/{swapId} {
      // Users can read swaps they're involved in
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.fromUser || request.auth.uid == resource.data.toUser);
      // Users can create swap requests
      allow create: if request.auth != null && request.auth.uid == request.resource.data.fromUser;
      // Users can update swaps they're involved in
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.fromUser || request.auth.uid == resource.data.toUser);
    }
  }
}
