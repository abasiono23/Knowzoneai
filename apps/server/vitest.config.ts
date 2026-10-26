import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ?? 'postgresql://knowzone:knowzone@localhost:5433/knowzone_testing',
      SUPABASE_URL: 'https://test-project.supabase.co',
      OPENAI_API_KEY: '',
      RESEND_API_KEY: '',
    },
    globalSetup: './test/global-setup.ts',
    setupFiles: './test/setup.ts',
    // Tests share one database, so files run one at a time.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
