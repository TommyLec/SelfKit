<script>
	import Icon from '@iconify/svelte';
	import Button from './ui/button/button.svelte';
	import { toggleMode } from 'mode-watcher';
</script>

<Button onclick={toggleMode} variant="ghost" size="icon">
	<Icon
		class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
		icon="tabler:sun"
	/>
	<Icon
		class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
		icon="tabler:moon"
	/>
	<span class="sr-only">Toggle theme</span>
</Button>
