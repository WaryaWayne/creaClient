import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "drizzle-kit";

const configDir = dirname(fileURLToPath(import.meta.url));
const defaultDatabaseUrl = `file:${resolve(configDir, "contact-form.sqlite")}`;

export default defineConfig({
  out: resolve(configDir, "drizzle"),
  schema: resolve(configDir, "src/schema/index.ts"),
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_FILE_NAME ?? defaultDatabaseUrl,
  },
});
