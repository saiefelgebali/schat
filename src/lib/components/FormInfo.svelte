<script lang="ts">
	import { slide } from 'svelte/transition';
	export let error: string = '';
	export let success: string = '';
</script>

{#if error !== ''}
	<div transition:slide|local>
		<div class="text-red-600 rounded">{error}</div>
	</div>
{/if}

{#if success !== ''}
	<div transition:slide|local>
		<div class="text-blue-600 rounded">{success}</div>
	</div>
{/if}
