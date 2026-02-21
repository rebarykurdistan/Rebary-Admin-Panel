# 🚀 DEPLOYMENT GUIDE

## Quick Setup Steps

### 1. Initial Setup (5 minutes)
```bash
# In Firebase Studio terminal:
npm install
cp .env.example .env.local
# Edit .env.local with your Firebase config
```

### 2. Set Super Admin Role (CRITICAL!)

Before you can login, the super admin user MUST have the `role` custom claim set.

**Quick Script Method:**
Create `set-super-admin.js` in project root:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setSuperAdmin() {
  try {
    await admin.auth().setCustomUserClaims('IJIO9mztAzaRmKbZtJxLwp5aqWe2', {
      role: 'super_admin'
    });
    console.log('✅ Super admin role set successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setSuperAdmin();
```

Run it:
```bash
node set-super-admin.js
```

### 3. Run Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

### 4. Login
- Email: `rebarykurdistan@gmail.com`
- Password: `Nakaw@1991`

---

## Production Deployment

### Deploy to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Deploy Cloud Functions (for User Management)
```bash
firebase deploy --only functions
```

---

## Verification Checklist

✅ All dependencies installed
✅ .env.local file configured
✅ Super admin role set in Firebase
✅ Can login successfully
✅ Dashboard loads with stats
✅ Can create/edit/delete services
✅ All features working

---

## Common Issues & Solutions

### "No role assigned" error on login
**Solution:** Run the set-super-admin.js script above

### "Permission denied" in Firestore
**Solution:** Check security rules - they should allow authenticated users with roles

### Cloud Functions not working
**Solution:** Deploy functions: `firebase deploy --only functions`

---

🎉 **That's it! You're ready to use Rebary Admin Panel!**
