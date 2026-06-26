"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = "noreply@taksha.education"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://taksha.education"

export async function sendVerificationEmail(email: string, otp: string) {
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: email,
      subject: `${otp} — Aapka Taksha verification code`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;">
          <div style="text-align:center;margin-bottom:28px;">
            <h1 style="margin:0;font-size:26px;color:#1e293b;letter-spacing:-0.5px;">Taksha</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Exam Preparation Platform</p>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:32px;text-align:center;">
            <p style="margin:0 0 8px;font-size:15px;color:#475569;">Aapka verification code hai</p>
            <div style="background:#fff;border:2px dashed #3b82f6;border-radius:8px;padding:16px 24px;display:inline-block;margin:12px 0;">
              <span style="font-size:40px;font-weight:700;letter-spacing:10px;color:#1e293b;font-family:'Courier New',monospace;">${otp}</span>
            </div>
            <p style="margin:12px 0 0;font-size:13px;color:#94a3b8;">Yeh code <strong>10 minutes</strong> mein expire ho jaayega.</p>
          </div>

          <p style="margin:20px 0 0;font-size:13px;color:#94a3b8;text-align:center;">
            Agar aapne yeh request nahi ki, toh is email ko ignore kar dijiye.<br/>
            &copy; 2025 Taksha &mdash; <a href="${APP_URL}" style="color:#3b82f6;text-decoration:none;">taksha.education</a>
          </p>
        </div>
      `,
    })

    if (result.error) {
      console.error("[auth] Resend error:", result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error: any) {
    console.error("[auth] sendVerificationEmail failed:", error?.message ?? error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendConfirmationEmail(email: string, userName: string) {
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Taksha mein aapka swagat hai!",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fff;">
          <div style="text-align:center;margin-bottom:28px;">
            <h1 style="margin:0;font-size:26px;color:#1e293b;">Taksha</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Exam Preparation Platform</p>
          </div>

          <h2 style="color:#1e293b;margin:0 0 12px;">Swagat hai, ${userName}!</h2>
          <p style="color:#475569;line-height:1.7;margin:0 0 20px;">
            Aapka account successfully ban gaya hai. Ab aap apni exam preparation suru kar sakte hain.
          </p>

          <div style="background:#f0f9ff;border-left:4px solid #3b82f6;border-radius:4px;padding:16px 20px;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-weight:600;color:#1e293b;">Agle steps:</p>
            <ul style="margin:0;padding-left:20px;color:#475569;line-height:1.9;">
              <li>Profile complete karein aur exam goal chunein</li>
              <li>Subject strengths map karein</li>
              <li>AI-generated personalized tests practice karein</li>
              <li>Daily quiz se streak banayein</li>
            </ul>
          </div>

          <div style="text-align:center;margin:0 0 24px;">
            <a href="${APP_URL}/profile"
               style="background:#3b82f6;color:#fff;padding:12px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
              Profile Complete Karein
            </a>
          </div>

          <p style="font-size:13px;color:#94a3b8;text-align:center;margin:0;">
            Koi sawaal ho toh email karein:
            <a href="mailto:support@taksha.education" style="color:#3b82f6;text-decoration:none;">support@taksha.education</a><br/>
            &copy; 2025 Taksha &mdash; <a href="${APP_URL}" style="color:#3b82f6;text-decoration:none;">taksha.education</a>
          </p>
        </div>
      `,
    })

    if (result.error) {
      console.error("[auth] Resend error:", result.error)
      return { success: false, error: result.error.message }
    }

    return { success: true, messageId: result.data?.id }
  } catch (error: any) {
    console.error("[auth] sendConfirmationEmail failed:", error?.message ?? error)
    return { success: false, error: "Failed to send confirmation email" }
  }
}
