<script lang="ts">
	export let title: string;
	export let loading: boolean;
	export let handleSubmit: (e: SubmitEvent) => void;
</script>

<section class="container">
	<h2 class="text-xl mb-4">{title}</h2>
	<form on:submit|preventDefault={handleSubmit} {...$$props}>
		<fieldset class="grid grid-cols-1 gap-4" disabled={loading}>
			<slot />
		</fieldset>
	</form>
</section>
