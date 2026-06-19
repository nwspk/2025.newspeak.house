<script lang="ts">
	import { onMount } from 'svelte';
	import {
		IDENTITY_STORAGE_KEY,
		getBookingPeriodLabel,
		getBookingStartLabel,
		getHeldDateForMember,
		getPendingTradesForDate,
		isPastDate,
		tradeSummary,
		type BookingState,
		type CalendarDay,
		type CohortMember,
		type DayState,
		type Trade,
		type TradeType,
		type WalletRegistration
	} from '$lib/data/room-booking';

	let { data } = $props();

	let bookingState = $state<BookingState>(data.state);
	let identity = $state<CohortMember | ''>('');
	let selectedDate = $state<string | null>(null);
	let modalMode = $state<'claim' | 'own' | 'other' | 'trade' | 'respond' | 'wallet' | null>(null);
	let tradeNote = $state('');
	let tradeKind = $state<TradeType>('day_swap');
	let tradeTargetDate = $state('');
	let tradeOfferDate = $state('');
	let walletAddress = $state('');
	let activeTrade = $state<Trade | null>(null);
	let rulesOpen = $state(false);
	let whyOpen = $state(false);
	let snapshotGuideOpen = $state(false);
	let votingOpen = $state(false);
	let busy = $state(false);
	let errorMessage = $state('');

	const members = data.members as CohortMember[];
	const calendarDays = data.calendarDays as CalendarDay[];
	const poolLeadDays = data.poolLeadDays;
	const snapshotUrl = data.snapshotUrl;
	const bookingPeriod = getBookingPeriodLabel();
	const bookingStartLabel = getBookingStartLabel();

	onMount(() => {
		const saved = localStorage.getItem(IDENTITY_STORAGE_KEY);
		if (saved && members.includes(saved as CohortMember)) {
			identity = saved as CohortMember;
		}
	});

	function saveIdentity(member: CohortMember | '') {
		identity = member;
		if (member) {
			localStorage.setItem(IDENTITY_STORAGE_KEY, member);
		} else {
			localStorage.removeItem(IDENTITY_STORAGE_KEY);
		}
	}

	function getDay(date: string): DayState {
		return bookingState.days[date];
	}

	function displayName(day: DayState): string {
		return day.holder ?? day.allocated_to;
	}

	function poolCount(date: string): number {
		return bookingState.pool_claims[date]?.length ?? 0;
	}

	function pendingTrades(date: string): Trade[] {
		return getPendingTradesForDate(bookingState, date);
	}

	function statusLabel(day: DayState, date: string): string {
		if (day.status === 'claimed') return 'Claimed';
		if (day.status === 'pool') {
			const count = poolCount(date);
			return count > 0 ? `Pool · ${count} interested` : 'Pool · up for grabs';
		}
		if (day.status === 'trade_pending') return 'Trade pending';
		return 'Unclaimed';
	}

	function counterpartName(day: DayState): CohortMember {
		return day.holder ?? day.allocated_to;
	}

	function isOwnDay(day: DayState): boolean {
		if (!identity) return false;
		return day.allocated_to === identity || day.holder === identity;
	}

	function openDay(date: string) {
		if (isPastDate(date)) return;

		selectedDate = date;
		errorMessage = '';

		const day = getDay(date);
		const trades = pendingTrades(date);
		const incoming = trades.find((trade) => trade.counterpart_date === date && trade.status === 'pending');

		if (incoming && identity === incoming.counterpart) {
			modalMode = 'respond';
			activeTrade = incoming;
			return;
		}

		if (day.status === 'pool') {
			modalMode = 'claim';
			return;
		}

		if (isOwnDay(day)) {
			if (day.status === 'claimed' && day.holder === identity) {
				modalMode = 'own';
				return;
			}

			if (day.status === 'trade_pending') {
				modalMode = 'own';
				return;
			}

			modalMode = 'claim';
			return;
		}

		modalMode = 'other';
	}

	function openWalletModal() {
		selectedDate = null;
		activeTrade = null;
		tradeNote = '';
		walletAddress =
			identity && bookingState.wallet_addresses[identity]
				? bookingState.wallet_addresses[identity]!.address
				: '';
		errorMessage = '';
		modalMode = 'wallet';
	}

	function closeModal() {
		selectedDate = null;
		modalMode = null;
		tradeNote = '';
		tradeKind = 'day_swap';
		tradeTargetDate = '';
		tradeOfferDate = '';
		walletAddress = '';
		activeTrade = null;
		errorMessage = '';
	}

	async function mutate(body: Record<string, unknown>) {
		busy = true;
		errorMessage = '';

		try {
			const response = await fetch('/api/room-booking', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});

			const result = await response.json();
			if (!response.ok || !result.ok) {
				throw new Error(result.error ?? 'Something went wrong');
			}

			bookingState = result.state;
			return true;
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Something went wrong';
			return false;
		} finally {
			busy = false;
		}
	}

	async function handleClaim() {
		if (!selectedDate || !identity) {
			errorMessage = 'Pick who you are first.';
			return;
		}

		const ok = await mutate({
			action: 'claim',
			date: selectedDate,
			member: identity
		});

		if (ok) closeModal();
	}

	async function handleRelease() {
		if (!selectedDate || !identity) {
			errorMessage = 'Pick who you are first.';
			return;
		}

		const ok = await mutate({
			action: 'swap',
			date: selectedDate,
			member: identity
		});

		if (ok) closeModal();
	}

	function startTrade() {
		if (!selectedDate || !identity) return;
		modalMode = 'trade';
		tradeNote = '';
		tradeKind = 'day_swap';
		errorMessage = '';

		tradeTargetDate = selectedDate;
		tradeOfferDate = getHeldDateForMember(bookingState, identity) ?? '';
	}

	async function submitWallet() {
		if (!identity) {
			errorMessage = 'Pick who you are first.';
			return;
		}

		const ok = await mutate({
			action: 'register_wallet',
			member: identity,
			address: walletAddress
		});

		if (ok) closeModal();
	}

	async function submitTrade() {
		if (!identity) {
			errorMessage = 'Pick who you are first.';
			return;
		}

		if (!tradeTargetDate) {
			errorMessage = 'Choose the day you want.';
			return;
		}

		const counterpartDay = getDay(tradeTargetDate);
		const counterpart = counterpartDay.holder ?? counterpartDay.allocated_to;

		if (tradeKind === 'day_swap') {
			if (!tradeOfferDate) {
				errorMessage = 'Choose the day you are offering in return.';
				return;
			}

			const ok = await mutate({
				action: 'trade_request',
				type: 'day_swap',
				initiator: identity,
				initiator_date: tradeOfferDate,
				counterpart,
				counterpart_date: tradeTargetDate,
				irl_note: tradeNote
			});

			if (ok) closeModal();
			return;
		}

		if (!tradeNote.trim()) {
			errorMessage = 'Describe what you are offering in real life.';
			return;
		}

		const ok = await mutate({
			action: 'trade_request',
			type: 'irl_offer',
			initiator: identity,
			counterpart,
			counterpart_date: tradeTargetDate,
			irl_note: tradeNote
		});

		if (ok) closeModal();
	}

	async function respondToTrade(accept: boolean) {
		if (!activeTrade || !identity) {
			errorMessage = 'Pick who you are first.';
			return;
		}

		const ok = await mutate({
			action: 'trade_respond',
			trade_id: activeTrade.id,
			responder: identity,
			accept
		});

		if (ok) closeModal();
	}

	const tradeOptions = $derived(
		calendarDays.map((day) => {
			const dayState = getDay(day.date);
			return {
				date: day.date,
				label: `${day.label} · ${dayState.holder ?? dayState.allocated_to}`
			};
		})
	);

	const walletEntries = $derived(
		members
			.map((member) => {
				const registration = bookingState.wallet_addresses[member];
				if (!registration) return null;
				return { member, ...registration };
			})
			.filter((entry): entry is { member: CohortMember } & WalletRegistration => entry !== null)
	);
