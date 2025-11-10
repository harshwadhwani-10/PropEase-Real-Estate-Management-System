import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter for Mailtrap (development) or SMTP (production)
const createTransporter = () => {
  // Check if Mailtrap credentials are provided
  if (
    process.env.MAILTRAP_HOST &&
    process.env.MAILTRAP_PORT &&
    process.env.MAILTRAP_USER &&
    process.env.MAILTRAP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: parseInt(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  // Fallback to SMTP if Mailtrap not configured
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // If no email config, return null (emails will be skipped)
  console.warn("⚠️  Email configuration not found. Email notifications will be disabled.");
  return null;
};

const transporter = createTransporter();

// Send Inquiry Email to Owner
export const sendInquiryEmail = async ({
  to,
  ownerName,
  inquirerName,
  inquirerEmail,
  listingName,
  message,
  phone,
}) => {
  if (!transporter) {
    console.log("Email transporter not configured, skipping email");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propease.com",
    to,
    subject: `New Inquiry for ${listingName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; }
            .info-box { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #1e293b; }
            .button { display: inline-block; padding: 10px 20px; background-color: #1e293b; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Property Inquiry</h1>
            </div>
            <div class="content">
              <p>Hello ${ownerName},</p>
              <p>You have received a new inquiry for your property listing: <strong>${listingName}</strong></p>
              
              <div class="info-box">
                <h3>Inquirer Details:</h3>
                <p><strong>Name:</strong> ${inquirerName}</p>
                <p><strong>Email:</strong> ${inquirerEmail}</p>
                ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
              </div>
              
              <div class="info-box">
                <h3>Message:</h3>
                <p>${message}</p>
              </div>
              
              <p>Please respond to this inquiry at your earliest convenience.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Inquiry email sent to ${to}`);
  } catch (error) {
    console.error("Error sending inquiry email:", error);
    throw error;
  }
};

// Send Listing Approval Email
export const sendListingApprovalEmail = async ({ to, ownerName, listingName, status }) => {
  if (!transporter) {
    console.log("Email transporter not configured, skipping email");
    return;
  }

  const isApproved = status === "approved";
  const subject = isApproved
    ? `Your Listing "${listingName}" Has Been Approved`
    : `Your Listing "${listingName}" Has Been Rejected`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propease.com",
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${isApproved ? "#10b981" : "#ef4444"}; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${isApproved ? "Listing Approved!" : "Listing Rejected"}</h1>
            </div>
            <div class="content">
              <p>Hello ${ownerName},</p>
              <p>Your listing <strong>"${listingName}"</strong> has been ${isApproved ? "approved" : "rejected"}.</p>
              ${!isApproved ? "<p>If you have any questions, please contact our support team.</p>" : ""}
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Listing ${status} email sent to ${to}`);
  } catch (error) {
    console.error("Error sending listing approval email:", error);
    throw error;
  }
};

// Send Password Reset Email
export const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  if (!transporter) {
    console.log("Email transporter not configured, skipping email");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@propease.com",
    to,
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1e293b; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f8f9fa; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1e293b; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${username},</p>
              <p>You have requested to reset your password. Click the button below to reset your password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #1e293b;">${resetUrl}</p>
              
              <div class="warning">
                <strong>⚠️ Important:</strong>
                <ul>
                  <li>This link will expire in 5 minutes</li>
                  <li>If you didn't request this, please ignore this email</li>
                  <li>For security, never share this link with anyone</li>
                </ul>
              </div>
              
              <p>If you continue to have problems, please contact our support team.</p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${to}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

