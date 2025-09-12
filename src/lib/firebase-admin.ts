import { initializeApp, applicationDefault, cert, getApps, getApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function readServiceAccountJson(): string | null {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  if (b64 && typeof b64 === "string") {
    try {
      return Buffer.from(b64, "base64").toString("utf8");
    } catch {
      // ignore and try JSON fallback
    }
  }
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  return json ?? null;
}

const raw = readServiceAccountJson();

const app =
  getApps().length
    ? getApp()
    : raw
    ? initializeApp({ credential: cert(JSON.parse(raw) as any) })
    : initializeApp({ credential: applicationDefault() });

export const adminDb = getFirestore(app);
export default app;
