import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: Number(this.configService.get('SMTP_PORT', 587)),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM', 'LabAI <noreply@labai.com>'),
        to: email,
        subject: 'Your verification code - LabAI',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Welcome to LabAI</h2>
            <p style="color: #64748b; font-size: 15px;">Enter this verification code in the app to confirm your email:</p>
            <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">This code expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send verification email to ${email}: ${error}`,
      );
    }
  }

  async sendPasswordResetEmail(email: string, code: string) {
    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM', 'LabAI <noreply@labai.com>'),
        to: email,
        subject: 'Your password reset code - LabAI',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #0f172a; margin-bottom: 8px;">Password Reset</h2>
            <p style="color: #64748b; font-size: 15px;">Enter this code in the app to reset your password:</p>
            <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
              <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px;">This code expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send password reset email to ${email}: ${error}`,
      );
    }
  }

  async sendLabReportReadyEmail(email: string, reportId: string) {
    const clientUrl = this.configService.get(
      'CLIENT_URL',
      'http://localhost:8081',
    );
    const reportUrl = `${clientUrl}/report/${reportId}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM', 'LabAI <noreply@labai.com>'),
        to: email,
        subject: 'Your lab report is ready - LabAI',
        html: `
          <h2>Lab Report Ready!</h2>
          <p>Your lab report has been analyzed. View the results:</p>
          <a href="${reportUrl}">View Report</a>
        `,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send report ready email to ${email}: ${error}`,
      );
    }
  }

  async sendCriticalAlertEmail(
    email: string,
    reportId: string,
    criticalValues: string[],
  ) {
    const clientUrl = this.configService.get(
      'CLIENT_URL',
      'http://localhost:8081',
    );
    const reportUrl = `${clientUrl}/report/${reportId}`;

    try {
      await this.transporter.sendMail({
        from: this.configService.get('MAIL_FROM', 'LabAI <noreply@labai.com>'),
        to: email,
        subject: 'CRITICAL: Lab values require attention - LabAI',
        html: `
          <h2 style="color: red;">Critical Lab Values Detected</h2>
          <p>The following values require immediate attention:</p>
          <ul>${criticalValues.map((v) => `<li>${v}</li>`).join('')}</ul>
          <a href="${reportUrl}">View Full Report</a>
          <p><strong>Please consult your doctor immediately.</strong></p>
        `,
      });
    } catch (error) {
      this.logger.warn(
        `Failed to send critical alert email to ${email}: ${error}`,
      );
    }
  }
}
