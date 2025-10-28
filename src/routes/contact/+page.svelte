<script lang="ts">
	import { countries, reasonOptions } from '$lib/contact-form-options';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<div class="container">
	<h1>Contact us</h1>

	<p>
		We'd love to hear from you! Whether you have questions, feedback, or just want to say hello,
		please fill out the form below and we'll get back to you as soon as possible.
	</p>

	<form method="POST">
		<label>
			Name
			<input name="name" type="text" />
		</label>
		<label>
			Email
			<input name="email" type="email" />
		</label>
		<label>
			WhatsApp
			<input name="whatsApp" type="text" />
		</label>
		<label>
			Subject
			<input name="subject" type="text" />
		</label>
		<label>
			Reason for getting in touch
			<select name="reason">
				<option value="" disabled selected>Select a reason</option>
				{#each reasonOptions as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>
		<label>
			Message
			<textarea name="message" required></textarea>
		</label>
		<label>
			Country
			<select name="country">
				<option value="" disabled selected>Select a country</option>
				{#each countries as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		</label>
		<button>Submit</button>
	</form>
	{#if form?.success}
		<p>Form successfully submitted! We'll be in touch.</p>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 16px;
	}
	:root {
		--max-width: 720px;
		--accent: #0b72b9;
	}
	form {
		display: grid;
		gap: 12px;
		margin-bottom: 24px;
	}
	label {
		display: block;
		font-weight: 600;
		margin-bottom: 6px;
	}
	input[type='text'],
	input[type='email'],
	textarea,
	select {
		width: 100%;
		padding: 10px;
		border: 1px solid #d7dbe0;
		border-radius: 6px;
		font-size: 14px;
	}
	textarea {
		min-height: 140px;
		resize: vertical;
	}
	.row {
		display: flex;
		gap: 12px;
	}
	.row > * {
		flex: 1;
	}
	.checkboxes {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}
	.hint {
		font-size: 13px;
		color: #556;
	}
	.actions {
		display: flex;
		gap: 8px;
		align-items: center;
	}
	button {
		background: var(--accent);
		color: #fff;
		padding: 10px 16px;
		border-radius: 8px;
		border: 0;
		cursor: pointer;
	}
	button[disabled] {
		opacity: 0.6;
		cursor: not-allowed;
	}
	.secondary {
		background: #eef3f8;
		color: var(--accent);
		border: 1px solid #d8e8fb;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
