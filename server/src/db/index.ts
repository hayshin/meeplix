import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "./schema";

// Database connection configuration
const connectionString =
  process.env.DATABASE_URL ||
  `postgresql://${process.env.DB_USER || "meeplix_user"}:${process.env.DB_PASSWORD || "meeplix_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "meeplix_db"}`;

// Create postgres client
const client = postgres(connectionString);
export const db = drizzle(client, { schema, casing: "snake_case" });

export async function closeDB() {
  await client.end();
}

export * from "./schema";

// const query = await db
//   .insert(schema.decks)
//   .values({ name: "test", amount: 84 });

// console.log(query);
// const id = "d22f868f-ead2-4213-8e49-e0ad7b50cda4"
