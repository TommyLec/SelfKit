<script lang="ts">
    import BentoCard from '$lib/components/ui/bento-grid/bentoCard.svelte';
    import { cn } from "$lib/utils";
	import type { BentoCardProps } from '$lib/types/bentoGrid';

    let { class: className = '', items } : { items: BentoCardProps[], class?: string} = $props()
  </script>
  
  <div class={cn("grid w-full auto-rows-[20rem] grid-cols-3 gap-4 text-left my-10", className)}>
        {#each items as item}
            <BentoCard {...item} />
        {/each}
  </div>
  