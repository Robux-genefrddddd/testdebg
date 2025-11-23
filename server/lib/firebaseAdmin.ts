import { initializeApp, cert, getApp } from "firebase-admin/app";
import * as admin from "firebase-admin";

let app: admin.app.App;

try {
  app = getApp();
} catch {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || "keysystem-d0b86-8df89",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  if (!serviceAccount.clientEmail || !serviceAccount.privateKey) {
    console.warn(
      "Firebase service account credentials not fully configured. Running in limited mode.",
    );
    app = initializeApp({
      projectId: serviceAccount.projectId,
    });
  } else {
    app = initializeApp({
      credential: cert(serviceAccount as any),
      projectId: serviceAccount.projectId,
    });
  }
}

export default app;

export const getFirebaseAdmin = () => admin;
