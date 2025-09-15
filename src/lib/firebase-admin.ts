import type { App } from "firebase-admin/app";
import { initializeApp, applicationDefault, cert, AppOptions, getApps, getApp } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue, Firestore } from "firebase-admin/firestore";

declare global {
  // eslint-disable-next-line no-var
  var _adminApp: App | undefined;
  // eslint-disable-next-line no-var
  var _adminDb: Firestore | undefined;
}

function buildOptions(): AppOptions {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf8");
      const parsed = JSON.parse(decoded);
      if (typeof (parsed as any)?.client_email !== "string") {
        throw new Error('decoded JSON missing "client_email" (string)');
      }
      if (typeof (parsed as any)?.private_key !== "string") {
        throw new Error('decoded JSON missing "private_key" (string)');
      }
      return { credential: cert(parsed as any) };
    } catch (e: any) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_B64 invalid: ${e?.message || e}`);
    }
  }

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof (parsed as any)?.client_email !== "string") {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON missing "client_email" (string)');
      }
      if (typeof (parsed as any)?.private_key !== "string") {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON missing "private_key" (string)');
      }
      return { credential: cert(parsed as any) };
    } catch (e: any) {
      throw new Error(`FIREBASE_SERVICE_ACCOUNT_JSON invalid: ${e?.message || e}`);
    }
  }

  // Last resort: ADC (requires GOOGLE_APPLICATION_CREDENTIALS on the host)
  return { credential: applicationDefault() };
}

function initApp(): App {
  if (global._adminApp) return global._adminApp;
  const app = getApps().length ? getApp() : initializeApp(buildOptions());
  global._adminApp = app;
  return app;
}

const app = initApp();

function initDb(): Firestore {
  if (global._adminDb) return global._adminDb;
  const db = getFirestore(app);
  global._adminDb = db;
  return db;
}

export const adminDb = initDb();
export default app;
export { Timestamp, FieldValue };
