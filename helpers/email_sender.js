const nodemailer = require("nodemailer");
const { google } = require("googleapis");

exports.sendMail = async (email, subject, body, success, errorMessage) => {
  try {
    // Load OAuth2 credentials from environment variables
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
    const REDIRECT_URI =
      process.env.GMAIL_REDIRECT_URI ||
      "https://developers.google.com/oauthplayground";
    const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
    const SENDER_EMAIL = process.env.EMAIL_USER;

    // Initialize OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

    // Get access token
    const accessToken = await oAuth2Client.getAccessToken();

    // Create Nodemailer transporter with OAuth2
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: SENDER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Email details
    const mailOptions = {
      from: SENDER_EMAIL,
      to: email,
      subject: subject,
    };

    // Support passing either a plain string body or an object from the mail builder
    // If body is an object, prefer body.text and body.html. If it's a string, use as text.
    if (typeof body === "string") {
      mailOptions.text = body;
    } else if (body && typeof body === "object") {
      // If caller didn't provide a subject (passed null/undefined), allow builder.subject to be used
      if ((!subject || subject === "") && body.subject) {
        mailOptions.subject = body.subject;
      }
      mailOptions.text = body.text || JSON.stringify(body);
      if (body.html) mailOptions.html = body.html;
    } else {
      mailOptions.text = "";
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    return {
      message: success || "Email sent successfully",
      statusCode: 200,
    };
  } catch (err) {
    console.error("Error sending email:", err);

    return {
      message: errorMessage || "Error sending email",
      statusCode: 500,
    };
  }
};
