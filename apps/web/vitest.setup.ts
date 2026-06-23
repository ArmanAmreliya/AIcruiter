import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Clean up DOM elements after each test to ensure test isolation
afterEach(() => {
  cleanup();
});
