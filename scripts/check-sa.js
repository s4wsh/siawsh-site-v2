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
// Validates either FIREBASE_SERVICE_ACCOUNT_B64 (preferred) or FIREBASE_SERVICE_ACCOUNT_JSON.
const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!b64 && !json) {
  console.error("❌ Missing FIREBASE_SERVICE_ACCOUNT_B64 or FIREBASE_SERVICE_ACCOUNT_JSON");
  process.exit(1);
}

try {
  const raw = b64 ? Buffer.from(b64, "base64").toString("utf8") : json;
  const j = JSON.parse(raw);

  if (typeof j.client_email !== "string") throw new Error("missing client_email");
  if (typeof j.private_key !== "string") throw new Error("missing private_key");
  if (!j.private_key.startsWith("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("private_key must start with BEGIN line");
  }

  console.log("✅ Service account looks valid");
} catch (e) {
  console.error("❌ Invalid service account:", e.message);
  process.exit(1);
}
// Verbose service-account checker. Skippable via SKIP_SA_CHECK=1
if (process.env.SKIP_SA_CHECK === "1") {
  console.log("prebuild: SKIP_SA_CHECK=1 -> skipping service account validation");
  process.exit(0);
}

const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;
const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

console.log(
  "prebuild: env presence ->",
  "B64?", !!b64, "len:", b64?.length || 0,
  "| JSON?", !!json, "len:", json?.length || 0
);

if (!b64 && !json) {
  console.error("❌ Missing FIREBASE_SERVICE_ACCOUNT_B64 or FIREBASE_SERVICE_ACCOUNT_JSON");
  process.exit(1);
}

try {
  const raw = b64 ? Buffer.from(b64, "base64").toString("utf8") : json;
  console.log("prebuild: decoded length:", raw.length);
  const j = JSON.parse(raw);

  console.log("prebuild: client_email:", j.client_email || "<none>");
  if (typeof j.client_email !== "string") throw new Error("missing client_email");
  if (typeof j.private_key !== "string") throw new Error("missing private_key");
  if (!j.private_key.startsWith("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("private_key must start with BEGIN line");
  }
  console.log("✅ Service account looks valid");
} catch (e) {
  console.error("❌ Invalid service account:", e?.message || e);
  process.exit(1);
}
