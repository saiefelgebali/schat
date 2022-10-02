<script lang="ts">
	export let href: string;
</script>

<section class="container">
	<div class="grid grid-cols-1">
		<!-- Or Divider -->
		<div class="my-2 flex justify-between items-center gap-4 text-gray-400">
			<div class="border-b w-full" />
			<p class="text-gray-400">Or</p>
			<div class="border-b w-full" />
		</div>

		<!-- Button -->
		<a {href} class="text-center bg-gray-200 my-2 p-3 rounded text-gray-700 shadow-sm">
			<slot />
		</a>
	</div>
</section>
