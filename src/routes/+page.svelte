<script lang="ts">
	import { onMount } from 'svelte';
	import CohortCard from '$lib/components/CohortCard.svelte';
	import DavidPowellPhoto from '$lib/assets/david-powell.png';
	import GamithraMargaPhoto from '$lib/assets/gamithra.jpg';

	type CohortMember = {
		name: string;
		profileSlug?: string;
		photo?: string;
		description?: string;
		mediaType?: 'video' | 'image';
		mediaUrl?: string;
		mediaAltText?: string;
	};

	let selectedPerson = $state<CohortMember | null>(null);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let profileContent = $state<any>(null);

	async function openPanel(person: CohortMember) {
		selectedPerson = person;
		document.body.style.overflow = 'hidden';

		const slug = person.profileSlug ?? 'profile-under-construction';

		// Load the markdown content for this person
		try {
			const module = await import(`$lib/cohort-profiles/${slug}.md`);
			profileContent = module.default;
		} catch (error) {
			console.error(`Failed to load profile for ${slug}:`, error);
			profileContent = null;
		}
	}

	function closePanel() {
		selectedPerson = null;
		profileContent = null;
		document.body.style.overflow = '';
	}

	onMount(() => {
		const handleMouseMove = (e: MouseEvent) => {
			mouseX = e.clientX / window.innerWidth;
			mouseY = e.clientY / window.innerHeight;
		};

		window.addEventListener('mousemove', handleMouseMove);

		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
		};
	});

	const cohort: CohortMember[] = [
		{
			name: 'Aadi Kulkarni'
		},
		{
			name: 'Alex Pedori'
		},
		{
			name: 'Alexandra Ciocanel',
			profileSlug: 'alexandra-ciocanel'
		},
		{
			name: 'Asil Sidahmed',
			profileSlug: 'asil-sidahmed'
		},
		{
			name: 'Chris Owen',
			profileSlug: 'chris-owen'
		},
		{
			name: 'Connor Dunlop',
			profileSlug: 'connordunlop'
		},
		{
			name: 'David Powell',
			profileSlug: 'david-powell',
			photo: DavidPowellPhoto
		},
		{
			name: 'Davit Jintcharadze'
		},
		{
			name: 'Emily Mayhew'
		},
		{
			name: 'Fatima Sarah Khalid'
		},
		{
			name: 'Francesca Galli'
		},
		{
			name: "Fred O'Brien",
			profileSlug: 'frederick-obrien'
		},
		{
			name: 'Gamithra Marga',
			profileSlug: 'gamithra',
			photo: GamithraMargaPhoto,
			description: '☀︎ a solarpunk technologist'
		},
		{
			name: 'Huda Abdirahim'
		},
		{
			name: 'Jamie Coombes'
		},
		{
			name: 'Martina Orlea',
			profileSlug: 'martina-orlea'
		},
		{
			name: 'Nick Botti'
		},
		{
			name: 'Tuna Acisu',
			profileSlug: 'tuna-acisu'
		}
	];
</script>

<div class="background" style="--mouse-x: {mouseX}; --mouse-y: {mouseY};"></div>

