import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BREVO_API_URL,
  BREVO_REQUEST_TIMEOUT_MS,
  DEFAULT_SENDER_NAME,
} from './email.constants';
import {
  announcementTemplate,
  passwordResetOtpTemplate,
  registrationOtpTemplate,
  submissionOpenTemplate,
} from './email.templates';

export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Thin wrapper around Brevo's transactional email API. Nothing in the
 * rest of the app talks to Brevo directly - callers only see
 * intention-revealing methods (sendRegistrationOtp, sendPasswordResetOtp,
 * sendSubmissionOpenNotification, sendAnnouncementNotification).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly apiKey?: string;
  private readonly senderEmail?: string;
  private readonly senderName: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('brevo.apiKey');
    this.senderEmail = this.configService.get<string>('brevo.senderEmail');
    this.senderName =
      this.configService.get<string>('brevo.senderName') ?? DEFAULT_SENDER_NAME;

    this.senderName =
      this.configService.get<string>('brevo.senderName') ?? DEFAULT_SENDER_NAME;

    this.logger.log(`Brevo sender loaded: ${this.senderEmail}`);
    if (!this.apiKey || !this.senderEmail) {
      this.logger.warn(
        'Brevo is not fully configured (BREVO_API_KEY / BREVO_SENDER_EMAIL missing); emails will not be sent',
      );
    }
  }

  async sendRegistrationOtp(
    to: string,
    name: string,
    otp: string,
    expiresInMinutes: number,
  ): Promise<void> {
    await this.sendCritical(
      { email: to, name },
      'TopicGuard Registration Verification',
      registrationOtpTemplate(name, otp, expiresInMinutes),
    );
  }

  async sendPasswordResetOtp(
    to: string,
    name: string,
    otp: string,
    expiresInMinutes: number,
  ): Promise<void> {
    await this.sendCritical(
      { email: to, name },
      'TopicGuard Password Reset',
      passwordResetOtpTemplate(name, otp, expiresInMinutes),
    );
  }

  /**
   * Best-effort classroom-wide notifications. A delivery failure for one
   * (or all) recipients must never fail the submission/announcement
   * action that triggered it, so failures are logged, not thrown.
   */
  async sendSubmissionOpenNotification(
    recipients: EmailRecipient[],
    classroomName: string,
    submissionTitle: string,
  ): Promise<void> {
    await this.sendBestEffort(
      recipients,
      `TopicGuard: New Submission Open in ${classroomName}`,
      submissionOpenTemplate(classroomName, submissionTitle),
    );
  }

  async sendAnnouncementNotification(
    recipients: EmailRecipient[],
    classroomName: string,
    messageTitle: string,
  ): Promise<void> {
    await this.sendBestEffort(
      recipients,
      `TopicGuard: New Announcement in ${classroomName}`,
      announcementTemplate(classroomName, messageTitle),
    );
  }

  /** Used by OTP flows, where a failed send must surface to the caller. */
  private async sendCritical(
    to: EmailRecipient,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    try {
      await this.dispatch([to], subject, htmlContent);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${to.email}: ${(error as Error).message}`,
      );
      throw new ServiceUnavailableException(
        'Failed to send the verification email. Please try again shortly.',
      );
    }
  }

  /** Used by classroom notifications, sent individually so recipients' addresses are never shared with each other. */
  private async sendBestEffort(
    recipients: EmailRecipient[],
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    await Promise.all(
      recipients.map(async (recipient) => {
        try {
          await this.dispatch([recipient], subject, htmlContent);
        } catch (error) {
          this.logger.warn(
            `Failed to send notification email to ${recipient.email}: ${(error as Error).message}`,
          );
        }
      }),
    );
  }

  private async dispatch(
    to: EmailRecipient[],
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    if (!this.apiKey || !this.senderEmail) {
      throw new Error('Brevo is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      BREVO_REQUEST_TIMEOUT_MS,
    );

    try {
      const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          sender: { email: this.senderEmail, name: this.senderName },
          to: to.map((recipient) => ({
            email: recipient.email,
            name: recipient.name,
          })),
          subject,
          htmlContent,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`Brevo responded with ${response.status}: ${body}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }
}
