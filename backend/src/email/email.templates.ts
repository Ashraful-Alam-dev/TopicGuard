/**
 * Minimal, dependency-free HTML templates for transactional emails.
 * Kept intentionally simple (no external templating engine) since
 * the project has no such dependency today.
 */

function layout(title: string, bodyHtml: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
      <h2 style="color: #111827;">${title}</h2>
      ${bodyHtml}
      <p style="color: #6b7280; font-size: 12px; margin-top: 32px;">
        TopicGuard &mdash; if you did not request this, you can safely ignore this email.
      </p>
    </div>
  `.trim();
}

function otpBlock(otp: string): string {
  return `
    <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px; background: #f3f4f6; padding: 12px 16px; text-align: center; border-radius: 8px;">
      ${otp}
    </p>
  `;
}

export function registrationOtpTemplate(name: string, otp: string, expiresInMinutes: number): string {
  return layout(
    'Verify your email',
    `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Use the code below to finish creating your TopicGuard account. This code expires in ${expiresInMinutes} minutes.</p>
      ${otpBlock(otp)}
    `,
  );
}

export function passwordResetOtpTemplate(name: string, otp: string, expiresInMinutes: number): string {
  return layout(
    'Reset your password',
    `
      <p>Hi ${escapeHtml(name)},</p>
      <p>Use the code below to reset your TopicGuard password. This code expires in ${expiresInMinutes} minutes.</p>
      ${otpBlock(otp)}
    `,
  );
}

export function submissionOpenTemplate(classroomName: string, submissionTitle: string): string {
  return layout(
    'New submission open',
    `
      <p>A new submission is now open in <strong>${escapeHtml(classroomName)}</strong>:</p>
      <p style="font-size: 18px; font-weight: 600;">${escapeHtml(submissionTitle)}</p>
      <p>Log in to TopicGuard to view the details and submit your topic.</p>
    `,
  );
}

export function announcementTemplate(classroomName: string, messageTitle: string): string {
  return layout(
    'New announcement',
    `
      <p>A new announcement was posted in <strong>${escapeHtml(classroomName)}</strong>:</p>
      <p style="font-size: 18px; font-weight: 600;">${escapeHtml(messageTitle)}</p>
      <p>Log in to TopicGuard to read the full announcement.</p>
    `,
  );
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
