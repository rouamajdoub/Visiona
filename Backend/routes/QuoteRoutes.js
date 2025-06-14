const express = require("express");
const router = express.Router();
const {
  createQuote,
  getAllQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  convertToInvoice,
  generatePDF,
  sendQuoteEmail,
} = require("../controllers/quoteController");

// Middleware
const { protect } = require("../middlewares/authMiddleware"); // Use protect

router.use(protect);

router.route("/").post(createQuote).get(getAllQuotes);

router.route("/:id").get(getQuoteById).patch(updateQuote).delete(deleteQuote);
router.patch("/:id/convert-to-invoice", convertToInvoice);

// ==== EMAIL ROUTES ====
// Send quote to client via email
router.post("/:id/send-email", sendQuoteEmail);

// ==== SHARED ROUTES ====
// Generate PDF for a specific quote
router.get("/:id/pdf", generatePDF);

module.exports = router;
