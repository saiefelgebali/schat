<script lang="ts">
	export let name: string | undefined = undefined;
	export let label: string | undefined = undefined;
	export let value: any | undefined = undefined;
</script>

<div class="w-full">
	{#if label}
		<label class="block text-gray-600" for={name}>{label}</label>
	{/if}
	<input id={name} {name} bind:value {...$$props} />
</div>

<style lang="postcss">
	input {
		@apply block rounded drop-shadow w-full px-4 py-2 focus:outline-none focus:drop-shadow-md;
	}

	input:disabled {
		@apply drop-shadow-none outline outline-1 outline-gray-300;
	}
</style>
