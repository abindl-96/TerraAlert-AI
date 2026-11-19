# Email Setup Guide

## Configuration

The email service uses nodemailer to send emails to citizens. You need to configure your SMTP settings.

### Environment Variables

Create a `.env` file in the `Backend` directory with the following variables:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
GEMINI_API_KEY=AIzaSyAUMk1fI-FtIu93hMONKyKnIQ8r5_ndAwQ
```

### Gmail Setup (Recommended)

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to App Passwords: https://myaccount.google.com/apppasswords
4. Generate an app password for "Mail"
5. Use this app password as `SMTP_PASS`

### Other Email Providers

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

## API Endpoints

### 1. Get Users by Pincode
**GET** `/api/email/getUsersByPincode?pincode={pincode}`
- Returns list of users registered in the specified pincode

### 2. Generate AI Email Content
**POST** `/api/email/generateEmailContent`
- Body:
  ```json
  {
    "location_name": "Munnar",
    "risk_percentage": 75.5,
    "latitude": 10.0889,
    "longitude": 77.0595,
    "pincode": "685612"
  }
  ```
- Returns AI-generated email subject and body

### 3. Send Emails to Citizens
**POST** `/api/email/sendEmailsToCitizens`
- Body:
  ```json
  {
    "pincode": "685612",
    "subject": "Landslide Alert - Munnar",
    "body": "<h2>Alert Content</h2><p>...</p>",
    "location_name": "Munnar",
    "risk_percentage": 75.5
  }
  ```
- Sends email to all users in the specified pincode

## Usage Flow

1. Government authority views risk predictions
2. Clicks "Send Alert to Citizens" for a prediction
3. System generates AI email content using Gemini
4. Authority can edit the email content
5. System sends email to all users registered in that pincode

## Email Template

The AI generates emails with:
- Clear subject line
- Risk level information
- Safety recommendations
- Emergency contact information
- Professional formatting

## Testing

Test the email functionality:
1. Ensure you have users with pincodes in the database
2. Use a test pincode that has registered users
3. Generate email content
4. Review and edit if needed
5. Send test email

## Troubleshooting

### Emails not sending
- Check SMTP credentials
- Verify firewall allows SMTP port
- Check email provider's sending limits
- Verify users exist for the pincode

### AI content generation fails
- Check Gemini API key
- Verify API quota not exceeded
- System will fallback to template email
