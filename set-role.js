// const admin = require('firebase-admin');

// // Download serviceAccountKey.json from Firebase Console
// // Project Settings → Service Accounts → Generate New Private Key
// const serviceAccount = require('./serviceAccountKey.json');


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// async function setRole() {
//   try {
//     await admin.auth().setCustomUserClaims('IJIO9mztAzaRmKbZtJxLwp5aqWe2', {
//       role: 'super_admin'
//     });
//     console.log('✅ Super admin role set!');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// }

// setRole();


// const admin = require('firebase-admin');

// // Download serviceAccountKey.json from Firebase Console
// // Project Settings → Service Accounts → Generate New Private Key
// const serviceAccount = require('./serviceAccountKey.json');


// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// async function setRole() {
//   try {
//     await admin.auth().setCustomUserClaims('RIxGNJRlrVPM6uLNCygvSmSxteB3', {
//       role: 'admin'
//     });
//     console.log('✅ admin role set!');
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error:', error);
//     process.exit(1);
//   }
// }

// setRole();


const admin = require('firebase-admin');

// Download serviceAccountKey.json from Firebase Console
// Project Settings → Service Accounts → Generate New Private Key
const serviceAccount = require('./serviceAccountKey.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setRole() {
  try {
    await admin.auth().setCustomUserClaims('o4TpOFbAqNNDmuAFfkca3HWCo922', {
      role: 'editor'
    });
    console.log('✅ editor role set!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setRole();
