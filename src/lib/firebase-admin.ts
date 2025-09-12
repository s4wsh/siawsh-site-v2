import { getApps, initializeApp, applicationDefault, cert, AppOptions } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getStorage as getAdminStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

function buildOptions(): AppOptions {
  // Prefer ADC via GOOGLE_APPLICATION_CREDENTIALS for local/dev
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return { credential: applicationDefault() };
  }

  // Fallback: JSON in env
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.client_email || typeof parsed.client_email !== "string") {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing "client_email" (string).');
      }
      if (!parsed.private_key || typeof parsed.private_key !== "string") {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is missing "private_key" (string).');
      }
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
      return { credential: cert(parsed) };
    } catch (e: any) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e?.message || e);
      throw e;
    }
  }

  // Last resort
  return { credential: applicationDefault() };
}

const adminApp = getApps().length ? getApps()[0] : initializeApp(buildOptions());

export const adminAuth = getAdminAuth(adminApp);
export const adminStorage = getAdminStorage(adminApp);
export const adminDb = getFirestore(adminApp);
