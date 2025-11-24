<script>
	import ContactForm from '$lib/components/ContactForm.svelte';
</script>

<div class="container">
	<h1>Contact us</h1>

	<p>
		We'd love to hear from you! Whether you have questions, feedback, or just want to say hello,
		please fill out the form below and we'll get back to you as soon as possible.
	</p>
	<ContactForm />
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 3rem 2.5rem;
	}

	.container h1 {
		font-size: clamp(2rem, 5vw, 3rem);
		font-weight: 600;
		margin: 0 0 1.5rem 0;
		color: #0a0a0a;
		letter-spacing: -0.01em;
		line-height: 1.1;
		font-family: 'Stack Sans Notch', 'Crimson Pro', serif;
	}

	.container p {
		font-size: 1rem;
		line-height: 1.7;
		color: #1a1a1a;
		margin-bottom: 2.5rem;
		font-weight: 400;
	}

	@media (max-width: 768px) {
		.container {
			padding: 2rem 1.5rem;
		}
	}
</style>
