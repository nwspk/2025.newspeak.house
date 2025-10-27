<script lang="ts">
	import { countries, reasonOptions } from '$lib/remote-functions/contact-options';
	import { contactForm } from '$lib/remote-functions/form.remote';

	const {name, email, whatsApp, subject, message, reason, country} = contactForm.fields;
</script>

<form {...contactForm}>
	<label>
		Name
		<input {...name.as('text')} type="text" />
	</label>
	<label>
		Email
		<input {...email.as('email')} type="email" />
	</label>
	<label>
		WhatsApp
		<input {...whatsApp.as('text')} type="text" placeholder="+44 000 000 000" />
	</label>
	<label>
		Subject
		<input {...subject.as('text')} type="text" />
	</label>
	<label>
		Reason for getting in touch
		<select {...reason.as('select')}>
			<option value="" disabled selected>Select a reason</option>
			{#each reasonOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</label>
	<label>
		Message
		<textarea {...message.as('text')} required></textarea>
	</label>
	<label>
		Country
		<select {...country.as('select')}>
			<option value="" disabled selected>Select a country</option>
			{#each countries as option}
				<option value={option}>{option}</option>
			{/each}
		</select>
	</label>
	<button type="submit">Submit</button>
</form>

<style>
	:root {
		--max-width: 720px;
		--accent: #0b72b9;
	}

	form {
		display: grid;
		gap: 12px;
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
