<script lang="ts">
	export let online: boolean;
</script>

<div class="grid items-center">
	<div class="w-4 row-start-1 col-start-1 flex justify-center transition-all duration-75">
		<div
			class="w-4 aspect-square rounded-full"
			class:bg-gray-400={!online}
			class:bg-green-700={online}
			class:opacity-50={online}
		/>
	</div>
	<div class="w-4 row-start-1 col-start-1 flex justify-center">
		<div
			class="w-3 aspect-square rounded-full transition-colors duration-150"
			class:bg-gray-300={!online}
			class:bg-green-600={online}
		/>
	</div>
</div>
