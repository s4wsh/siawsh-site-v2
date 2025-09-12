import { getApps, initializeApp, applicationDefault, cert, AppOptions } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

function buildOptions(): AppOptions {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw && raw.trim().length > 0) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.client_email || typeof parsed.client_email !== "string") {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing "client_email" (string).');
      }
      if (!parsed.private_key || typeof parsed.private_key !== "string") {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing "private_key" (string).');
      }
      // Some environments mistakenly keep literal "\n" or remove them; firebase-admin accepts actual newlines
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      return { credential: cert(parsed) };
    } catch (e: any) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e?.message || e);
      throw e;
    }
  }
  // Fallback to ADC if provided (e.g., GOOGLE_APPLICATION_CREDENTIALS)
  return { credential: applicationDefault() };
}

const adminApp = getApps().length ? getApps()[0] : initializeApp(buildOptions());

export const adminAuth = getAdminAuth(adminApp);
export const adminStorage = getAdminStorage(adminApp);
export const adminDb = getFirestore(adminApp);
