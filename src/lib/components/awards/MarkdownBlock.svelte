<script lang="ts">
	import { marked } from 'marked';
	import sanitizeHtml from 'sanitize-html';

	interface Props {
		content: string;
	}

	let { content }: Props = $props();

	/** No jsdom — Netlify SSR crashes on isomorphic-dompurify (ERR_REQUIRE_ESM in html-encoding-sniffer). */
	const sanitizeOpts: sanitizeHtml.IOptions = {
		allowedTags: [
			'p',
			'br',
			'strong',
			'em',
			'b',
			'i',
			'a',
			'ul',
			'ol',
			'li',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'blockquote',
			'code',
			'pre',
			'hr',
			'table',
			'thead',
			'tbody',
			'tr',
			'th',
			'td'
		],
		allowedAttributes: {
			a: ['href', 'name', 'target', 'rel'],
			th: ['colspan', 'rowspan', 'align'],
			td: ['colspan', 'rowspan', 'align']
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		transformTags: {
			a: (tagName, attribs) => {
				if (attribs.target === '_blank' && !attribs.rel) {
					attribs.rel = 'noopener noreferrer';
				}
				return { tagName, attribs };
			}
		}
	};

	const html = $derived(
		content ? sanitizeHtml(marked.parse(content) as string, sanitizeOpts) : ''
	);
</script>

{#if html}
	<div class="markdown-prose" data-markdown-block>
		{@html html}
	</div>
{/if}

<style>
	.markdown-prose {
		font-size: 0.9rem;
		line-height: 1.6;
	}

	.markdown-prose :global(h2),
	.markdown-prose :global(h3),
	.markdown-prose :global(h4) {
		font-family: 'IBM Plex Mono', monospace;
		font-weight: 700;
		margin: 1.25rem 0 0.5rem 0;
		color: #1a1a1a;
	}
	.markdown-prose :global(h2) { font-size: 1.1rem; }
	.markdown-prose :global(h3) { font-size: 1rem; }
	.markdown-prose :global(h4) { font-size: 0.9rem; }
	.markdown-prose :global(h2:first-child),
	.markdown-prose :global(h3:first-child),
	.markdown-prose :global(h4:first-child) {
		margin-top: 0;
	}

	.markdown-prose :global(p) {
		margin: 0 0 0.75rem 0;
		color: rgba(26, 26, 26, 0.9);
	}
	.markdown-prose :global(p:last-child) {
		margin-bottom: 0;
	}

	.markdown-prose :global(ul),
	.markdown-prose :global(ol) {
		margin: 0 0 0.75rem 0;
		padding-left: 1.25rem;
	}
	.markdown-prose :global(li) {
		margin-bottom: 0.35rem;
		line-height: 1.55;
	}

	.markdown-prose :global(strong) {
		font-weight: 700;
		color: #0a0a0a;
	}

	.markdown-prose :global(a) {
		color: #d62828;
		text-decoration: underline;
		text-decoration-color: rgba(214, 40, 40, 0.4);
		text-underline-offset: 2px;
	}
	.markdown-prose :global(a:hover) {
		text-decoration-color: #d62828;
	}

	.markdown-prose :global(code) {
		font-family: 'IBM Plex Mono', monospace;
		background: rgba(26, 26, 26, 0.05);
		padding: 0.2em 0.4em;
		font-size: 0.88em;
	}

	.markdown-prose :global(blockquote) {
		border-left: 3px solid #d62828;
		padding-left: 1rem;
		margin: 0.75rem 0;
		font-style: italic;
		color: rgba(26, 26, 26, 0.75);
	}

	/* Markdown tables: bordered */
	.markdown-prose :global(table) {
		width: 100%;
		border-collapse: collapse;
		margin: 0.75rem 0;
		font-size: 0.88rem;
	}
	.markdown-prose :global(th),
	.markdown-prose :global(td) {
		border: 1px solid rgba(26, 26, 26, 0.2);
		padding: 0.4rem 0.6rem;
		text-align: left;
		vertical-align: top;
	}
	.markdown-prose :global(th) {
		background: rgba(26, 26, 26, 0.06);
		font-weight: 600;
		color: #1a1a1a;
	}
	.markdown-prose :global(tr:hover td) {
		background: rgba(26, 26, 26, 0.02);
	}
</style>
