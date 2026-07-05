const requiredEnv = [
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "NEXT_SUPABASE_URL",
  "NEXT_SUPABASE_ANON_KEY",
  "NEXT_AI_API_KEY",
  "NEXT_REPORT_API_KEY",
  "NEXT_DEEPGRAM_API_KEY",
  "DAILY_API_KEY",
  "DAILY_ROOM_URL",
];

const missing = requiredEnv.filter((name) => {
  const value = process.env[name];
  return !value || !String(value).trim();
});

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((name) => console.error(`  - ${name}`));
  process.exit(1);
}

const urlChecks = [
  { name: "NEXT_SUPABASE_URL", prefix: "https://" },
  { name: "DAILY_ROOM_URL", prefix: "https://" },
];

const urlErrors = urlChecks.filter(({ name, prefix }) => {
  const value = process.env[name];
  return typeof value !== "string" || !value.startsWith(prefix);
});

if (urlErrors.length > 0) {
  console.error("❌ Invalid URL environment variables:");
  urlErrors.forEach(({ name, prefix }) =>
    console.error(`  - ${name} must start with ${prefix}`),
  );
  process.exit(1);
}

const clerkKey = process.env.CLERK_SECRET_KEY;
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkKey.startsWith("sk_") || !clerkPubKey.startsWith("pk_")) {
  console.error("❌ Clerk keys appear invalid.");
  console.error(
    `  - CLERK_SECRET_KEY=${clerkKey.startsWith("sk_") ? "ok" : "invalid"}`,
  );
  console.error(
    `  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${clerkPubKey.startsWith("pk_") ? "ok" : "invalid"}`,
  );
  process.exit(1);
}

console.log("✅ Environment validation passed.");
process.exit(0);