<div class="page-wrapper" class:panel-open={selectedPerson}>
	<div class="main-content">
		<div class="hero">
			<div class="hero-content">
				<div class="hero-main">
					<h1>London College of Political Technology<br />2025/26 cohort</h1>
					<p class="mission-statement">
						Mid-career technologists developing a holistic understanding of the civic landscape in
						the UK and beyond, to found groundbreaking projects or seek strategic positions in key
						institutions.
					</p>
					<div class="meta">
						<span class="label">STATUS:</span>
						<span class="value">ACTIVE</span>
						<span class="separator">|</span>
						<span class="label">FELLOWS:</span>
						<span class="value">{cohort.length}</span>
						<span class="separator">|</span>
						<span class="label">CYCLE:</span>
						<span class="value">2025-2026</span>
					</div>
				</div>
				<div class="hero-nav">
					<a href="/library" class="hero-link">→ Browse our library</a>
					<a href="/guest-room" class="hero-link">→ Stay in our guest room</a>
					<a href="/contact" class="hero-link">→ Get in touch</a>
				</div>
			</div>
		</div>

		<div class="section-header">
			<div class="line"></div>
			<h2>/// FELLOWSHIP CANDIDATES</h2>
		</div>

		<div class="grid">
			{#each cohort as human}
				<button class="card-button" onclick={() => openPanel(human)}>
					<CohortCard
						name={human.name}
						description={human.description ?? 'Newspeak House Fellowship Candidate'}
						photo={human.photo}
					/>
				</button>
			{/each}
		</div>

		<div class="footer">
			<p>
				Visit the <a
					href="https://newspeak.house"
					class="hero-link"
					target="_blank"
					rel="noopener noreferrer">Newspeak House website</a
				>
				and join us for the next
				<a
					href="https://newspeak.house/events"
					class="hero-link"
					target="_blank"
					rel="noopener noreferrer">Ration Club</a
				>.
			</p>
		</div>
	</div>

	{#if selectedPerson}
		<div class="side-panel">
			<div class="cohort-profile">
				{#if selectedPerson.photo}
					<div class="photo-clip">
						<img src={selectedPerson.photo} alt={selectedPerson.name} class="panel-photo" />
						<div class="clip-top"></div>
						<div class="clip-bottom"></div>
					</div>
				{/if}
				<button class="close-button" onclick={closePanel}>✕</button>
				<div class="panel-content">
					<h2>{selectedPerson.name}</h2>
					{#if selectedPerson.description}
						<p class="panel-description">{selectedPerson.description}</p>
					{/if}

					<div class="panel-details">
						{#if profileContent}
							<svelte:component this={profileContent} />
						{:else}
							<p>Loading profile...</p>
						{/if}
					</div>
				</div>
			</div>

			<div class="media-showcase">
				<div class="media-label">///</div>
				{#if selectedPerson.mediaType === 'video'}
					<div class="video-container">
						<iframe
							src={selectedPerson.mediaUrl}
							title="Video content"
							frameborder="0"
							allow="autoplay; encrypted-media"
							allowfullscreen
						></iframe>
					</div>
				{:else if selectedPerson.mediaType === 'image'}
					<div class="image-showcase">
						<img src={selectedPerson.mediaUrl} alt={selectedPerson.mediaAltText} />
					</div>
				{:else}
					<div class="image-showcase">
						<img
							src={'https://picsum.photos/seed/davit/1200/800'}
							alt="Autumnal leaves on the ground"
						/>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		background:
			radial-gradient(
				circle at calc(var(--mouse-x) * 100%) calc(var(--mouse-y) * 100%),
				rgba(232, 232, 220, 0.95) 0%,
				rgba(220, 220, 208, 0.7) 25%,
				rgba(208, 208, 196, 0.5) 50%,
				transparent 100%
			),
			radial-gradient(
				ellipse at 35% 65%,
				rgba(200, 200, 180, 0.3) 0%,
				transparent 50%
			),
			radial-gradient(
				ellipse at 65% 35%,
				rgba(180, 180, 160, 0.2) 0%,
				transparent 50%
			),
			linear-gradient(to bottom, #d8d8cc 0%, #ccccc0 50%, #c0c0b4 100%);
	}

	.background::before {
		content: '';
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			0deg,
			transparent,
			transparent 2px,
			rgba(0, 0, 0, 0.035) 2px,
			rgba(0, 0, 0, 0.035) 4px
		);
		opacity: 0.4;
		pointer-events: none;
		will-change: auto;
	}

	.page-wrapper {
		display: flex;
		width: 100%;
		min-height: 100vh;
		transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.main-content {
		width: 100%;
		min-width: 100%;
		flex-shrink: 0;
	}

	.side-panel {
		position: fixed;
		right: 0;
		top: 100px;
		width: 60vw;
		background: rgba(232, 232, 220, 0.98);
		backdrop-filter: blur(20px);
		border-left: 3px solid #d62828;
		transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		box-sizing: border-box;
		height: calc(100vh - 100px);
		overflow-y: auto;
		display: flex;
	}

	.cohort-profile {
		padding: 3rem;
		position: relative;
		flex-basis: 50%;
	}

	.close-button {
		position: absolute;
		top: 2rem;
		right: 2rem;
		width: 40px;
		height: 40px;
		border: 2px solid #1a1a1a;
		background: rgba(255, 255, 255, 0.8);
		color: #1a1a1a;
		font-size: 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: 'IBM Plex Mono', monospace;
	}

	.close-button:hover {
		background: #d62828;
		color: white;
		border-color: #d62828;
		transform: rotate(90deg);
	}

	.photo-clip {
		position: absolute;
		top: 0.5rem;
		left: 2rem;
		width: 180px;
		z-index: 10;
		transform: rotate(-2deg);
	}

	.panel-photo {
		width: 100%;
		height: auto;
		display: block;
		filter: grayscale(100%) contrast(1.3) brightness(0.85) sepia(0.25);
		mix-blend-mode: multiply;
		border: 4px solid rgba(255, 255, 255, 0.9);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.15),
			0 8px 20px rgba(0, 0, 0, 0.1);
	}

	.clip-top,
	.clip-bottom {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		width: 40px;
		height: 8px;
		background: linear-gradient(135deg, #c8c8b8 0%, #b0b0a0 100%);
		border: 1px solid rgba(0, 0, 0, 0.2);
		box-shadow:
			inset 0 1px 2px rgba(255, 255, 255, 0.3),
			0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.clip-top {
		top: -4px;
		border-radius: 2px 2px 0 0;
	}

	.clip-bottom {
		bottom: -4px;
		border-radius: 0 0 2px 2px;
		opacity: 0.7;
	}

	.panel-content {
		padding-top: 160px;
		padding-bottom: 1rem;
	}

	.panel-content h2 {
		font-size: 2rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		color: #0a0a0a;
		font-family: 'Crimson Pro', serif;
	}

	.panel-description {
		font-size: 1.1rem;
		color: #1a1a1a;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.media-showcase {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		border-left: 3px solid #d62828;
		background:
			radial-gradient(circle at top left, rgba(255, 255, 255, 0.06), transparent 55%),
			linear-gradient(120deg, #101010, #1a1a1a 40%, #151515 70%, #050505);
		color: #f5f5f5;
		position: relative;
		overflow: hidden;
		box-sizing: border-box;
		flex-basis: 50%;
	}

	.media-label {
		position: absolute;
		top: 0;
		left: 0;
		background: #d62828;
		color: white;
		font-size: 0.65rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		padding: 0.4rem 0.8rem;
		font-family: 'IBM Plex Mono', monospace;
		z-index: 10;
	}

	.video-container {
		width: 100%;
		height: 100%;
		background: #1a1a1a;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.video-container iframe {
		width: 100%;
		height: 100%;
		border: none;
		object-fit: cover;
	}

	.image-showcase {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.image-showcase img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.panel-details {
		font-size: 0.95rem;
		line-height: 1.7;
		color: #333;
	}

	.card-button {
		all: unset;
		cursor: pointer;
		display: block;
		width: 100%;
	}

	@media (max-width: 1024px) {
		/* Stop shifting the underlying page on tablet/mobile */
		.page-wrapper.panel-open {
			transform: none;
		}

		.side-panel {
			width: 100vw;
			flex-direction: column;
		}
	}

	@media (max-width: 768px) {
		.cohort-profile {
			padding: 2rem 1.5rem;
		}

		.page-wrapper.panel-open .side-panel {
			left: 0;
		}

		.photo-clip {
			width: 140px;
			top: 0.5rem;
			left: 1.5rem;
		}

		.panel-content {
			padding-top: 130px;
		}

		.media-showcase {
			display: block;
			height: auto;
			border-left: none;
			padding: 0;
			width: 100vw;
			margin-left: 50%;
			transform: translateX(-50%);
		}

		.media-showcase iframe,
		.media-showcase img {
			width: 100%;
			height: auto;
			display: block;
		}
	}

	@keyframes scanlines {
		0% {
			transform: translateY(0);
		}
		100% {
			transform: translateY(100px);
		}
	}

	.hero {
		padding: 3rem 2.5rem 2.5rem;
		position: relative;
		background: transparent;
		width: 100%;
	}

	.hero::before {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 1px;
		background: linear-gradient(
			to right,
			transparent 0%,
			rgba(26, 26, 26, 0.1) 20%,
			rgba(26, 26, 26, 0.2) 50%,
			rgba(26, 26, 26, 0.1) 80%,
			transparent 100%
		);
	}

	.hero-content {
		display: flex;
		gap: 4rem;
		align-items: flex-start;
		justify-content: space-between;
		width: 100%;
	}

	.hero-main {
		flex: 1;
		min-width: 0;
		position: relative;
	}

	.hero-nav {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding-top: 0.5rem;
	}

	.hero-link {
		font-size: 0.95rem;
		color: #1a1a1a;
		text-decoration: none;
		font-weight: 500;
		transition: all 0.2s ease;
		position: relative;
		padding-left: 0;
		white-space: nowrap;
	}

	.hero-link:hover {
		color: #d62828;
	}

	.hero h1 {
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		font-weight: 600;
		margin: 0 0 1.5rem 0;
		color: #0a0a0a;
		letter-spacing: -0.01em;
		line-height: 1.05;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
		max-width: 800px;
	}

	.mission-statement {
		font-size: 1rem;
		line-height: 1.7;
		color: #1a1a1a;
		margin: 0 0 2rem 0;
		font-weight: 400;
		max-width: 700px;
	}

	.meta {
		font-size: 0.8rem;
		font-family: 'IBM Plex Mono', monospace;
		color: #666;
		letter-spacing: 0.02em;
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.label {
		font-weight: 600;
		color: #4a4a4a;
	}

	.value {
		font-weight: 700;
		color: #5a6a4a;
	}

	.separator {
		color: #8a8a8a;
	}

	.section-header {
		margin: 3rem 0 2.5rem;
		padding: 0 2.5rem;
		position: relative;
		width: 100%;
	}

	.section-header .line {
		position: absolute;
		left: 2.5rem;
		top: 50%;
		width: 60px;
		height: 2px;
		background: #d62828;
	}

	.section-header h2 {
		font-size: 0.75rem;
		font-weight: 700;
		color: #1a1a1a;
		margin: 0;
		letter-spacing: 0.1em;
		font-family: 'IBM Plex Mono', monospace;
		padding-left: 80px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 1rem;
		margin: 0 0 4rem;
		padding: 0 2.5rem;
		width: 100%;
	}

	@media (min-width: 768px) {
		.grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	@media (min-width: 1400px) {
		.grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	@media (max-width: 768px) {
		.hero {
			padding: 2rem 1.5rem;
		}

		.hero-content {
			flex-direction: column;
			gap: 2rem;
		}

		.hero-nav {
			padding-top: 1.5rem;
			border-top: 1px solid rgba(26, 26, 26, 0.15);
		}

		.section-header {
			padding: 0 1.5rem;
		}

		.section-header .line {
			left: 1.5rem;
			width: 40px;
		}

		.section-header h2 {
			padding-left: 60px;
		}

		.grid {
			padding: 0 1.5rem;
		}

		.footer {
			padding: 2rem 1.5rem;
		}
	}

	.footer {
		padding: 3rem 2.5rem;
		border-top: 2px solid rgba(26, 26, 26, 0.2);
		background: rgba(255, 255, 255, 0.85);
		backdrop-filter: blur(10px);
		position: relative;
		width: 100%;
	}

	.footer p {
		margin: 0;
		color: #666;
		font-size: 0.85rem;
		font-family: 'IBM Plex Mono', monospace;
		text-align: center;
	}
</style>
