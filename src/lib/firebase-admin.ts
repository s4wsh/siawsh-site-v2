import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { env } from "@/lib/env";

const adminApp = getApps().length
  ? getApps()[0]
  : initializeApp(
      env.FIREBASE_SERVICE_ACCOUNT_JSON
        ? { credential: cert(JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON) as any) }
        : { credential: applicationDefault() }
    );

export const adminAuth = getAdminAuth(adminApp);
export const adminStorage = getAdminStorage(adminApp);
export const adminDb = getFirestore(adminApp);
