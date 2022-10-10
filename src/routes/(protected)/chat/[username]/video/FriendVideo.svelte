<script lang="ts">
	export let self: HTMLVideoElement | undefined = undefined;
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video class="w-full" bind:this={self} autoplay playsinline />

<style>
	video {
		max-height: 100vh;
	}
</style>
