import React, { useState, useEffect, useMemo } from 'react';
import { invoiceAPI } from '../config/api';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign,
  Users,
  Package,
  Target,
  Calendar,
  Filter,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, subMonths, subQuarters } from 'date-fns';

const SalesAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [selectedPeriod, setSelectedPeriod] = useState(new Date());
  const [salesData, setSalesData] = useState([]);
  const [invoiceData, setInvoiceData] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalInvoices: 0,
    monthlyRevenue: 0,
    pendingInvoices: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    loadAnalytics();
    loadInvoiceData();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await invoiceAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadInvoiceData = async () => {
    try {
      const response = await invoiceAPI.getAll();
      setInvoiceData(response.data || []);
    } catch (error) {
      console.error('Failed to load invoice data:', error);
      // Fallback to local storage if API fails
      const existingInvoices = JSON.parse(localStorage.getItem('steel-app-invoices') || '[]');
      setInvoiceData(existingInvoices);
    }
  };

  // Generate sample sales data for enhanced analytics
  useEffect(() => {

    // Generate comprehensive sales data for analytics
    const generateSalesData = () => {
      const months = [];
      const products = [
        { name: 'TMT Rebar 12mm', category: 'rebar', basePrice: 52 },
        { name: 'MS Angle 50x50x6', category: 'angle', basePrice: 63 },
        { name: 'Steel Sheet 2mm', category: 'sheet', basePrice: 3200 },
        { name: 'TMT Rebar 16mm', category: 'rebar', basePrice: 54 },
        { name: 'MS Pipe 25mm', category: 'pipe', basePrice: 68 },
        { name: 'Steel Plate 10mm', category: 'sheet', basePrice: 4500 },
        { name: 'Round Bar 20mm', category: 'round', basePrice: 58 },
        { name: 'Flat Bar 25x6', category: 'flat', basePrice: 55 }
      ];
      
      const customers = [
        'ABC Construction Ltd',
        'XYZ Infrastructure',
        'Prime Builders',
        'Metro Steel Works',
        'City Developers',
        'Royal Construction',
        'Empire Builders',
        'Golden Gate Projects'
      ];

      // Generate data for the last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        
        // Generate random sales for this month
        const monthlySales = [];
        const salesCount = Math.floor(Math.random() * 20) + 10; // 10-30 sales per month
        
        for (let j = 0; j < salesCount; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const customer = customers[Math.floor(Math.random() * customers.length)];
          const quantity = Math.floor(Math.random() * 1000) + 100;
          const unitPrice = product.basePrice * (0.9 + Math.random() * 0.2); // ±10% variation
          const total = quantity * unitPrice;
          
          monthlySales.push({
            id: `${i}-${j}`,
            date: new Date(monthStart.getTime() + Math.random() * (monthEnd.getTime() - monthStart.getTime())),
            product: product.name,
            category: product.category,
            customer,
            quantity,
            unitPrice,
            total,
            month: format(monthDate, 'yyyy-MM'),
            quarter: `Q${Math.ceil((monthDate.getMonth() + 1) / 3)} ${monthDate.getFullYear()}`
          });
        }
        
        months.push(...monthlySales);
      }
      
      return months;
    };

    const generated = generateSalesData();
    setSalesData(generated);
  }, []);

  // Calculate analytics based on selected period
  const analytics = useMemo(() => {
    let startDate, endDate, previousStartDate, previousEndDate;
    
    if (dateRange === 'month') {
      startDate = startOfMonth(selectedPeriod);
      endDate = endOfMonth(selectedPeriod);
      const previousMonth = subMonths(selectedPeriod, 1);
      previousStartDate = startOfMonth(previousMonth);
      previousEndDate = endOfMonth(previousMonth);
    } else {
      startDate = startOfQuarter(selectedPeriod);
      endDate = endOfQuarter(selectedPeriod);
      const previousQuarter = subQuarters(selectedPeriod, 1);
      previousStartDate = startOfQuarter(previousQuarter);
      previousEndDate = endOfQuarter(previousQuarter);
    }

    // Filter data for current and previous periods
    const currentPeriodData = salesData.filter(sale => 
      sale.date >= startDate && sale.date <= endDate
    );
    
    const previousPeriodData = salesData.filter(sale => 
      sale.date >= previousStartDate && sale.date <= previousEndDate
    );

    // Calculate metrics
    const currentRevenue = currentPeriodData.reduce((sum, sale) => sum + sale.total, 0);
    const previousRevenue = previousPeriodData.reduce((sum, sale) => sum + sale.total, 0);
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    const currentOrders = currentPeriodData.length;
    const previousOrders = previousPeriodData.length;
    const ordersGrowth = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : 0;

    const uniqueCustomers = new Set(currentPeriodData.map(sale => sale.customer)).size;
    const previousUniqueCustomers = new Set(previousPeriodData.map(sale => sale.customer)).size;
    const customersGrowth = previousUniqueCustomers > 0 ? ((uniqueCustomers - previousUniqueCustomers) / previousUniqueCustomers) * 100 : 0;

    const avgOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;
    const previousAvgOrderValue = previousOrders > 0 ? previousRevenue / previousOrders : 0;
    const avgOrderGrowth = previousAvgOrderValue > 0 ? ((avgOrderValue - previousAvgOrderValue) / previousAvgOrderValue) * 100 : 0;

    // Top products
    const productSales = {};
    currentPeriodData.forEach(sale => {
      if (!productSales[sale.product]) {
        productSales[sale.product] = { quantity: 0, revenue: 0, orders: 0 };
      }
      productSales[sale.product].quantity += sale.quantity;
      productSales[sale.product].revenue += sale.total;
      productSales[sale.product].orders += 1;
    });

    const topProducts = Object.entries(productSales)
      .map(([product, data]) => ({ product, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Top customers
    const customerSales = {};
    currentPeriodData.forEach(sale => {
      if (!customerSales[sale.customer]) {
        customerSales[sale.customer] = { revenue: 0, orders: 0, quantity: 0 };
      }
      customerSales[sale.customer].revenue += sale.total;
      customerSales[sale.customer].orders += 1;
      customerSales[sale.customer].quantity += sale.quantity;
    });

    const topCustomers = Object.entries(customerSales)
      .map(([customer, data]) => ({ customer, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category performance
    const categoryPerformance = {};
    currentPeriodData.forEach(sale => {
      if (!categoryPerformance[sale.category]) {
        categoryPerformance[sale.category] = { revenue: 0, quantity: 0, orders: 0 };
      }
      categoryPerformance[sale.category].revenue += sale.total;
      categoryPerformance[sale.category].quantity += sale.quantity;
      categoryPerformance[sale.category].orders += 1;
    });

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthData = salesData.filter(sale => 
        sale.date >= monthStart && sale.date <= monthEnd
      );
      
      monthlyTrend.push({
        month: format(monthDate, 'MMM yyyy'),
        revenue: monthData.reduce((sum, sale) => sum + sale.total, 0),
        orders: monthData.length,
        customers: new Set(monthData.map(sale => sale.customer)).size
      });
    }

    return {
      currentRevenue,
      revenueGrowth,
      currentOrders,
      ordersGrowth,
      uniqueCustomers,
      customersGrowth,
      avgOrderValue,
      avgOrderGrowth,
      topProducts,
      topCustomers,
      categoryPerformance,
      monthlyTrend,
      currentPeriodData,
      previousPeriodData
    };
  }, [salesData, dateRange, selectedPeriod]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth) => {
    if (growth > 0) return `+${growth.toFixed(1)}%`;
    if (growth < 0) return `${growth.toFixed(1)}%`;
    return '0%';
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUp size={16} className="growth-positive" />;
    if (growth < 0) return <ArrowDown size={16} className="growth-negative" />;
    return <Minus size={16} className="growth-neutral" />;
  };

  const renderOverview = () => (
    <div className="analytics-overview">
      <div className="period-selector">
        <div className="period-controls">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="period-select"
          >
            <option value="month">Monthly</option>
            <option value="quarter">Quarterly</option>
          </select>
          <input
            type="month"
            value={format(selectedPeriod, 'yyyy-MM')}
            onChange={(e) => setSelectedPeriod(new Date(e.target.value))}
            className="period-input"
          />
        </div>
        <button className="btn-secondary">
          <Download size={16} />
          Export Report
        </button>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <DollarSign size={24} className="metric-icon revenue" />
            <span className="metric-label">Total Revenue</span>
          </div>
          <div className="metric-value">{formatCurrency(analytics.currentRevenue)}</div>
          <div className="metric-growth">
            {getGrowthIcon(analytics.revenueGrowth)}
            <span className={`growth-text ${analytics.revenueGrowth > 0 ? 'positive' : analytics.revenueGrowth < 0 ? 'negative' : 'neutral'}`}>
              {formatGrowth(analytics.revenueGrowth)} vs last {dateRange}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Package size={24} className="metric-icon orders" />
            <span className="metric-label">Total Orders</span>
          </div>
          <div className="metric-value">{analytics.currentOrders}</div>
          <div className="metric-growth">
            {getGrowthIcon(analytics.ordersGrowth)}
            <span className={`growth-text ${analytics.ordersGrowth > 0 ? 'positive' : analytics.ordersGrowth < 0 ? 'negative' : 'neutral'}`}>
              {formatGrowth(analytics.ordersGrowth)} vs last {dateRange}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Users size={24} className="metric-icon customers" />
            <span className="metric-label">Active Customers</span>
          </div>
          <div className="metric-value">{analytics.uniqueCustomers}</div>
          <div className="metric-growth">
            {getGrowthIcon(analytics.customersGrowth)}
            <span className={`growth-text ${analytics.customersGrowth > 0 ? 'positive' : analytics.customersGrowth < 0 ? 'negative' : 'neutral'}`}>
              {formatGrowth(analytics.customersGrowth)} vs last {dateRange}
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Target size={24} className="metric-icon avg-order" />
            <span className="metric-label">Avg Order Value</span>
          </div>
          <div className="metric-value">{formatCurrency(analytics.avgOrderValue)}</div>
          <div className="metric-growth">
            {getGrowthIcon(analytics.avgOrderGrowth)}
            <span className={`growth-text ${analytics.avgOrderGrowth > 0 ? 'positive' : analytics.avgOrderGrowth < 0 ? 'negative' : 'neutral'}`}>
              {formatGrowth(analytics.avgOrderGrowth)} vs last {dateRange}
            </span>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue Trend (Last 6 Months)</h3>
          <div className="revenue-chart">
            {analytics.monthlyTrend.map((month, index) => (
              <div key={index} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${(month.revenue / Math.max(...analytics.monthlyTrend.map(m => m.revenue))) * 100}%` 
                  }}
                />
                <span className="bar-value">{formatCurrency(month.revenue).replace('₹', '₹')}</span>
                <span className="bar-label">{month.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>Category Performance</h3>
          <div className="category-chart">
            {Object.entries(analytics.categoryPerformance)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .map(([category, data]) => (
                <div key={category} className="category-item">
                  <div className="category-info">
                    <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    <span className="category-revenue">{formatCurrency(data.revenue)}</span>
                  </div>
                  <div className="category-bar">
                    <div 
                      className="category-fill"
                      style={{ 
                        width: `${(data.revenue / Math.max(...Object.values(analytics.categoryPerformance).map(c => c.revenue))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="category-orders">{data.orders} orders</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomerAnalysis = () => (
    <div className="customer-analysis">
      <div className="analysis-header">
        <h3>Customer Sales Analysis</h3>
        <div className="analysis-period">
          {format(selectedPeriod, dateRange === 'month' ? 'MMMM yyyy' : 'QQQ yyyy')}
        </div>
      </div>

      <div className="customer-metrics">
        <div className="customer-summary">
          <div className="summary-card">
            <div className="summary-header">
              <Users size={20} />
              <span>Customer Distribution</span>
            </div>
            <div className="customer-segments">
              <div className="segment">
                <span className="segment-label">High Value (₹5L+)</span>
                <span className="segment-count">
                  {analytics.topCustomers.filter(c => c.revenue >= 500000).length}
                </span>
                <span className="segment-revenue">
                  {formatCurrency(analytics.topCustomers.filter(c => c.revenue >= 500000).reduce((sum, c) => sum + c.revenue, 0))}
                </span>
              </div>
              <div className="segment">
                <span className="segment-label">Medium Value (₹1L-5L)</span>
                <span className="segment-count">
                  {analytics.topCustomers.filter(c => c.revenue >= 100000 && c.revenue < 500000).length}
                </span>
                <span className="segment-revenue">
                  {formatCurrency(analytics.topCustomers.filter(c => c.revenue >= 100000 && c.revenue < 500000).reduce((sum, c) => sum + c.revenue, 0))}
                </span>
              </div>
              <div className="segment">
                <span className="segment-label">Regular (₹1L)</span>
                <span className="segment-count">
                  {analytics.topCustomers.filter(c => c.revenue < 100000).length}
                </span>
                <span className="segment-revenue">
                  {formatCurrency(analytics.topCustomers.filter(c => c.revenue < 100000).reduce((sum, c) => sum + c.revenue, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="top-customers">
          <h4>Top Customers by Revenue</h4>
          <div className="customers-list">
            {analytics.topCustomers.map((customer, index) => (
              <div key={customer.customer} className="customer-item">
                <div className="customer-rank">
                  {index === 0 && <Award size={16} className="rank-gold" />}
                  {index === 1 && <Award size={16} className="rank-silver" />}
                  {index === 2 && <Award size={16} className="rank-bronze" />}
                  {index > 2 && <span className="rank-number">#{index + 1}</span>}
                </div>
                <div className="customer-details">
                  <span className="customer-name">{customer.customer}</span>
                  <div className="customer-stats">
                    <span className="stat">
                      <DollarSign size={14} />
                      {formatCurrency(customer.revenue)}
                    </span>
                    <span className="stat">
                      <Package size={14} />
                      {customer.orders} orders
                    </span>
                    <span className="stat">
                      <Target size={14} />
                      {formatCurrency(customer.revenue / customer.orders)} avg
                    </span>
                  </div>
                </div>
                <div className="customer-progress">
                  <div 
                    className="progress-bar"
                    style={{ 
                      width: `${(customer.revenue / analytics.topCustomers[0].revenue) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="customer-insights">
        <div className="insight-card">
          <div className="insight-header">
            <TrendingUp size={20} />
            <span>Key Insights</span>
          </div>
          <div className="insights-list">
            <div className="insight-item">
              <CheckCircle size={16} className="insight-positive" />
              <span>Top 3 customers generate {((analytics.topCustomers.slice(0, 3).reduce((sum, c) => sum + c.revenue, 0) / analytics.currentRevenue) * 100).toFixed(1)}% of total revenue</span>
            </div>
            <div className="insight-item">
              <AlertTriangle size={16} className="insight-warning" />
              <span>Customer concentration risk: Consider diversifying customer base</span>
            </div>
            <div className="insight-item">
              <Target size={16} className="insight-info" />
              <span>Average customer lifetime value: {formatCurrency(analytics.currentRevenue / analytics.uniqueCustomers)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductPerformance = () => (
    <div className="product-performance">
      <div className="performance-header">
        <h3>Product Performance Metrics</h3>
        <div className="performance-filters">
          <select className="filter-select">
            <option value="revenue">Sort by Revenue</option>
            <option value="quantity">Sort by Quantity</option>
            <option value="orders">Sort by Orders</option>
          </select>
        </div>
      </div>

      <div className="product-grid">
        {analytics.topProducts.map((product, index) => (
          <div key={product.product} className="product-card">
            <div className="product-header">
              <div className="product-rank">
                {index < 3 ? (
                  <Star size={16} className={`star-${index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'}`} />
                ) : (
                  <span className="rank">#{index + 1}</span>
                )}
              </div>
              <h4 className="product-name">{product.product}</h4>
            </div>
            
            <div className="product-metrics">
              <div className="metric">
                <span className="metric-label">Revenue</span>
                <span className="metric-value">{formatCurrency(product.revenue)}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Quantity Sold</span>
                <span className="metric-value">{product.quantity.toLocaleString()} units</span>
              </div>
              <div className="metric">
                <span className="metric-label">Orders</span>
                <span className="metric-value">{product.orders}</span>
              </div>
              <div className="metric">
                <span className="metric-label">Avg Order Size</span>
                <span className="metric-value">{Math.round(product.quantity / product.orders)} units</span>
              </div>
            </div>

            <div className="product-performance-bar">
              <div className="performance-label">
                <span>Market Share</span>
                <span>{((product.revenue / analytics.currentRevenue) * 100).toFixed(1)}%</span>
              </div>
              <div className="performance-bar">
                <div 
                  className="performance-fill"
                  style={{ width: `${(product.revenue / analytics.topProducts[0].revenue) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="product-insights">
        <div className="insights-grid">
          <div className="insight-card">
            <h4>Best Performing Category</h4>
            <div className="insight-content">
              {Object.entries(analytics.categoryPerformance)
                .sort(([,a], [,b]) => b.revenue - a.revenue)[0] && (
                <>
                  <span className="insight-value">
                    {Object.entries(analytics.categoryPerformance)
                      .sort(([,a], [,b]) => b.revenue - a.revenue)[0][0]
                      .charAt(0).toUpperCase() + 
                     Object.entries(analytics.categoryPerformance)
                      .sort(([,a], [,b]) => b.revenue - a.revenue)[0][0].slice(1)}
                  </span>
                  <span className="insight-detail">
                    {formatCurrency(Object.entries(analytics.categoryPerformance)
                      .sort(([,a], [,b]) => b.revenue - a.revenue)[0][1].revenue)} revenue
                  </span>
                </>
              )}
            </div>
          </div>
          
          <div className="insight-card">
            <h4>Most Popular Product</h4>
            <div className="insight-content">
              <span className="insight-value">{analytics.topProducts[0]?.product}</span>
              <span className="insight-detail">{analytics.topProducts[0]?.orders} orders</span>
            </div>
          </div>
          
          <div className="insight-card">
            <h4>Revenue Leader</h4>
            <div className="insight-content">
              <span className="insight-value">{analytics.topProducts[0]?.product}</span>
              <span className="insight-detail">{formatCurrency(analytics.topProducts[0]?.revenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-section">
      <div className="reports-header">
        <h3>Monthly & Quarterly Reports</h3>
        <div className="report-actions">
          <button className="btn-secondary">
            <RefreshCw size={16} />
            Refresh Data
          </button>
          <button className="btn-primary">
            <Download size={16} />
            Generate Report
          </button>
        </div>
      </div>

      <div className="report-summary">
        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-header">
              <Calendar size={20} />
              <span>Report Period</span>
            </div>
            <div className="summary-content">
              <span className="period-text">
                {format(selectedPeriod, dateRange === 'month' ? 'MMMM yyyy' : 'QQQ yyyy')}
              </span>
              <span className="period-type">{dateRange === 'month' ? 'Monthly' : 'Quarterly'} Report</span>
            </div>
          </div>
          
          <div className="summary-item">
            <div className="summary-header">
              <BarChart3 size={20} />
              <span>Performance vs Target</span>
            </div>
            <div className="summary-content">
              <span className="performance-text">
                {analytics.revenueGrowth > 0 ? 'Above' : analytics.revenueGrowth < 0 ? 'Below' : 'On'} Target
              </span>
              <span className="performance-detail">
                {formatGrowth(analytics.revenueGrowth)} growth
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-tables">
        <div className="table-section">
          <h4>Revenue Breakdown by Product Category</h4>
          <div className="table-container">
            <table className="performance-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Avg Order Value</th>
                  <th>Market Share</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(analytics.categoryPerformance)
                  .sort(([,a], [,b]) => b.revenue - a.revenue)
                  .map(([category, data]) => (
                    <tr key={category}>
                      <td className="category-cell">
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </td>
                      <td className="revenue-cell">{formatCurrency(data.revenue)}</td>
                      <td className="orders-cell">{data.orders}</td>
                      <td className="avg-cell">{formatCurrency(data.revenue / data.orders)}</td>
                      <td className="share-cell">
                        {((data.revenue / analytics.currentRevenue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-section">
          <h4>Monthly Trend Analysis</h4>
          <div className="table-container">
            <table className="trend-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Revenue</th>
                  <th>Orders</th>
                  <th>Customers</th>
                  <th>Growth %</th>
                </tr>
              </thead>
              <tbody>
                {analytics.monthlyTrend.map((month, index) => {
                  const previousMonth = analytics.monthlyTrend[index - 1];
                  const growth = previousMonth ? 
                    ((month.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0;
                  
                  return (
                    <tr key={month.month}>
                      <td>{month.month}</td>
                      <td>{formatCurrency(month.revenue)}</td>
                      <td>{month.orders}</td>
                      <td>{month.customers}</td>
                      <td className={`growth-cell ${growth > 0 ? 'positive' : growth < 0 ? 'negative' : 'neutral'}`}>
                        {index > 0 ? formatGrowth(growth) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sales-analytics">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <BarChart3 size={28} />
            Sales Analytics
          </h1>
          <p>Comprehensive sales performance analysis and reporting</p>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={20} />
          Revenue Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <Users size={20} />
          Customer Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={20} />
          Product Performance
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <Calendar size={20} />
          Reports
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'customers' && renderCustomerAnalysis()}
        {activeTab === 'products' && renderProductPerformance()}
        {activeTab === 'reports' && renderReports()}
      </div>
    </div>
  );
};

export default SalesAnalytics;