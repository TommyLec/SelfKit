<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion/index';
	import { config } from '$lib/selfkit.config';

	let items = [
		{
			question: 'Question 1?',
			answer: 'Answer 1'
		},
		{
			question: 'Question 2?',
			answer: 'Answer 2'
		},
		{
			question: 'Question 3?',
			answer: 'Answer 3'
		},
		{
			question: 'Question 4?',
			answer: 'Answer 4'
		},
	];

	let { type = 'multiple' }: { type?: 'single' | 'multiple' } = $props();
</script>


<div class="grid grid-cols-1 px-10 my-10">
	<div class="text-center mb-5">
		<h3 class="text-2xl lg:text-3xl font-bold">Frequently Asked Questions</h3>
		<p class="text-md text-muted-foreground">
			Have another question? Contact me on the <a
				class="underline hover:text-primary"
				href="/contact">Contact page</a
			>
			or by
			<a class="underline hover:text-primary" href={`mailto:${config.emailContact}`}>Email</a>
		</p>
	</div>
	<Accordion.Root {type}>
		{#each items as item, i}
			<Accordion.Item value={`item-${i}`}>
				<Accordion.Trigger class="text-base md:text-lg lg:text-xl">{item.question}</Accordion.Trigger>
				<Accordion.Content class="content text-left text-lg font-thin">
					{@html item.answer}
				</Accordion.Content>
			</Accordion.Item>
		{/each}
	</Accordion.Root>
</div>
