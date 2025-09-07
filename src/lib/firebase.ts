
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: These are now being read from your .env file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;

// Check if Firebase is configured with placeholder values
export const isPlaceholderConfig = () => {
  return !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_");
};


if (getApps().length === 0) {
  if (isPlaceholderConfig()) {
     console.error("CRITICAL: Firebase is not configured with real credentials. The app will not function correctly. Please update your .env file.");
  }
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized");
} else {
  app = getApps()[0];
  console.log("Firebase app already initialized");
}

db = getFirestore(app);

export { app, db };

// ====================================================================================
// FIRESTORE SECURITY RULES (COPY AND PASTE THIS ENTIRE BLOCK INTO YOUR FIREBASE CONSOLE)
// ====================================================================================
/*
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    // ================= HELPER FUNCTIONS =================
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }
    
    // Checks if the requesting user is an authenticated staff member of a specific business.
    function isStaffOfBusiness(businessId, allowedRoles) {
      // Path to the user's document in the 'users' collection.
      let userDocPath = /databases/$(database)/documents/users/$(request.auth.uid);
      // Check if the user document exists and if their businessId and role match the requirements.
      return exists(userDocPath) 
             && get(userDocPath).data.businessId == businessId 
             && get(userDocPath).data.role in allowedRoles;
    }
    
    // ================= COLLECTION RULES =================

    // Business Instances: Core details of each business tenant.
    match /businessInstances/{businessId} {
      // Allow creation only if the user is creating their own business instance (document ID must match user ID).
      allow create: if isOwner(businessId);
      // Any authenticated staff member can read their own business's details.
      allow read: if request.auth != null && isStaffOfBusiness(businessId, ['admin', 'manager', 'vendor_operator']);
      // Only the admin (owner) can modify their business instance settings.
      allow update: if request.auth != null && isStaffOfBusiness(businessId, ['admin']);
    }

    // Users / Staff: Manages user profiles and their roles within a business.
    match /users/{userId} {
      // Allow a user to create their own user document during signup.
      allow create: if isOwner(userId);
      // A user can read their own data. An admin can read data of other staff in their business.
      allow read: if request.auth != null && (isOwner(userId) || isStaffOfBusiness(get(/databases/$(database)/documents/users/$(userId)).data.businessId, ['admin']));
      // An admin can add/update users for their own business.
      allow update: if request.auth != null && isStaffOfBusiness(request.resource.data.businessId, ['admin']);
      // An admin can delete another user from their business, but cannot delete themselves.
      allow delete: if request.auth != null && isStaffOfBusiness(resource.data.businessId, ['admin']) && request.auth.uid != userId;
    }

    // Products: The inventory items for each business.
    match /products/{productId} {
      // Any staff member can read products for their assigned business.
      allow read: if request.auth != null && isStaffOfBusiness(get(/databases/$(database)/documents/products/$(productId)).data.businessId, ['admin', 'manager', 'vendor_operator']);
      // Admins and Managers can create, update, and delete products.
      allow create, update: if request.auth != null && isStaffOfBusiness(request.resource.data.businessId, ['admin', 'manager']);
      allow delete: if request.auth != null && isStaffOfBusiness(resource.data.businessId, ['admin']);
    }

    // Receipts: Transaction records.
    match /receipts/{receiptId} {
      // Admins and Managers can read receipts for their business.
      allow read: if request.auth != null && isStaffOfBusiness(get(/databases/$(database)/documents/receipts/$(receiptId)).data.businessId, ['admin', 'manager']);
      // Admins and Managers can create new receipts.
      allow create: if request.auth != null && isStaffOfBusiness(request.resource.data.businessId, ['admin', 'manager']);
      // Receipts are immutable; they cannot be updated or deleted from the client to ensure data integrity.
      allow update, delete: if false;
    }

    // Customers: The customer relationship management data.
    match /customers/{customerId} {
       // Admins and Managers can read customer data for their business.
       allow read: if request.auth != null && isStaffOfBusiness(get(/databases/$(database)/documents/customers/$(customerId)).data.businessId, ['admin', 'manager']);
       // Admins and Managers can manage the customer list.
       allow create, update, delete: if request.auth != null && isStaffOfBusiness(request.resource.data.businessId, ['admin', 'manager']);
    }
    
    // Expenses: Records of business expenses.
    match /expenses/{expenseId} {
        // Admins and Managers can read expenses for their business.
        allow read: if request.auth != null && isStaffOfBusiness(get(/databases/$(database)/documents/expenses/$(expenseId)).data.businessId, ['admin', 'manager']);
        // Admins and Managers can create and update expenses.
        allow create, update: if request.auth != null && isStaffOfBusiness(request.resource.data.businessId, ['admin', 'manager']);
        allow delete: if request.auth != null && isStaffOfBusiness(resource.data.businessId, ['admin']);
    }
    
    // Discounts: Promotional discount rules.
    match /discounts/{discountId} {
        // Admins and Managers can read discounts for their business.
        allow read: if request.auth != null && isStaffOfBusiness(get(/databases/$(database)/documents/discounts/$(discountId)).data.businessId, ['admin', 'manager']);
        // Admins and Managers can create and update discounts.
        allow create, update: if request.auth != null && isStaffOfBusiness(request.resource.data.businessId, ['admin', 'manager']);
        allow delete: if request.auth != null && isStaffOfBusiness(resource.data.businessId, ['admin']);
    }

    // Waitlist: Customer requests for out-of-stock items.
    match /waitlist/{waitlistId} {
        // Admins and Managers can read the waitlist for their business.
        allow read: if request.auth != null && isStaffOfBusiness(get(/databases/$(database)/documents/waitlist/$(waitlistId)).data.businessId, ['admin', 'manager']);
        // Any authenticated user can add themselves to a waitlist. This is more open but necessary for a public storefront.
        // A stricter rule would require the businessId to be known, but for a public waitlist form, this is okay.
        allow create: if request.auth != null;
        // Only admins/managers can remove someone from the waitlist (e.g., after notifying them).
        allow delete: if request.auth != null && isStaffOfBusiness(resource.data.businessId, ['admin', 'manager']);
    }
    
    // Activation Codes: For subscriptions
    match /activationCodes/{codeId} {
      // Only an authenticated admin of ANY business can read/update a code (e.g. to apply it).
      // This rule is broad for simplicity. In a production app, you might have a global 'superadmin' role.
      // For this app, any business owner is trusted to apply a code they possess.
      allow read, update: if request.auth != null && isStaffOfBusiness(get(/databases/$(database)/documents/users/$(request.auth.uid)).data.businessId, ['admin']);
      // Creation and deletion would be handled by a backend function or a super-admin panel, not client-side.
      allow create, delete: if false; 
    }
    
    // Default Rule: Deny all access to any other collections by default.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
*/
// ====================================================================================
// END OF FIRESTORE SECURITY RULES
// ====================================================================================
