import { form } from '$app/server';
import * as z from 'zod';
import { countries, reasonOptions } from './contact-options';
import { env } from '$env/dynamic/private';

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
		try {
			// Validate environment variables
			const MATRIX_ACCESS_TOKEN = env.MATRIX_ACCESS_TOKEN;
			const MATRIX_HOMESERVER = env.MATRIX_HOMESERVER;
			const MATRIX_ROOM = env.MATRIX_ROOM;

			if (!MATRIX_ACCESS_TOKEN || !MATRIX_HOMESERVER || !MATRIX_ROOM) {
				console.error('Missing Matrix environment variables:', {
					hasToken: !!MATRIX_ACCESS_TOKEN,
					hasServer: !!MATRIX_HOMESERVER,
					hasRoom: !!MATRIX_ROOM
				});
				return {
					success: false,
					error: 'Server configuration error. Please contact support directly.'
				};
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
				if (!room.startsWith('#')) return room; // already an ID
				const url = `${
					MATRIX_HOMESERVER
				}/_matrix/client/v3/directory/room/${encodeURIComponent(room)}`;
				const res = await fetch(url, {
					headers: { Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}` }
				});
				if (!res.ok) {
					const errorText = await res.text().catch(() => 'Unknown error');
					throw new Error(`Failed to resolve room alias (${res.status}): ${errorText}`);
				}
				const data = await res.json();
				return data.room_id;
			}

			async function sendMatrixMessage(roomId: string, content: MatrixMessage) {
				const txnId = Date.now() + '-' + Math.random().toString(36).slice(2, 10);
				const url = `${MATRIX_HOMESERVER}/_matrix/client/v3/rooms/${encodeURIComponent(
					roomId
				)}/send/m.room.message/${txnId}`;
				const res = await fetch(url, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${MATRIX_ACCESS_TOKEN}`
					},
					body: JSON.stringify(content)
				});
				if (!res.ok) {
					const text = await res.text().catch(() => 'Unknown error');
					throw new Error(`Matrix send failed (${res.status}): ${text}`);
				}
				return res.json();
			}

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

			const roomId = await resolveRoomIdIfAlias(MATRIX_ROOM);
			await sendMatrixMessage(roomId, {
				msgtype: 'm.text',
				body: textBody,
				format: 'org.matrix.custom.html',
				formatted_body: htmlBody
			});
			
			console.log('Contact form submitted successfully:', {
				name,
				email,
				whatsApp,
				subject,
				message,
				reason,
				country
			});

			return {
				success: true
			};
		} catch (error) {
			console.error('Contact form submission error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again or contact support directly.'
			};
		}
	}
);
