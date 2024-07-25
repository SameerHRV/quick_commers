import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const db_uri = process.env.DB_URL!;
export const connection = postgres(db_uri);

export const db = drizzle(connection);
