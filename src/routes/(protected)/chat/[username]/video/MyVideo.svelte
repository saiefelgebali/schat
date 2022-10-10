<script lang="ts">
	export let self: HTMLVideoElement | undefined = undefined;
</script>

<video class="rounded-lg absolute left-4 top-4 z-50" bind:this={self} autoplay playsinline muted />

<style>
	video {
		/* Flip video */
		transform: rotateY(180deg);
		-webkit-transform: rotateY(180deg);
		-moz-transform: rotateY(180deg);

		width: 200px;
		max-width: 30vw;
	}
</style>
