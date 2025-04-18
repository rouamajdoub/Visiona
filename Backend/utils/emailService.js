// utils/emailService.js
const SibApiV3Sdk = require("sib-api-v3-sdk");

//  Brevo API client
const initBrevoClient = () => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  return new SibApiV3Sdk.TransactionalEmailsApi();
};

// Function to send approval email to architects
const sendApprovalEmail = async (user) => {
  try {
    const apiInstance = initBrevoClient();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      email: process.env.EMAIL_USER,
      name: "Visiona",
    };

    sendSmtpEmail.to = [{ email: user.email }];
    sendSmtpEmail.subject = "Your Architect Account Has Been Approved";
    sendSmtpEmail.htmlContent = `
      <h1>Welcome to Our Platform!</h1>
      <p>Dear ${user.firstName || user.prenom || "Architect"},</p>
      <p>We're pleased to inform you that your architect account has been approved.</p>
      <p>You can now log in to the platform using your registered email and password.</p>
      <p>Here's a summary of your account information:</p>
      <ul>
        <li>Name: ${user.firstName || user.prenom} ${
      user.lastName || user.nomDeFamille
    }</li>
        <li>Email: ${user.email}</li>
        <li>Role: Architect</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Thank you for joining us!</p>
    `;

    console.log(`Attempting to send approval email to: ${user.email}`);
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Approval email sent successfully:", result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
};

module.exports = {
  sendApprovalEmail,
};
