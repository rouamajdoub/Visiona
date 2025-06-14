// utils/emailService.js
const SibApiV3Sdk = require("sib-api-v3-sdk");
const PDFDocument = require("pdfkit");

//  Brevo API client
const initBrevoClient = () => {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY;
  return new SibApiV3Sdk.TransactionalEmailsApi();
};

// Function to generate PDF buffer for quote
const generateQuotePDFBuffer = async (quote) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Add company logo/header
      doc
        .fontSize(20)
        .text("ARCHITECTURE QUOTE", { align: "center" })
        .moveDown(0.5);

      // Add quote information
      doc
        .fontSize(12)
        .text(`Quote #: ${quote._id}`)
        .text(`Date: ${new Date(quote.issueDate).toLocaleDateString()}`)
        .text(`Status: ${quote.status.toUpperCase()}`)
        .moveDown();

      // Add client information
      doc
        .fontSize(14)
        .text("Client Information", { underline: true })
        .fontSize(12)
        .text(`Name: ${quote.clientName}`)
        .text(`Email: ${quote.client?.email || "N/A"}`);

      if (quote.clientAddress) {
        doc.text(
          `Address: ${quote.clientAddress.street || ""}, ${
            quote.clientAddress.city || ""
          }, ${quote.clientAddress.zipCode || ""}`
        );
      }

      doc.moveDown();

      // Add project information
      doc
        .fontSize(14)
        .text("Project Details", { underline: true })
        .fontSize(12)
        .text(`Project: ${quote.projectTitle}`)
        .text(`Description: ${quote.projectDescription || "N/A"}`)
        .moveDown();

      // Add items table
      doc.fontSize(14).text("Quote Items", { underline: true }).moveDown(0.5);

      let yPos = doc.y;
      const itemStartX = 50;
      const descriptionWidth = 200;
      const numberColWidth = 80;

      // Table headers
      doc
        .fontSize(10)
        .text("Description", itemStartX, yPos)
        .text("Category", itemStartX + descriptionWidth, yPos)
        .text("Qty", itemStartX + descriptionWidth + numberColWidth, yPos)
        .text(
          "Unit Price",
          itemStartX + descriptionWidth + 2 * numberColWidth,
          yPos
        )
        .text(
          "Total",
          itemStartX + descriptionWidth + 3 * numberColWidth,
          yPos
        );

      yPos += 20;

      // Add line under headers
      doc
        .moveTo(itemStartX, yPos - 5)
        .lineTo(itemStartX + descriptionWidth + 4 * numberColWidth, yPos - 5)
        .stroke();

      // Table rows for items
      quote.items.forEach((item) => {
        // Check if we need a new page
        if (yPos > doc.page.height - 150) {
          doc.addPage();
          yPos = 50;
        }

        doc
          .fontSize(10)
          .text(item.description || "", itemStartX, yPos, {
            width: descriptionWidth,
          })
          .text(item.category || "N/A", itemStartX + descriptionWidth, yPos)
          .text(
            item.quantity?.toString() || "1",
            itemStartX + descriptionWidth + numberColWidth,
            yPos
          )
          .text(
            `$${(item.unitPrice || 0).toFixed(2)}`,
            itemStartX + descriptionWidth + 2 * numberColWidth,
            yPos
          )
          .text(
            `$${(item.total || 0).toFixed(2)}`,
            itemStartX + descriptionWidth + 3 * numberColWidth,
            yPos
          );

        yPos += 20;
      });

      // Add line after items
      doc
        .moveTo(itemStartX, yPos)
        .lineTo(itemStartX + descriptionWidth + 4 * numberColWidth, yPos)
        .stroke();

      yPos += 20;

      // Add totals section
      const totalsX = itemStartX + descriptionWidth + 2 * numberColWidth;
      doc
        .fontSize(10)
        .text("Subtotal:", totalsX, yPos)
        .text(
          `$${quote.subtotal.toFixed(2)}`,
          itemStartX + descriptionWidth + 3 * numberColWidth,
          yPos
        );
      yPos += 15;

      if (quote.discount > 0) {
        doc
          .text("Discount:", totalsX, yPos)
          .text(
            `$${quote.discount.toFixed(2)}`,
            itemStartX + descriptionWidth + 3 * numberColWidth,
            yPos
          );
        yPos += 15;
      }

      if (quote.taxRate > 0) {
        doc
          .text(`Tax (${quote.taxRate}%):`, totalsX, yPos)
          .text(
            `$${quote.taxAmount.toFixed(2)}`,
            itemStartX + descriptionWidth + 3 * numberColWidth,
            yPos
          );
        yPos += 15;
      }

      // Total amount
      doc
        .fontSize(12)
        .text("TOTAL:", totalsX, yPos, { bold: true })
        .text(
          `$${quote.totalAmount.toFixed(2)}`,
          itemStartX + descriptionWidth + 3 * numberColWidth,
          yPos,
          { bold: true }
        );

      yPos += 30;

      // Add terms and conditions
      if (quote.termsConditions) {
        doc
          .fontSize(14)
          .text("Terms & Conditions", { underline: true })
          .fontSize(10)
          .text(quote.termsConditions, { align: "left" })
          .moveDown();
      }

      // Add notes
      if (quote.notes) {
        doc
          .fontSize(14)
          .text("Notes", { underline: true })
          .fontSize(10)
          .text(quote.notes, { align: "left" });
      }

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Function to send quote to client
const sendQuoteToClient = async (quote, architect, customMessage = "") => {
  try {
    const apiInstance = initBrevoClient();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Generate PDF attachment
    const pdfBuffer = await generateQuotePDFBuffer(quote);
    const pdfBase64 = pdfBuffer.toString("base64");

    // Set up email
    sendSmtpEmail.sender = {
      email: process.env.EMAIL_USER,
      name: architect.companyName || "Visiona Architecture",
    };

    sendSmtpEmail.to = [
      {
        email: quote.client?.email || quote.clientEmail,
        name: quote.clientName,
      },
    ];

    sendSmtpEmail.subject = `Quote for ${quote.projectTitle} - ${quote._id}`;

    // Create email content
    const defaultMessage = `
      <h2>Architecture Quote</h2>
      <p>Dear ${quote.clientName},</p>
      <p>Please find attached the quote for your project: <strong>${
        quote.projectTitle
      }</strong></p>
      <p><strong>Quote Details:</strong></p>
      <ul>
        <li>Quote Number: ${quote._id}</li>
        <li>Project: ${quote.projectTitle}</li>
        <li>Issue Date: ${new Date(quote.issueDate).toLocaleDateString()}</li>
        <li>Total Amount: $${quote.totalAmount.toFixed(2)}</li>
      </ul>
      ${
        quote.projectDescription
          ? `<p><strong>Project Description:</strong><br>${quote.projectDescription}</p>`
          : ""
      }
      ${
        customMessage
          ? `<p><strong>Additional Message:</strong><br>${customMessage}</p>`
          : ""
      }
      <p>If you have any questions about this quote, please don't hesitate to contact us.</p>
      <p>Best regards,<br>
      ${architect.firstName || architect.prenom} ${
      architect.lastName || architect.nomDeFamille
    }<br>
      ${architect.companyName || "Architecture Services"}<br>
      ${architect.email}<br>
      ${architect.phone || ""}</p>
    `;

    sendSmtpEmail.htmlContent = defaultMessage;

    // Add PDF attachment
    sendSmtpEmail.attachment = [
      {
        content: pdfBase64,
        name: `Quote-${quote._id}-${quote.projectTitle.replace(
          /[^a-zA-Z0-9]/g,
          "-"
        )}.pdf`,
        type: "application/pdf",
      },
    ];

    console.log(
      `Attempting to send quote email to: ${
        quote.client?.email || quote.clientEmail
      }`
    );
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Quote email sent successfully:", result);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Quote email sending error:", error);
    return { success: false, error: error.message || error };
  }
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

