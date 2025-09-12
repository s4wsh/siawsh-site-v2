const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!raw) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_JSON is missing");
  process.exit(1);
}
try {
  const j = JSON.parse(raw);
  if (!j.client_email) throw new Error("missing client_email");
  if (!j.private_key) throw new Error("missing private_key");
  if (!j.private_key.startsWith("-----BEGIN PRIVATE KEY-----\n")) {
    throw new Error("private_key must contain escaped \\n and begin with BEGIN line");
  }
  if (!j.private_key.endsWith("\n-----END PRIVATE KEY-----\n")) {
    throw new Error("private_key must end with END line and \\n");
  }
  console.log("✅ Service account JSON looks valid (basic checks passed).");
} catch (e) {
  console.error("❌ Invalid FIREBASE_SERVICE_ACCOUNT_JSON:", e.message);
  process.exit(1);
}

