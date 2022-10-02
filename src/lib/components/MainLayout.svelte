<script>
	import Header from '$lib/components/Header.svelte';

	export let logo = true;
	export let title = '';
</script>

<div class="min-h-screen flex flex-col">
	<Header {logo} {title}>
		<svelte:fragment slot="left">
			<slot name="header-left" />
		</svelte:fragment>
		<svelte:fragment slot="right">
			<slot name="header-right" />
		</svelte:fragment>
	</Header>

	<div class="flex-grow">
		<slot name="main" />
	</div>

	<footer>
		<div class="container flex justify-center py-8">
			<p class="text-gray-400 text-sm">Safchat © 2022</p>
		</div>
	</footer>
</div>
