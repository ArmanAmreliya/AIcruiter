import { prisma } from '@aicruiter/db';

export async function sendEmail({ to, subject, htmlContent }: { to: string; subject: string; htmlContent: string }) {
  const apiKey = process.env.BREVO_API_KEY || process.env.NEXT_BREVO_API_KEY || process.env.SENDINBLUE_API_KEY;
  if (!apiKey) {
    console.warn("[Mail] BREVO_API_KEY is not configured in the environment. Email was NOT sent.");
    return false;
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: "AIcruiter Notifications",
          email: "notifications@aicruiter.com"
        },
        to: [
          {
            email: to
          }
        ],
        subject: subject,
        htmlContent: htmlContent
      })
    });

    if (response.ok) {
      console.log(`[Mail] Email successfully sent to ${to}: ${subject}`);
      return true;
    } else {
      const errText = await response.text();
      console.error(`[Mail] Brevo API returned error status ${response.status}: ${errText}`);
      return false;
    }
  } catch (error) {
    console.error("[Mail] Failed to send email via Brevo:", error);
    return false;
  }
}
