import React, { useState } from 'react';
import { Edit, Eye, Download, Trash2, Search, FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../utils/invoiceUtils';
import { generateInvoicePDF } from '../utils/pdfGenerator';
import { createCompany } from '../types';

const InvoiceList = ({ invoices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [downloadingIds, setDownloadingIds] = useState(new Set());

  const company = createCompany();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'status-draft',
      sent: 'status-sent',
      paid: 'status-paid',
      overdue: 'status-overdue'
    };
    
    return <span className={`status-badge ${statusClasses[status]}`}>{status.toUpperCase()}</span>;
  };

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
  };

  const handleDownloadPDF = async (invoice) => {
    if (downloadingIds.has(invoice.id)) return;
    
    setDownloadingIds(prev => new Set(prev).add(invoice.id));
    
    try {
      await generateInvoicePDF(invoice, company);
    } catch (error) {
      alert(error.message);
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(invoice.id);
        return newSet;
      });
    }
  };

  const handleBulkDownload = async () => {
    if (filteredInvoices.length === 0) return;
    
    const confirmed = window.confirm(`Download PDFs for all ${filteredInvoices.length} invoices?`);
    if (!confirmed) return;

    for (const invoice of filteredInvoices) {
      try {
        await generateInvoicePDF(invoice, company);
        // Add a small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to download ${invoice.invoiceNumber}:`, error);
      }
    }
    
    alert(`Downloaded ${filteredInvoices.length} invoice PDFs`);
  };

  if (invoices.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Invoices Yet</h2>
        <p>Create your first invoice to get started</p>
        <Link to="/" className="btn btn-primary">Create Invoice</Link>
      </div>
    );
  }

  return (
    <div className="invoice-list">
      <div className="list-header">
        <div className="list-header-content">
          <h1>All Invoices</h1>
          {filteredInvoices.length > 0 && (
            <button 
              onClick={handleBulkDownload}
              className="btn btn-secondary"
              title="Download all invoices as PDF"
            >
              <FileDown size={18} />
              Download All PDFs
            </button>
          )}
        </div>
        <div className="list-stats">
          <div className="stat">
            <span className="stat-value">{filteredInvoices.length}</span>
            <span className="stat-label">Invoices</span>
          </div>
          <div className="stat">
            <span className="stat-value">{formatCurrency(getTotalAmount())}</span>
            <span className="stat-label">Total Value</span>
          </div>
        </div>
      </div>

      <div className="list-filters">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      <div className="invoices-table">
        <div className="table-header">
          <div>Invoice #</div>
          <div>Customer</div>
          <div>Date</div>
          <div>Due Date</div>
          <div>Amount</div>
          <div>Status</div>
          <div>Actions</div>
        </div>
        
        {filteredInvoices.map((invoice) => (
          <div key={invoice.id} className="table-row">
            <div className="invoice-number">{invoice.invoiceNumber}</div>
            <div className="customer-info">
              <div className="customer-name">{invoice.customer.name}</div>
              <div className="customer-email">{invoice.customer.email}</div>
            </div>
            <div>{formatDate(invoice.date)}</div>
            <div>{formatDate(invoice.dueDate)}</div>
            <div className="amount">{formatCurrency(invoice.total)}</div>
            <div>{getStatusBadge(invoice.status)}</div>
            <div className="actions">
              <Link 
                to={`/edit/${invoice.id}`}
                className="action-btn"
                title="Edit Invoice"
              >
                <Edit size={16} />
              </Link>
              <button 
                className="action-btn"
                title="View Invoice"
                onClick={() => {/* TODO: Implement view */}}
              >
                <Eye size={16} />
              </button>
              <button 
                className={`action-btn ${downloadingIds.has(invoice.id) ? 'action-btn-loading' : ''}`}
                title="Download PDF"
                onClick={() => handleDownloadPDF(invoice)}
                disabled={downloadingIds.has(invoice.id)}
              >
                {downloadingIds.has(invoice.id) ? (
                  <div className="spinner" />
                ) : (
                  <Download size={16} />
                )}
              </button>
              <button 
                className="action-btn danger"
                title="Delete Invoice"
                onClick={() => {/* TODO: Implement delete */}}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredInvoices.length === 0 && invoices.length > 0 && (
        <div className="no-results">
          <p>No invoices match your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;