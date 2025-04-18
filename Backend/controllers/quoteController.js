const Quote = require("../models/Quote");
const { NotFoundError, BadRequestError } = require("../utils/customErrors");
const { StatusCodes } = require("http-status-codes");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Utility functions to avoid code duplication
const calculateFinancials = (items, taxRate, discount) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const totalAmount = subtotal + taxAmount - discount;

  // Add calculated item totals
  const itemsWithTotals = items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));

  return { subtotal, taxAmount, totalAmount, itemsWithTotals };
};

const handleError = (res, error) => {
  const statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  return res.status(statusCode).json({
    success: false,
    error: error.message,
  });
};

// ============== QUOTE FUNCTIONS ==============

// Create a new quote
const createQuote = async (req, res) => {
  try {
    const { client, project, items, taxRate, discount } = req.body;

    if (!client || !items || items.length === 0) {
      throw new BadRequestError("Client and at least one item are required");
    }

    const { subtotal, taxAmount, totalAmount, itemsWithTotals } =
      calculateFinancials(items, taxRate || 0, discount || 0);

    const newQuote = await Quote.create({
      ...req.body,
      type: "quote", // Explicitly set type as quote
      items: itemsWithTotals,
      subtotal,
      taxAmount,
      totalAmount,
      architect: req.user.userId,
      status: "draft",
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: newQuote,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all quotes
const getAllQuotes = async (req, res) => {
  try {
    const { status, client } = req.query;
    const filter = {
      architect: req.user.userId,
      type: "quote",
    };

    if (status) filter.status = status;
    if (client) filter.client = client;

    const quotes = await Quote.find(filter)
      .populate("client", "name email")
      .populate("project", "title")
      .sort("-issueDate");

    res.status(StatusCodes.OK).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get single quote
const getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      _id: req.params.id,
      architect: req.user.userId,
      type: "quote",
    }).populate("client project");

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update quote
const updateQuote = async (req, res) => {
  try {
    const { items, taxRate, discount } = req.body;

    let updateData = req.body;

    if (items || taxRate !== undefined || discount !== undefined) {
      const existingQuote = await Quote.findById(req.params.id);

      if (!existingQuote || existingQuote.type !== "quote") {
        throw new NotFoundError("Quote not found");
      }

      const newItems = items || existingQuote.items;
      const newTaxRate =
        taxRate !== undefined ? taxRate : existingQuote.taxRate;
      const newDiscount =
        discount !== undefined ? discount : existingQuote.discount;

      const { subtotal, taxAmount, totalAmount, itemsWithTotals } =
        calculateFinancials(newItems, newTaxRate, newDiscount);

      updateData = {
        ...req.body,
        items: itemsWithTotals,
        subtotal,
        taxAmount,
        totalAmount,
      };
    }

    const updatedQuote = await Quote.findOneAndUpdate(
      {
        _id: req.params.id,
        architect: req.user.userId,
        type: "quote", // Ensure it's a quote
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedQuote) {
      throw new NotFoundError("Quote not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedQuote,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete quote
const deleteQuote = async (req, res) => {
  try {
    const deletedQuote = await Quote.findOneAndDelete({
      _id: req.params.id,
      architect: req.user.userId,
      type: "quote", // Ensure it's a quote
    });

    if (!deletedQuote) {
      throw new NotFoundError("Quote not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Quote deleted successfully",
      data: {},
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Convert quote to invoice
const convertToInvoice = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      _id: req.params.id,
      architect: req.user.userId,
      type: "quote", // Ensure it's a quote
    });

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    // Set due date (default 30 days if not provided)
    const dueDate =
      req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const invoice = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        type: "invoice",
        dueDate,
        paymentStatus: "unpaid",
        status: "sent",
        // Record this conversion in revision history
        $push: {
          revisionHistory: {
            date: new Date(),
            changes: "Converted from quote to invoice",
            revisedBy: req.user.userId,
          },
        },
      },
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ============== INVOICE FUNCTIONS ==============

// Create a new invoice directly
const createInvoice = async (req, res) => {
  try {
    const { client, project, items, taxRate, discount, dueDate } = req.body;

    if (!client || !items || items.length === 0) {
      throw new BadRequestError("Client and at least one item are required");
    }

    const { subtotal, taxAmount, totalAmount, itemsWithTotals } =
      calculateFinancials(items, taxRate || 0, discount || 0);

    // Default due date is 30 days from now if not provided
    const invoiceDueDate =
      dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const newInvoice = await Quote.create({
      ...req.body,
      type: "invoice", // Explicitly set type as invoice
      items: itemsWithTotals,
      subtotal,
      taxAmount,
      totalAmount,
      architect: req.user.userId,
      status: "sent",
      dueDate: invoiceDueDate,
      paymentStatus: "unpaid",
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: newInvoice,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get all invoices
const getAllInvoices = async (req, res) => {
  try {
    const { status, client, paymentStatus } = req.query;
    const filter = {
      architect: req.user.userId,
      type: "invoice", // Only get invoices
    };

    if (status) filter.status = status;
    if (client) filter.client = client;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const invoices = await Quote.find(filter)
      .populate("client", "name email")
      .populate("project", "title")
      .sort("-issueDate");

    res.status(StatusCodes.OK).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Get single invoice
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Quote.findOne({
      _id: req.params.id,
      architect: req.user.userId,
      type: "invoice", // Ensure it's an invoice
    }).populate("client project");

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { items, taxRate, discount, paymentStatus } = req.body;

    // Recalculate financials if items/tax/discount change
    let updateData = req.body;

    if (items || taxRate !== undefined || discount !== undefined) {
      const existingInvoice = await Quote.findById(req.params.id);

      if (!existingInvoice || existingInvoice.type !== "invoice") {
        throw new NotFoundError("Invoice not found");
      }

      const newItems = items || existingInvoice.items;
      const newTaxRate =
        taxRate !== undefined ? taxRate : existingInvoice.taxRate;
      const newDiscount =
        discount !== undefined ? discount : existingInvoice.discount;

      const { subtotal, taxAmount, totalAmount, itemsWithTotals } =
        calculateFinancials(newItems, newTaxRate, newDiscount);

      updateData = {
        ...req.body,
        items: itemsWithTotals,
        subtotal,
        taxAmount,
        totalAmount,
      };
    }

    // Add revision history if applicable
    if (Object.keys(updateData).length > 0) {
      updateData.$push = {
        revisionHistory: {
          date: new Date(),
          changes: "Invoice updated",
          revisedBy: req.user.userId,
        },
      };
    }

    const updatedInvoice = await Quote.findOneAndUpdate(
      {
        _id: req.params.id,
        architect: req.user.userId,
        type: "invoice", // Ensure it's an invoice
      },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedInvoice) {
      throw new NotFoundError("Invoice not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedInvoice,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const deletedInvoice = await Quote.findOneAndDelete({
      _id: req.params.id,
      architect: req.user.userId,
      type: "invoice", // Ensure it's an invoice
    });

    if (!deletedInvoice) {
      throw new NotFoundError("Invoice not found");
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Invoice deleted successfully",
      data: {},
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Record payment for an invoice
const recordPayment = async (req, res) => {
  try {
    const { amount, method } = req.body;

    if (!amount || amount <= 0) {
      throw new BadRequestError("Valid payment amount is required");
    }

    const invoice = await Quote.findOne({
      _id: req.params.id,
      architect: req.user.userId,
      type: "invoice",
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    // Add the new payment
    const payment = {
      amount,
      method: method || "bank_transfer",
      date: new Date(),
    };

    // Calculate total paid amount including the new payment
    const totalPaid =
      invoice.payments.reduce((sum, payment) => sum + payment.amount, 0) +
      amount;

    // Determine new payment status
    let paymentStatus;
    if (totalPaid >= invoice.totalAmount) {
      paymentStatus = "paid";
    } else if (totalPaid > 0) {
      paymentStatus = "partial";
    } else {
      paymentStatus = "unpaid";
    }

    const updatedInvoice = await Quote.findByIdAndUpdate(
      req.params.id,
      {
        $push: { payments: payment },
        paymentStatus,
        status: paymentStatus === "paid" ? "accepted" : invoice.status,
      },
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedInvoice,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ============== SHARED FUNCTIONS ==============

// Generate PDF for quote or invoice
const generatePDF = async (req, res) => {
  try {
    const document = await Quote.findById(req.params.id)
      .populate("client", "name email country address")
      .populate("architect", "companyName phone")
      .populate("project", "title");

    if (!document) {
      throw new NotFoundError("Document not found");
    }

    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(buffers);

      const folderPath =
        document.type === "invoice" ? "./storage/invoices" : "./storage/quotes";
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }

      const pdfPath = `${folderPath}/${document._id}.pdf`;
      fs.writeFileSync(pdfPath, pdfBuffer);

      const pdfUrl =
        document.type === "invoice"
          ? `/invoices/${document._id}.pdf`
          : `/quotes/${document._id}.pdf`;

      await Quote.findByIdAndUpdate(document._id, {
        $addToSet: { attachments: pdfUrl },
      });

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${document.type}_${document._id}.pdf"`,
      });
      res.send(pdfBuffer);
    });

    const formatCurrency = (num) =>
      `${num
        .toFixed(2)
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")
        .replace(".", ",")} TND`;

    const customInvoiceId = `${document.type.toUpperCase()}-${new Date(
      document.issueDate
    ).getFullYear()}/${document._id.toString().slice(-6).toUpperCase()}`;

    // ----------- STATUS COLOR ----------
    let statusColor = "#000000";
    if (document.type === "invoice") {
      switch (document.paymentStatus) {
        case "paid":
          statusColor = "green";
          break;
        case "partial":
          statusColor = "orange";
          break;
        case "unpaid":
        default:
          statusColor = "red";
          break;
      }
    }

    // ----------- HEADER ----------
    doc
      .fontSize(20)
      .text(document.type.toUpperCase(), 50, 45)
      .fontSize(10)
      .text(customInvoiceId, 50, 70);

    if (document.type === "invoice" && document.paymentStatus) {
      doc
        .fillColor(statusColor)
        .text(document.paymentStatus.toUpperCase(), 450, 45, { align: "right" })
        .fillColor("black");
    }

    doc.moveDown();

    // ----------- ARCHITECT INFO ----------
    doc
      .font("Helvetica-Bold")
      .text(
        document.architect.companyName || "Dundill S.A.R.L au capital 40 000 DT"
      )
      .font("Helvetica")
      .text("RUE DE LA REPUBLIQUE")
      .text("Akouda, Sousse, 4022")
      .text("VAT Number: 1781912/K/A/M/000")
      .moveDown();

    // ----------- CLIENT INFO ----------
    doc
      .font("Helvetica-Bold")
      .text("Bill To:")
      .font("Helvetica")
      .text(document.client.name)
      .text(document.client.country || "TN")
      .moveDown();

    // ----------- DATES ----------
    doc.text(`Date: ${new Date(document.issueDate).toLocaleDateString()}`);

    if (document.type === "invoice") {
      doc.text(
        `Due Date: ${
          document.dueDate
            ? new Date(document.dueDate).toLocaleDateString()
            : new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              ).toLocaleDateString()
        }`
      );
    }

    doc.moveDown();

    // ----------- TABLE HEADERS ----------
    const tableTop = 250;
    let y = tableTop;

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("#", 40, y)
      .text("Item", 70, y)
      .text("Qty", 280, y)
      .text("Rate", 350, y)
      .text("Amount", 450, y)
      .font("Helvetica");

    // ----------- TABLE ROWS ----------
    document.items.forEach((item, i) => {
      const posY = y + 25 + i * 25;
      doc
        .fontSize(10)
        .text(i + 1, 40, posY)
        .text(item.description, 70, posY)
        .text(item.quantity.toString(), 280, posY)
        .text(formatCurrency(item.unitPrice), 350, posY)
        .text(formatCurrency(item.total), 450, posY);
    });

    y += 30 + document.items.length * 25;

    // ----------- TOTALS ----------
    doc
      .font("Helvetica-Bold")
      .text("Sub Total", 350, y)
      .text(formatCurrency(document.subtotal), 450, y)
      .text("Total", 350, y + 20)
      .text(formatCurrency(document.totalAmount), 450, y + 20);

    if (document.type === "invoice") {
      doc
        .text("Amount Due", 350, y + 40)
        .text(formatCurrency(document.totalAmount), 450, y + 40);
    }

    y += 80;

    // ----------- BANK PAYMENT INFO ----------
    doc
      .font("Helvetica-Bold")
      .text("Offline Payment:", 50, y)
      .font("Helvetica")
      .text("Banque : Biat", 50, y + 15)
      .text("Titulaire : STE DUNDILL", 50, y + 30)
      .text("IBAN : TN59 0813 0030 0159 0001 0293", 50, y + 45)
      .text("BIC : BIATTNTT", 50, y + 60);

    doc.end();
  } catch (error) {
    console.error("PDF generation error:", error);
    handleError(res, error);
  }
};

module.exports = {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  convertToInvoice,

  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  recordPayment,

  // Shared functions
  generatePDF,
};
