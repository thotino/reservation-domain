import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    mockReset: true,
    env: {
            TZ: "UTC",
            NODE_ENV: "test",
        },
  },
})