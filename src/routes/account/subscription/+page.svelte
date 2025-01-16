<script lang="ts">
	import Pricing from "$lib/components/pricing.svelte";
    import Button from "$lib/components/ui/button/button.svelte";
	import Input from "$lib/components/ui/input/input.svelte";
	import type { User } from "$lib/server/auth/user.js";
	import { config } from "$lib/selfkit.config.js";
    import { type SubscriptionDetails } from "$lib/types/subscriptionDetails";

    let { data, form } = $props();
    let { products, credit } = $derived(data);
    let { subscriptions, user }: {subscriptions: SubscriptionDetails[]; user: User | null} = $derived(data);

    let notSubscribedProducts = $derived(products.filter(product => 
        !subscriptions.some((sub: SubscriptionDetails) => sub.product.id === product.id)
    ));

    let confirmEmail = $state("");
    let showPlan = $state(false);
    let selectedSubscription: SubscriptionDetails | undefined = $state();
</script>

{#if credit}
    Your available credit is {credit} EUR
{/if}

{#each subscriptions as sub}
    {@const period = sub.product_variant.billingPeriod}
    <ul>
        <li>{sub.product.name}</li>
        <li>{sub.product_variant.price} {sub.product_variant.currency} /{period}</li>
        <li>{sub.subscription.status}</li>
        {#if !sub.subscription.endDate}
            Your subscription will be not renewed
        {/if}
        
        <form method="POST" action="?/previewUpdateSubscription">
            <input hidden name="subscriptionId" value={sub.subscription.id} />
            <input hidden name="extSubscriptionId" value={sub.subscription.subscriptionId} />
            <input hidden name="productId" value={sub.product_variant.productId} />
            <input hidden name="billingPeriod" value={period === "monthly" ? "annually" : "monthly"} />
            <input hidden name="mode" value={"changeBilling"} />

            {#if sub.subscription.status === "paused"}
                <Button type="submit" formaction="?/resumeSubscription">Unpaused subscription</Button>
            {:else if sub.subscription.status === "canceled"}
                <Button>Renew subscription</Button>
            {:else}
                {#if period && !(period === "annually" && !config.enableAnnuallyToMonthlyBilling)}
                    <Button type="submit">{period === "monthly" ? "Change to annually" : "Change to monthly"}</Button>
                {/if}
                {#if !config.enableMultiSubscription && notSubscribedProducts.length}
                    <Button onclick={() => {showPlan = !showPlan; selectedSubscription = sub}}>{showPlan ? "Cancel change plan" : "Change plan"}</Button>
                {/if}
                {#if sub.subscription.endDate}
                    <Button formaction="?/pauseSubscription" type="submit" variant="outline">Pause subscription</Button>
                    <Button formaction="?/cancelSubscription" type="submit" variant="destructive">Cancel subscription</Button>
                {:else}
                    <Button formaction="?/removeScheduledChange" type="submit" variant="outline">Resume subscription</Button>
                {/if}
            {/if}
        </form>
    </ul>
{/each}

{#if showPlan}
    {#each notSubscribedProducts as product}
    <ul>
        <li>{product.name}</li>
        <li>{product.description}</li>
        {#each product.variants as variant}
            {#if config.enableAnnuallyToMonthlyBilling || 
                (!config.enableAnnuallyToMonthlyBilling && variant.billingPeriod === selectedSubscription?.product_variant.billingPeriod)}
            <ul>
                <li>{variant.price} {variant.currency} /{variant.billingPeriod}</li>
                <form method="POST" action="?/previewUpdateSubscription">
                    <input hidden name="subscriptionId" value={selectedSubscription?.subscription.id} />
                    <input hidden name="extSubscriptionId" value={selectedSubscription?.subscription.subscriptionId} />
                    <input hidden name="productId" value={product.id} />
                    <input hidden name="billingPeriod" value={variant.billingPeriod} />
                    <input hidden name="mode" value={"changePlan"} />
                    <Button type="submit">Choose this plan</Button>
                </form>
            </ul>
            {/if}
        {/each}
    </ul>
    {/each}
{/if}


{#if form?.data}
    <div>{form.data.action}</div>
    <div>{Number(form.data.amount) / 100}</div>
    <form method="POST" action="?/updateSubscription">
        <input hidden name="subscriptionId" value={selectedSubscription?.subscription.id} />
        <input hidden name="extSubscriptionId" value={selectedSubscription?.subscription.subscriptionId} />
        <input hidden name="extVariantId" value={form.data.variantId} />
        <Input name="email" bind:value={confirmEmail} />
        <Button type="submit" disabled={confirmEmail !== data.user?.email}>Confirm</Button>
    </form>
{/if}

{#if config.enableMultiSubscription}
    <Pricing {products} {subscriptions} {user} />
{/if}