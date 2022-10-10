<script lang="ts">
	let self: HTMLVideoElement;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video class="w-full" bind:this={self} autoplay playsinline />

<style>
	video {
		max-height: 100vh;
	}
</style>
