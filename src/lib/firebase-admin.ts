import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || 'demo-project';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'demo@example.com';
  const privateKey = process.env.FIREBASE_PRIVATE_KEY || 'demo-key';

  if (projectId && clientEmail && privateKey && projectId !== 'demo-project') {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export { admin };