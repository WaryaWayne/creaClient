import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const dbDir = dirname(fileURLToPath(import.meta.url));
const defaultDatabasePath = resolve(dbDir, "../../contact-form.sqlite");
const databasePath = process.env.DB_FILE_NAME ?? defaultDatabasePath;

const sqlite = new Database(databasePath);

export const db = drizzle({ client: sqlite });
export type Db = typeof db;