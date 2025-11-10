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
		padding: 16px;
	}
</style>
