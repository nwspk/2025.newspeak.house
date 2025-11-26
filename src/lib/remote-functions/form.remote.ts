import { form } from '$app/server';
import * as z from 'zod';
import { countries, reasonOptions } from './contact-options';
import { MATRIX_ACCESS_TOKEN, MATRIX_HOMESERVER, MATRIX_ROOM } from '$env/static/private';

const ContactFormSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.email('Invalid email address'),
	whatsApp: z.string().optional(),
	subject: z.string().min(1, 'Subject is required'),
	message: z.string().min(1, 'Message is required'),
	reason: z.enum(reasonOptions),
	country: z.enum(countries)
});

interface MatrixMessage {
	msgtype: 'm.text';
	body: string;
	format: 'org.matrix.custom.html';
	formatted_body: string;
}

export const contactForm = form(
	ContactFormSchema,
	async ({ name, email, whatsApp, subject, message, reason, country }) => {
		// Log form submission start
		console.log('[Contact Form] Submission started:', {
			timestamp: new Date().toISOString(),
			email: email,
			hasName: !!name,
			hasSubject: !!subject,
			hasMessage: !!message
		});

		// Check environment variables (without exposing values)
		const envCheck = {
			hasMatrixToken: !!MATRIX_ACCESS_TOKEN,
			hasMatrixHomeserver: !!MATRIX_HOMESERVER,
			hasMatrixRoom: !!MATRIX_ROOM,
			homeserverUrl: MATRIX_HOMESERVER ? new URL(MATRIX_HOMESERVER).origin : 'NOT SET',
			roomValue: MATRIX_ROOM ? (MATRIX_ROOM.startsWith('#') ? 'ALIAS' : 'ROOM_ID') : 'NOT SET'
		};
		console.log('[Contact Form] Environment check:', envCheck);

		if (!MATRIX_ACCESS_TOKEN || !MATRIX_HOMESERVER || !MATRIX_ROOM) {
			const error = 'Missing required environment variables';
			console.error('[Contact Form] Configuration error:', envCheck);
			throw new Error(error);
		}

		function escapeHtml(str: string): string {
			return str
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&apos;');
		}

		async function resolveRoomIdIfAlias(room: string) {
			try {
				if (!room.startsWith('#')) {
					console.log('[Contact Form] Room is already an ID, skipping resolution');
					return room; // already an ID
				}

				console.log('[Contact Form] Resolving room alias:', room);
				const url = `${
					MATRIX_HOMESERVER
				}/_matrix/client/v3/directory/room/${encodeURIComponent(room)}`;
				
				const res = await fetch(url, {
					headers: { Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}` }
				});

				console.log('[Contact Form] Room resolution response:', {
					status: res.status,
					statusText: res.statusText,
					ok: res.ok
				});

				if (!res.ok) {
					const errorText = await res.text();
					console.error('[Contact Form] Room resolution failed:', {
						status: res.status,
						statusText: res.statusText,
						error: errorText
					});
					throw new Error(`Failed to resolve room alias (${res.status}): ${errorText}`);
				}

				const data = await res.json();
				console.log('[Contact Form] Room resolved successfully:', {
					alias: room,
					roomId: data.room_id
				});
				return data.room_id;
			} catch (error) {
				console.error('[Contact Form] Error in resolveRoomIdIfAlias:', error);
				if (error instanceof Error) {
					throw error;
				}
				throw new Error(`Room resolution error: ${String(error)}`);
			}
		}

		async function sendMatrixMessage(roomId: string, content: MatrixMessage) {
			try {
				const txnId = Date.now() + '-' + Math.random().toString(36).slice(2, 10);
				const url = `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(
					roomId
				)}/send/m.room.message/${txnId}`;
				
				console.log('[Contact Form] Sending message to Matrix:', {
					roomId: roomId,
					txnId: txnId,
					url: url.replace(MATRIX_ACCESS_TOKEN, 'REDACTED')
				});

				const res = await fetch(url, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}`
					},
					body: JSON.stringify(content)
				});

				console.log('[Contact Form] Matrix send response:', {
					status: res.status,
					statusText: res.statusText,
					ok: res.ok
				});

				if (!res.ok) {
					const text = await res.text();
					console.error('[Contact Form] Matrix send failed:', {
						status: res.status,
						statusText: res.statusText,
						error: text,
						roomId: roomId
					});
					throw new Error(`Matrix send failed (${res.status}): ${text}`);
				}

				const result = await res.json();
				console.log('[Contact Form] Message sent successfully:', {
					eventId: result.event_id,
					roomId: roomId
				});
				return result;
			} catch (error) {
				console.error('[Contact Form] Error in sendMatrixMessage:', {
					error: error instanceof Error ? error.message : String(error),
					stack: error instanceof Error ? error.stack : undefined,
					roomId: roomId
				});
				if (error instanceof Error) {
					throw error;
				}
				throw new Error(`Matrix send error: ${String(error)}`);
			}
		}

		try {
			const lines = [
				'Contact Form Submission',
				'=======================',
				`Name: ${name || ''}`,
				`Email: ${email || ''}`,
				`WhatsApp: ${whatsApp || ''}`,
				`Subject: ${subject || ''}`,
				`Reason: ${reason || ''}`,
				`Country: ${country || ''}`,
				'',
				'Message:',
				message || ''
			];
			const textBody = lines.join('\n');

			const htmlBody =
				`<strong>Contact Form Submission</strong><br/>` +
				`<b>Name:</b> ${escapeHtml(name || '')}<br/>` +
				`<b>Email:</b> ${escapeHtml(email || '')}<br/>` +
				`<b>WhatsApp:</b> ${escapeHtml(whatsApp || '')}<br/>` +
				`<b>Subject:</b> ${escapeHtml(subject || '')}<br/>` +
				`<b>Reason:</b> ${escapeHtml(reason || '')}<br/>` +
				`<b>Country:</b> ${escapeHtml(country || '')}<br/><br/>` +
				`<b>Message:</b><br/>${escapeHtml(message || '').replace(/\n/g, '<br/>')}`;

			console.log('[Contact Form] Resolving room ID...');
			const roomId = await resolveRoomIdIfAlias(MATRIX_ROOM);
			
			console.log('[Contact Form] Sending message to Matrix...');
			await sendMatrixMessage(roomId, {
				msgtype: 'm.text',
				body: textBody,
				format: 'org.matrix.custom.html',
				formatted_body: htmlBody
			});

			console.log('[Contact Form] Submission successful:', {
				timestamp: new Date().toISOString(),
				email: email,
				roomId: roomId
			});
		} catch (error) {
			console.error('[Contact Form] Submission failed:', {
				timestamp: new Date().toISOString(),
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
				email: email
			});
			// Re-throw to let SvelteKit form handler catch it
			throw error;
		}
	}
);
