<script>
	import Logo from '$lib/components/Logo.svelte';

	export let logo = true;
	export let title = '';
</script>

<header class="border-b py-4 sticky top-0 bg-gray-50 h-16 flex items-center justify-center">
	<div class="container">
		<div class="flex justify-between items-center">
			<div class="w-full">
				{#if logo}
					<a href="/" target="_self">
						<Logo />
					</a>
				{/if}
				<slot name="left" />
			</div>
			<div>
				{#if title !== ''}
					<h1 class="font-medium text-gray-900">{title}</h1>
				{/if}
				<slot name="center" />
			</div>
			<div class="w-full">
				<slot name="right" />
			</div>
		</div>
	</div>
</header>
