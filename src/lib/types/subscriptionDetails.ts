import type { Product, ProductVariant } from "$lib/server/database/schemas/productsSchema";
import type { Subscription } from "$lib/server/database/schemas/subscriptionSchema";

export type SubscriptionDetails = {
    subscription: Subscription;
    product: Product;
    product_variant: ProductVariant;
}