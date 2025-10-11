interface InviteEmailParams {
  recipientEmail: string;
  recipientRole: string;
  inviterName: string;
  inviterEmail: string;
}

export const sendInviteEmail = async (params: InviteEmailParams): Promise<boolean> => {
  const { recipientEmail, recipientRole, inviterName, inviterEmail } = params;

  try {
    // Create the email content
    const emailContent = {
      to: recipientEmail,
      subject: `You've been invited to join AEORank as a ${recipientRole}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              color: #1a1a1a;
              margin-bottom: 10px;
            }
            .content {
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              background-color: #1a1a1a;
              color: #ffffff;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 500;
              margin: 20px 0;
            }
            .button-container {
              text-align: center;
            }
            .role-badge {
              display: inline-block;
              background-color: ${recipientRole === 'Company Member' ? '#2563eb' : '#16a34a'};
              color: white;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
              margin: 10px 0;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">AEORank</div>
            </div>
            
            <div class="content">
              <h2>You've been invited!</h2>
              <p>Hi there,</p>
              <p><strong>${inviterName}</strong> (${inviterEmail}) has invited you to join their AEORank workspace as a:</p>
              <div class="button-container">
                <span class="role-badge">${recipientRole}</span>
              </div>
              <p>AEORank helps you track and optimize your AI Engine Optimization (AEO) performance, monitor competitors, and analyze sources across AI platforms.</p>
              
              <div class="button-container">
                <a href="${window.location.origin}/signup?email=${encodeURIComponent(recipientEmail)}&role=${encodeURIComponent(recipientRole)}" class="button">
                  Accept Invitation
                </a>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                If you have any questions, feel free to reply to this email or contact our support team.
              </p>
            </div>
            
            <div class="footer">
              <p>This invitation was sent by ${inviterName} on behalf of AEORank.</p>
              <p style="margin-top: 10px;">
                © ${new Date().getFullYear()} AEORank. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
You've been invited to join AEORank!

${inviterName} (${inviterEmail}) has invited you to join their AEORank workspace as a ${recipientRole}.

Accept your invitation by visiting: ${window.location.origin}/signup?email=${encodeURIComponent(recipientEmail)}&role=${encodeURIComponent(recipientRole)}

AEORank helps you track and optimize your AI Engine Optimization (AEO) performance, monitor competitors, and analyze sources across AI platforms.

If you have any questions, feel free to contact our support team.

© ${new Date().getFullYear()} AEORank. All rights reserved.
      `.trim()
    };

    // For development: Log the email instead of sending
    if (import.meta.env.DEV) {
      console.log('📧 Email would be sent:', emailContent);
      console.log('Email HTML Preview:');
      console.log(emailContent.html);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    }

    // In production, you would integrate with your email service
    // Example with a REST API:
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return true;
  } catch (error) {
    console.error('Error sending invite email:', error);
    return false;
  }
};

// Alternative: EmailJS integration (if you want to use EmailJS)
export const sendInviteEmailViaEmailJS = async (params: InviteEmailParams): Promise<boolean> => {
  try {
    // You would need to install emailjs-com package
    // npm install @emailjs/browser
    
    // import emailjs from '@emailjs/browser';
    
    // const templateParams = {
    //   to_email: params.recipientEmail,
    //   to_name: params.recipientEmail,
    //   from_name: params.inviterName,
    //   from_email: params.inviterEmail,
    //   role: params.recipientRole,
    //   invite_link: `${window.location.origin}/signup?email=${encodeURIComponent(params.recipientEmail)}&role=${encodeURIComponent(params.recipientRole)}`
    // };

    // await emailjs.send(
    //   'YOUR_SERVICE_ID',
    //   'YOUR_TEMPLATE_ID',
    //   templateParams,
    //   'YOUR_PUBLIC_KEY'
    // );

    return true;
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    return false;
  }
};
