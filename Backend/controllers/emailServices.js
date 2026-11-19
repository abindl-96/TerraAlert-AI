import db from "../config/db.js";
import nodemailer from "nodemailer";

// Configure nodemailer transporter
// Update these with your email service credentials
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || "terraalertailandslide@gmail.com",
      pass: process.env.SMTP_PASS || "szbo naqk lrtf wwjk",
    },
  });
};

// Get users by pincode
export const getUsersByPincode = (req, res) => {
  const { pincode } = req.query;

  if (!pincode) {
    return res.status(400).json({ error: "Pincode is required" });
  }

  const sql = "SELECT id, name, email, phone_number, location, pincode FROM user WHERE pincode = ? AND isBlocked = 0";
  
  db.query(sql, [pincode], (err, result) => {
    if (err) {
      console.error("Error getting users by pincode:", err);
      res.status(500).json({ error: "Error getting users" });
      return;
    }
    console.log(`Users retrieved for pincode ${pincode}: ${result.length}`);
    res.status(200).json({ data: result, count: result.length });
  });
};

// Get users by district (Kerala)
export const getUsersByDistrict = (req, res) => {
  const { district } = req.query;
  if (!district) {
    return res.status(400).json({ error: "District is required" });
  }
  const sql = "SELECT id, name, email, phone_number, location, district FROM user WHERE district = ? AND isBlocked = 0";
  db.query(sql, [district], (err, result) => {
    if (err) {
      console.error("Error getting users by district:", err);
      res.status(500).json({ error: "Error getting users" });
      return;
    }
    res.status(200).json({ data: result, count: result.length });
  });
};

// Generate AI email content using Gemini
export const generateEmailContent = async (req, res) => {
  const { location_name, risk_percentage, latitude, longitude, pincode, district } = req.body;

  if (!location_name || !risk_percentage) {
    return res.status(400).json({ error: "Location name and risk percentage are required" });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAUMk1fI-FtIu93hMONKyKnIQ8r5_ndAwQ";

  const prompt = `You are a disaster management communication expert. Create a professional, clear, and actionable email alert for citizens about landslide risk.

LANDD-SLIDE ALERT DETAILS:
- Location: ${location_name}
- Risk Percentage: ${risk_percentage}%
- Coordinates: Latitude ${latitude}, Longitude ${longitude}
- District: ${district || "N/A"}
- Pincode: ${pincode || "N/A"}

Create an email with:
1. A clear, attention-grabbing subject line
2. A professional greeting
3. Brief explanation of the risk level
4. Specific safety recommendations based on the risk percentage
5. Emergency contact information
6. A professional closing

Format the response as JSON:
{
  "subject": "Subject line here",
  "body": "Email body here (use HTML formatting with <p>, <strong>, <ul>, <li> tags)"
}

Make it urgent and actionable if risk is high (>=61%), and informative but calm if risk is moderate or low.`;

  const endpoints = [
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  ];

  let response = null;
  let lastError = null;

  for (const GEMINI_API_URL of endpoints) {
    try {
      response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      });

      if (response.ok) {
        break;
      } else {
        const errorData = await response.text();
        console.error(`Gemini API error (${response.status}):`, errorData);
        lastError = new Error(`API returned ${response.status}: ${errorData}`);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      lastError = error;
      response = null;
    }
  }

  if (response && response.ok) {
    try {
      const data = await response.json();
      if (data.candidates && data.candidates.length > 0) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from response
        let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const emailData = JSON.parse(jsonMatch[0]);
          res.status(200).json({ 
            subject: emailData.subject || `Landslide Alert - ${location_name}`,
            body: emailData.body || generateFallbackEmail(location_name, risk_percentage, pincode, district)
          });
          return;
        }
      }
    } catch (error) {
      console.error("Error parsing AI response:", error);
    }
  }

  // Fallback to template email
  res.status(200).json({
    subject: `Landslide Alert - ${location_name}`,
    body: generateFallbackEmail(location_name, risk_percentage, pincode, district)
  });
};

// Fallback email template
const generateFallbackEmail = (location_name, risk_percentage, pincode, district = null) => {
  const riskLevel = parseFloat(risk_percentage) >= 86 ? "CRITICAL" :
                   parseFloat(risk_percentage) >= 61 ? "HIGH" :
                   parseFloat(risk_percentage) >= 31 ? "MODERATE" : "LOW";

  return `
    <h2 style="color: #d32f2f;">🚨 Landslide Risk Alert</h2>
    <p>Dear Citizen,</p>
    <p>This is an important alert regarding landslide risk in your area.</p>
    <p><strong>Location:</strong> ${location_name}</p>
    <p><strong>Risk Level:</strong> ${riskLevel} (${parseFloat(risk_percentage).toFixed(1)}%)</p>
    ${district ? `<p><strong>District:</strong> ${district}</p>` : ""}
    ${pincode ? `<p><strong>Pincode:</strong> ${pincode}</p>` : ""}
    <h3>Safety Recommendations:</h3>
    <ul>
      ${parseFloat(risk_percentage) >= 61 ? `
      <li>Stay alert and be prepared to evacuate if necessary</li>
      <li>Avoid traveling to hilly or mountainous areas</li>
      <li>Keep emergency supplies ready</li>
      <li>Monitor weather conditions closely</li>
      ` : `
      <li>Stay informed about weather updates</li>
      <li>Be cautious when traveling in hilly areas</li>
      <li>Report any unusual ground movement to authorities</li>
      `}
    </ul>
    <p><strong>Emergency Contact:</strong> Dial 100 for immediate assistance</p>
    <p>Stay safe and follow local authority guidelines.</p>
    <p>Best regards,<br>Disaster Management Authority</p>
  `;
};

// Send emails to users by district (primary) or pincode (fallback)
export const sendEmailsToCitizens = async (req, res) => {
  const { district, pincode, subject, body, location_name, risk_percentage } = req.body;

  if ((!district && !pincode) || !subject || !body) {
    return res.status(400).json({ error: "District or pincode, subject, and body are required" });
  }

  try {
    const useDistrict = district && district.trim() !== "";
    const sql = useDistrict
      ? "SELECT id, name, email FROM user WHERE district = ? AND isBlocked = 0"
      : "SELECT id, name, email FROM user WHERE pincode = ? AND isBlocked = 0";
    const param = useDistrict ? district : pincode;
    db.query(sql, [param], async (err, users) => {
      if (err) {
        console.error("Error getting users:", err);
        return res.status(500).json({ error: "Error getting users" });
      }

      if (users.length === 0) {
        return res.status(404).json({ error: useDistrict ? "No users found for this district" : "No users found for this pincode" });
      }

      // Create transporter
      const transporter = createTransporter();

      // Send emails
      const emailPromises = users.map((user) => {
        const mailOptions = {
          from: process.env.SMTP_USER || "noreply@terraalert.com",
          to: user.email,
          subject: subject,
          html: body.replace(/\{name\}/g, user.name || "Citizen"),
        };

        return transporter.sendMail(mailOptions);
      });

      const results = await Promise.allSettled(emailPromises);
      
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      console.log(`Emails sent: ${successful} successful, ${failed} failed`);

      res.status(200).json({
        message: `Emails sent to ${successful} users`,
        total: users.length,
        successful: successful,
        failed: failed,
      });
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Error sending emails" });
  }
};
