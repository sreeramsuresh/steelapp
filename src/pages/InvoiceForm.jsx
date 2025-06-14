import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Eye, Download } from 'lucide-react';
import { createInvoice, createCompany, createSteelItem, STEEL_UNITS } from '../types';
import { 
  generateInvoiceNumber, 
  calculateItemAmount, 
  calculateSubtotal, 
  calculateTotalGST, 
  calculateTotal,
  formatCurrency 
} from '../utils/invoiceUtils';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import InvoicePreview from '../components/InvoicePreview';
import { invoiceAPI } from '../config/api';

const InvoiceForm = ({ onSave, existingInvoice }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoice, setInvoice] = useState(() => {
    if (existingInvoice) {
      return existingInvoice;
    }
    
    const newInvoice = createInvoice();
    return newInvoice;
  });

  // Generate invoice number when component mounts
  useEffect(() => {
    if (!existingInvoice) {
      generateNewInvoiceNumber();
    }
  }, [existingInvoice]);

  const generateNewInvoiceNumber = async () => {
    try {
      const response = await invoiceAPI.generateNumber();
      setInvoice(prev => ({
        ...prev,
        invoiceNumber: response.invoice_number
      }));
    } catch (error) {
      console.error('Failed to generate invoice number:', error);
      // Fallback to local generation
      setInvoice(prev => ({
        ...prev,
        invoiceNumber: generateInvoiceNumber()
      }));
    }
  };

  const [company] = useState(createCompany());

  useEffect(() => {
    const subtotal = calculateSubtotal(invoice.items);
    const gstAmount = calculateTotalGST(invoice.items);
    const total = calculateTotal(subtotal, gstAmount);
    
    setInvoice(prev => ({
      ...prev,
      subtotal,
      gstAmount,
      total
    }));
  }, [invoice.items]);

  const handleCustomerChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setInvoice(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [parent]: {
            ...prev.customer[parent],
            [child]: value
          }
        }
      }));
    } else {
      setInvoice(prev => ({
        ...prev,
        customer: {
          ...prev.customer,
          [field]: value
        }
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setInvoice(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      
      if (field === 'quantity' || field === 'rate') {
        newItems[index].amount = calculateItemAmount(newItems[index].quantity, newItems[index].rate);
      }
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const addItem = () => {
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, createSteelItem()]
    }));
  };

  const removeItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      if (existingInvoice) {
        await invoiceAPI.update(existingInvoice.id, invoice);
        alert('Invoice updated successfully!');
      } else {
        await invoiceAPI.create(invoice);
        alert('Invoice created successfully!');
      }
      if (onSave) {
        onSave(invoice);
      }
    } catch (error) {
      console.error('Failed to save invoice:', error);
      alert('Failed to save invoice. Please try again.');
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      await generateInvoicePDF(invoice, company);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (showPreview) {
    return (
      <InvoicePreview 
        invoice={invoice} 
        company={company}
        onClose={() => setShowPreview(false)} 
      />
    );
  }

  return (
    <div className="invoice-form">
      <div className="form-header">
        <h1>{existingInvoice ? 'Edit Invoice' : 'Create New Invoice'}</h1>
        <div className="form-actions">
          <button 
            onClick={() => setShowPreview(true)}
            className="btn btn-secondary"
          >
            <Eye size={18} />
            Preview
          </button>
          <button 
            onClick={handleDownloadPDF}
            className={`btn btn-secondary ${isGeneratingPDF ? 'btn-loading' : ''}`}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <div className="spinner" />
            ) : (
              <Download size={18} />
            )}
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>
          <button 
            onClick={handleSave}
            className="btn btn-primary"
          >
            <Save size={18} />
            Save Invoice
          </button>
        </div>
      </div>

      <div className="form-grid">
        <div className="invoice-details">
          <h3>Invoice Details</h3>
          <div className="form-group">
            <label>Invoice Number</label>
            <input
              type="text"
              value={invoice.invoiceNumber}
              onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={invoice.date}
                onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className="customer-details">
          <h3>Customer Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Customer Name</label>
              <input
                type="text"
                value={invoice.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={invoice.customer.gstNumber}
                onChange={(e) => handleCustomerChange('gstNumber', e.target.value)}
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={invoice.customer.email}
                onChange={(e) => handleCustomerChange('email', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={invoice.customer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              placeholder="Street Address"
              value={invoice.customer.address.street}
              onChange={(e) => handleCustomerChange('address.street', e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                placeholder="City"
                value={invoice.customer.address.city}
                onChange={(e) => handleCustomerChange('address.city', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="State"
                value={invoice.customer.address.state}
                onChange={(e) => handleCustomerChange('address.state', e.target.value)}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                placeholder="ZIP Code"
                value={invoice.customer.address.zipCode}
                onChange={(e) => handleCustomerChange('address.zipCode', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="items-section">
        <div className="items-header">
          <h3>Steel Items</h3>
          <button onClick={addItem} className="btn btn-secondary">
            <Plus size={18} />
            Add Item
          </button>
        </div>
        
        <div className="items-table">
          <div className="table-header">
            <div>Item Name</div>
            <div>Specification</div>
            <div>HSN Code</div>
            <div>Unit</div>
            <div>Qty</div>
            <div>Rate</div>
            <div>GST %</div>
            <div>Amount</div>
            <div>Action</div>
          </div>
          
          {invoice.items.map((item, index) => (
            <div key={item.id} className="table-row">
              <input
                type="text"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                placeholder="e.g., MS Round Bar"
              />
              <input
                type="text"
                value={item.specification}
                onChange={(e) => handleItemChange(index, 'specification', e.target.value)}
                placeholder="e.g., 12mm dia"
              />
              <input
                type="text"
                value={item.hsnCode}
                onChange={(e) => handleItemChange(index, 'hsnCode', e.target.value)}
                placeholder="HSN Code"
              />
              <select
                value={item.unit}
                onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
              >
                {STEEL_UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
              <input
                type="number"
                value={item.rate}
                onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
              />
              <input
                type="number"
                value={item.gstRate}
                onChange={(e) => handleItemChange(index, 'gstRate', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
              />
              <div className="amount">{formatCurrency(item.amount)}</div>
              <button
                onClick={() => removeItem(index)}
                className="btn btn-danger"
                disabled={invoice.items.length === 1}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="invoice-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>{formatCurrency(invoice.subtotal)}</span>
        </div>
        <div className="summary-row">
          <span>GST Amount:</span>
          <span>{formatCurrency(invoice.gstAmount)}</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>{formatCurrency(invoice.total)}</span>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Notes</label>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes..."
          />
        </div>
        <div className="form-group">
          <label>Terms & Conditions</label>
          <textarea
            value={invoice.terms}
            onChange={(e) => setInvoice(prev => ({ ...prev, terms: e.target.value }))}
            placeholder="Payment terms..."
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;