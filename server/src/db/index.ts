import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// import * as schema from "./schema";

// Database connection configuration
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "narrari_user"}:${process.env.DB_PASSWORD || "narrari_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "narrari_db"}`;

// Create postgres client
const client = postgres(connectionString);
// export const db = drizzle(client, { schema });

export async function closeDB() {
  await client.end();
}
