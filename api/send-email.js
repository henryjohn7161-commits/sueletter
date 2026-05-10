// api/send-email.js
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, from, subject, letterText, senderName, recipientName } = req.body;

    if (!to || !subject || !letterText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await resend.emails.send({
      from: from || 'SueLetter <noreply@sueletter.com>', // Change later to your verified domain
      to: to,
      subject: subject,
      html: `
        <div style="font-family: 'Times New Roman', serif; font-size: 13.5pt; line-height: 1.85; color: #111827;">
          ${letterText.replace(/\n/g, '<br><br>')}
        </div>
      `,
      text: letterText, // Plain text fallback
    });

    if (error) {
      console.error('Resend Error:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      data 
    });

  } catch (error) {
    console.error('Send email error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}