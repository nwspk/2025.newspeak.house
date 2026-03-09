<script lang="ts">
	interface Props {
		name: string;
		photo?: string;
		color?: string;
	}

	let { name, photo, color = 'chart-1' }: Props = $props();
</script>

<div class="avatar-card">
	<span class="avatar" style="border-color:hsl(var(--{color}))">
		{#if photo}
			<img src={photo} alt={name} />
		{:else}
			<span class="initials">{name.split(' ').map((n) => n[0]).join('').slice(0, 2)}</span>
		{/if}
	</span>
	<span class="avatar-name">{name}</span>
</div>

<style>
	.avatar-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		max-width: 110px;
		flex-shrink: 0;
	}

	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 64px;
		height: 64px;
		border-radius: 50%;
		overflow: hidden;
		border: 3px solid;
		background: rgba(255, 255, 255, 0.5);
		flex-shrink: 0;
	}
	.avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.initials {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.95rem;
		font-weight: 600;
		color: #555;
	}

	.avatar-name {
		font-size: 0.82rem;
		font-weight: 700;
		font-family: 'IBM Plex Mono', monospace;
		text-align: center;
		line-height: 1.3;
	}

	/* Compact variant for panel header */
	:global(.avatar-card--compact) .avatar {
		width: 40px;
		height: 40px;
	}
	:global(.avatar-card--compact) .avatar-name {
		font-size: 0.72rem;
	}
</style>
