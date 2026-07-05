const { execSync } = require("child_process");

console.log("Starting pre-deployment checks...\n");

try {
  console.log("1. Validating required environment variables...");
  execSync("node scripts/validate-env.js", { stdio: "inherit" });

  console.log("\n2. Running security audit...");
  execSync("pnpm audit --audit-level=high --ignore GHSA-jx2c-rxcm-jvmq", {
    stdio: "inherit",
  });

  console.log("\n3. Building packages...");
  execSync("pnpm run build", { stdio: "inherit" });

  console.log("\n4. Running unit tests...");
  execSync("pnpm run test:unit", { stdio: "inherit" });

  console.log("\n5. Running E2E tests (Chromium only)...");
  execSync("pnpm run test:e2e -- --project=chromium", { stdio: "inherit" });

  console.log("\nAll pre-deployment checks passed successfully!");
  process.exit(0);
} catch (error) {
  console.error("\nPre-deployment checks failed!");
  process.exit(1);
}
