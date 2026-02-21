# Rebary Admin Panel

Complete admin control panel for managing Rebary services, categories, and tags.

## 🚀 Quick Start

### 1. Setup in Firebase Studio

1. **Open Firebase Studio** and create a new project or open existing
2. **Upload all files** from this folder to your Firebase Studio project
3. **Install dependencies**:
   ```bash
   npm install
   ```

### 2. Configure Firebase

1. Go to **Firebase Console** → **Project Settings** → **General** → **Your apps** → **Web app**
2. Copy your Firebase configuration
3. Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your Firebase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
   
   NEXT_PUBLIC_SUPER_ADMIN_EMAIL=rebarykurdistan@gmail.com
   NEXT_PUBLIC_SUPER_ADMIN_UID=IJIO9mztAzaRmKbZtJxLwp5aqWe2
   ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

---

## 🔐 IMPORTANT: Security Rules Update Required!

### Current Security Rules Status
Your existing security rules check for `request.auth.token.role` but the system needs a Cloud Function to set these custom claims.

### Required Updates to Security Rules

**NO CHANGES NEEDED!** Your current security rules are perfect and already support role-based access:

```javascript
function isSuperAdmin() { return signedIn() && request.auth.token.role == "super_admin"; }
function isAdmin()      { return signedIn() && request.auth.token.role == "admin"; }
function isEditor()     { return signedIn() && request.auth.token.role == "editor"; }
```

The system is designed to work with your existing security rules.

---

## 👥 User Management Setup

### Option 1: Manual Setup (Temporary)
Until the Cloud Function is deployed, you can set custom claims manually:

1. Install Firebase Tools:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Run this script to set role for super admin:
   ```javascript
   // set-role.js
   const admin = require('firebase-admin');
   admin.initializeApp();
   
   async function setRole() {
     await admin.auth().setCustomUserClaims('IJIO9mztAzaRmKbZtJxLwp5aqWe2', {
       role: 'super_admin'
     });
     console.log('Role set successfully!');
   }
   
   setRole();
   ```

   Run with:
   ```bash
   node set-role.js
   ```

### Option 2: Cloud Function (Recommended)

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create user with role
exports.createUserWithRole = functions.https.onCall(async (data, context) => {
  // Only super admin can create users
  if (!context.auth || context.auth.token.role !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can create users'
    );
  }

  const { email, password, role } = data;

  try {
    // Create user
    const user = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
    });

    // Set custom claim
    await admin.auth().setCustomUserClaims(user.uid, { role });

    return {
      success: true,
      uid: user.uid,
      message: `User created with role: ${role}`,
    };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Update user role
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can update roles'
    );
  }

  const { uid, role } = data;

  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    return { success: true, message: 'Role updated successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Delete user
exports.deleteUser = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'super_admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only super admins can delete users'
    );
  }

  const { uid } = data;

  try {
    await admin.auth().deleteUser(uid);
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

Deploy Cloud Functions:
```bash
firebase deploy --only functions
```

---

## 📱 Features

### Role-Based Access Control
- **Super Admin**: Full access to Services, Categories, Tags + User Management
- **Admin**: Access to Services and Categories only
- **Editor**: Access to Services only

### Services Management
- ✅ Create, Edit, Delete, Duplicate services
- ✅ Multi-language support (Sorani, Badini, Arabic, English)
- ✅ 18 contact platforms (Phone, WhatsApp, Email, Social Media, etc.)
- ✅ Multiple entries per platform
- ✅ Image URL management
- ✅ Location (GPS coordinates)
- ✅ Dates, Tags, Dropdown filters
- ✅ Search, Filter, Sort, Pagination
- ✅ Bulk delete operations

### Categories Management
- ✅ Create, Edit, Delete, Duplicate categories
- ✅ Multi-language names and icons
- ✅ Visibility controls
- ✅ Sorting order
- ✅ Search and filter

### Tags Management
- ✅ Create, Edit, Delete, Duplicate tags
- ✅ Multi-language names
- ✅ Image support
- ✅ Search functionality

### User Management (Super Admin Only)
- ✅ Create new admin users
- ✅ Assign roles (Super Admin, Admin, Editor)
- ✅ Change user roles
- ✅ Delete users
- ✅ View all admin users

---

## 🎨 Design

Built with Rebary brand colors:
- Primary: Cyan Blue (#0891B2)
- Accents: Orange, Yellow, Green, Red
- Clean, modern card-based UI
- Fully responsive (Mobile, Tablet, Desktop)

---

## 🔧 Tech Stack

- **Framework**: Next.js 14 (React)
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Icons**: React Icons
- **Notifications**: React Hot Toast
- **State Management**: Zustand (if needed)

---

## 📂 Project Structure

```
rebary-admin-panel/
├── src/
│   ├── app/
│   │   ├── layout.js              # Root layout with AuthProvider
│   │   ├── page.js                # Home page (redirects)
│   │   ├── login/
│   │   │   └── page.js            # Login page
│   │   ├── dashboard/
│   │   │   └── page.js            # Dashboard with stats
│   │   ├── services/
│   │   │   └── page.js            # Services CRUD
│   │   ├── categories/
│   │   │   └── page.js            # Categories CRUD
│   │   ├── tags/
│   │   │   └── page.js            # Tags CRUD
│   │   └── users/
│   │       └── page.js            # User management
│   ├── components/
│   │   ├── Sidebar.js             # Navigation sidebar
│   │   ├── LanguageTabs.js        # Multi-language tabs
│   │   └── ProtectedRoute.js      # Auth wrapper
│   ├── hooks/
│   │   └── useAuth.js             # Authentication hook
│   ├── lib/
│   │   ├── firebase.js            # Firebase config
│   │   ├── firestore.js           # Firestore CRUD functions
│   │   └── platforms.js           # Platform definitions
│   └── styles/
│       └── globals.css            # Global styles + Tailwind
├── functions/                      # Cloud Functions
│   └── index.js                   # User management functions
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.example
└── README.md
```

---

## 🐛 Troubleshooting

### Login Issues
- **"No role assigned"**: User needs custom claims set via Cloud Function or manual script
- **"Invalid credentials"**: Check email/password in Firebase Console

### Permission Denied
- **Services/Categories/Tags**: Check user's role in Firebase Auth custom claims
- **User Management**: Only super admin (rebarykurdistan@gmail.com) can access

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Check that `.env.local` exists and has valid Firebase config
- Clear `.next` folder and rebuild: `rm -rf .next && npm run build`

---

## 📞 Support

For issues or questions, contact the development team.

---

## 🎉 You're Ready!

1. Setup Firebase credentials
2. Install dependencies
3. Set super admin role (manual or Cloud Function)
4. Run development server
5. Login and start managing!

**First Login:**
- Email: `rebarykurdistan@gmail.com`
- Password: `Nakaw@1991`

---

**Built with ❤️ for Rebary** 🗺️
