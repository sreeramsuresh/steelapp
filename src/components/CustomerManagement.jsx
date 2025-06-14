import React, { useState, useEffect } from 'react';
import { customerAPI } from '../config/api';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  History,
  BarChart3,
  Filter,
  Save,
  X,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('profiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showContactHistory, setShowContactHistory] = useState(false);
  const [contactHistoryCustomer, setContactHistoryCustomer] = useState(null);

  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    creditLimit: 0,
    currentCredit: 0,
    status: 'active'
  });

  const [newContact, setNewContact] = useState({
    type: 'call',
    subject: '',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const response = await customerAPI.getAll();
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Failed to load customers:', error);
      alert('Failed to load customers. Please try again.');
    }
  };


  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || customer.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddCustomer = async () => {
    try {
      await customerAPI.create(newCustomer);
      await loadCustomers();
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
        creditLimit: 0,
        currentCredit: 0,
        status: 'active'
      });
      setShowAddModal(false);
      alert('Customer added successfully!');
    } catch (error) {
      console.error('Failed to add customer:', error);
      alert('Failed to add customer. Please try again.');
    }
  };

  const handleEditCustomer = async () => {
    try {
      await customerAPI.update(selectedCustomer.id, selectedCustomer);
      await loadCustomers();
      setShowEditModal(false);
      setSelectedCustomer(null);
      alert('Customer updated successfully!');
    } catch (error) {
      console.error('Failed to update customer:', error);
      alert('Failed to update customer. Please try again.');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customerAPI.delete(customerId);
        await loadCustomers();
        alert('Customer deleted successfully!');
      } catch (error) {
        console.error('Failed to delete customer:', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  const openContactHistory = (customer) => {
    setContactHistoryCustomer(customer);
    setShowContactHistory(true);
  };

  const addContactEntry = async () => {
    try {
      const contactData = {
        customer_id: contactHistoryCustomer.id,
        ...newContact
      };
      await customerAPI.addContact(contactData);
      
      // Reload customer with updated contact history
      const response = await customerAPI.getById(contactHistoryCustomer.id);
      setContactHistoryCustomer(response.data);
      
      // Update the customers list
      await loadCustomers();
      
      setNewContact({
        type: 'call',
        subject: '',
        notes: '',
        date: new Date().toISOString().split('T')[0]
      });
      alert('Contact entry added successfully!');
    } catch (error) {
      console.error('Failed to add contact entry:', error);
      alert('Failed to add contact entry. Please try again.');
    }
  };

  const [analytics, setAnalytics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalCreditLimit: 0,
    totalCreditUsed: 0,
    availableCredit: 0,
    avgCreditUtilization: 0
  });

  const loadAnalytics = async () => {
    try {
      const response = await customerAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [activeTab]);

  const renderProfiles = () => (
    <div className="customer-profiles">
      <div className="profiles-header">
        <div className="profiles-controls">
          <div className="search-filter-group">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            Add Customer
          </button>
        </div>
      </div>

      <div className="customers-grid">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <p className="company">{customer.company}</p>
                <span className={`status-badge status-${customer.status}`}>
                  {customer.status}
                </span>
              </div>
              <div className="customer-actions">
                <button
                  className="btn-icon"
                  onClick={() => openContactHistory(customer)}
                  title="Contact History"
                >
                  <History size={16} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => {
                    setSelectedCustomer(customer);
                    setShowEditModal(true);
                  }}
                  title="Edit Customer"
                >
                  <Edit size={16} />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDeleteCustomer(customer.id)}
                  title="Delete Customer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="customer-details">
              <div className="detail-item">
                <Mail size={16} />
                <span>{customer.email}</span>
              </div>
              <div className="detail-item">
                <Phone size={16} />
                <span>{customer.phone}</span>
              </div>
              <div className="detail-item">
                <MapPin size={16} />
                <span>{customer.address}</span>
              </div>
            </div>

            <div className="credit-info">
              <div className="credit-item">
                <span className="credit-label">Credit Limit</span>
                <span className="credit-value">₹{customer.creditLimit.toLocaleString()}</span>
              </div>
              <div className="credit-item">
                <span className="credit-label">Used</span>
                <span className="credit-value">₹{customer.currentCredit.toLocaleString()}</span>
              </div>
              <div className="credit-utilization">
                <div className="utilization-bar">
                  <div 
                    className="utilization-fill"
                    style={{ 
                      width: `${customer.creditLimit > 0 ? (customer.currentCredit / customer.creditLimit) * 100 : 0}%` 
                    }}
                  />
                </div>
                <span className="utilization-text">
                  {customer.creditLimit > 0 ? Math.round((customer.currentCredit / customer.creditLimit) * 100) : 0}% used
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="customer-analytics">
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="card-header">
            <Users size={24} />
            <h3>Total Customers</h3>
          </div>
          <div className="card-value">{analytics.totalCustomers}</div>
          <div className="card-subtitle">
            {analytics.activeCustomers} active customers
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <CreditCard size={24} />
            <h3>Total Credit Limit</h3>
          </div>
          <div className="card-value">₹{analytics.totalCreditLimit.toLocaleString()}</div>
          <div className="card-subtitle">
            Across all customers
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <DollarSign size={24} />
            <h3>Credit Utilized</h3>
          </div>
          <div className="card-value">₹{analytics.totalCreditUsed.toLocaleString()}</div>
          <div className="card-subtitle">
            {Math.round(analytics.avgCreditUtilization)}% average utilization
          </div>
        </div>

        <div className="analytics-card">
          <div className="card-header">
            <TrendingUp size={24} />
            <h3>Available Credit</h3>
          </div>
          <div className="card-value">₹{analytics.availableCredit.toLocaleString()}</div>
          <div className="card-subtitle">
            Ready to be utilized
          </div>
        </div>
      </div>

      <div className="analytics-charts">
        <div className="chart-card">
          <h3>Credit Utilization by Customer</h3>
          <div className="chart-content">
            {customers.map(customer => (
              <div key={customer.id} className="utilization-row">
                <div className="customer-name">{customer.name}</div>
                <div className="utilization-visual">
                  <div className="utilization-bar-large">
                    <div 
                      className="utilization-fill"
                      style={{ 
                        width: `${customer.creditLimit > 0 ? (customer.currentCredit / customer.creditLimit) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <span className="utilization-percentage">
                    {customer.creditLimit > 0 ? Math.round((customer.currentCredit / customer.creditLimit) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="customer-management">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Users size={28} />
            Customer Management
          </h1>
          <p>Manage customer profiles, contact history, and credit limits</p>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'profiles' ? 'active' : ''}`}
          onClick={() => setActiveTab('profiles')}
        >
          <Users size={20} />
          Customer Profiles
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={20} />
          Analytics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profiles' && renderProfiles()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add New Customer</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    placeholder="Enter address"
                  />
                </div>
                <div className="form-group">
                  <label>Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={newCustomer.creditLimit}
                    onChange={(e) => setNewCustomer({...newCustomer, creditLimit: Number(e.target.value)})}
                    placeholder="Enter credit limit"
                  />
                </div>
                <div className="form-group">
                  <label>Current Credit Used (₹)</label>
                  <input
                    type="number"
                    value={newCustomer.currentCredit}
                    onChange={(e) => setNewCustomer({...newCustomer, currentCredit: Number(e.target.value)})}
                    placeholder="Enter current credit used"
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={newCustomer.status}
                    onChange={(e) => setNewCustomer({...newCustomer, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddCustomer}>
                <Save size={20} />
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Customer</h2>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input
                    type="text"
                    value={selectedCustomer.company}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, company: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={selectedCustomer.phone}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, phone: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={selectedCustomer.address}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, address: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={selectedCustomer.creditLimit}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, creditLimit: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Current Credit Used (₹)</label>
                  <input
                    type="number"
                    value={selectedCustomer.currentCredit}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, currentCredit: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={selectedCustomer.status}
                    onChange={(e) => setSelectedCustomer({...selectedCustomer, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleEditCustomer}>
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact History Modal */}
      {showContactHistory && contactHistoryCustomer && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>Contact History - {contactHistoryCustomer.name}</h2>
              <button className="btn-icon" onClick={() => setShowContactHistory(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="contact-history-section">
                <h3>Add New Contact Entry</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={newContact.type}
                      onChange={(e) => setNewContact({...newContact, type: e.target.value})}
                    >
                      <option value="call">Phone Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={newContact.date}
                      onChange={(e) => setNewContact({...newContact, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Subject</label>
                    <input
                      type="text"
                      value={newContact.subject}
                      onChange={(e) => setNewContact({...newContact, subject: e.target.value})}
                      placeholder="Enter contact subject"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Notes</label>
                    <textarea
                      value={newContact.notes}
                      onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                      placeholder="Enter contact notes"
                      rows={3}
                    />
                  </div>
                </div>
                <button className="btn-primary" onClick={addContactEntry}>
                  <Plus size={20} />
                  Add Contact Entry
                </button>
              </div>

              <div className="contact-history-list">
                <h3>Contact History</h3>
                {contactHistoryCustomer.contactHistory && contactHistoryCustomer.contactHistory.length > 0 ? (
                  <div className="history-items">
                    {contactHistoryCustomer.contactHistory.map(contact => (
                      <div key={contact.id} className="history-item">
                        <div className="history-header">
                          <div className="contact-type">
                            {contact.type === 'call' && <Phone size={16} />}
                            {contact.type === 'email' && <Mail size={16} />}
                            {contact.type === 'meeting' && <Calendar size={16} />}
                            {contact.type === 'other' && <AlertCircle size={16} />}
                            <span className="type-text">{contact.type}</span>
                          </div>
                          <span className="contact-date">{format(new Date(contact.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <h4>{contact.subject}</h4>
                        <p>{contact.notes}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <History size={48} />
                    <p>No contact history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;