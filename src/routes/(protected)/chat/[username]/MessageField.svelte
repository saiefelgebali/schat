<script lang="ts">
	import { onMount } from 'svelte';

	export let value: string = '';

	export let send: () => void;

	const sendMessage = () => {
		send();
		value = '';
	};

	let growers: NodeListOf<HTMLElement>;

	onMount(() => {
		growers = document.querySelectorAll('.grow-wrap');
	});

	$: if (growers) {
		growers.forEach((g) => {
			g.dataset.replicatedValue = value;
		});
	}

	function handleEnter(e: any) {
		if (e.key === 'Enter') {
			e.preventDefault();
			sendMessage();
		}
	}
</script>

<div class="border-t pt-4 pb-6 fixed bottom-0 left-0 right-0 z-20 bg-gray-50">
	<div class="flex items-start gap-4 container">
		<div class={`grow-wrap ${$$props.class}`}>
			<textarea bind:value name="text" id="text" rows="1" on:keypress={handleEnter} />
		</div>
		<button class="px-4 py-2 border bg-blue-600 rounded-full text-white" on:click={sendMessage}>
			Send
		</button>
	</div>
</div>

<!-- 
    Autogrowing textarea
    https://css-tricks.com/the-cleanest-trick-for-autogrowing-textareas/
-->
<style lang="postcss">
	.grow-wrap {
		/* easy way to plop the elements on top of each other and have them both sized based on the tallest one's height */
		display: grid;
	}
	.grow-wrap::after {
		/* Note the weird space! Needed to preventy jumpy behavior */
		content: attr(data-replicated-value) ' ';

		/* This is how textarea text behaves */
		white-space: pre-wrap;

		/* Hidden from view, clicks, and screen readers */
		visibility: hidden;
	}
	.grow-wrap > textarea {
		/* You could leave this, but after a user resizes, then it ruins the auto sizing */
		resize: none;

		/* Firefox shows scrollbar on growth, you can hide like this. */
		/* overflow: hidden; */
	}
	.grow-wrap > textarea,
	.grow-wrap::after {
		/* Identical styling required!! */
		@apply w-full rounded-3xl border px-4 py-2 max-h-96 overflow-hidden break-words;

		/* Place on top of each other */
		grid-area: 1 / 1 / 2 / 2;
	}
</style>
