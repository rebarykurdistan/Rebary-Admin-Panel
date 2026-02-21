# ⚡ QUICK START - Get Running in 10 Minutes!

## 🚀 Step-by-Step Setup

### Step 1: Install Dependencies (2 minutes)
```bash
cd rebary-admin-panel
npm install
```

### Step 2: Configure Firebase (3 minutes)
1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase config:
   - Go to Firebase Console → Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the config values

3. Your `.env.local` should look like:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

   NEXT_PUBLIC_SUPER_ADMIN_EMAIL=rebarykurdistan@gmail.com
   NEXT_PUBLIC_SUPER_ADMIN_UID=IJIO9mztAzaRmKbZtJxLwp5aqWe2
   ```

### Step 3: Set Super Admin Role (5 minutes)

**CRITICAL:** The super admin must have the `role` custom claim set!

**Method 1: Quick Script (Recommended)**
Create `set-role.js` in the project root:
```javascript
const admin = require('firebase-admin');

// Download serviceAccountKey.json from Firebase Console
// Project Settings → Service Accounts → Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setRole() {
  try {
    await admin.auth().setCustomUserClaims('IJIO9mztAzaRmKbZtJxLwp5aqWe2', {
      role: 'super_admin'
    });
    console.log('✅ Super admin role set!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setRole();
```

Run it:
```bash
node set-role.js
```

**Method 2: Firebase Console**
- Go to Firebase Console → Authentication
- Find the user: `rebarykurdistan@gmail.com`
- Note: You cannot set custom claims via UI
- You MUST use the script above

### Step 4: Run Development Server
```bash
npm run dev
```

Open: http://localhost:3000

### Step 5: Login! 🎉
- Email: `rebarykurdistan@gmail.com`
- Password: `Nakaw@1991`

---

## ✅ You're Done!

If you see the dashboard, you're ready to use the admin panel!

---

## 🎯 What Works Right Now

### ✅ Fully Functional:
- **Login page** - Beautiful, branded
- **Dashboard** - Shows stats for Services, Categories, Tags
- **Tags page** - Complete CRUD (Create, Read, Update, Delete)
- **Navigation** - Role-based sidebar
- **Authentication** - Secure login/logout

### 🔨 Needs Completion:
- **Categories page** - Copy from Tags page (2-3 hours)
- **Services page** - More complex (4-6 hours)
- **Users page** - Needs Cloud Functions (3-4 hours)

---

## 🆘 Troubleshooting

### "No role assigned" error
**Solution:** Run the `set-role.js` script to set super admin custom claim

### "Permission denied" in Firestore
**Solution:** Check your security rules in Firebase Console

### Cannot find module errors
**Solution:** Delete `node_modules` and run `npm install` again

### Page not found
**Solution:** Make sure you're accessing the correct URL (http://localhost:3000)

---

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. Check `DEPLOYMENT_GUIDE.md` for deployment steps
3. Check `FINAL_DELIVERY.md` for completion status
4. Ask me to complete any specific page!

---

**Ready to build! 🚀**
