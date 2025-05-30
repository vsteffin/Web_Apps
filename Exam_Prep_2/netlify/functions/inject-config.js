exports.handler = async function(event, context) {
return {
  statusCode: 200,
  headers: {
    'Content-Type': 'application/javascript'
  },
  body: `
    // This file is generated at runtime by Netlify Functions
    window.firebaseConfig = {
      apiKey: "${process.env.FIREBASE_API_KEY || ''}",
      authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
      databaseURL: "${process.env.FIREBASE_DATABASE_URL || ''}",
      projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
      storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
      messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
      appId: "${process.env.FIREBASE_APP_ID || ''}"
    };
  `
};
};
