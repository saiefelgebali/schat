<script>
	import MainLayout from '$lib/components/MainLayout.svelte';
</script>

<MainLayout>
	<main slot="main">
		<section class="container my-8">
			<h1 class="text-4xl mb-4">Welcome to Safchat</h1>
			<p class="text-gray-600">
				A carrier pigeon that connects two people from opposite sides of the world.
			</p>
		</section>

		<slot />
	</main>
</MainLayout>
