<script lang="ts">
	import { countries, reasonOptions } from '$lib/remote-functions/contact-options';
	import { contactForm } from '$lib/remote-functions/form.remote';

	const { name, email, whatsApp, subject, message, reason, country } = contactForm.fields;
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
	form {
		display: grid;
		gap: 1.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.85rem;
		color: #1a1a1a;
		letter-spacing: 0.02em;
	}

	input[type='text'],
	input[type='email'],
	textarea,
	select {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid rgba(26, 26, 26, 0.15);
		background: rgba(255, 255, 255, 0.6);
		font-size: 0.95rem;
		font-family: 'IBM Plex Mono', monospace;
		transition: all 0.2s ease;
		color: #1a1a1a;
	}

	input[type='text']:focus,
	input[type='email']:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: #d62828;
		background: rgba(255, 255, 255, 0.9);
	}

	input[type='text']::placeholder,
	input[type='email']::placeholder,
	textarea::placeholder {
		color: rgba(26, 26, 26, 0.4);
	}

	textarea {
		min-height: 140px;
		resize: vertical;
		font-family: 'IBM Plex Mono', monospace;
	}

	select {
		cursor: pointer;
	}

	button {
		background: #1a1a1a;
		color: #fff;
		padding: 0.75rem 2rem;
		border: 2px solid #1a1a1a;
		cursor: pointer;
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 600;
		font-size: 0.9rem;
		letter-spacing: 0.05em;
		transition: all 0.2s ease;
		width: fit-content;
	}

	button:hover {
		background: #d62828;
		border-color: #d62828;
	}

	button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button[disabled]:hover {
		background: #1a1a1a;
		border-color: #1a1a1a;
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
