import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Tag,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Layers,
  Info,
  Save,
  X,
  Filter,
  BarChart3,
  Package2,
  Ruler,
  Weight,
  Calendar,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const SteelProducts = () => {
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'rebar',
    grade: '',
    size: '',
    weight: '',
    unit: 'kg',
    description: '',
    currentStock: 0,
    minStock: 10,
    maxStock: 1000,
    costPrice: 0,
    sellingPrice: 0,
    supplier: '',
    location: '',
    specifications: {
      length: '',
      width: '',
      thickness: '',
      diameter: '',
      tensileStrength: '',
      yieldStrength: '',
      carbonContent: '',
      coating: '',
      standard: ''
    }
  });

  const [priceUpdate, setPriceUpdate] = useState({
    newPrice: 0,
    reason: '',
    effectiveDate: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'rebar', label: 'Rebar & Reinforcement' },
    { value: 'structural', label: 'Structural Steel' },
    { value: 'sheet', label: 'Steel Sheets' },
    { value: 'pipe', label: 'Pipes & Tubes' },
    { value: 'angle', label: 'Angles & Channels' },
    { value: 'round', label: 'Round Bars' },
    { value: 'flat', label: 'Flat Bars' },
    { value: 'wire', label: 'Wire & Mesh' }
  ];

  const grades = [
    'Fe415', 'Fe500', 'Fe550', 'Fe600',
    'IS2062', 'ASTM A36', 'ASTM A572',
    'SS304', 'SS316', 'MS', 'Galvanized'
  ];

  useEffect(() => {
    const savedProducts = localStorage.getItem('steel-app-products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const sampleProducts = [
        {
          id: '1',
          name: 'TMT Rebar 12mm',
          category: 'rebar',
          grade: 'Fe415',
          size: '12mm',
          weight: '0.888',
          unit: 'kg/m',
          description: 'High strength TMT rebar for construction',
          currentStock: 500,
          minStock: 100,
          maxStock: 2000,
          costPrice: 45,
          sellingPrice: 52,
          supplier: 'Steel Corp India',
          location: 'Warehouse A',
          createdAt: '2024-01-15',
          lastUpdated: '2024-12-10',
          priceHistory: [
            { date: '2024-12-10', price: 52, reason: 'Market adjustment', updatedBy: 'Admin' },
            { date: '2024-11-15', price: 50, reason: 'Seasonal pricing', updatedBy: 'Admin' }
          ],
          specifications: {
            length: '12m',
            width: '',
            thickness: '',
            diameter: '12mm',
            tensileStrength: '500 MPa',
            yieldStrength: '415 MPa',
            carbonContent: '0.25%',
            coating: 'TMT',
            standard: 'IS1786:2008'
          }
        },
        {
          id: '2',
          name: 'MS Angle 50x50x6',
          category: 'angle',
          grade: 'MS',
          size: '50x50x6',
          weight: '4.5',
          unit: 'kg/m',
          description: 'Mild steel angle for structural applications',
          currentStock: 150,
          minStock: 50,
          maxStock: 500,
          costPrice: 55,
          sellingPrice: 63,
          supplier: 'Bharat Steel',
          location: 'Warehouse B',
          createdAt: '2024-02-20',
          lastUpdated: '2024-12-08',
          priceHistory: [
            { date: '2024-12-08', price: 63, reason: 'Raw material cost increase', updatedBy: 'Admin' }
          ],
          specifications: {
            length: '6m',
            width: '50mm',
            thickness: '6mm',
            diameter: '',
            tensileStrength: '410 MPa',
            yieldStrength: '250 MPa',
            carbonContent: '0.23%',
            coating: 'None',
            standard: 'IS2062:2011'
          }
        },
        {
          id: '3',
          name: 'Steel Sheet 2mm',
          category: 'sheet',
          grade: 'IS2062',
          size: '1200x2400',
          weight: '45.2',
          unit: 'kg/sheet',
          description: 'Cold rolled steel sheet',
          currentStock: 25,
          minStock: 10,
          maxStock: 100,
          costPrice: 2800,
          sellingPrice: 3200,
          supplier: 'Sheet Metal Works',
          location: 'Warehouse C',
          createdAt: '2024-03-10',
          lastUpdated: '2024-12-05',
          priceHistory: [
            { date: '2024-12-05', price: 3200, reason: 'Standard pricing', updatedBy: 'Admin' }
          ],
          specifications: {
            length: '2400mm',
            width: '1200mm',
            thickness: '2mm',
            diameter: '',
            tensileStrength: '410 MPa',
            yieldStrength: '240 MPa',
            carbonContent: '0.22%',
            coating: 'Oiled',
            standard: 'IS2062:2011'
          }
        }
      ];
      setProducts(sampleProducts);
      localStorage.setItem('steel-app-products', JSON.stringify(sampleProducts));
    }
  }, []);

  const saveProductsToStorage = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('steel-app-products', JSON.stringify(updatedProducts));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'low' && product.currentStock <= product.minStock) ||
                        (stockFilter === 'normal' && product.currentStock > product.minStock && product.currentStock < product.maxStock * 0.8) ||
                        (stockFilter === 'high' && product.currentStock >= product.maxStock * 0.8);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleAddProduct = () => {
    const product = {
      ...newProduct,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      priceHistory: [{
        date: new Date().toISOString().split('T')[0],
        price: newProduct.sellingPrice,
        reason: 'Initial price',
        updatedBy: 'Admin'
      }]
    };
    const updatedProducts = [...products, product];
    saveProductsToStorage(updatedProducts);
    setNewProduct({
      name: '',
      category: 'rebar',
      grade: '',
      size: '',
      weight: '',
      unit: 'kg',
      description: '',
      currentStock: 0,
      minStock: 10,
      maxStock: 1000,
      costPrice: 0,
      sellingPrice: 0,
      supplier: '',
      location: '',
      specifications: {
        length: '', width: '', thickness: '', diameter: '',
        tensileStrength: '', yieldStrength: '', carbonContent: '',
        coating: '', standard: ''
      }
    });
    setShowAddModal(false);
  };

  const handleEditProduct = () => {
    const updatedProducts = products.map(product =>
      product.id === selectedProduct.id ? {
        ...selectedProduct,
        lastUpdated: new Date().toISOString().split('T')[0]
      } : product
    );
    saveProductsToStorage(updatedProducts);
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(product => product.id !== productId);
      saveProductsToStorage(updatedProducts);
    }
  };

  const handlePriceUpdate = () => {
    const updatedProducts = products.map(product => {
      if (product.id === selectedProduct.id) {
        const newPriceEntry = {
          date: priceUpdate.effectiveDate,
          price: priceUpdate.newPrice,
          reason: priceUpdate.reason,
          updatedBy: 'Admin'
        };
        return {
          ...product,
          sellingPrice: priceUpdate.newPrice,
          lastUpdated: new Date().toISOString().split('T')[0],
          priceHistory: [newPriceEntry, ...(product.priceHistory || [])]
        };
      }
      return product;
    });
    saveProductsToStorage(updatedProducts);
    setPriceUpdate({ newPrice: 0, reason: '', effectiveDate: new Date().toISOString().split('T')[0] });
    setShowPriceModal(false);
    setSelectedProduct(null);
  };

  const getStockStatus = (product) => {
    if (product.currentStock <= product.minStock) return 'low';
    if (product.currentStock >= product.maxStock * 0.8) return 'high';
    return 'normal';
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'low': return '#dc2626';
      case 'high': return '#059669';
      default: return '#2563eb';
    }
  };

  const calculateInventoryStats = () => {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => getStockStatus(p) === 'low').length;
    const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);
    const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
    
    return { totalProducts, lowStockProducts, totalValue, totalStock };
  };

  const stats = calculateInventoryStats();

  const renderCatalog = () => (
    <div className="products-catalog">
      <div className="catalog-header">
        <div className="catalog-controls">
          <div className="search-filter-group">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock</option>
              <option value="normal">Normal Stock</option>
              <option value="high">High Stock</option>
            </select>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => {
          const stockStatus = getStockStatus(product);
          return (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-category">
                    {categories.find(c => c.value === product.category)?.label}
                  </p>
                  <div className="product-details">
                    <span className="grade-badge">{product.grade}</span>
                    <span className="size-info">{product.size}</span>
                  </div>
                </div>
                <div className="product-actions">
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowSpecModal(true);
                    }}
                    title="View Specifications"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setPriceUpdate({ ...priceUpdate, newPrice: product.sellingPrice });
                      setShowPriceModal(true);
                    }}
                    title="Update Price"
                  >
                    <Tag size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEditModal(true);
                    }}
                    title="Edit Product"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteProduct(product.id)}
                    title="Delete Product"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="product-description">
                <p>{product.description}</p>
              </div>

              <div className="product-stats">
                <div className="stat-row">
                  <span className="stat-label">Weight</span>
                  <span className="stat-value">{product.weight} {product.unit}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Supplier</span>
                  <span className="stat-value">{product.supplier}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Location</span>
                  <span className="stat-value">{product.location}</span>
                </div>
              </div>

              <div className="stock-info">
                <div className="stock-header">
                  <span className="stock-label">Stock Level</span>
                  <span className={`stock-status status-${stockStatus}`}>
                    {stockStatus === 'low' && <AlertTriangle size={16} />}
                    {stockStatus === 'normal' && <CheckCircle size={16} />}
                    {stockStatus === 'high' && <Package size={16} />}
                    {stockStatus.toUpperCase()}
                  </span>
                </div>
                <div className="stock-details">
                  <span className="current-stock">{product.currentStock}</span>
                  <span className="stock-range">Min: {product.minStock} | Max: {product.maxStock}</span>
                </div>
                <div className="stock-bar">
                  <div 
                    className="stock-fill"
                    style={{ 
                      width: `${Math.min((product.currentStock / product.maxStock) * 100, 100)}%`,
                      backgroundColor: getStockStatusColor(stockStatus)
                    }}
                  />
                </div>
              </div>

              <div className="price-info">
                <div className="price-item">
                  <span className="price-label">Cost Price</span>
                  <span className="price-value">₹{product.costPrice}</span>
                </div>
                <div className="price-item">
                  <span className="price-label">Selling Price</span>
                  <span className="price-value selling">₹{product.sellingPrice}</span>
                </div>
                <div className="margin-info">
                  <span className="margin-label">Margin</span>
                  <span className="margin-value">
                    {product.costPrice > 0 ? 
                      Math.round(((product.sellingPrice - product.costPrice) / product.costPrice) * 100) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="inventory-dashboard">
      <div className="inventory-stats">
        <div className="stat-card">
          <div className="stat-header">
            <Package2 size={24} />
            <h3>Total Products</h3>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
          <div className="stat-subtitle">In catalog</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <AlertTriangle size={24} />
            <h3>Low Stock Items</h3>
          </div>
          <div className="stat-value">{stats.lowStockProducts}</div>
          <div className="stat-subtitle">Need reorder</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <DollarSign size={24} />
            <h3>Inventory Value</h3>
          </div>
          <div className="stat-value">₹{stats.totalValue.toLocaleString()}</div>
          <div className="stat-subtitle">Total cost value</div>
        </div>
        <div className="stat-card">
          <div className="stat-header">
            <Layers size={24} />
            <h3>Total Stock</h3>
          </div>
          <div className="stat-value">{stats.totalStock}</div>
          <div className="stat-subtitle">Units in stock</div>
        </div>
      </div>

      <div className="inventory-table">
        <h3>Stock Levels Overview</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Min Stock</th>
                <th>Max Stock</th>
                <th>Status</th>
                <th>Value</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const stockStatus = getStockStatus(product);
                const stockValue = product.currentStock * product.costPrice;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <strong>{product.name}</strong>
                        <span className="product-grade">{product.grade} - {product.size}</span>
                      </div>
                    </td>
                    <td>{categories.find(c => c.value === product.category)?.label}</td>
                    <td className="stock-cell">
                      <span className="stock-number">{product.currentStock}</span>
                      <span className="stock-unit">{product.unit}</span>
                    </td>
                    <td>{product.minStock}</td>
                    <td>{product.maxStock}</td>
                    <td>
                      <span className={`status-badge status-${stockStatus}`}>
                        {stockStatus === 'low' && <AlertTriangle size={14} />}
                        {stockStatus === 'normal' && <CheckCircle size={14} />}
                        {stockStatus === 'high' && <Package size={14} />}
                        {stockStatus.toUpperCase()}
                      </span>
                    </td>
                    <td>₹{stockValue.toLocaleString()}</td>
                    <td>{format(new Date(product.lastUpdated), 'MMM dd, yyyy')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="pricing-dashboard">
      <div className="pricing-header">
        <h3>Price Management</h3>
        <p>Manage product pricing and track price history</p>
      </div>

      <div className="pricing-table">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Cost Price</th>
                <th>Selling Price</th>
                <th>Margin</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const margin = product.costPrice > 0 ? 
                  ((product.sellingPrice - product.costPrice) / product.costPrice) * 100 : 0;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <strong>{product.name}</strong>
                        <span className="product-grade">{product.grade} - {product.size}</span>
                      </div>
                    </td>
                    <td>{categories.find(c => c.value === product.category)?.label}</td>
                    <td>₹{product.costPrice}</td>
                    <td className="selling-price">₹{product.sellingPrice}</td>
                    <td>
                      <span className={`margin-badge ${margin < 10 ? 'low' : margin > 30 ? 'high' : 'normal'}`}>
                        {Math.round(margin)}%
                      </span>
                    </td>
                    <td>{format(new Date(product.lastUpdated), 'MMM dd, yyyy')}</td>
                    <td>
                      <div className="price-actions">
                        <button
                          className="btn-icon"
                          onClick={() => {
                            setSelectedProduct(product);
                            setPriceUpdate({ ...priceUpdate, newPrice: product.sellingPrice });
                            setShowPriceModal(true);
                          }}
                          title="Update Price"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="steel-products">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Package size={28} />
            Steel Products
          </h1>
          <p>Manage your steel product catalog, inventory, and pricing</p>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <Package size={20} />
          Product Catalog
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <Layers size={20} />
          Inventory Tracking
        </button>
        <button
          className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveTab('pricing')}
        >
          <DollarSign size={20} />
          Price Management
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'catalog' && renderCatalog()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'pricing' && renderPricing()}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="Enter product name"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Grade</label>
                  <input
                    list="grades"
                    value={newProduct.grade}
                    onChange={(e) => setNewProduct({...newProduct, grade: e.target.value})}
                    placeholder="Enter grade"
                  />
                  <datalist id="grades">
                    {grades.map(grade => (
                      <option key={grade} value={grade} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    value={newProduct.size}
                    onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
                    placeholder="Enter size (e.g., 12mm, 50x50x6)"
                  />
                </div>
                <div className="form-group">
                  <label>Weight</label>
                  <input
                    type="text"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({...newProduct, weight: e.target.value})}
                    placeholder="Enter weight"
                  />
                </div>
                <div className="form-group">
                  <label>Unit</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                  >
                    <option value="kg">kg</option>
                    <option value="kg/m">kg/m</option>
                    <option value="kg/sheet">kg/sheet</option>
                    <option value="tonnes">tonnes</option>
                    <option value="pieces">pieces</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter product description"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    value={newProduct.currentStock}
                    onChange={(e) => setNewProduct({...newProduct, currentStock: Number(e.target.value)})}
                    placeholder="Enter current stock"
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Stock</label>
                  <input
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct({...newProduct, minStock: Number(e.target.value)})}
                    placeholder="Enter minimum stock level"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Stock</label>
                  <input
                    type="number"
                    value={newProduct.maxStock}
                    onChange={(e) => setNewProduct({...newProduct, maxStock: Number(e.target.value)})}
                    placeholder="Enter maximum stock level"
                  />
                </div>
                <div className="form-group">
                  <label>Cost Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({...newProduct, costPrice: Number(e.target.value)})}
                    placeholder="Enter cost price"
                  />
                </div>
                <div className="form-group">
                  <label>Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.sellingPrice}
                    onChange={(e) => setNewProduct({...newProduct, sellingPrice: Number(e.target.value)})}
                    placeholder="Enter selling price"
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={newProduct.supplier}
                    onChange={(e) => setNewProduct({...newProduct, supplier: e.target.value})}
                    placeholder="Enter supplier name"
                  />
                </div>
                <div className="form-group">
                  <label>Storage Location</label>
                  <input
                    type="text"
                    value={newProduct.location}
                    onChange={(e) => setNewProduct({...newProduct, location: e.target.value})}
                    placeholder="Enter storage location"
                  />
                </div>
              </div>
              
              <div className="specifications-section">
                <h3>Product Specifications</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Length</label>
                    <input
                      type="text"
                      value={newProduct.specifications.length}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, length: e.target.value}
                      })}
                      placeholder="Enter length"
                    />
                  </div>
                  <div className="form-group">
                    <label>Width</label>
                    <input
                      type="text"
                      value={newProduct.specifications.width}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, width: e.target.value}
                      })}
                      placeholder="Enter width"
                    />
                  </div>
                  <div className="form-group">
                    <label>Thickness</label>
                    <input
                      type="text"
                      value={newProduct.specifications.thickness}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, thickness: e.target.value}
                      })}
                      placeholder="Enter thickness"
                    />
                  </div>
                  <div className="form-group">
                    <label>Diameter</label>
                    <input
                      type="text"
                      value={newProduct.specifications.diameter}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, diameter: e.target.value}
                      })}
                      placeholder="Enter diameter"
                    />
                  </div>
                  <div className="form-group">
                    <label>Tensile Strength</label>
                    <input
                      type="text"
                      value={newProduct.specifications.tensileStrength}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, tensileStrength: e.target.value}
                      })}
                      placeholder="Enter tensile strength"
                    />
                  </div>
                  <div className="form-group">
                    <label>Yield Strength</label>
                    <input
                      type="text"
                      value={newProduct.specifications.yieldStrength}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, yieldStrength: e.target.value}
                      })}
                      placeholder="Enter yield strength"
                    />
                  </div>
                  <div className="form-group">
                    <label>Carbon Content</label>
                    <input
                      type="text"
                      value={newProduct.specifications.carbonContent}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, carbonContent: e.target.value}
                      })}
                      placeholder="Enter carbon content"
                    />
                  </div>
                  <div className="form-group">
                    <label>Coating</label>
                    <input
                      type="text"
                      value={newProduct.specifications.coating}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, coating: e.target.value}
                      })}
                      placeholder="Enter coating type"
                    />
                  </div>
                  <div className="form-group">
                    <label>Standard</label>
                    <input
                      type="text"
                      value={newProduct.specifications.standard}
                      onChange={(e) => setNewProduct({
                        ...newProduct,
                        specifications: {...newProduct.specifications, standard: e.target.value}
                      })}
                      placeholder="Enter applicable standard"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddProduct}>
                <Save size={20} />
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal large-modal">
            <div className="modal-header">
              <h2>Edit Product</h2>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={selectedProduct.name}
                    onChange={(e) => setSelectedProduct({...selectedProduct, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={selectedProduct.category}
                    onChange={(e) => setSelectedProduct({...selectedProduct, category: e.target.value})}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Grade</label>
                  <input
                    type="text"
                    value={selectedProduct.grade}
                    onChange={(e) => setSelectedProduct({...selectedProduct, grade: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Size</label>
                  <input
                    type="text"
                    value={selectedProduct.size}
                    onChange={(e) => setSelectedProduct({...selectedProduct, size: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Current Stock</label>
                  <input
                    type="number"
                    value={selectedProduct.currentStock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, currentStock: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Stock</label>
                  <input
                    type="number"
                    value={selectedProduct.minStock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, minStock: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Stock</label>
                  <input
                    type="number"
                    value={selectedProduct.maxStock}
                    onChange={(e) => setSelectedProduct({...selectedProduct, maxStock: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Cost Price (₹)</label>
                  <input
                    type="number"
                    value={selectedProduct.costPrice}
                    onChange={(e) => setSelectedProduct({...selectedProduct, costPrice: Number(e.target.value)})}
                  />
                </div>
                <div className="form-group">
                  <label>Supplier</label>
                  <input
                    type="text"
                    value={selectedProduct.supplier}
                    onChange={(e) => setSelectedProduct({...selectedProduct, supplier: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Storage Location</label>
                  <input
                    type="text"
                    value={selectedProduct.location}
                    onChange={(e) => setSelectedProduct({...selectedProduct, location: e.target.value})}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={selectedProduct.description}
                    onChange={(e) => setSelectedProduct({...selectedProduct, description: e.target.value})}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleEditProduct}>
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Price Update Modal */}
      {showPriceModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Price - {selectedProduct.name}</h2>
              <button className="btn-icon" onClick={() => setShowPriceModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="price-update-form">
                <div className="current-price">
                  <span className="label">Current Price:</span>
                  <span className="price">₹{selectedProduct.sellingPrice}</span>
                </div>
                <div className="form-group">
                  <label>New Price (₹)</label>
                  <input
                    type="number"
                    value={priceUpdate.newPrice}
                    onChange={(e) => setPriceUpdate({...priceUpdate, newPrice: Number(e.target.value)})}
                    placeholder="Enter new price"
                  />
                </div>
                <div className="form-group">
                  <label>Reason for Update</label>
                  <input
                    type="text"
                    value={priceUpdate.reason}
                    onChange={(e) => setPriceUpdate({...priceUpdate, reason: e.target.value})}
                    placeholder="Enter reason for price change"
                  />
                </div>
                <div className="form-group">
                  <label>Effective Date</label>
                  <input
                    type="date"
                    value={priceUpdate.effectiveDate}
                    onChange={(e) => setPriceUpdate({...priceUpdate, effectiveDate: e.target.value})}
                  />
                </div>
                {selectedProduct.priceHistory && selectedProduct.priceHistory.length > 0 && (
                  <div className="price-history">
                    <h4>Price History</h4>
                    <div className="history-list">
                      {selectedProduct.priceHistory.slice(0, 5).map((entry, index) => (
                        <div key={index} className="history-item">
                          <span className="history-date">{format(new Date(entry.date), 'MMM dd, yyyy')}</span>
                          <span className="history-price">₹{entry.price}</span>
                          <span className="history-reason">{entry.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPriceModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handlePriceUpdate}>
                <Save size={20} />
                Update Price
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Specifications Modal */}
      {showSpecModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Product Specifications - {selectedProduct.name}</h2>
              <button className="btn-icon" onClick={() => setShowSpecModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="specifications-view">
                <div className="spec-section">
                  <h3>Basic Information</h3>
                  <div className="spec-grid">
                    <div className="spec-item">
                      <span className="spec-label">Product Name:</span>
                      <span className="spec-value">{selectedProduct.name}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Category:</span>
                      <span className="spec-value">{categories.find(c => c.value === selectedProduct.category)?.label}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Grade:</span>
                      <span className="spec-value">{selectedProduct.grade}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Size:</span>
                      <span className="spec-value">{selectedProduct.size}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Weight:</span>
                      <span className="spec-value">{selectedProduct.weight} {selectedProduct.unit}</span>
                    </div>
                  </div>
                </div>

                <div className="spec-section">
                  <h3>Technical Specifications</h3>
                  <div className="spec-grid">
                    {selectedProduct.specifications.length && (
                      <div className="spec-item">
                        <span className="spec-label">Length:</span>
                        <span className="spec-value">{selectedProduct.specifications.length}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.width && (
                      <div className="spec-item">
                        <span className="spec-label">Width:</span>
                        <span className="spec-value">{selectedProduct.specifications.width}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.thickness && (
                      <div className="spec-item">
                        <span className="spec-label">Thickness:</span>
                        <span className="spec-value">{selectedProduct.specifications.thickness}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.diameter && (
                      <div className="spec-item">
                        <span className="spec-label">Diameter:</span>
                        <span className="spec-value">{selectedProduct.specifications.diameter}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.tensileStrength && (
                      <div className="spec-item">
                        <span className="spec-label">Tensile Strength:</span>
                        <span className="spec-value">{selectedProduct.specifications.tensileStrength}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.yieldStrength && (
                      <div className="spec-item">
                        <span className="spec-label">Yield Strength:</span>
                        <span className="spec-value">{selectedProduct.specifications.yieldStrength}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.carbonContent && (
                      <div className="spec-item">
                        <span className="spec-label">Carbon Content:</span>
                        <span className="spec-value">{selectedProduct.specifications.carbonContent}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.coating && (
                      <div className="spec-item">
                        <span className="spec-label">Coating:</span>
                        <span className="spec-value">{selectedProduct.specifications.coating}</span>
                      </div>
                    )}
                    {selectedProduct.specifications.standard && (
                      <div className="spec-item">
                        <span className="spec-label">Standard:</span>
                        <span className="spec-value">{selectedProduct.specifications.standard}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="spec-section">
                  <h3>Description</h3>
                  <p>{selectedProduct.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SteelProducts;