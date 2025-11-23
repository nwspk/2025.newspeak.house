<script lang="ts">
	import genericPersonImg from '../assets/generic-person.png';
	interface Props {
		name: string;
		description?: string;
		photo?: string;
	}

	let { name, description, photo }: Props = $props();

	// Generate placeholder image with initials
	const initials = name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
</script>

<div class="card">
	<div class="photo-container">
		{#if photo}
			<img src={photo} alt={name} />
		{:else}
			<img src={genericPersonImg} alt={'Generic image of a person'} />
		{/if}
	</div>
	<div class="info">
		<h3 class="name">{name}</h3>
		{#if description}
			<p class="description">{description}</p>
		{/if}
	</div>
</div>

<style>
	.card {
		background: rgba(220, 220, 200, 0.5);
		backdrop-filter: blur(8px);
		border: 2px solid rgba(26, 26, 26, 0.15);
		overflow: hidden;
		transition: all 0.2s ease;
		display: block;
		position: relative;
		height: 100%;
	}

	.card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 3px;
		background: #d62828;
		transform: scaleX(0);
		transform-origin: left;
		transition: transform 0.3s ease;
	}

	.card:hover {
		border-color: #1a1a1a;
		transform: translateY(-3px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
	}

	.card:hover::before {
		transform: scaleX(1);
	}

	.photo-container {
		position: relative;
		width: 100%;
		aspect-ratio: 1;
		overflow: hidden;
		background: linear-gradient(135deg, #e8e8dc 0%, #d5d5ca 100%);
	}

	.photo-container img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(100%) contrast(1.3) brightness(0.85) sepia(0.25);
		mix-blend-mode: multiply;
		opacity: 0.95;
		transition:
			filter 0.3s ease,
			mix-blend-mode 0.3s ease,
			opacity 0.3s ease;
	}

	.card:hover .photo-container img {
		filter: none;
		mix-blend-mode: normal;
		opacity: 1;
	}

	.placeholder {
		width: 100%;
		height: 100%;
		background:
			linear-gradient(
				135deg,
				transparent 0%,
				transparent 45%,
				rgba(214, 40, 40, 0.03) 45%,
				rgba(214, 40, 40, 0.03) 55%,
				transparent 55%,
				transparent 100%
			),
			linear-gradient(
				45deg,
				transparent 0%,
				transparent 45%,
				rgba(26, 26, 26, 0.02) 45%,
				rgba(26, 26, 26, 0.02) 55%,
				transparent 55%,
				transparent 100%
			),
			radial-gradient(ellipse at 30% 40%, #e8e8e0 0%, #d8d8d0 50%, #c8c8c0 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		mix-blend-mode: multiply;
	}

	.placeholder::after {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 4px,
			rgba(0, 0, 0, 0.015) 4px,
			rgba(0, 0, 0, 0.015) 8px
		);
	}

	.initials {
		font-size: 2.5rem;
		font-weight: 600;
		color: rgba(80, 80, 70, 0.6);
		letter-spacing: 0.05em;
		font-family: 'IBM Plex Mono', monospace;
		z-index: 1;
		mix-blend-mode: multiply;
	}

	.info {
		padding: 1.25rem;
		background: rgba(220, 220, 200, 0.4);
	}

	.name {
		font-size: 1.2rem;
		font-weight: 600;
		margin: 0;
		color: #1a1a1a;
		letter-spacing: 0.01em;
		line-height: 1.3;
		font-family: 'IBM Plex Mono', monospace;
	}

	.description {
		font-size: 0.85rem;
		line-height: 1.6;
		margin: 0.5rem 0 0 0;
		color: #555;
		font-weight: 400;
	}
</style>
