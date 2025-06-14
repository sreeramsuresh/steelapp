import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Ruler, 
  Weight, 
  DollarSign,
  Settings,
  Percent,
  Plus,
  Minus,
  Edit,
  Save,
  X,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  Info,
  Target,
  Layers,
  BarChart3
} from 'lucide-react';

const PriceCalculator = () => {
  const [activeTab, setActiveTab] = useState('calculator');
  const [selectedProduct, setSelectedProduct] = useState('rebar');
  const [dimensions, setDimensions] = useState({
    length: 12,
    width: '',
    thickness: '',
    diameter: 12,
    quantity: 1
  });
  const [customRules, setCustomRules] = useState([]);
  const [bulkDiscounts, setBulkDiscounts] = useState([]);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    condition: 'quantity',
    operator: 'greater_than',
    value: 0,
    adjustmentType: 'percentage',
    adjustmentValue: 0,
    active: true
  });
  const [newDiscount, setNewDiscount] = useState({
    name: '',
    minQuantity: 0,
    discountPercentage: 0,
    active: true
  });

  // Base steel prices per kg (these would normally come from an API)
  const basePrices = {
    rebar: { fe415: 48, fe500: 52, fe550: 55 },
    structural: { ms: 55, ss304: 180, ss316: 220 },
    sheet: { ms: 62, galvanized: 75, ss304: 190 },
    pipe: { ms: 58, galvanized: 70, ss304: 185 },
    angle: { ms: 55, galvanized: 68 },
    round: { ms: 53, ss304: 175 },
    flat: { ms: 54, ss304: 178 },
    wire: { ms: 60, galvanized: 72 }
  };

  // Steel density and weight calculations
  const steelDensity = 7850; // kg/m³

  const productTypes = {
    rebar: {
      name: 'TMT Rebar',
      grades: ['fe415', 'fe500', 'fe550'],
      weightFormula: 'circular',
      dimensions: ['diameter', 'length']
    },
    structural: {
      name: 'Structural Steel',
      grades: ['ms', 'ss304', 'ss316'],
      weightFormula: 'rectangular',
      dimensions: ['length', 'width', 'thickness']
    },
    sheet: {
      name: 'Steel Sheet',
      grades: ['ms', 'galvanized', 'ss304'],
      weightFormula: 'sheet',
      dimensions: ['length', 'width', 'thickness']
    },
    pipe: {
      name: 'Steel Pipe',
      grades: ['ms', 'galvanized', 'ss304'],
      weightFormula: 'pipe',
      dimensions: ['diameter', 'thickness', 'length']
    },
    angle: {
      name: 'Steel Angle',
      grades: ['ms', 'galvanized'],
      weightFormula: 'angle',
      dimensions: ['length', 'width', 'thickness']
    },
    round: {
      name: 'Round Bar',
      grades: ['ms', 'ss304'],
      weightFormula: 'circular',
      dimensions: ['diameter', 'length']
    },
    flat: {
      name: 'Flat Bar',
      grades: ['ms', 'ss304'],
      weightFormula: 'rectangular',
      dimensions: ['length', 'width', 'thickness']
    },
    wire: {
      name: 'Steel Wire',
      grades: ['ms', 'galvanized'],
      weightFormula: 'circular',
      dimensions: ['diameter', 'length']
    }
  };

  const [selectedGrade, setSelectedGrade] = useState(productTypes[selectedProduct].grades[0]);

  useEffect(() => {
    // Load saved data
    const savedRules = localStorage.getItem('steel-app-pricing-rules');
    const savedDiscounts = localStorage.getItem('steel-app-bulk-discounts');
    
    if (savedRules) {
      setCustomRules(JSON.parse(savedRules));
    } else {
      // Default pricing rules
      const defaultRules = [
        {
          id: '1',
          name: 'High Volume Discount',
          condition: 'quantity',
          operator: 'greater_than',
          value: 1000,
          adjustmentType: 'percentage',
          adjustmentValue: -5,
          active: true
        },
        {
          id: '2',
          name: 'Premium Grade Surcharge',
          condition: 'grade',
          operator: 'equals',
          value: 'ss316',
          adjustmentType: 'percentage',
          adjustmentValue: 10,
          active: true
        },
        {
          id: '3',
          name: 'Small Order Fee',
          condition: 'total',
          operator: 'less_than',
          value: 5000,
          adjustmentType: 'fixed',
          adjustmentValue: 500,
          active: true
        }
      ];
      setCustomRules(defaultRules);
      localStorage.setItem('steel-app-pricing-rules', JSON.stringify(defaultRules));
    }

    if (savedDiscounts) {
      setBulkDiscounts(JSON.parse(savedDiscounts));
    } else {
      // Default bulk discounts
      const defaultDiscounts = [
        { id: '1', name: '5+ tonnes', minQuantity: 5000, discountPercentage: 3, active: true },
        { id: '2', name: '10+ tonnes', minQuantity: 10000, discountPercentage: 5, active: true },
        { id: '3', name: '25+ tonnes', minQuantity: 25000, discountPercentage: 8, active: true },
        { id: '4', name: '50+ tonnes', minQuantity: 50000, discountPercentage: 12, active: true }
      ];
      setBulkDiscounts(defaultDiscounts);
      localStorage.setItem('steel-app-bulk-discounts', JSON.stringify(defaultDiscounts));
    }

    // Reset grade when product changes
    setSelectedGrade(productTypes[selectedProduct].grades[0]);
  }, [selectedProduct]);

  const calculateWeight = useMemo(() => {
    const { weightFormula } = productTypes[selectedProduct];
    const { length, width, thickness, diameter, quantity } = dimensions;
    
    let weightPerUnit = 0;

    switch (weightFormula) {
      case 'circular': // For rebar, round bars, wire
        if (diameter && length) {
          const radiusM = (diameter / 1000) / 2; // Convert mm to m
          const lengthM = length;
          const volume = Math.PI * radiusM * radiusM * lengthM;
          weightPerUnit = volume * steelDensity;
        }
        break;
        
      case 'rectangular': // For structural steel, flat bars
        if (length && width && thickness) {
          const lengthM = length;
          const widthM = width / 1000; // Convert mm to m
          const thicknessM = thickness / 1000; // Convert mm to m
          const volume = lengthM * widthM * thicknessM;
          weightPerUnit = volume * steelDensity;
        }
        break;
        
      case 'sheet': // For steel sheets
        if (length && width && thickness) {
          const lengthM = length / 1000; // Convert mm to m
          const widthM = width / 1000; // Convert mm to m
          const thicknessM = thickness / 1000; // Convert mm to m
          const volume = lengthM * widthM * thicknessM;
          weightPerUnit = volume * steelDensity;
        }
        break;
        
      case 'pipe': // For pipes
        if (diameter && thickness && length) {
          const outerRadiusM = (diameter / 1000) / 2; // Convert mm to m
          const innerRadiusM = outerRadiusM - (thickness / 1000);
          const lengthM = length;
          const volume = Math.PI * (outerRadiusM * outerRadiusM - innerRadiusM * innerRadiusM) * lengthM;
          weightPerUnit = volume * steelDensity;
        }
        break;
        
      case 'angle': // For angles - simplified as two rectangles
        if (length && width && thickness) {
          const lengthM = length;
          const widthM = width / 1000; // Convert mm to m
          const thicknessM = thickness / 1000; // Convert mm to m
          // Simplified: two rectangles minus overlap
          const volume = lengthM * thicknessM * (2 * widthM - thicknessM);
          weightPerUnit = volume * steelDensity;
        }
        break;
        
      default:
        weightPerUnit = 0;
    }

    return weightPerUnit * quantity;
  }, [selectedProduct, dimensions]);

  const calculatePrice = useMemo(() => {
    const basePrice = basePrices[selectedProduct][selectedGrade] || 50;
    const totalWeight = calculateWeight;
    let subtotal = totalWeight * basePrice;

    // Apply custom pricing rules
    const applicableRules = customRules.filter(rule => rule.active);
    let adjustments = [];

    applicableRules.forEach(rule => {
      let applies = false;
      
      switch (rule.condition) {
        case 'quantity':
          if (rule.operator === 'greater_than' && dimensions.quantity > rule.value) applies = true;
          if (rule.operator === 'less_than' && dimensions.quantity < rule.value) applies = true;
          if (rule.operator === 'equals' && dimensions.quantity === rule.value) applies = true;
          break;
        case 'weight':
          if (rule.operator === 'greater_than' && totalWeight > rule.value) applies = true;
          if (rule.operator === 'less_than' && totalWeight < rule.value) applies = true;
          break;
        case 'total':
          if (rule.operator === 'greater_than' && subtotal > rule.value) applies = true;
          if (rule.operator === 'less_than' && subtotal < rule.value) applies = true;
          break;
        case 'grade':
          if (rule.operator === 'equals' && selectedGrade === rule.value) applies = true;
          break;
      }

      if (applies) {
        let adjustment = 0;
        if (rule.adjustmentType === 'percentage') {
          adjustment = subtotal * (rule.adjustmentValue / 100);
        } else {
          adjustment = rule.adjustmentValue;
        }
        
        adjustments.push({
          name: rule.name,
          amount: adjustment,
          type: rule.adjustmentType
        });
        
        subtotal += adjustment;
      }
    });

    // Apply bulk discounts
    const applicableDiscounts = bulkDiscounts
      .filter(discount => discount.active && totalWeight >= discount.minQuantity)
      .sort((a, b) => b.discountPercentage - a.discountPercentage);

    let bulkDiscount = 0;
    let appliedDiscount = null;

    if (applicableDiscounts.length > 0) {
      appliedDiscount = applicableDiscounts[0];
      bulkDiscount = subtotal * (appliedDiscount.discountPercentage / 100);
      subtotal -= bulkDiscount;
    }

    return {
      basePrice,
      baseAmount: totalWeight * basePrice,
      adjustments,
      bulkDiscount,
      appliedDiscount,
      subtotal,
      total: subtotal,
      pricePerKg: totalWeight > 0 ? subtotal / totalWeight : 0
    };
  }, [selectedProduct, selectedGrade, calculateWeight, dimensions, customRules, bulkDiscounts]);

  const handleAddRule = () => {
    const rule = {
      ...newRule,
      id: Date.now().toString()
    };
    const updatedRules = [...customRules, rule];
    setCustomRules(updatedRules);
    localStorage.setItem('steel-app-pricing-rules', JSON.stringify(updatedRules));
    setNewRule({
      name: '',
      condition: 'quantity',
      operator: 'greater_than',
      value: 0,
      adjustmentType: 'percentage',
      adjustmentValue: 0,
      active: true
    });
    setShowRulesModal(false);
  };

  const handleAddDiscount = () => {
    const discount = {
      ...newDiscount,
      id: Date.now().toString()
    };
    const updatedDiscounts = [...bulkDiscounts, discount];
    setBulkDiscounts(updatedDiscounts);
    localStorage.setItem('steel-app-bulk-discounts', JSON.stringify(updatedDiscounts));
    setNewDiscount({
      name: '',
      minQuantity: 0,
      discountPercentage: 0,
      active: true
    });
    setShowDiscountModal(false);
  };

  const toggleRuleActive = (ruleId) => {
    const updatedRules = customRules.map(rule =>
      rule.id === ruleId ? { ...rule, active: !rule.active } : rule
    );
    setCustomRules(updatedRules);
    localStorage.setItem('steel-app-pricing-rules', JSON.stringify(updatedRules));
  };

  const toggleDiscountActive = (discountId) => {
    const updatedDiscounts = bulkDiscounts.map(discount =>
      discount.id === discountId ? { ...discount, active: !discount.active } : discount
    );
    setBulkDiscounts(updatedDiscounts);
    localStorage.setItem('steel-app-bulk-discounts', JSON.stringify(updatedDiscounts));
  };

  const deleteRule = (ruleId) => {
    const updatedRules = customRules.filter(rule => rule.id !== ruleId);
    setCustomRules(updatedRules);
    localStorage.setItem('steel-app-pricing-rules', JSON.stringify(updatedRules));
  };

  const deleteDiscount = (discountId) => {
    const updatedDiscounts = bulkDiscounts.filter(discount => discount.id !== discountId);
    setBulkDiscounts(updatedDiscounts);
    localStorage.setItem('steel-app-bulk-discounts', JSON.stringify(updatedDiscounts));
  };

  const renderCalculator = () => (
    <div className="price-calculator-main">
      <div className="calculator-form">
        <div className="form-section">
          <h3>Product Selection</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Product Type</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="form-select"
              >
                {Object.entries(productTypes).map(([key, product]) => (
                  <option key={key} value={key}>{product.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Grade</label>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="form-select"
              >
                {productTypes[selectedProduct].grades.map(grade => (
                  <option key={grade} value={grade}>{grade.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Dimensions</h3>
          <div className="form-grid">
            {productTypes[selectedProduct].dimensions.includes('diameter') && (
              <div className="form-group">
                <label>Diameter (mm)</label>
                <input
                  type="number"
                  value={dimensions.diameter}
                  onChange={(e) => setDimensions({...dimensions, diameter: Number(e.target.value)})}
                  placeholder="Enter diameter"
                />
              </div>
            )}
            {productTypes[selectedProduct].dimensions.includes('length') && (
              <div className="form-group">
                <label>Length (m)</label>
                <input
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions({...dimensions, length: Number(e.target.value)})}
                  placeholder="Enter length"
                />
              </div>
            )}
            {productTypes[selectedProduct].dimensions.includes('width') && (
              <div className="form-group">
                <label>Width (mm)</label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions({...dimensions, width: Number(e.target.value)})}
                  placeholder="Enter width"
                />
              </div>
            )}
            {productTypes[selectedProduct].dimensions.includes('thickness') && (
              <div className="form-group">
                <label>Thickness (mm)</label>
                <input
                  type="number"
                  value={dimensions.thickness}
                  onChange={(e) => setDimensions({...dimensions, thickness: Number(e.target.value)})}
                  placeholder="Enter thickness"
                />
              </div>
            )}
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={dimensions.quantity}
                onChange={(e) => setDimensions({...dimensions, quantity: Number(e.target.value)})}
                placeholder="Enter quantity"
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="calculation-results">
        <div className="results-header">
          <h3>Calculation Results</h3>
          <div className="base-price-info">
            <span className="base-price-label">Base Price:</span>
            <span className="base-price-value">₹{calculatePrice.basePrice}/kg</span>
          </div>
        </div>

        <div className="weight-calculation">
          <div className="calc-row">
            <div className="calc-item">
              <Weight size={20} />
              <div className="calc-details">
                <span className="calc-label">Total Weight</span>
                <span className="calc-value">{calculateWeight.toFixed(2)} kg</span>
              </div>
            </div>
            <div className="calc-item">
              <Package size={20} />
              <div className="calc-details">
                <span className="calc-label">Weight per Unit</span>
                <span className="calc-value">
                  {dimensions.quantity > 0 ? (calculateWeight / dimensions.quantity).toFixed(2) : 0} kg
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="price-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Base Amount</span>
            <span className="breakdown-value">₹{calculatePrice.baseAmount.toFixed(2)}</span>
          </div>

          {calculatePrice.adjustments.map((adjustment, index) => (
            <div key={index} className={`breakdown-item ${adjustment.amount < 0 ? 'discount' : 'surcharge'}`}>
              <span className="breakdown-label">
                {adjustment.name}
                <span className="adjustment-type">
                  ({adjustment.type === 'percentage' ? `${adjustment.amount < 0 ? '' : '+'}${((adjustment.amount / calculatePrice.baseAmount) * 100).toFixed(1)}%` : 'Fixed'})
                </span>
              </span>
              <span className="breakdown-value">
                {adjustment.amount >= 0 ? '+' : ''}₹{adjustment.amount.toFixed(2)}
              </span>
            </div>
          ))}

          {calculatePrice.bulkDiscount > 0 && (
            <div className="breakdown-item discount">
              <span className="breakdown-label">
                Bulk Discount ({calculatePrice.appliedDiscount.name})
                <span className="adjustment-type">(-{calculatePrice.appliedDiscount.discountPercentage}%)</span>
              </span>
              <span className="breakdown-value">-₹{calculatePrice.bulkDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="breakdown-total">
            <span className="breakdown-label">Total Amount</span>
            <span className="breakdown-value">₹{calculatePrice.total.toFixed(2)}</span>
          </div>

          <div className="final-price-per-kg">
            <span className="breakdown-label">Final Price per kg</span>
            <span className="breakdown-value">₹{calculatePrice.pricePerKg.toFixed(2)}</span>
          </div>
        </div>

        {calculatePrice.appliedDiscount && (
          <div className="discount-notice">
            <CheckCircle size={16} />
            <span>Bulk discount applied: {calculatePrice.appliedDiscount.name}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderPricingRules = () => (
    <div className="pricing-rules">
      <div className="rules-header">
        <h3>Custom Pricing Rules</h3>
        <button
          className="btn-primary"
          onClick={() => setShowRulesModal(true)}
        >
          <Plus size={20} />
          Add Rule
        </button>
      </div>

      <div className="rules-list">
        {customRules.map(rule => (
          <div key={rule.id} className={`rule-card ${rule.active ? 'active' : 'inactive'}`}>
            <div className="rule-header">
              <div className="rule-info">
                <h4>{rule.name}</h4>
                <span className={`rule-status ${rule.active ? 'active' : 'inactive'}`}>
                  {rule.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="rule-actions">
                <button
                  className={`btn-toggle ${rule.active ? 'active' : ''}`}
                  onClick={() => toggleRuleActive(rule.id)}
                >
                  {rule.active ? 'Disable' : 'Enable'}
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => deleteRule(rule.id)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="rule-details">
              <div className="rule-condition">
                <strong>Condition:</strong> {rule.condition} {rule.operator.replace('_', ' ')} {rule.value}
              </div>
              <div className="rule-adjustment">
                <strong>Adjustment:</strong> 
                {rule.adjustmentType === 'percentage' 
                  ? `${rule.adjustmentValue > 0 ? '+' : ''}${rule.adjustmentValue}%`
                  : `${rule.adjustmentValue > 0 ? '+' : ''}₹${rule.adjustmentValue}`
                }
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBulkDiscounts = () => (
    <div className="bulk-discounts">
      <div className="discounts-header">
        <h3>Bulk Quantity Discounts</h3>
        <button
          className="btn-primary"
          onClick={() => setShowDiscountModal(true)}
        >
          <Plus size={20} />
          Add Discount
        </button>
      </div>

      <div className="discounts-grid">
        {bulkDiscounts.map(discount => (
          <div key={discount.id} className={`discount-card ${discount.active ? 'active' : 'inactive'}`}>
            <div className="discount-header">
              <div className="discount-info">
                <h4>{discount.name}</h4>
                <span className={`discount-status ${discount.active ? 'active' : 'inactive'}`}>
                  {discount.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="discount-actions">
                <button
                  className={`btn-toggle ${discount.active ? 'active' : ''}`}
                  onClick={() => toggleDiscountActive(discount.id)}
                >
                  {discount.active ? 'Disable' : 'Enable'}
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => deleteDiscount(discount.id)}
                >
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <div className="discount-details">
              <div className="discount-threshold">
                <Layers size={16} />
                <span>Min Quantity: {discount.minQuantity.toLocaleString()} kg</span>
              </div>
              <div className="discount-percentage">
                <Percent size={16} />
                <span>Discount: {discount.discountPercentage}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="price-calculator">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Calculator size={28} />
            Steel Price Calculator
          </h1>
          <p>Calculate steel prices with real-time weight calculations and custom pricing rules</p>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => setActiveTab('calculator')}
        >
          <Calculator size={20} />
          Price Calculator
        </button>
        <button
          className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <Settings size={20} />
          Pricing Rules
        </button>
        <button
          className={`tab-btn ${activeTab === 'discounts' ? 'active' : ''}`}
          onClick={() => setActiveTab('discounts')}
        >
          <Percent size={20} />
          Bulk Discounts
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'calculator' && renderCalculator()}
        {activeTab === 'rules' && renderPricingRules()}
        {activeTab === 'discounts' && renderBulkDiscounts()}
      </div>

      {/* Add Rule Modal */}
      {showRulesModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Pricing Rule</h2>
              <button className="btn-icon" onClick={() => setShowRulesModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Rule Name</label>
                  <input
                    type="text"
                    value={newRule.name}
                    onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                    placeholder="Enter rule name"
                  />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select
                    value={newRule.condition}
                    onChange={(e) => setNewRule({...newRule, condition: e.target.value})}
                  >
                    <option value="quantity">Quantity</option>
                    <option value="weight">Weight (kg)</option>
                    <option value="total">Total Amount (₹)</option>
                    <option value="grade">Grade</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Operator</label>
                  <select
                    value={newRule.operator}
                    onChange={(e) => setNewRule({...newRule, operator: e.target.value})}
                  >
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="equals">Equals</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Value</label>
                  {newRule.condition === 'grade' ? (
                    <select
                      value={newRule.value}
                      onChange={(e) => setNewRule({...newRule, value: e.target.value})}
                    >
                      <option value="">Select Grade</option>
                      <option value="fe415">FE415</option>
                      <option value="fe500">FE500</option>
                      <option value="fe550">FE550</option>
                      <option value="ms">MS</option>
                      <option value="ss304">SS304</option>
                      <option value="ss316">SS316</option>
                      <option value="galvanized">Galvanized</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={newRule.value}
                      onChange={(e) => setNewRule({...newRule, value: Number(e.target.value)})}
                      placeholder="Enter value"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label>Adjustment Type</label>
                  <select
                    value={newRule.adjustmentType}
                    onChange={(e) => setNewRule({...newRule, adjustmentType: e.target.value})}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Adjustment Value 
                    {newRule.adjustmentType === 'percentage' ? ' (%)' : ' (₹)'}
                  </label>
                  <input
                    type="number"
                    value={newRule.adjustmentValue}
                    onChange={(e) => setNewRule({...newRule, adjustmentValue: Number(e.target.value)})}
                    placeholder={newRule.adjustmentType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRulesModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddRule}>
                <Save size={20} />
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Discount Modal */}
      {showDiscountModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Add Bulk Discount</h2>
              <button className="btn-icon" onClick={() => setShowDiscountModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Discount Name</label>
                  <input
                    type="text"
                    value={newDiscount.name}
                    onChange={(e) => setNewDiscount({...newDiscount, name: e.target.value})}
                    placeholder="Enter discount name (e.g., 10+ tonnes)"
                  />
                </div>
                <div className="form-group">
                  <label>Minimum Quantity (kg)</label>
                  <input
                    type="number"
                    value={newDiscount.minQuantity}
                    onChange={(e) => setNewDiscount({...newDiscount, minQuantity: Number(e.target.value)})}
                    placeholder="Enter minimum quantity"
                  />
                </div>
                <div className="form-group">
                  <label>Discount Percentage (%)</label>
                  <input
                    type="number"
                    value={newDiscount.discountPercentage}
                    onChange={(e) => setNewDiscount({...newDiscount, discountPercentage: Number(e.target.value)})}
                    placeholder="Enter discount percentage"
                    max="100"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDiscountModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleAddDiscount}>
                <Save size={20} />
                Add Discount
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;