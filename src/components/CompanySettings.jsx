import React, { useState, useEffect } from 'react';
import { 
  Settings,
  Building,
  FileText,
  Calculator,
  Users,
  Save,
  Upload,
  Edit,
  Trash2,
  Plus,
  X,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Phone,
  MapPin,
  Globe,
  Palette,
  Download,
  Copy,
  CheckCircle,
  AlertCircle,
  Camera
} from 'lucide-react';

const CompanySettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [companyProfile, setCompanyProfile] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    phone: '',
    email: '',
    website: '',
    gstNumber: '',
    panNumber: '',
    logo: null,
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    }
  });

  const [invoiceSettings, setInvoiceSettings] = useState({
    templateStyle: 'modern',
    primaryColor: '#2563eb',
    showLogo: true,
    showBankDetails: true,
    footer: '',
    terms: '',
    invoiceNumberFormat: 'INV-{YYYY}-{MM}-{###}',
    dueDays: 30
  });

  const [taxSettings, setTaxSettings] = useState([]);
  const [users, setUsers] = useState([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddTaxModal, setShowAddTaxModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
    permissions: {
      invoices: { create: false, read: false, update: false, delete: false },
      customers: { create: false, read: false, update: false, delete: false },
      products: { create: false, read: false, update: false, delete: false },
      analytics: { read: false },
      settings: { read: false, update: false }
    }
  });

  const [newTax, setNewTax] = useState({
    name: '',
    rate: 0,
    type: 'percentage',
    description: '',
    active: true
  });

  const [showPassword, setShowPassword] = useState(false);

  const templateStyles = [
    { id: 'modern', name: 'Modern', description: 'Clean and professional design' },
    { id: 'classic', name: 'Classic', description: 'Traditional business format' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant layout' },
    { id: 'detailed', name: 'Detailed', description: 'Comprehensive information display' }
  ];

  const userRoles = [
    { id: 'admin', name: 'Administrator', description: 'Full system access' },
    { id: 'manager', name: 'Manager', description: 'Manage operations and view reports' },
    { id: 'user', name: 'User', description: 'Basic access to create invoices' },
    { id: 'viewer', name: 'Viewer', description: 'Read-only access' }
  ];

  useEffect(() => {
    // Load saved settings
    const savedProfile = localStorage.getItem('steel-app-company-profile');
    const savedInvoiceSettings = localStorage.getItem('steel-app-invoice-settings');
    const savedTaxSettings = localStorage.getItem('steel-app-tax-settings');
    const savedUsers = localStorage.getItem('steel-app-users');

    if (savedProfile) {
      setCompanyProfile(JSON.parse(savedProfile));
    } else {
      // Default company profile
      const defaultProfile = {
        name: 'Steel Industries Ltd',
        address: '123 Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India',
        phone: '+91-9876543210',
        email: 'info@steelindustries.com',
        website: 'www.steelindustries.com',
        gstNumber: '27AABCU9603R1ZM',
        panNumber: 'AABCU9603R',
        logo: null,
        bankDetails: {
          bankName: 'State Bank of India',
          accountNumber: '1234567890123456',
          ifscCode: 'SBIN0001234',
          accountHolderName: 'Steel Industries Ltd'
        }
      };
      setCompanyProfile(defaultProfile);
    }

    if (savedInvoiceSettings) {
      setInvoiceSettings(JSON.parse(savedInvoiceSettings));
    }

    if (savedTaxSettings) {
      setTaxSettings(JSON.parse(savedTaxSettings));
    } else {
      // Default tax settings
      const defaultTaxes = [
        { id: '1', name: 'CGST', rate: 9, type: 'percentage', description: 'Central Goods and Services Tax', active: true },
        { id: '2', name: 'SGST', rate: 9, type: 'percentage', description: 'State Goods and Services Tax', active: true },
        { id: '3', name: 'IGST', rate: 18, type: 'percentage', description: 'Integrated Goods and Services Tax', active: true }
      ];
      setTaxSettings(defaultTaxes);
    }

    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Default users
      const defaultUsers = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@steelindustries.com',
          role: 'admin',
          status: 'active',
          createdAt: '2024-01-01',
          lastLogin: '2024-12-14',
          permissions: {
            invoices: { create: true, read: true, update: true, delete: true },
            customers: { create: true, read: true, update: true, delete: true },
            products: { create: true, read: true, update: true, delete: true },
            analytics: { read: true },
            settings: { read: true, update: true }
          }
        },
        {
          id: '2',
          name: 'Sales Manager',
          email: 'manager@steelindustries.com',
          role: 'manager',
          status: 'active',
          createdAt: '2024-02-15',
          lastLogin: '2024-12-13',
          permissions: {
            invoices: { create: true, read: true, update: true, delete: false },
            customers: { create: true, read: true, update: true, delete: false },
            products: { create: false, read: true, update: false, delete: false },
            analytics: { read: true },
            settings: { read: false, update: false }
          }
        }
      ];
      setUsers(defaultUsers);
    }
  }, []);

  const saveCompanyProfile = () => {
    localStorage.setItem('steel-app-company-profile', JSON.stringify(companyProfile));
    alert('Company profile saved successfully!');
  };

  const saveInvoiceSettings = () => {
    localStorage.setItem('steel-app-invoice-settings', JSON.stringify(invoiceSettings));
    alert('Invoice settings saved successfully!');
  };

  const saveTaxSettings = () => {
    localStorage.setItem('steel-app-tax-settings', JSON.stringify(taxSettings));
  };

  const saveUsers = () => {
    localStorage.setItem('steel-app-users', JSON.stringify(users));
  };

  const handleAddUser = () => {
    const user = {
      ...newUser,
      id: Date.now().toString(),
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: null
    };
    const updatedUsers = [...users, user];
    setUsers(updatedUsers);
    saveUsers();
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      password: '',
      permissions: {
        invoices: { create: false, read: false, update: false, delete: false },
        customers: { create: false, read: false, update: false, delete: false },
        products: { create: false, read: false, update: false, delete: false },
        analytics: { read: false },
        settings: { read: false, update: false }
      }
    });
    setShowAddUserModal(false);
  };

  const handleAddTax = () => {
    const tax = {
      ...newTax,
      id: Date.now().toString()
    };
    const updatedTaxes = [...taxSettings, tax];
    setTaxSettings(updatedTaxes);
    saveTaxSettings();
    setNewTax({
      name: '',
      rate: 0,
      type: 'percentage',
      description: '',
      active: true
    });
    setShowAddTaxModal(false);
  };

  const toggleTaxActive = (taxId) => {
    const updatedTaxes = taxSettings.map(tax =>
      tax.id === taxId ? { ...tax, active: !tax.active } : tax
    );
    setTaxSettings(updatedTaxes);
    saveTaxSettings();
  };

  const deleteTax = (taxId) => {
    if (window.confirm('Are you sure you want to delete this tax setting?')) {
      const updatedTaxes = taxSettings.filter(tax => tax.id !== taxId);
      setTaxSettings(updatedTaxes);
      saveTaxSettings();
    }
  };

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map(user =>
      user.id === userId ? { 
        ...user, 
        status: user.status === 'active' ? 'inactive' : 'active' 
      } : user
    );
    setUsers(updatedUsers);
    saveUsers();
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      saveUsers();
    }
  };

  const handleRoleChange = (role) => {
    let permissions = {
      invoices: { create: false, read: false, update: false, delete: false },
      customers: { create: false, read: false, update: false, delete: false },
      products: { create: false, read: false, update: false, delete: false },
      analytics: { read: false },
      settings: { read: false, update: false }
    };

    switch (role) {
      case 'admin':
        permissions = {
          invoices: { create: true, read: true, update: true, delete: true },
          customers: { create: true, read: true, update: true, delete: true },
          products: { create: true, read: true, update: true, delete: true },
          analytics: { read: true },
          settings: { read: true, update: true }
        };
        break;
      case 'manager':
        permissions = {
          invoices: { create: true, read: true, update: true, delete: false },
          customers: { create: true, read: true, update: true, delete: false },
          products: { create: false, read: true, update: false, delete: false },
          analytics: { read: true },
          settings: { read: false, update: false }
        };
        break;
      case 'user':
        permissions = {
          invoices: { create: true, read: true, update: false, delete: false },
          customers: { create: false, read: true, update: false, delete: false },
          products: { create: false, read: true, update: false, delete: false },
          analytics: { read: false },
          settings: { read: false, update: false }
        };
        break;
      case 'viewer':
        permissions = {
          invoices: { create: false, read: true, update: false, delete: false },
          customers: { create: false, read: true, update: false, delete: false },
          products: { create: false, read: true, update: false, delete: false },
          analytics: { read: true },
          settings: { read: false, update: false }
        };
        break;
    }

    setNewUser({ ...newUser, role, permissions });
  };

  const renderProfile = () => (
    <div className="profile-settings">
      <div className="settings-header">
        <h3>Company Profile</h3>
        <button className="btn-primary" onClick={saveCompanyProfile}>
          <Save size={16} />
          Save Profile
        </button>
      </div>

      <div className="profile-form">
        <div className="logo-section">
          <h4>Company Logo</h4>
          <div className="logo-upload">
            <div className="logo-preview">
              {companyProfile.logo ? (
                <img src={companyProfile.logo} alt="Company Logo" />
              ) : (
                <div className="logo-placeholder">
                  <Camera size={32} />
                  <span>Upload Logo</span>
                </div>
              )}
            </div>
            <button className="btn-secondary">
              <Upload size={16} />
              Upload Logo
            </button>
          </div>
        </div>

        <div className="form-section">
          <h4>Basic Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={companyProfile.name}
                onChange={(e) => setCompanyProfile({...companyProfile, name: e.target.value})}
                placeholder="Enter company name"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={companyProfile.email}
                onChange={(e) => setCompanyProfile({...companyProfile, email: e.target.value})}
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={companyProfile.phone}
                onChange={(e) => setCompanyProfile({...companyProfile, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={companyProfile.website}
                onChange={(e) => setCompanyProfile({...companyProfile, website: e.target.value})}
                placeholder="Enter website URL"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Address Information</h4>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Street Address</label>
              <input
                type="text"
                value={companyProfile.address}
                onChange={(e) => setCompanyProfile({...companyProfile, address: e.target.value})}
                placeholder="Enter street address"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                value={companyProfile.city}
                onChange={(e) => setCompanyProfile({...companyProfile, city: e.target.value})}
                placeholder="Enter city"
              />
            </div>
            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                value={companyProfile.state}
                onChange={(e) => setCompanyProfile({...companyProfile, state: e.target.value})}
                placeholder="Enter state"
              />
            </div>
            <div className="form-group">
              <label>ZIP Code</label>
              <input
                type="text"
                value={companyProfile.zipCode}
                onChange={(e) => setCompanyProfile({...companyProfile, zipCode: e.target.value})}
                placeholder="Enter ZIP code"
              />
            </div>
            <div className="form-group">
              <label>Country</label>
              <select
                value={companyProfile.country}
                onChange={(e) => setCompanyProfile({...companyProfile, country: e.target.value})}
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Tax Information</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>GST Number</label>
              <input
                type="text"
                value={companyProfile.gstNumber}
                onChange={(e) => setCompanyProfile({...companyProfile, gstNumber: e.target.value})}
                placeholder="Enter GST number"
              />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input
                type="text"
                value={companyProfile.panNumber}
                onChange={(e) => setCompanyProfile({...companyProfile, panNumber: e.target.value})}
                placeholder="Enter PAN number"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h4>Bank Details</h4>
          <div className="form-grid">
            <div className="form-group">
              <label>Bank Name</label>
              <input
                type="text"
                value={companyProfile.bankDetails.bankName}
                onChange={(e) => setCompanyProfile({
                  ...companyProfile,
                  bankDetails: {...companyProfile.bankDetails, bankName: e.target.value}
                })}
                placeholder="Enter bank name"
              />
            </div>
            <div className="form-group">
              <label>Account Number</label>
              <input
                type="text"
                value={companyProfile.bankDetails.accountNumber}
                onChange={(e) => setCompanyProfile({
                  ...companyProfile,
                  bankDetails: {...companyProfile.bankDetails, accountNumber: e.target.value}
                })}
                placeholder="Enter account number"
              />
            </div>
            <div className="form-group">
              <label>IFSC Code</label>
              <input
                type="text"
                value={companyProfile.bankDetails.ifscCode}
                onChange={(e) => setCompanyProfile({
                  ...companyProfile,
                  bankDetails: {...companyProfile.bankDetails, ifscCode: e.target.value}
                })}
                placeholder="Enter IFSC code"
              />
            </div>
            <div className="form-group">
              <label>Account Holder Name</label>
              <input
                type="text"
                value={companyProfile.bankDetails.accountHolderName}
                onChange={(e) => setCompanyProfile({
                  ...companyProfile,
                  bankDetails: {...companyProfile.bankDetails, accountHolderName: e.target.value}
                })}
                placeholder="Enter account holder name"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoiceTemplates = () => (
    <div className="invoice-templates">
      <div className="settings-header">
        <h3>Invoice Templates</h3>
        <button className="btn-primary" onClick={saveInvoiceSettings}>
          <Save size={16} />
          Save Settings
        </button>
      </div>

      <div className="template-settings">
        <div className="template-styles">
          <h4>Template Style</h4>
          <div className="styles-grid">
            {templateStyles.map(style => (
              <div
                key={style.id}
                className={`style-card ${invoiceSettings.templateStyle === style.id ? 'selected' : ''}`}
                onClick={() => setInvoiceSettings({...invoiceSettings, templateStyle: style.id})}
              >
                <div className="style-preview">
                  <div className="preview-content">
                    <div className="preview-header" style={{ backgroundColor: invoiceSettings.primaryColor }}></div>
                    <div className="preview-body">
                      <div className="preview-line"></div>
                      <div className="preview-line short"></div>
                      <div className="preview-line"></div>
                    </div>
                  </div>
                </div>
                <div className="style-info">
                  <h5>{style.name}</h5>
                  <p>{style.description}</p>
                </div>
                {invoiceSettings.templateStyle === style.id && (
                  <CheckCircle size={20} className="style-selected" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="customization-options">
          <div className="option-section">
            <h4>Customization</h4>
            <div className="form-grid">
              <div className="form-group">
                <label>Primary Color</label>
                <div className="color-input">
                  <input
                    type="color"
                    value={invoiceSettings.primaryColor}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, primaryColor: e.target.value})}
                  />
                  <span>{invoiceSettings.primaryColor}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Due Days</label>
                <input
                  type="number"
                  value={invoiceSettings.dueDays}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, dueDays: Number(e.target.value)})}
                  placeholder="Default due days"
                />
              </div>
              <div className="form-group full-width">
                <label>Invoice Number Format</label>
                <input
                  type="text"
                  value={invoiceSettings.invoiceNumberFormat}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, invoiceNumberFormat: e.target.value})}
                  placeholder="e.g., INV-{YYYY}-{MM}-{###}"
                />
                <small>Use {'{YYYY}'} for year, {'{MM}'} for month, {'{###}'} for number</small>
              </div>
            </div>
          </div>

          <div className="option-section">
            <h4>Display Options</h4>
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={invoiceSettings.showLogo}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, showLogo: e.target.checked})}
                />
                <span>Show company logo</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={invoiceSettings.showBankDetails}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, showBankDetails: e.target.checked})}
                />
                <span>Show bank details</span>
              </label>
            </div>
          </div>

          <div className="option-section">
            <h4>Default Text</h4>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Footer Text</label>
                <textarea
                  value={invoiceSettings.footer}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, footer: e.target.value})}
                  placeholder="Enter footer text"
                  rows={3}
                />
              </div>
              <div className="form-group full-width">
                <label>Terms & Conditions</label>
                <textarea
                  value={invoiceSettings.terms}
                  onChange={(e) => setInvoiceSettings({...invoiceSettings, terms: e.target.value})}
                  placeholder="Enter terms and conditions"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTaxSettings = () => (
    <div className="tax-settings">
      <div className="settings-header">
        <h3>Tax Settings</h3>
        <button
          className="btn-primary"
          onClick={() => setShowAddTaxModal(true)}
        >
          <Plus size={16} />
          Add Tax
        </button>
      </div>

      <div className="tax-list">
        {taxSettings.map(tax => (
          <div key={tax.id} className={`tax-card ${tax.active ? 'active' : 'inactive'}`}>
            <div className="tax-header">
              <div className="tax-info">
                <h4>{tax.name}</h4>
                <p className="tax-description">{tax.description}</p>
              </div>
              <div className="tax-actions">
                <button
                  className={`btn-toggle ${tax.active ? 'active' : ''}`}
                  onClick={() => toggleTaxActive(tax.id)}
                >
                  {tax.active ? 'Active' : 'Inactive'}
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => deleteTax(tax.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="tax-details">
              <div className="tax-rate">
                <span className="rate-value">{tax.rate}%</span>
                <span className="rate-type">{tax.type}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Tax Modal */}
      {showAddTaxModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Tax Setting</h2>
              <button className="btn-icon" onClick={() => setShowAddTaxModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Tax Name</label>
                  <input
                    type="text"
                    value={newTax.name}
                    onChange={(e) => setNewTax({...newTax, name: e.target.value})}
                    placeholder="Enter tax name (e.g., GST, VAT)"
                  />
                </div>
                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    value={newTax.rate}
                    onChange={(e) => setNewTax({...newTax, rate: Number(e.target.value)})}
                    placeholder="Enter tax rate"
                    step="0.01"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={newTax.type}
                    onChange={(e) => setNewTax({...newTax, type: e.target.value})}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <input
                    type="text"
                    value={newTax.description}
                    onChange={(e) => setNewTax({...newTax, description: e.target.value})}
                    placeholder="Enter tax description"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddTaxModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddTax}>
                <Save size={20} />
                Add Tax
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserManagement = () => (
    <div className="user-management">
      <div className="settings-header">
        <h3>User Management</h3>
        <button
          className="btn-primary"
          onClick={() => setShowAddUserModal(true)}
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="users-list">
        {users.map(user => (
          <div key={user.id} className={`user-card ${user.status}`}>
            <div className="user-header">
              <div className="user-info">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-details">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                  <span className={`role-badge ${user.role}`}>
                    {userRoles.find(r => r.id === user.role)?.name}
                  </span>
                </div>
              </div>
              <div className="user-actions">
                <button
                  className={`btn-toggle ${user.status === 'active' ? 'active' : ''}`}
                  onClick={() => toggleUserStatus(user.id)}
                >
                  {user.status === 'active' ? 'Active' : 'Inactive'}
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => deleteUser(user.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="user-stats">
              <div className="stat-item">
                <span className="stat-label">Created</span>
                <span className="stat-value">{user.createdAt}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Last Login</span>
                <span className="stat-value">{user.lastLogin || 'Never'}</span>
              </div>
            </div>

            <div className="user-permissions">
              <h5>Permissions</h5>
              <div className="permissions-grid">
                {Object.entries(user.permissions).map(([module, perms]) => (
                  <div key={module} className="permission-item">
                    <span className="permission-module">{module.charAt(0).toUpperCase() + module.slice(1)}</span>
                    <div className="permission-actions">
                      {typeof perms === 'object' ? (
                        Object.entries(perms).map(([action, allowed]) => (
                          <span key={action} className={`permission-tag ${allowed ? 'allowed' : 'denied'}`}>
                            {action.charAt(0).toUpperCase()}
                          </span>
                        ))
                      ) : (
                        <span className={`permission-tag ${perms ? 'allowed' : 'denied'}`}>
                          R
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="btn-icon" onClick={() => setShowAddUserModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    {userRoles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                  <small>{userRoles.find(r => r.id === newUser.role)?.description}</small>
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <div className="password-input">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="permissions-section">
                <h4>Permissions</h4>
                <div className="permissions-matrix">
                  {Object.entries(newUser.permissions).map(([module, perms]) => (
                    <div key={module} className="permission-row">
                      <div className="permission-module">
                        {module.charAt(0).toUpperCase() + module.slice(1)}
                      </div>
                      <div className="permission-checkboxes">
                        {typeof perms === 'object' ? (
                          Object.entries(perms).map(([action, allowed]) => (
                            <label key={action} className="permission-checkbox">
                              <input
                                type="checkbox"
                                checked={allowed}
                                onChange={(e) => setNewUser({
                                  ...newUser,
                                  permissions: {
                                    ...newUser.permissions,
                                    [module]: {
                                      ...newUser.permissions[module],
                                      [action]: e.target.checked
                                    }
                                  }
                                })}
                              />
                              <span>{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                            </label>
                          ))
                        ) : (
                          <label className="permission-checkbox">
                            <input
                              type="checkbox"
                              checked={perms}
                              onChange={(e) => setNewUser({
                                ...newUser,
                                permissions: {
                                  ...newUser.permissions,
                                  [module]: { read: e.target.checked }
                                }
                              })}
                            />
                            <span>Read</span>
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddUserModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddUser}>
                <Save size={20} />
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="company-settings">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Settings size={28} />
            Company Settings
          </h1>
          <p>Manage your company profile, invoice templates, taxes, and users</p>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <Building size={20} />
          Company Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FileText size={20} />
          Invoice Templates
        </button>
        <button
          className={`tab-btn ${activeTab === 'tax' ? 'active' : ''}`}
          onClick={() => setActiveTab('tax')}
        >
          <Calculator size={20} />
          Tax Settings
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Users size={20} />
          User Management
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'templates' && renderInvoiceTemplates()}
        {activeTab === 'tax' && renderTaxSettings()}
        {activeTab === 'users' && renderUserManagement()}
      </div>
    </div>
  );
};

export default CompanySettings;