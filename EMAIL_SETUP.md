# Email Invitation Setup Guide

This document explains how the email invitation system works and how to configure it for production.

## Overview

The People section now sends actual email invitations when you invite someone to join your AEORank workspace.

## Current Implementation (Development)

In development mode, the email service:
- ✅ Validates email addresses
- ✅ Prevents duplicate invitations
- ✅ Shows loading states during sending
- ✅ Logs email content to console
- ✅ Simulates sending with a 1-second delay

**In development, emails are NOT actually sent** - they are logged to the browser console for testing.

## Production Setup Options

### Option 1: Backend API (Recommended)

1. Create a backend API endpoint `/api/send-email`
2. Update the `emailService.ts` file with your API endpoint
3. Use a service like:
   - **SendGrid** (https://sendgrid.com)
   - **Mailgun** (https://mailgun.com)
   - **AWS SES** (https://aws.amazon.com/ses)
   - **Postmark** (https://postmarkapp.com)

Example backend code (Node.js with SendGrid):

```javascript
// backend/api/send-email.js
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(req) {
  const { to, subject, html, text } = await req.json();
  
  const msg = {
    to,
    from: 'noreply@aeorank.com', // Your verified sender
    subject,
    text,
    html,
  };
  
  try {
    await sgMail.send(msg);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

### Option 2: EmailJS (Frontend-only, Quick Setup)

1. Install EmailJS:
```bash
npm install @emailjs/browser
```

2. Sign up at https://www.emailjs.com/

3. Create an email template in EmailJS dashboard

4. Update `src/services/emailService.ts`:

```typescript
import emailjs from '@emailjs/browser';

export const sendInviteEmail = async (params: InviteEmailParams): Promise<boolean> => {
  try {
    const templateParams = {
      to_email: params.recipientEmail,
      to_name: params.recipientEmail,
      from_name: params.inviterName,
      from_email: params.inviterEmail,
      role: params.recipientRole,
      invite_link: `${window.location.origin}/signup?email=${encodeURIComponent(params.recipientEmail)}`
    };

    await emailjs.send(
      'YOUR_SERVICE_ID',      // From EmailJS dashboard
      'YOUR_TEMPLATE_ID',     // From EmailJS dashboard
      templateParams,
      'YOUR_PUBLIC_KEY'       // From EmailJS dashboard
    );

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
```

5. Set environment variables in `.env`:
```
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

### Option 3: Resend (Modern, Developer-friendly)

1. Install Resend:
```bash
npm install resend
```

2. Create backend API endpoint:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInviteEmail(to: string, html: string) {
  await resend.emails.send({
    from: 'AEORank <noreply@aeorank.com>',
    to: [to],
    subject: 'You've been invited to AEORank',
    html,
  });
}
```

## Email Template

The current email template includes:

- 📧 **Professional HTML design**
- 🎨 **Branded styling**
- 🔗 **Direct signup link** with pre-filled email
- 👤 **Role badge** (Company Member or Workspace Member)
- 💼 **Inviter information**
- 📱 **Responsive design**

## Testing in Development

1. Open browser console (F12)
2. Go to People section
3. Enter an email and click "Invite"
4. Check console for email preview:
   - Email content will be logged
   - HTML will be displayed in console
   - Simulated 1-second delay

## Features

✅ **Email validation** - Checks for valid email format
✅ **Duplicate prevention** - Won't send to already invited users
✅ **Loading states** - Shows spinner while sending
✅ **Error handling** - Graceful failure with user feedback
✅ **Toast notifications** - Success and error messages
✅ **Professional design** - Beautiful HTML email template
✅ **Role-based invites** - Different badges for different roles

## Environment Variables

Create a `.env` file in the root directory:

```env
# Development
VITE_APP_ENV=development

# Production (choose one based on your email service)
VITE_EMAIL_SERVICE=sendgrid  # or 'emailjs', 'resend', 'mailgun'
VITE_SENDGRID_API_KEY=your_api_key
# or
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Next Steps

1. Choose an email service provider
2. Set up your account and get API keys
3. Update `src/services/emailService.ts` with your configuration
4. Set environment variables
5. Test in development
6. Deploy to production

## Troubleshooting

**Emails not sending in production:**
- Check API keys are set correctly
- Verify sender email is verified with your provider
- Check console for error messages
- Ensure CORS is configured if using frontend-only solution

**Emails going to spam:**
- Set up SPF, DKIM, and DMARC records
- Use a verified sender domain
- Avoid spam trigger words in subject/content
- Use a reputable email service provider

## Support

For questions or issues, refer to:
- SendGrid: https://docs.sendgrid.com
- EmailJS: https://www.emailjs.com/docs
- Resend: https://resend.com/docs
