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
} = require("../controllers/quoteController");

// Middleware
const { protect } = require("../middlewares/authMiddleware"); // Use protect

router.use(protect);

router.route("/").post(createQuote).get(getAllQuotes);

router.route("/:id").get(getQuoteById).patch(updateQuote).delete(deleteQuote);
router.patch("/:id/convert-to-invoice", convertToInvoice);

// ==== SHARED ROUTES ====
// Generate PDF for a specific quote
router.get("/:id/pdf", generatePDF);

module.exports = router;
