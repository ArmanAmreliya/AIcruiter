const { execSync } = require('child_process');

console.log('Starting pre-deployment checks...\n');

try {
  console.log('1. Running security audit...');
  execSync('pnpm audit --audit-level=high --ignore GHSA-jx2c-rxcm-jvmq', { stdio: 'inherit' });

  console.log('\n2. Building packages...');
  execSync('pnpm run build', { stdio: 'inherit' });

  console.log('\n3. Running unit tests...');
  execSync('pnpm run test:unit', { stdio: 'inherit' });

  console.log('\n4. Running E2E tests (Chromium only)...');
  execSync('pnpm run test:e2e -- --project=chromium', { stdio: 'inherit' });

  console.log('\nAll pre-deployment checks passed successfully!');
  process.exit(0);
} catch (error) {
  console.error('\nPre-deployment checks failed!');
  process.exit(1);
}
