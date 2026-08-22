import nodemailer, { Transporter } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.SMTP_USER || 'noreply@dayflow.com';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    // Only initialize if all SMTP config is provided
    if (!host || !port || !user || !pass) {
      console.warn('⚠️  Email service not configured. Email notifications will be skipped.');
      return;
    }

    try {
      const config: EmailConfig = {
        host,
        port: parseInt(port, 10),
        secure: parseInt(port, 10) === 465, // true for port 465, false for other ports
        auth: {
          user,
          pass,
        },
      };

      this.transporter = nodemailer.createTransport(config);
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      console.log('📧 Email skipped (service not configured):', { to, subject });
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
      });
      console.log('📧 Email sent successfully:', { to, subject });
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  // Email template for leave request approval
  async sendLeaveApprovalEmail(
    employeeEmail: string,
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    approverName: string
  ): Promise<boolean> {
    const subject = '✅ Leave Request Approved - Dayflow HRMS';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Leave Request Approved</h1>
          </div>
          <div class="content">
            <p>Dear ${employeeName},</p>
            <p>Your leave request has been <strong>approved</strong>.</p>

            <div class="info-box">
              <p style="margin: 5px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
              <p style="margin: 5px 0;"><strong>From:</strong> ${startDate}</p>
              <p style="margin: 5px 0;"><strong>To:</strong> ${endDate}</p>
              <p style="margin: 5px 0;"><strong>Approved By:</strong> ${approverName}</p>
            </div>

            <p>Please ensure all your work is up to date before your leave begins.</p>
            <p>If you have any questions, please contact HR.</p>

            <p style="margin-top: 30px;">Best regards,<br><strong>Dayflow HRMS Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email from Dayflow HRMS. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(employeeEmail, subject, html);
  }

  // Email template for leave request rejection
  async sendLeaveRejectionEmail(
    employeeEmail: string,
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    approverName: string,
    rejectionReason?: string
  ): Promise<boolean> {
    const subject = '❌ Leave Request Rejected - Dayflow HRMS';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #ef4444; margin: 20px 0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Leave Request Rejected</h1>
          </div>
          <div class="content">
            <p>Dear ${employeeName},</p>
            <p>Your leave request has been <strong>rejected</strong>.</p>

            <div class="info-box">
              <p style="margin: 5px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
              <p style="margin: 5px 0;"><strong>From:</strong> ${startDate}</p>
              <p style="margin: 5px 0;"><strong>To:</strong> ${endDate}</p>
              <p style="margin: 5px 0;"><strong>Rejected By:</strong> ${approverName}</p>
              ${rejectionReason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
            </div>

            <p>If you have any questions or concerns, please contact HR or your supervisor.</p>

            <p style="margin-top: 30px;">Best regards,<br><strong>Dayflow HRMS Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email from Dayflow HRMS. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(employeeEmail, subject, html);
  }

  // Email template for new leave request notification (to HR)
  async sendLeaveRequestNotificationToHR(
    hrEmail: string,
    employeeName: string,
    leaveType: string,
    startDate: string,
    endDate: string,
    reason: string
  ): Promise<boolean> {
    const subject = '🔔 New Leave Request - Dayflow HRMS';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .info-box { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Leave Request</h1>
          </div>
          <div class="content">
            <p>A new leave request requires your approval.</p>

            <div class="info-box">
              <p style="margin: 5px 0;"><strong>Employee:</strong> ${employeeName}</p>
              <p style="margin: 5px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
              <p style="margin: 5px 0;"><strong>From:</strong> ${startDate}</p>
              <p style="margin: 5px 0;"><strong>To:</strong> ${endDate}</p>
              <p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>
            </div>

            <p>Please log in to the Dayflow HRMS system to review and approve/reject this request.</p>

            <p style="margin-top: 30px;">Best regards,<br><strong>Dayflow HRMS System</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email from Dayflow HRMS. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(hrEmail, subject, html);
  }

  // Email template for email verification
  async sendVerificationEmail(
    email: string,
    name: string,
    verificationCode: string
  ): Promise<boolean> {
    const subject = '🔐 Verify Your Email - Dayflow HRMS';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .code-box { background: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; border: 2px dashed #667eea; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Email Verification</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for signing up with Dayflow HRMS. Please verify your email address using the code below:</p>

            <div class="code-box">
              ${verificationCode}
            </div>

            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't create an account, please ignore this email.</p>

            <p style="margin-top: 30px;">Best regards,<br><strong>Dayflow HRMS Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email from Dayflow HRMS. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }

  // Email template for password reset
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ): Promise<boolean> {
    const subject = '🔑 Password Reset Request - Dayflow HRMS';
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">Password Reset</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>

            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </div>

            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>

            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>

            <p style="margin-top: 30px;">Best regards,<br><strong>Dayflow HRMS Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email from Dayflow HRMS. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(email, subject, html);
  }
}

// Export singleton instance
export default new EmailService();
