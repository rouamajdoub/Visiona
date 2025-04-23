// controllers/quoteController.js
const Quote = require("../models/Quote");
const Invoice = require("../models/Invoice");
const { NotFoundError, BadRequestError } = require("../utils/customErrors");
const { StatusCodes } = require("http-status-codes");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Helper function to handle errors consistently
const handleError = (res, error) => {
  console.error("Error:", error);

  if (error.name === "ValidationError") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Validation Error",
      errors: Object.values(error.errors).map((err) => err.message),
    });
  }

  if (error.name === "NotFoundError") {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: error.message,
    });
  }

  if (error.name === "BadRequestError") {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Something went wrong, please try again later",
  });
};

// Helper function to calculate financials
const calculateFinancials = (items, taxRate = 0, discount = 0) => {
  // Calculate item totals and subtotal
  const itemsWithTotals = items.map((item) => {
    const total = item.total || item.quantity * item.unitPrice;
    return {
      ...item,
      total: Number(total.toFixed(2)),
    };
  });

  // Calculate subtotal from all items
  const subtotal = Number(
    itemsWithTotals.reduce((sum, item) => sum + item.total, 0).toFixed(2)
  );

  // Calculate tax amount
  const taxAmount = Number(
    ((subtotal - discount) * (taxRate / 100)).toFixed(2)
  );

  // Calculate total amount
  const totalAmount = Number((subtotal - discount + taxAmount).toFixed(2));

  return {
    itemsWithTotals,
    subtotal,
    taxAmount,
    totalAmount,
  };
};

// Create a new quote
const createQuote = async (req, res) => {
  try {
    const {
      client,
      project,
      items,
      taxRate,
      discount,
      clientName,
      projectTitle,
    } = req.body;

    if (
      !client ||
      !clientName ||
      !project ||
      !projectTitle ||
      !items ||
      items.length === 0
    ) {
      throw new BadRequestError(
        "Client, client name, project, project title, and at least one item are required"
      );
    }

    const { subtotal, taxAmount, totalAmount, itemsWithTotals } =
      calculateFinancials(items, taxRate || 0, discount || 0);

    const newQuote = await Quote.create({
      ...req.body,
      items: itemsWithTotals,
      subtotal,
      taxAmount,
      totalAmount,
      architect: req.user.id,
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
    const { status, client, project, search } = req.query;
    const filter = {
      architect: req.user.id,
    };

    if (status) filter.status = status;
    if (client) filter.client = client;
    if (project) filter.project = project;

    // Text search capability
    if (search) {
      filter.$text = { $search: search };
    }

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
      architect: req.user.id,
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

    let updateData = { ...req.body };

    // Find the quote first to ensure it exists and to use existing data if needed
    const existingQuote = await Quote.findOne({
      _id: req.params.id,
      architect: req.user.id,
    });

    if (!existingQuote) {
      throw new NotFoundError("Quote not found");
    }

    // Only recalculate financials if relevant fields are changed
    if (items || taxRate !== undefined || discount !== undefined) {
      const newItems = items || existingQuote.items;
      const newTaxRate =
        taxRate !== undefined ? taxRate : existingQuote.taxRate;
      const newDiscount =
        discount !== undefined ? discount : existingQuote.discount;

      const { subtotal, taxAmount, totalAmount, itemsWithTotals } =
        calculateFinancials(newItems, newTaxRate, newDiscount);

      updateData = {
        ...updateData,
        items: itemsWithTotals,
        subtotal,
        taxAmount,
        totalAmount,
      };
    }

    // Add revision history
    if (!updateData.revisionHistory) {
      updateData.$push = {
        revisionHistory: {
          date: new Date(),
          changes: "Quote updated",
          revisedBy: req.user.id,
        },
      };
    }

    const updatedQuote = await Quote.findOneAndUpdate(
      {
        _id: req.params.id,
        architect: req.user.id,
      },
      updateData,
      { new: true, runValidators: true }
    );

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
      architect: req.user.id,
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
      architect: req.user.id,
    });

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    // Check if this quote has already been converted to an invoice
    if (quote.convertedToInvoice) {
      throw new BadRequestError(
        "This quote has already been converted to an invoice"
      );
    }

    // Set due date (default 30 days if not provided)
    const dueDate =
      req.body.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create a new invoice from the quote
    const invoiceData = {
      client: quote.client,
      clientName: quote.clientName,
      clientAddress: quote.clientAddress,
      architect: quote.architect,
      project: quote.project,
      projectTitle: quote.projectTitle,
      projectDescription: quote.projectDescription,
      items: quote.items,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      discount: quote.discount,
      totalAmount: quote.totalAmount,
      issueDate: new Date(),
      dueDate: dueDate,
      paymentStatus: "unpaid",
      status: "sent",
      termsConditions: quote.termsConditions,
      notes: quote.notes,
      convertedFromQuote: quote._id,
      revisionHistory: [
        {
          date: new Date(),
          changes: "Created from quote",
          revisedBy: req.user.id,
        },
      ],
    };

    const newInvoice = await Invoice.create(invoiceData);

    // Update the quote to record the conversion
    await Quote.findByIdAndUpdate(quote._id, {
      status: "accepted",
      convertedToInvoice: newInvoice._id,
      $push: {
        revisionHistory: {
          date: new Date(),
          changes: "Converted to invoice",
          revisedBy: req.user.id,
        },
      },
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: newInvoice,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Generate PDF for quote
const generatePDF = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      _id: req.params.id,
      architect: req.user.id,
    })
      .populate("client", "name email country address")
      .populate("architect", "companyName phone")
      .populate("project", "title");

    if (!quote) {
      throw new NotFoundError("Quote not found");
    }

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=quote-${quote._id}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

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
      .text("Total", itemStartX + descriptionWidth + 3 * numberColWidth, yPos);

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
  generatePDF,
};
