<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/components/ui/button/button.svelte";
	import Label from "$lib/components/ui/label/label.svelte";
	import * as InputOTP from '$lib/components/ui/input-otp/index.ts';
	import { REGEXP_ONLY_DIGITS_AND_CHARS } from "bits-ui";
	import Separator from "$lib/components/ui/separator/separator.svelte";
	import * as m from '$lib/paraglide/messages.js';

	let { data, form } = $props();
</script>

<div class="flex mt-5 flex-col items-center gap-5 text-center">
	<div>
		<h1 class="text-2xl font-bold">{m.inner_mild_flamingo_breathe()}</h1>
		<p class="text-muted-foreground">{m.heavy_wacky_hornet_cook()}</p>
	</div>
	<div class="w-[300px] h-[300px]">
		{@html data.qrcode}
	</div>
	<Separator class="w-11/12 my-3" />
	<form class="flex flex-col gap-3 items-center" method="post" use:enhance>
		<input name="key" value={data.encodedTOTPKey} hidden required />
		<Label for="form-totp.code">{m.nice_mealy_polecat_sway()}</Label>
		<InputOTP.Root maxlength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} id="form-totp.code" name="code" required>
			{#snippet children({ cells })}
				<InputOTP.Group>
					{#each cells as cell}
						<InputOTP.Slot {cell} />
					{/each}
				</InputOTP.Group>
			{/snippet}
		</InputOTP.Root>
		
		<Button class="w-full" type="submit">{m.lazy_wise_ostrich_favor()}</Button>
		<p class="text-destructive">{form?.message ?? ""}</p>
	</form>
</div>

