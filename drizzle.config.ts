import { defineConfig } from "drizzle-kit";
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/lib/server/database/schemas',
    out: './migrations',
    dbCredentials: {
        url: process.env.DB_CONNECTION_STRING || ''
    }
})