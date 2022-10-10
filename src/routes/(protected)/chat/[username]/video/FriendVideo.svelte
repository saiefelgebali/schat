<script lang="ts">
	export let self: HTMLVideoElement | undefined = undefined;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video class="w-full -z-50" bind:this={self} autoplay playsinline />

<style>
	video {
		/* So that MyVideo stays on top */
		transform: rotateY(360deg);
		-webkit-transform: rotateY(360deg);
		-moz-transform: rotateY(360deg);

		max-height: 100vh;
	}
</style>
