import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.DB_USER || "meeplix_user"}:${process.env.DB_PASSWORD || "meeplix_password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "meeplix_db"}`,
  },
  verbose: true,
  strict: true,
} satisfies Config;
