import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key || key === "PASTE_RESEND_API_KEY_HERE") {
    console.warn("[email] RESEND_API_KEY not set — email skipped.");
    return null;
  }
  return new Resend(key);
}

export async function sendReportEmail(opts: {
  toEmail: string;
  toName: string;
  reportUrl: string;
  degree: string;
}) {
  const resend = getResend();
  if (!resend) return; // Silently skip during testing

  const { toEmail, toName, reportUrl, degree } = opts;

  try {
    await resend.emails.send({
      from: "NEET by Unipathschool <onboarding@resend.dev>", // Use this until domain is verified
      to: toEmail,
      subject: `Your NEET 2026 Action Plan is ready, ${toName}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; background: #FAFAFA;">
          <div style="background: #0C1120; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
            <div style="color: #C2410C; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 12px;">NEET by UNIPATHSCHOOL</div>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.2;">Your ${degree} Action Plan is ready, ${toName}</h1>
            <p style="color: #94A3B8; font-size: 14px; font-weight: 300; margin: 0;">We know you're in a stressful place right now. This plan was built specifically for you.</p>
          </div>
          <div style="background: #ffffff; border: 1px solid #E2E8F0; border-radius: 16px; padding: 28px; margin-bottom: 20px;">
            <p style="color: #334155; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">Your personalised NEET 2026 Crisis Action Plan includes:</p>
            <ul style="color: #64748B; font-size: 13px; padding-left: 20px; line-height: 2; margin: 0 0 24px 0;">
              <li>Your situation summary — honest, specific to your score</li>
              <li>College list for your current score + re-exam scenarios</li>
              <li>Drop vs repeat recommendation based on your data</li>
              <li>30-day re-exam prep plan, week by week</li>
              <li>Alternative paths if needed</li>
            </ul>
            <a href="${reportUrl}" style="display: inline-block; background: #C2410C; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 50px; letter-spacing: 0.15em; text-transform: uppercase;">
              Download Your PDF →
            </a>
          </div>
          <p style="color: #94A3B8; font-size: 12px; text-align: center; margin: 0;">
            Questions? Reply to this email.<br/>
            <a href="https://unipathschool.com" style="color: #C2410C;">unipathschool.com</a>
          </p>
        </div>
      `,
    });
    console.log(`[email] ✅ Report email sent to ${toEmail}`);
  } catch (err) {
    // Log but don't throw — student gets report via page even if email fails
    console.error("[email] ❌ Failed to send report email:", err);
  }
}

export async function sendAdminAlert(opts: { subject: string; message: string }) {
  const resend = getResend();
  if (!resend) return;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@unipathschool.com";
  try {
    await resend.emails.send({
      from: "NEET Alert <onboarding@resend.dev>",
      to: adminEmail,
      subject: `[NEET Platform Alert] ${opts.subject}`,
      html: `<pre style="font-family: monospace; font-size: 13px; white-space: pre-wrap;">${opts.message}</pre>`,
    });
  } catch (err) {
    console.error("[email] ❌ Failed to send admin alert:", err);
  }
}
