<script lang="ts">
	import { page } from '$app/stores';
	import FellowProfileHeader from '$lib/components/fellow/FellowProfileHeader.svelte';
	import FellowActivitySection from '$lib/components/fellow/FellowActivitySection.svelte';
	import FieldNotesGrid from '$lib/components/fellow/FieldNotesGrid.svelte';
	import ExplorationSection from '$lib/components/fellow/ExplorationSection.svelte';
	import UpcomingEventsSection from '$lib/components/fellow/UpcomingEventsSection.svelte';
	import SocialFeedSection from '$lib/components/fellow/SocialFeedSection.svelte';
	import type { FellowProfile } from '$lib/data/fellow-types.js';

	let { data }: { data: { fellow: FellowProfile } } = $props();
	const fellow = data.fellow;

	const hasActivity =
		fellow.summary.interests.length > 0 ||
		fellow.summary.working_on.length > 0 ||
		fellow.currentlyExploring.length > 0;
</script>

<svelte:head>
	<title>{fellow.name} · Newspeak House 25/26</title>
	<meta name="description" content={fellow.bio} />
</svelte:head>

<div class="page">
	<div class="container">
		<a href="/" class="back-link">
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7" />
			</svg>
			Back to cohort
		</a>

		<FellowProfileHeader
			name={fellow.name}
			avatar={fellow.avatar}
			bio={fellow.bio}
			socialLinks={fellow.socialLinks}
		/>

		<div class="divider"></div>

		{#if hasActivity}
			<FellowActivitySection
				interests={fellow.summary.interests}
				workingOn={fellow.summary.working_on}
				currentlyExploring={fellow.currentlyExploring}
			/>
			<div class="divider"></div>
		{/if}

		{#if fellow.upcomingEvents && fellow.upcomingEvents.length > 0}
			<UpcomingEventsSection events={fellow.upcomingEvents} />
			<div class="divider"></div>
		{/if}

		{#if fellow.fieldNotes.length > 0}
			<FieldNotesGrid notes={fellow.fieldNotes} />
			<div class="divider"></div>
		{/if}

		{#if fellow.explorationItems && fellow.explorationItems.length > 0}
			<ExplorationSection items={fellow.explorationItems} />
			<div class="divider"></div>
		{/if}

		{#if fellow.socialPosts && fellow.socialPosts.length > 0}
			<SocialFeedSection posts={fellow.socialPosts} />
		{/if}
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		background: #d4cfc0;
		color: #1a1a1a;
	}

	.container {
		max-width: 80rem;
		margin: 0 auto;
		padding: 1.5rem 1.5rem 3rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		font-family: 'IBM Plex Mono', monospace;
		color: rgba(26, 26, 26, 0.7);
		text-decoration: none;
	}

	.back-link:hover {
		color: #1a1a1a;
	}

	.divider {
		border-top: 1px solid rgba(26, 26, 26, 0.2);
	}
</style>
