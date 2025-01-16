import { env } from '$env/dynamic/private';
import { drizzle } from 'drizzle-orm/connect';
import * as authSchema from "./schemas/authSchema";
import * as productSchema from "./schemas/productsSchema";
import * as subscriptionSchema from "./schemas/subscriptionSchema";

export const db = await drizzle('postgres-js', { 
    connection: {url: env.DB_CONNECTION_STRING}, 
    schema: {...authSchema, ...productSchema, ...subscriptionSchema}
});