// Function to send rejection email to architects
const sendRejectionEmail = async (user) => {
  try {
    const apiInstance = initBrevoClient();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    // Format rejection reason
    let reasonText = "";
    if (user.rejectionDetails && user.rejectionDetails.reason) {
      reasonText = user.rejectionDetails.reason;
      if (
        user.rejectionDetails.reason === "Other" &&
        user.rejectionDetails.customReason
      ) {
        reasonText += `: ${user.rejectionDetails.customReason}`;
      } else if (user.rejectionDetails.customReason) {
        reasonText += `\nAdditional information: ${user.rejectionDetails.customReason}`;
      }
    }

    sendSmtpEmail.sender = {
      email: process.env.EMAIL_USER,
      name: "Visiona",
    };

    sendSmtpEmail.to = [{ email: user.email }];
    sendSmtpEmail.subject = "Your Architect Account Application Status";
    sendSmtpEmail.htmlContent = `
      <h1>Architect Account Application Update</h1>
      <p>Dear ${user.firstName || user.prenom || "Architect"},</p>
      <p>Thank you for your interest in joining our platform as an architect.</p>
      <p>After careful review of your application, we regret to inform you that we are unable to approve your account at this time.</p>
      ${reasonText ? `<p><strong>Reason:</strong> ${reasonText}</p>` : ""}
      <p>You may address the issues mentioned above and submit a new application in the future.</p>
      <p>If you believe there has been an error or would like to provide additional information, please contact our support team.</p>
      <p>Thank you for your understanding.</p>
    `;

    console.log(`Attempting to send rejection email to: ${user.email}`);
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Rejection email sent successfully:", result);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    return { success: false, error };
  }
};

module.exports = {
  sendApprovalEmail,
  sendRejectionEmail,
  sendQuoteToClient,
};
