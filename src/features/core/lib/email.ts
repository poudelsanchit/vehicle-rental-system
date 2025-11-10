import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface BookingConfirmationEmailData {
  to: string;
  userName: string;
  vehicleName: string;
  vehicleBrand: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  pickupLocation: string;
  ownerName: string;
  ownerEmail: string;
}

interface BookingReminderEmailData {
  to: string;
  userName: string;
  vehicleName: string;
  vehicleBrand: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  pickupLocation: string;
  ownerName: string;
  ownerPhone?: string;
}

interface BookingOverdueEmailData {
  to: string;
  userName: string;
  vehicleName: string;
  vehicleBrand: string;
  vehicleModel: string;
  endDate: string;
  ownerName: string;
  ownerEmail: string;
}

interface KYCApprovedEmailData {
  to: string;
  userName: string;
  fullName: string;
}

interface KYCRejectedEmailData {
  to: string;
  userName: string;
  fullName: string;
  rejectionReason: string;
}

export async function sendBookingConfirmationEmail(data: BookingConfirmationEmailData) {
  try {
    const mailOptions = {
      from: `"Vehicle Rental System" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: "🎉 Booking Confirmed - Your Vehicle is Ready!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #667eea; }
            .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your vehicle rental has been confirmed</p>
            </div>
            <div class="content">
              <p>Dear ${data.userName},</p>
              <p>Great news! Your booking has been confirmed by the vehicle owner.</p>
              
              <div class="booking-details">
                <h3>Booking Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Vehicle:</span>
                  <span>${data.vehicleBrand} ${data.vehicleModel}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Start Date:</span>
                  <span>${data.startDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">End Date:</span>
                  <span>${data.endDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Pickup Location:</span>
                  <span>${data.pickupLocation}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Total Amount:</span>
                  <span style="color: #10b981; font-weight: bold;">Rs. ${data.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div class="booking-details">
                <h3>Owner Contact</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span>${data.ownerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span>${data.ownerEmail}</span>
                </div>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Contact the owner to arrange payment and pickup details</li>
                <li>Ensure you have all required documents (license, ID)</li>
                <li>Inspect the vehicle before taking possession</li>
              </ul>

              <center>
                <a href="${process.env.NEXTAUTH_URL}/user/bookings" class="button">View My Bookings</a>
              </center>

              <p>If you have any questions, please contact the vehicle owner directly.</p>
              <p>Happy travels!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Vehicle Rental System. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Booking confirmation email sent to:", data.to);
    return { success: true };
  } catch (error) {
    console.error("Error sending booking confirmation email:", error);
    return { success: false, error };
  }
}

export async function sendBookingReminderEmail(data: BookingReminderEmailData) {
  try {
    const mailOptions = {
      from: `"Vehicle Rental System" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: "⏰ Reminder: Your Vehicle Rental Starts Tomorrow!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reminder-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #f59e0b; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Rental Reminder</h1>
              <p>Your vehicle rental starts tomorrow!</p>
            </div>
            <div class="content">
              <p>Dear ${data.userName},</p>
              <p>This is a friendly reminder that your vehicle rental begins tomorrow.</p>
              
              <div class="reminder-box">
                <h3>Rental Details</h3>
                <div class="detail-row">
                  <span class="detail-label">Vehicle:</span>
                  <span>${data.vehicleBrand} ${data.vehicleModel}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Start Date:</span>
                  <span>${data.startDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">End Date:</span>
                  <span>${data.endDate}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Pickup Location:</span>
                  <span>${data.pickupLocation}</span>
                </div>
              </div>

              <div class="reminder-box">
                <h3>Owner Contact</h3>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span>${data.ownerName}</span>
                </div>
                ${data.ownerPhone ? `
                <div class="detail-row">
                  <span class="detail-label">Phone:</span>
                  <span>${data.ownerPhone}</span>
                </div>
                ` : ''}
              </div>

              <p><strong>Checklist:</strong></p>
              <ul>
                <li>✓ Confirm pickup time with the owner</li>
                <li>✓ Bring your driver's license and ID</li>
                <li>✓ Complete payment if not already done</li>
                <li>✓ Inspect the vehicle thoroughly</li>
              </ul>

              <center>
                <a href="${process.env.NEXTAUTH_URL}/user/bookings" class="button">View Booking Details</a>
              </center>

              <p>Have a safe and enjoyable trip!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Vehicle Rental System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Booking reminder email sent to:", data.to);
    return { success: true };
  } catch (error) {
    console.error("Error sending booking reminder email:", error);
    return { success: false, error };
  }
}

export async function sendBookingOverdueEmail(data: BookingOverdueEmailData) {
  try {
    const mailOptions = {
      from: `"Vehicle Rental System" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: "⚠️ Urgent: Vehicle Return Overdue",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #ef4444; }
            .button { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Vehicle Return Overdue</h1>
              <p>Immediate action required</p>
            </div>
            <div class="content">
              <p>Dear ${data.userName},</p>
              <p><strong>This is an urgent notice regarding your vehicle rental.</strong></p>
              
              <div class="alert-box">
                <h3>⚠️ Overdue Rental</h3>
                <p>The rental period for the following vehicle has ended, but the vehicle has not been returned yet.</p>
                <div class="detail-row">
                  <span class="detail-label">Vehicle:</span>
                  <span>${data.vehicleBrand} ${data.vehicleModel}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Return Date:</span>
                  <span style="color: #ef4444; font-weight: bold;">${data.endDate}</span>
                </div>
              </div>

              <div class="alert-box">
                <h3>Owner Contact</h3>
                <p>Please contact the vehicle owner immediately:</p>
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span>${data.ownerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span>${data.ownerEmail}</span>
                </div>
              </div>

              <p><strong>Required Actions:</strong></p>
              <ul>
                <li>Contact the owner immediately to arrange vehicle return</li>
                <li>Return the vehicle as soon as possible</li>
                <li>Settle any additional charges for the extended period</li>
              </ul>

              <p style="color: #ef4444;"><strong>Note:</strong> Late returns may incur additional charges and affect your rental history.</p>

              <center>
                <a href="${process.env.NEXTAUTH_URL}/user/bookings" class="button">View Booking Details</a>
              </center>

              <p>Please resolve this matter urgently.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Vehicle Rental System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("Booking overdue email sent to:", data.to);
    return { success: true };
  } catch (error) {
    console.error("Error sending booking overdue email:", error);
    return { success: false, error };
  }
}


export async function sendKYCApprovedEmail(data: KYCApprovedEmailData) {
  try {
    const mailOptions = {
      from: `"Vehicle Rental System" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: "🎉 KYC Verification Approved - Account Activated!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { padding: 10px 0; border-bottom: 1px solid #eee; }
            .feature-item:last-child { border-bottom: none; }
            .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .checkmark { color: #10b981; font-size: 20px; margin-right: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
              <p>Your KYC verification has been approved</p>
            </div>
            <div class="content">
              <p>Dear ${data.fullName},</p>
              <p>Great news! Your KYC (Know Your Customer) verification has been successfully approved.</p>
              
              <div class="success-box">
                <h3 style="color: #10b981; margin-top: 0;">✓ Account Verified</h3>
                <p style="margin-bottom: 0;">Your account is now fully activated and you can access all features of our platform.</p>
              </div>

              <div class="feature-list">
                <h3>What You Can Do Now:</h3>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <strong>Browse Vehicles:</strong> Explore our wide range of available vehicles
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <strong>Make Bookings:</strong> Book vehicles for your trips
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <strong>List Your Vehicles:</strong> If you're an owner, start listing your vehicles
                </div>
                <div class="feature-item">
                  <span class="checkmark">✓</span>
                  <strong>Full Platform Access:</strong> Use all features without restrictions
                </div>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Complete your profile if you haven't already</li>
                <li>Browse available vehicles or list your own</li>
                <li>Start your rental journey with confidence</li>
              </ul>

              <center>
                <a href="${process.env.NEXTAUTH_URL}/user/dashboard" class="button">Go to Dashboard</a>
              </center>

              <p>Thank you for choosing our platform. We're excited to have you as a verified member!</p>
              
              <p>If you have any questions, feel free to contact our support team.</p>
              
              <p>Happy renting!</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Vehicle Rental System. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("KYC approved email sent to:", data.to);
    return { success: true };
  } catch (error) {
    console.error("Error sending KYC approved email:", error);
    return { success: false, error };
  }
}

export async function sendKYCRejectedEmail(data: KYCRejectedEmailData) {
  try {
    const mailOptions = {
      from: `"Vehicle Rental System" <${process.env.EMAIL_USER}>`,
      to: data.to,
      subject: "⚠️ KYC Verification Update - Action Required",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .reason-box { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
            .steps-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ KYC Verification Update</h1>
              <p>Action required on your verification</p>
            </div>
            <div class="content">
              <p>Dear ${data.fullName},</p>
              <p>Thank you for submitting your KYC verification documents. After careful review, we need you to resubmit your documents with some corrections.</p>
              
              <div class="warning-box">
                <h3 style="color: #f59e0b; margin-top: 0;">⚠️ Verification Status: Needs Revision</h3>
                <p style="margin-bottom: 0;">Your KYC submission requires some updates before we can approve it.</p>
              </div>

              <div class="reason-box">
                <h3 style="color: #ef4444; margin-top: 0;">Reason for Revision:</h3>
                <p style="margin-bottom: 0; font-weight: 500;">${data.rejectionReason}</p>
              </div>

              <div class="steps-box">
                <h3>What to Do Next:</h3>
                <ol>
                  <li><strong>Review the reason</strong> mentioned above carefully</li>
                  <li><strong>Prepare corrected documents</strong> that address the issues</li>
                  <li><strong>Resubmit your KYC</strong> through your dashboard</li>
                  <li><strong>Wait for verification</strong> - we'll review it within 24-48 hours</li>
                </ol>
              </div>

              <p><strong>Common Issues to Check:</strong></p>
              <ul>
                <li>✓ Documents are clear and readable</li>
                <li>✓ All required information is visible</li>
                <li>✓ Documents are valid and not expired</li>
                <li>✓ Photos are well-lit and in focus</li>
                <li>✓ All required documents are uploaded</li>
              </ul>

              <center>
                <a href="${process.env.NEXTAUTH_URL}/user/dashboard" class="button">Resubmit KYC Documents</a>
              </center>

              <p><strong>Need Help?</strong></p>
              <p>If you have questions about the rejection reason or need assistance with your documents, please contact our support team. We're here to help!</p>
              
              <p>We look forward to verifying your account soon.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Vehicle Rental System. All rights reserved.</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("KYC rejected email sent to:", data.to);
    return { success: true };
  } catch (error) {
    console.error("Error sending KYC rejected email:", error);
    return { success: false, error };
  }
}