</script>

<svelte:head>
	<title>Guest room · Newspeak House 25/26</title>
	<meta name="description" content="Cohort guest room booking calendar" />
</svelte:head>

<div class="page">
	<header class="page-header">
		<div class="hero">
			<p class="eyebrow">/// guest room</p>
			<h1>Who's in the guest room?</h1>
			<p class="subtitle">{bookingPeriod} · iteration one · cohort only</p>
			<p class="lede">
				One day each. Claim your slot, release it back to the pool, or trade with someone else. If a day
				isn't claimed {poolLeadDays} days before, it opens up for anyone — and if you're the only one
				interested the day before, it's yours.
			</p>
		</div>
	</header>

	<section class="toolbar">
		<div class="identity-block">
			<label class="identity-picker">
				<span>I am</span>
				<select
					value={identity}
					onchange={(event) => saveIdentity((event.currentTarget as HTMLSelectElement).value as CohortMember | '')}
				>
					<option value="">Choose your name</option>
					{#each members as member}
						<option value={member}>{member}</option>
					{/each}
				</select>
			</label>
			<p class="identity-hint">Remembered on this device only.</p>
		</div>

		<div class="legend">
			<span><i class="swatch unconfirmed"></i> Unclaimed</span>
			<span><i class="swatch claimed"></i> Claimed</span>
			<span><i class="swatch pool"></i> Pool</span>
			<span><i class="swatch trade"></i> Trade pending</span>
			<span><i class="swatch past"></i> Past</span>
		</div>
	</section>

	<section class="calendar-wrap" aria-label="Guest room calendar">
		<div class="calendar-grid">
			{#each calendarDays as day (day.date)}
				{@const dayState = getDay(day.date)}
				{@const trades = pendingTrades(day.date)}
				{@const past = isPastDate(day.date)}
				<button
					type="button"
					class="day-card status-{dayState.status}"
					class:is-past={past}
					disabled={past}
					aria-disabled={past}
					onclick={() => openDay(day.date)}
				>
					<div class="day-meta">
						<span class="weekday">{day.weekday}</span>
						<span class="day-number">{day.dayNumber}</span>
						<span class="month">{day.monthLabel}</span>
					</div>

					<div class="event-bar">
						<span class="event-name">{displayName(dayState)}</span>
						<span class="event-status">{statusLabel(dayState, day.date)}</span>
					</div>

					{#if trades.length > 0}
						<p class="trade-hint">{tradeSummary(trades[0])}</p>
					{/if}
				</button>
			{/each}
		</div>
	</section>

	<aside class="info-panel" aria-label="Experiment info">
		<details class="info-dropdown" open={rulesOpen} ontoggle={(event) => (rulesOpen = event.currentTarget.open)}>
			<summary>Rules</summary>
			<ul>
				<li>Each fellow gets one day from {bookingStartLabel}.</li>
				<li>Click your amber day to claim it. We're relying on honesty — only claim your own day.</li>
				<li>
					<strong>Release to pool</strong> gives up your claimed day for others. To trade, click
					someone else's day — you can swap days or offer something in real life.
				</li>
				<li>
					Unclaimed days move to the pool {poolLeadDays} days before the date. If exactly one person
					has registered interest by the day before, they get it automatically.
				</li>
			</ul>
		</details>

		<details class="info-dropdown" open={whyOpen} ontoggle={(event) => (whyOpen = event.currentTarget.open)}>
			<summary>Why?</summary>
			<p>
				The guest room is a scarce shared resource at Newspeak — and a live governance experiment. We're
				testing whether adding light structure (this calendar + Snapshot) helps a small group coordinate
				fairly, or just adds friction.
			</p>
			<p>
				This is <strong>iteration one</strong>. If you'd like to change the process, the rules, or
				anything else, raise a proposal on Snapshot and we'll vote on it.
			</p>
			<a href={snapshotUrl} target="_blank" rel="noopener noreferrer">Open Snapshot space →</a>
		</details>

		<details
			class="info-dropdown"
			open={snapshotGuideOpen}
			ontoggle={(event) => (snapshotGuideOpen = event.currentTarget.open)}
		>
			<summary>How to use Snapshot</summary>
			<p>
				Snapshot is where we post proposals and vote on changes to how the guest room works.
			</p>
			<ol>
				<li>
					Go to <a href={snapshotUrl} target="_blank" rel="noopener noreferrer">snapshot.box</a> and open
					our space.
				</li>
				<li>Sign in with <strong>Sequence</strong> then <strong>email</strong>.</li>
				<li>Once you're logged in, copy your wallet address from your profile.</li>
				<li>
					<button type="button" class="inline-link" onclick={openWalletModal}>
						Register your address here
					</button>
					so we can add you for voting.
				</li>
				<li>When a proposal goes up, connect the same wallet to vote.</li>
			</ol>
		</details>

		<details class="info-dropdown" open={votingOpen} ontoggle={(event) => (votingOpen = event.currentTarget.open)}>
			<summary>Registered for Voting</summary>
			{#if walletEntries.length > 0}
				<table class="wallet-table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Address</th>
						</tr>
					</thead>
					<tbody>
						{#each walletEntries as entry (entry.member)}
							<tr>
								<td>{entry.member}</td>
								<td><code>{entry.address}</code></td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
			<button type="button" class="inline-link register-link" onclick={openWalletModal}>
				Register your address →
			</button>
		</details>

		<a class="snapshot-link" href={snapshotUrl} target="_blank" rel="noopener noreferrer">
			Raise a proposal →
		</a>
	</aside>
</div>

{#if modalMode}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closeModal}></div>
	<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
		<button type="button" class="close" onclick={closeModal} aria-label="Close">✕</button>

		{#if modalMode === 'wallet'}
			<h2 id="modal-title">Register for voting</h2>
			<p class="modal-copy">
				Sign in on Snapshot with Sequence then choose email, copy your wallet address, and save it here so we
				can add you for voting.
			</p>

			{#if errorMessage}
				<p class="message error">{errorMessage}</p>
			{/if}

			<label class="field">
				<span>I am</span>
				<select
					value={identity}
					onchange={(event) => {
						const member = (event.currentTarget as HTMLSelectElement).value as CohortMember | '';
						saveIdentity(member);
						walletAddress =
							member && bookingState.wallet_addresses[member]
								? bookingState.wallet_addresses[member]!.address
								: '';
					}}
				>
					<option value="">Choose your name</option>
					{#each members as member}
						<option value={member}>{member}</option>
					{/each}
				</select>
			</label>

			<label class="field">
				<span>Wallet address</span>
				<input
					type="text"
					bind:value={walletAddress}
					placeholder="0x..."
					spellcheck="false"
					autocapitalize="off"
				/>
			</label>

			<div class="modal-actions">
				<button type="button" class="primary" disabled={busy} onclick={submitWallet}>
					Save address
				</button>
			</div>
		{:else if selectedDate}
			{@const dayState = getDay(selectedDate)}
			{@const dayLabel = calendarDays.find((day) => day.date === selectedDate)?.label}
			{@const otherName = counterpartName(dayState)}

			<h2 id="modal-title">{dayLabel}</h2>
		<p class="modal-subtitle">
			Allocated to <strong>{dayState.allocated_to}</strong>
			{#if dayState.holder}
				· held by <strong>{dayState.holder}</strong>
			{/if}
		</p>

		{#if errorMessage}
			<p class="message error">{errorMessage}</p>
		{/if}

		{#if modalMode === 'claim'}
			<p class="modal-copy">
				{#if dayState.status === 'pool'}
					This day is in the pool. Add yourself if you'd like it — if you're the only one interested
					the day before, you'll get it automatically.
				{:else}
					Confirm you are <strong>{dayState.allocated_to}</strong> to claim this day.
				{/if}
			</p>

			<label class="field">
				<span>Confirm as</span>
				<select
					value={identity}
					onchange={(event) =>
						saveIdentity((event.currentTarget as HTMLSelectElement).value as CohortMember | '')}
				>
					<option value="">Choose your name</option>
					{#each members as member}
						<option value={member}>{member}</option>
					{/each}
				</select>
			</label>

			<div class="modal-actions">
				<button type="button" class="primary" disabled={busy} onclick={handleClaim}>
					{dayState.status === 'pool' ? 'Join pool' : 'Claim day'}
				</button>
			</div>
		{/if}

		{#if modalMode === 'own'}
			<p class="modal-copy">
				{#if dayState.status === 'trade_pending'}
					There's a trade waiting on your day.
				{:else}
					You're holding this day. Release it to the pool if you won't be using it.
				{/if}
			</p>

			<div class="modal-actions">
				{#if dayState.status === 'claimed' && dayState.holder === identity}
					<button type="button" class="secondary" disabled={busy} onclick={handleRelease}>
						Release to pool
					</button>
				{/if}
			</div>
		{/if}

		{#if modalMode === 'other'}
			<p class="modal-copy">
				{#if dayState.status === 'trade_pending'}
					There's already a trade waiting on {otherName}'s day.
				{:else}
					This day belongs to <strong>{otherName}</strong>. You can ask to trade with them.
				{/if}
			</p>

			<div class="modal-actions">
				{#if dayState.status !== 'trade_pending'}
					<button type="button" class="primary" disabled={busy} onclick={startTrade}>
						Trade with {otherName}
					</button>
				{/if}
			</div>
		{/if}

		{#if modalMode === 'trade'}
			<p class="modal-copy">
				Trading with <strong>{otherName}</strong>. Swap your day for theirs, or offer something in real
				life — they'll need to confirm.
			</p>

			<div class="trade-kind-picker" role="radiogroup" aria-label="Trade type">
				<label class="trade-kind-option">
					<input type="radio" bind:group={tradeKind} value="day_swap" />
					<span>Swap days</span>
				</label>
				<label class="trade-kind-option">
					<input type="radio" bind:group={tradeKind} value="irl_offer" />
					<span>Offer something IRL</span>
				</label>
			</div>

			{#if tradeKind === 'day_swap'}
				<label class="field">
					<span>Your day</span>
					<select bind:value={tradeOfferDate}>
						<option value="">Choose your day</option>
						{#each tradeOptions as option}
							<option value={option.date}>{option.label}</option>
						{/each}
					</select>
				</label>
			{/if}

			<label class="field">
				<span>{otherName}'s day</span>
				<input type="text" readonly value={dayLabel} />
			</label>

			<label class="field">
				<span>{tradeKind === 'irl_offer' ? 'What are you offering?' : 'Anything else? (optional)'}</span>
				<textarea
					bind:value={tradeNote}
					rows="3"
					placeholder={tradeKind === 'irl_offer'
						? 'e.g. coffee + cake, cook for ration club'
						: 'e.g. hosting a friend'}
				></textarea>
			</label>

			<div class="modal-actions">
				<button type="button" class="secondary" onclick={() => (modalMode = 'other')}>Back</button>
				<button type="button" class="primary" disabled={busy} onclick={submitTrade}>
					Send trade request
				</button>
			</div>
		{/if}

		{#if modalMode === 'respond' && activeTrade}
			<p class="modal-copy">
				<strong>{activeTrade.initiator}</strong>
				{#if activeTrade.type === 'irl_offer'}
					wants your day and is offering: <em>{activeTrade.irl_note}</em>
				{:else}
					wants to swap days with you.
					{#if activeTrade.irl_note}
						Note: <em>{activeTrade.irl_note}</em>
					{/if}
				{/if}
			</p>
			<p class="modal-copy">
				{#if activeTrade.type === 'day_swap'}
					Their day: {activeTrade.initiator_date} · Your day: {activeTrade.counterpart_date}
				{:else}
					Your day: {activeTrade.counterpart_date}
				{/if}
			</p>

			<div class="modal-actions">
				<button type="button" class="secondary" disabled={busy} onclick={() => respondToTrade(false)}>
					Decline
				</button>
				<button type="button" class="primary" disabled={busy} onclick={() => respondToTrade(true)}>
					Accept trade
				</button>
			</div>
		{/if}
		{/if}
	</div>
{/if}

<style>
	.page {
		min-height: calc(100vh - 100px);
		padding: 2rem 2rem 3rem;
		background:
			radial-gradient(circle at 12% 18%, rgba(214, 40, 40, 0.08), transparent 28%),
			radial-gradient(circle at 88% 12%, rgba(90, 106, 74, 0.12), transparent 24%),
			#d0d0c4;
	}

	.page-header {
		max-width: 1200px;
		margin: 0 auto 1.5rem;
	}

	.hero {
		min-width: 0;
	}

	.info-panel {
		max-width: 1200px;
		margin: 2.5rem auto 0;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(26, 26, 26, 0.15);
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1.25rem 2rem;
		align-items: start;
	}

	.info-dropdown {
		padding-bottom: 0;
	}

	.snapshot-link {
		grid-column: 1 / -1;
		justify-self: end;
		border: none;
		background: transparent;
		padding: 0;
		cursor: pointer;
	}

	.secondary-link {
		margin-left: 1rem;
	}

	.inline-link {
		border: none;
		background: transparent;
		padding: 0;
		font: inherit;
		color: #1a1a1a;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.35);
		cursor: pointer;
	}

	.inline-link:hover {
		color: #d62828;
	}

	.wallet-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.76rem;
		margin-top: 0.55rem;
	}

	.register-link {
		display: inline-block;
		margin-top: 0.75rem;
	}

	.wallet-table th,
	.wallet-table td {
		padding: 0.45rem 0.5rem;
		border-bottom: 1px solid rgba(26, 26, 26, 0.1);
		text-align: left;
		vertical-align: top;
	}

	.wallet-table th {
		color: #666;
		font-weight: 600;
	}

	.wallet-table code {
		word-break: break-all;
		font-size: 0.72rem;
	}

	.info-dropdown summary,
	.snapshot-link {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
		list-style: none;
	}

	.info-dropdown summary::-webkit-details-marker {
		display: none;
	}

	.info-dropdown summary::before {
		content: '▸ ';
		color: #d62828;
	}

	.info-dropdown[open] summary::before {
		content: '▾ ';
	}

	.info-dropdown p,
	.info-dropdown li,
	.info-dropdown ol {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.78rem;
		line-height: 1.6;
		color: #555;
	}

	.info-dropdown p {
		margin: 0.55rem 0 0;
	}

	.info-dropdown ul,
	.info-dropdown ol {
		margin: 0.55rem 0 0;
		padding-left: 1.1rem;
	}

	.info-dropdown a,
	.snapshot-link {
		color: #1a1a1a;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.35);
		text-underline-offset: 0.15em;
	}

	.info-dropdown a:hover,
	.snapshot-link:hover {
		color: #d62828;
	}

	.snapshot-link {
		display: inline-block;
		margin-top: 0.35rem;
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.82rem;
	}

	.trade-kind-picker {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
		margin-bottom: 1rem;
	}

	.trade-kind-option {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.65rem 0.75rem;
		border: 1px solid rgba(26, 26, 26, 0.14);
		background: rgba(255, 255, 255, 0.55);
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.78rem;
		cursor: pointer;
	}

	.trade-kind-option:has(input:checked) {
		border-color: rgba(214, 40, 40, 0.55);
		background: rgba(214, 40, 40, 0.08);
	}

	.eyebrow {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.8rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #666;
		margin: 0 0 0.75rem;
	}

	h1 {
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
		font-size: clamp(2.4rem, 5vw, 4rem);
		line-height: 1;
		margin: 0 0 0.5rem;
		color: #0a0a0a;
	}

	.subtitle,
	.lede {
		font-family: 'IBM Plex Mono', monospace;
		color: #555;
	}

	.subtitle {
		margin: 0 0 0.75rem;
		font-size: 0.9rem;
	}

	.lede {
		max-width: 58ch;
		margin: 0;
		line-height: 1.7;
	}

	.toolbar {
		max-width: 1100px;
		margin: 0 auto 1.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		align-items: center;
		justify-content: space-between;
	}

	.identity-block {
		display: grid;
		gap: 0.25rem;
	}

	.identity-hint {
		margin: 0;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		color: rgba(26, 26, 26, 0.5);
	}

	.identity-picker,
	.field {
		display: grid;
		gap: 0.4rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
	}

	select,
	textarea,
	input[type='text'] {
		font: inherit;
		padding: 0.65rem 0.75rem;
		border: 1px solid rgba(26, 26, 26, 0.18);
		background: rgba(255, 255, 255, 0.75);
		backdrop-filter: blur(8px);
	}

	input[readonly] {
		color: #555;
	}

	textarea {
		resize: vertical;
		min-height: 5rem;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.78rem;
		color: #555;
	}

	.swatch {
		display: inline-block;
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 999px;
		margin-right: 0.35rem;
		vertical-align: -0.1rem;
	}

	.swatch.unconfirmed {
		background: #f4b942;
	}

	.swatch.claimed {
		background: #5a6a4a;
	}

	.swatch.pool {
		background: #d62828;
	}

	.swatch.trade {
		background: transparent;
		border: 2px dashed #f4b942;
	}

	.swatch.past {
		background: #b8b8b0;
	}

	.calendar-wrap {
		max-width: 1200px;
		margin: 0 auto;
	}

	.calendar-grid {
		display: grid;
		grid-template-columns: repeat(6, minmax(0, 1fr));
		gap: 0.9rem;
		min-height: 58vh;
	}

	.day-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border: 1px solid rgba(26, 26, 26, 0.12);
		background: rgba(255, 255, 255, 0.55);
		backdrop-filter: blur(10px);
		text-align: left;
		cursor: pointer;
		transition:
			transform 0.18s ease,
			box-shadow 0.18s ease,
			border-color 0.18s ease;
		min-height: 9.5rem;
	}

	.day-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 10px 24px rgba(26, 26, 26, 0.08);
		border-color: rgba(214, 40, 40, 0.35);
	}

	.day-card.is-past {
		cursor: default;
		opacity: 0.72;
		background: rgba(255, 255, 255, 0.35);
	}

	.day-card.is-past .event-bar {
		background: #9a9a92 !important;
		color: #f5f5f0;
	}

	.day-card.is-past .day-number,
	.day-card.is-past .weekday,
	.day-card.is-past .month {
		color: #888;
	}

	.day-card.is-past:hover {
		transform: none;
		box-shadow: none;
		border-color: rgba(26, 26, 26, 0.12);
	}

	.day-meta {
		display: grid;
		gap: 0.1rem;
	}

	.weekday,
	.month {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #666;
	}

	.day-number {
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
		font-size: 2rem;
		line-height: 1;
		color: #0a0a0a;
	}

	.event-bar {
		margin-top: auto;
		padding: 0.7rem 0.75rem;
		border-radius: 0.55rem;
		display: grid;
		gap: 0.2rem;
	}

	.event-name {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.82rem;
		font-weight: 600;
		line-height: 1.3;
	}

	.event-status {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.68rem;
		opacity: 0.85;
	}

	.trade-hint {
		margin: 0;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.68rem;
		color: #666;
		line-height: 1.4;
	}

	.status-unconfirmed .event-bar {
		background: rgba(244, 185, 66, 0.88);
		color: #3a2d00;
	}

	.status-claimed .event-bar {
		background: rgba(90, 106, 74, 0.92);
		color: #f4f6ef;
	}

	.status-pool .event-bar {
		background: rgba(214, 40, 40, 0.12);
		border: 2px dashed rgba(214, 40, 40, 0.65);
		color: #7d1515;
	}

	.status-trade_pending .event-bar {
		background: rgba(244, 185, 66, 0.2);
		border: 2px dashed rgba(244, 185, 66, 0.95);
		color: #5a4300;
	}

	.primary,
	.secondary,
	.close {
		font-family: 'IBM Plex Mono', monospace;
		cursor: pointer;
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(20, 20, 20, 0.45);
		backdrop-filter: blur(3px);
		z-index: 200;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: min(92vw, 32rem);
		background: rgba(248, 248, 240, 0.98);
		border: 1px solid rgba(26, 26, 26, 0.12);
		box-shadow: 0 18px 50px rgba(0, 0, 0, 0.18);
		padding: 1.5rem;
		z-index: 210;
	}

	.close {
		position: absolute;
		top: 0.8rem;
		right: 0.8rem;
		border: none;
		background: transparent;
		font-size: 1rem;
	}

	.modal h2 {
		margin: 0 0 0.35rem;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
		font-size: 2rem;
	}

	.modal-subtitle,
	.modal-copy {
		font-family: 'IBM Plex Mono', monospace;
		color: #555;
		line-height: 1.6;
	}

	.modal-subtitle {
		margin: 0 0 1rem;
		font-size: 0.82rem;
	}

	.modal-copy {
		margin: 0 0 1rem;
	}

	.modal-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
	}

	.primary,
	.secondary {
		border: 1px solid rgba(26, 26, 26, 0.18);
		padding: 0.7rem 1rem;
	}

	.primary {
		background: #1a1a1a;
		color: #f8f8f0;
	}

	.secondary {
		background: rgba(255, 255, 255, 0.7);
		color: #1a1a1a;
	}

	.primary:disabled,
	.secondary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.message {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.82rem;
		padding: 0.65rem 0.75rem;
		margin: 0 0 1rem;
	}

	.message.error {
		background: rgba(214, 40, 40, 0.1);
		color: #7d1515;
	}

	.message.success {
		background: rgba(90, 106, 74, 0.12);
		color: #3f4d34;
	}

	@media (max-width: 1100px) {
		.info-panel {
			grid-template-columns: 1fr;
		}

		.calendar-grid {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (max-width: 768px) {
		.page {
			padding: 1.25rem 1rem 2rem;
		}

		.calendar-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			min-height: auto;
		}

		.toolbar {
			align-items: stretch;
		}
	}
</style>
