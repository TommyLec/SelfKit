<script lang="ts">
    import { Button } from '$lib/components/ui/button';

    let { title, subtitle, buttonLabel } = $props();
</script>

<section class="my-28 md:my-36 px-5 md:px-10">
    <h2 class="text-5xl font-bold">{title}</h2>
    <p class="my-5 text-xl text-muted-foreground">{subtitle}</p>
    <Button href="/payment" class="px-16 py-6 mt-5" size="lg">{buttonLabel}</Button>
</section>