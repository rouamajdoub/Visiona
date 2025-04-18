import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchQuotes,
  createQuote,
  updateQuote,
  deleteQuote,
  convertToInvoice,
  generatePDF,
  setCurrentQuote,
} from "../../../../../redux/slices/quotesInvoicesSlice";
import QuoteForm from "./QuoteForm";
import QuoteDetails from "./QuoteDetails";
// Define the formatting functions directly in this file
const formatCurrency = (amount, locale = "en-US", currency = "USD") => {
  if (!amount && amount !== 0) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (date, locale = "en-US") => {
  if (!date) return "—";
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
      dateObj
    );
  } catch (error) {
    return "—";
  }
};
const Quotes = () => {
  const dispatch = useDispatch();
  const {
    items: quotes,
    loading,
    error,
    currentQuote,
  } = useSelector((state) => state.quotesInvoices.quotes);

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(fetchQuotes());
  }, [dispatch]);

  const handleCreateQuote = (quoteData) => {
    dispatch(createQuote(quoteData)).then(() => {
      setShowForm(false);
    });
  };

  const handleUpdateQuote = (quoteData) => {
    dispatch(updateQuote({ id: currentQuote._id, quoteData })).then(() => {
      setShowForm(false);
      setIsEditing(false);
    });
  };

  const handleDeleteQuote = (id) => {
    if (window.confirm("Are you sure you want to delete this quote?")) {
      dispatch(deleteQuote(id));
    }
  };

  const handleConvertToInvoice = (id) => {
    if (window.confirm("Convert this quote to an invoice?")) {
      dispatch(convertToInvoice(id));
    }
  };

  const handleViewQuote = (quote) => {
    dispatch(setCurrentQuote(quote));
    setShowDetails(true);
  };

  const handleEditQuote = (quote) => {
    dispatch(setCurrentQuote(quote));
    setIsEditing(true);
    setShowForm(true);
  };

  const handleGeneratePDF = (id) => {
    dispatch(generatePDF({ type: "quote", id }));
  };

  // Filter quotes based on search term and status
  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      searchTerm === "" ||
      quote.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote._id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || quote.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading && quotes.length === 0) {
    return <div className="flex justify-center p-8">Loading quotes...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error:{" "}
        {typeof error === "string"
          ? error
          : error?.error || "An unknown error occurred"}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quotes</h1>
        <button
          onClick={() => {
            dispatch(setCurrentQuote(null));
            setIsEditing(false);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Quote
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex mb-6 gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="revised">Revised</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Quotes List */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded">
          No quotes found. Create your first quote!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border text-left">Quote ID</th>
                <th className="py-2 px-4 border text-left">Client</th>
                <th className="py-2 px-4 border text-left">Project</th>
                <th className="py-2 px-4 border text-left">Issue Date</th>
                <th className="py-2 px-4 border text-left">Amount</th>
                <th className="py-2 px-4 border text-left">Status</th>
                <th className="py-2 px-4 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote._id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border">{quote._id.slice(-6)}</td>
                  <td className="py-2 px-4 border">{quote.clientName}</td>
                  <td className="py-2 px-4 border">{quote.projectTitle}</td>
                  <td className="py-2 px-4 border">
                    {formatDate(quote.issueDate)}
                  </td>
                  <td className="py-2 px-4 border">
                    {formatCurrency(quote.totalAmount)}
                  </td>
                  <td className="py-2 px-4 border">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        quote.status === "draft"
                          ? "bg-gray-200"
                          : quote.status === "sent"
                          ? "bg-blue-200 text-blue-800"
                          : quote.status === "accepted"
                          ? "bg-green-200 text-green-800"
                          : quote.status === "rejected"
                          ? "bg-red-200 text-red-800"
                          : quote.status === "revised"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-gray-200"
                      }`}
                    >
                      {quote.status.charAt(0).toUpperCase() +
                        quote.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-2 px-4 border">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewQuote(quote)}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditQuote(quote)}
                        className="text-green-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleGeneratePDF(quote._id)}
                        className="text-purple-600 hover:underline"
                      >
                        PDF
                      </button>
                      <button
                        onClick={() => handleConvertToInvoice(quote._id)}
                        className="text-orange-600 hover:underline"
                      >
                        Convert
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quote Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {isEditing ? "Edit Quote" : "Create New Quote"}
            </h2>
            <QuoteForm
              initialData={isEditing ? currentQuote : null}
              onSubmit={isEditing ? handleUpdateQuote : handleCreateQuote}
              onCancel={() => {
                setShowForm(false);
                setIsEditing(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Quote Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-3xl max-h-screen overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">Quote Details</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
            <QuoteDetails
              quote={currentQuote}
              onEdit={() => {
                setShowDetails(false);
                setIsEditing(true);
                setShowForm(true);
              }}
              onConvert={() => {
                handleConvertToInvoice(currentQuote._id);
                setShowDetails(false);
              }}
              onGeneratePdf={() => {
                handleGeneratePDF(currentQuote._id);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Quotes;
