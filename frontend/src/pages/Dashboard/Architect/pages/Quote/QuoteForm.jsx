import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  createQuote,
  updateQuote,
  fetchQuoteById,
  clearCurrentQuote,
  convertToInvoice,
  generatePDF,
} from "../../../../../redux/slices/quotesSlice";
import { fetchClients } from "../../../../../redux/slices/clientsSlice";
import { fetchAllProjects } from "../../../../../redux/slices/ProjectSlice";
import {
  FaSave,
  FaFileInvoice,
  FaFileDownload,
  FaTimes,
  FaPaperPlane,
  FaPlus,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

const QuoteForm = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentQuote, loading, error, success } = useSelector(
    (state) => state.quotes
  );
  const { clients } = useSelector((state) => state.clients);
  const { projects } = useSelector((state) => state.projects);

  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const [formData, setFormData] = useState({
    client: "",
    clientName: "",
    clientAddress: {
      street: "",
      city: "",
      zipCode: "",
    },
    project: "",
    projectTitle: "",
    projectDescription: "",
    items: [
      {
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        category: "design",
      },
    ],
    taxRate: 0,
    discount: 0,
    subtotal: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: "draft",
    termsConditions: "",
    notes: "",
  });

  // Format currency utility function
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Spinner component
  const Spinner = () => (
    <div className="text-center my-5">
      <FaSpinner className="fa-spin me-2" />
      <span>Loading...</span>
    </div>
  );

  // Confirm modal component
  const ConfirmModal = ({ show, title, message, onHide, onConfirm }) => {
    if (!show) return null;

    return (
      <div
        className="modal show d-block"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title}</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              <p>{message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onHide}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Fetch necessary data
  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchAllProjects());

    if (id) {
      dispatch(fetchQuoteById(id));
    }

    return () => {
      dispatch(clearCurrentQuote());
    };
  }, [dispatch, id]);

  // Populate form when editing
  useEffect(() => {
    if (currentQuote && id) {
      setFormData({
        ...currentQuote,
        client: currentQuote.client?._id || currentQuote.client,
        project: currentQuote.project?._id || currentQuote.project,
      });
    }
  }, [currentQuote, id]);

  // Handle client selection
  useEffect(() => {
    if (formData.client && clients.length > 0) {
      const selectedClient = clients.find(
        (client) => client._id === formData.client
      );
      if (selectedClient) {
        setFormData((prevData) => ({
          ...prevData,
          clientName: selectedClient.name,
          clientAddress: {
            street: selectedClient.address?.street || "",
            city: selectedClient.address?.city || "",
            zipCode: selectedClient.address?.zipCode || "",
          },
        }));
      }
    }
  }, [formData.client, clients]);

  // Handle project selection
  useEffect(() => {
    if (formData.project && projects.length > 0) {
      const selectedProject = projects.find(
        (project) => project._id === formData.project
      );
      if (selectedProject) {
        setFormData((prevData) => ({
          ...prevData,
          projectTitle: selectedProject.title,
          projectDescription: selectedProject.description || "",
        }));
      }
    }
  }, [formData.project, projects]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: { ...formData[parent], [child]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle quote items changes
  const handleItemsChange = (updatedItems) => {
    // Calculate financial values
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0
    );

    const discount = parseFloat(formData.discount) || 0;
    const taxRate = parseFloat(formData.taxRate) || 0;
    const taxAmount = ((subtotal - discount) * (taxRate / 100)).toFixed(2);
    const totalAmount = (subtotal - discount + parseFloat(taxAmount)).toFixed(
      2
    );

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      taxAmount: parseFloat(taxAmount),
      totalAmount: parseFloat(totalAmount),
    });
  };

  // Handle financial values changes
  const handleFinancialChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value) || 0;

    let updatedFormData = { ...formData, [name]: numValue };

    const subtotal = formData.subtotal;
    const discount = name === "discount" ? numValue : formData.discount;
    const taxRate = name === "taxRate" ? numValue : formData.taxRate;

    const taxAmount = ((subtotal - discount) * (taxRate / 100)).toFixed(2);
    const totalAmount = (subtotal - discount + parseFloat(taxAmount)).toFixed(
      2
    );

    updatedFormData = {
      ...updatedFormData,
      taxAmount: parseFloat(taxAmount),
      totalAmount: parseFloat(totalAmount),
    };

    setFormData(updatedFormData);
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();

    if (id) {
      dispatch(updateQuote({ id, quoteData: formData })).then((result) => {
        if (!result.error) {
          navigate(`/quotes/${id}`);
        }
      });
    } else {
      dispatch(createQuote(formData)).then((result) => {
        if (!result.error) {
          navigate(`/quotes/${result.payload.data._id}`);
        }
      });
    }
  };

  // Handle quote status change
  const handleStatusChange = (newStatus) => {
    if (newStatus === "sent") {
      setShowSendModal(true);
    } else {
      updateStatus(newStatus);
    }
  };

  // Update status after confirmation
  const updateStatus = (newStatus) => {
    setFormData({ ...formData, status: newStatus });
    if (id) {
      dispatch(
        updateQuote({
          id,
          quoteData: { status: newStatus },
        })
      );
    }
    setShowSendModal(false);
  };

  // Handle convert to invoice
  const handleConvertToInvoice = () => {
    setShowConvertModal(true);
  };

  // Confirm conversion to invoice
  const confirmConversion = () => {
    dispatch(convertToInvoice(id)).then((result) => {
      if (!result.error) {
        navigate(`/invoices/${result.payload.data._id}`);
      }
      setShowConvertModal(false);
    });
  };

  // Generate PDF for the quote
  const handleGeneratePDF = () => {
    if (id) {
      dispatch(generatePDF(id));
    }
  };

  // Quote Items Table component
  const QuoteItemsTable = () => {
    const handleAddItem = () => {
      const newItems = [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
          category: "design",
        },
      ];
      handleItemsChange(newItems);
    };

    const handleRemoveItem = (index) => {
      const newItems = [...formData.items];
      newItems.splice(index, 1);
      handleItemsChange(newItems);
    };

    const handleItemChange = (index, field, value) => {
      const newItems = [...formData.items];
      newItems[index][field] = value;

      // Calculate item total
      if (field === "quantity" || field === "unitPrice") {
        const quantity =
          field === "quantity" ? value : newItems[index].quantity;
        const unitPrice =
          field === "unitPrice" ? value : newItems[index].unitPrice;
        newItems[index].total = Number((quantity * unitPrice).toFixed(2));
      }

      handleItemsChange(newItems);
    };

    return (
      <div className="quote-items-table">
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th style={{ width: "40%" }}>Description</th>
                <th style={{ width: "15%" }}>Category</th>
                <th style={{ width: "10%" }}>Quantity</th>
                <th style={{ width: "15%" }}>Unit Price</th>
                <th style={{ width: "15%" }}>Total</th>
                <th style={{ width: "5%" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={item.description || ""}
                      onChange={(e) =>
                        handleItemChange(index, "description", e.target.value)
                      }
                      placeholder="Item description"
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={item.category || "design"}
                      onChange={(e) =>
                        handleItemChange(index, "category", e.target.value)
                      }
                    >
                      <option value="design">Design</option>
                      <option value="materials">Materials</option>
                      <option value="labor">Labor</option>
                      <option value="furniture">Furniture</option>
                      <option value="other">Other</option>
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control"
                      value={item.quantity || 0}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "quantity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="1"
                    />
                  </td>
                  <td>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        value={item.unitPrice || 0}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "unitPrice",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        value={item.total || 0}
                        readOnly
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveItem(index)}
                      disabled={formData.items.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="6">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={handleAddItem}
                  >
                    <FaPlus className="me-1" /> Add Item
                  </button>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // Quote Summary component
  const QuoteSummary = () => {
    return (
      <div className="card mb-4">
        <div className="card-header">Quote Summary</div>
        <div className="card-body">
          <div className="quote-summary">
            <div className="row mb-2">
              <div className="col-6 text-end fw-bold">Subtotal:</div>
              <div className="col-6 text-end">
                {formatCurrency(formData.subtotal)}
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-6 text-end fw-bold">Discount:</div>
              <div className="col-6">
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control text-end"
                    name="discount"
                    value={formData.discount || 0}
                    onChange={handleFinancialChange}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-6 text-end fw-bold">Tax Rate:</div>
              <div className="col-6">
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control text-end"
                    name="taxRate"
                    value={formData.taxRate || 0}
                    onChange={handleFinancialChange}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="input-group-text">%</span>
                </div>
              </div>
            </div>

            <div className="row mb-2">
              <div className="col-6 text-end fw-bold">Tax Amount:</div>
              <div className="col-6 text-end">
                {formatCurrency(formData.taxAmount)}
              </div>
            </div>

            <hr />

            <div className="row">
              <div className="col-6 text-end fw-bold">TOTAL:</div>
              <div className="col-6 text-end fw-bold fs-5">
                {formatCurrency(formData.totalAmount)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Check if status is "sent" or above to enable convert button
  const canConvert =
    currentQuote && ["sent", "accepted"].includes(currentQuote.status);

  // Check if already converted
  const isConverted = currentQuote && currentQuote.convertedToInvoice;

  if (loading && !formData.client) {
    return <Spinner />;
  }

  return (
    <div className="quote-form-container p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{id ? "Edit Quote" : "Create New Quote"}</h1>
        <div className="action-buttons">
          {id && (
            <>
              <button
                type="button"
                className="btn btn-outline-secondary me-2"
                onClick={handleGeneratePDF}
                disabled={loading}
              >
                <FaFileDownload className="me-1" /> Download PDF
              </button>
              {!isConverted && (
                <button
                  type="button"
                  className="btn btn-outline-success me-2"
                  onClick={handleConvertToInvoice}
                  disabled={!canConvert || loading}
                >
                  <FaFileInvoice className="me-1" /> Convert to Invoice
                </button>
              )}
              {formData.status === "draft" && (
                <button
                  type="button"
                  className="btn btn-outline-primary me-2"
                  onClick={() => handleStatusChange("sent")}
                  disabled={loading}
                >
                  <FaPaperPlane className="me-1" /> Send Quote
                </button>
              )}
            </>
          )}
          <button
            type="button"
            className="btn btn-outline-danger me-2"
            onClick={() => navigate("/quotes")}
          >
            <FaTimes className="me-1" /> Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            <FaSave className="me-1" /> {id ? "Update" : "Create"} Quote
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">Client & Project Information</div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="client" className="form-label">
                      Client
                    </label>
                    <select
                      className="form-select"
                      id="client"
                      name="client"
                      value={formData.client}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map((client) => (
                        <option key={client._id} value={client._id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="project" className="form-label">
                      Project
                    </label>
                    <select
                      className="form-select"
                      id="project"
                      name="project"
                      value={formData.project}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="clientName" className="form-label">
                    Client Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="clientName"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Client Address</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    name="clientAddress.street"
                    placeholder="Street"
                    value={formData.clientAddress.street}
                    onChange={handleInputChange}
                    readOnly
                  />
                  <div className="row">
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        name="clientAddress.city"
                        placeholder="City"
                        value={formData.clientAddress.city}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                    <div className="col">
                      <input
                        type="text"
                        className="form-control"
                        name="clientAddress.zipCode"
                        placeholder="Zip Code"
                        value={formData.clientAddress.zipCode}
                        onChange={handleInputChange}
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="projectTitle" className="form-label">
                    Project Title
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="projectTitle"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleInputChange}
                    readOnly
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="projectDescription" className="form-label">
                    Project Description
                  </label>
                  <textarea
                    className="form-control"
                    id="projectDescription"
                    name="projectDescription"
                    rows="3"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    readOnly
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">Quote Information</div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <div className="input-group">
                      <select
                        className="form-select"
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={isConverted}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="viewed">Viewed</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                      {isConverted && (
                        <span className="input-group-text bg-success text-white">
                          Converted to Invoice
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="termsConditions" className="form-label">
                    Terms & Conditions
                  </label>
                  <textarea
                    className="form-control"
                    id="termsConditions"
                    name="termsConditions"
                    rows="3"
                    value={formData.termsConditions || ""}
                    onChange={handleInputChange}
                    placeholder="Terms and conditions for this quote"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="notes" className="form-label">
                    Notes
                  </label>
                  <textarea
                    className="form-control"
                    id="notes"
                    name="notes"
                    rows="2"
                    value={formData.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Additional notes or comments"
                  ></textarea>
                </div>
              </div>
            </div>

            <QuoteSummary />
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">Quote Items</div>
          <div className="card-body">
            <QuoteItemsTable />
          </div>
        </div>

        <div className="text-end mb-4">
          <button
            type="button"
            className="btn btn-outline-danger me-2"
            onClick={() => navigate("/quotes")}
          >
            <FaTimes className="me-1" /> Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FaSave className="me-1" /> {id ? "Update" : "Create"} Quote
          </button>
        </div>
      </form>

      {/* Convert to Invoice Confirmation Modal */}
      <ConfirmModal
        show={showConvertModal}
        title="Convert to Invoice"
        message="Are you sure you want to convert this quote to an invoice? This action cannot be undone."
        onHide={() => setShowConvertModal(false)}
        onConfirm={confirmConversion}
      />

      {/* Send Quote Confirmation Modal */}
      <ConfirmModal
        show={showSendModal}
        title="Send Quote"
        message="Are you sure you want to mark this quote as sent? This will update the status and can trigger email notifications if enabled."
        onHide={() => setShowSendModal(false)}
        onConfirm={() => updateStatus("sent")}
      />
    </div>
  );
};

export default QuoteForm;
