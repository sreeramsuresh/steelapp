import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  LineChart,
  Calendar,
  Target,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Eye,
  Download,
  RefreshCw,
  Zap,
  Sun,
  Snowflake,
  Leaf,
  Flower2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

const RevenueTrends = () => {
  const [activeTab, setActiveTab] = useState('trends');
  const [timeRange, setTimeRange] = useState('12months');
  const [viewType, setViewType] = useState('monthly');
  const [showPredictions, setShowPredictions] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [forecastData, setForecastData] = useState([]);

  // Generate comprehensive revenue data
  useEffect(() => {
    const generateRevenueData = () => {
      const baseRevenue = 800000; // Base monthly revenue
      const data = [];
      const monthlyGrowthTrend = 0.08; // 8% annual growth
      const seasonalFactors = {
        0: 0.85,  // January - post-holiday slowdown
        1: 0.90,  // February
        2: 1.05,  // March - construction season starts
        3: 1.15,  // April - peak construction
        4: 1.20,  // May - peak construction
        5: 1.18,  // June
        6: 1.10,  // July
        7: 1.12,  // August
        8: 1.08,  // September
        9: 1.00,  // October
        10: 0.95, // November - slowdown
        11: 0.80  // December - holiday slowdown
      };

      // Generate 24 months of historical data
      for (let i = 23; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const month = date.getMonth();
        const year = date.getFullYear();
        
        // Calculate trend growth
        const trendMultiplier = Math.pow(1 + monthlyGrowthTrend / 12, 24 - i);
        
        // Apply seasonal factor
        const seasonalMultiplier = seasonalFactors[month];
        
        // Add some randomness (±15%)
        const randomFactor = 0.85 + Math.random() * 0.3;
        
        // Calculate final revenue
        const revenue = Math.round(baseRevenue * trendMultiplier * seasonalMultiplier * randomFactor);
        
        // Generate orders based on revenue (roughly ₹40k average order)
        const avgOrderValue = 35000 + Math.random() * 10000;
        const orders = Math.round(revenue / avgOrderValue);
        
        // Calculate growth rate
        const previousRevenue = i === 23 ? revenue * 0.95 : data[data.length - 1]?.revenue || revenue;
        const growthRate = i === 23 ? 0 : ((revenue - previousRevenue) / previousRevenue) * 100;

        data.push({
          date,
          month: format(date, 'MMM yyyy'),
          shortMonth: format(date, 'MMM'),
          revenue,
          orders,
          growthRate,
          avgOrderValue: Math.round(avgOrderValue),
          quarter: `Q${Math.ceil((month + 1) / 3)} ${year}`,
          season: getSeason(month),
          isCurrentMonth: i === 0
        });
      }

      return data;
    };

    const data = generateRevenueData();
    setRevenueData(data);

    // Generate forecast data
    const forecast = generateForecast(data);
    setForecastData(forecast);
  }, []);

  const getSeason = (month) => {
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Autumn';
    return 'Winter';
  };

  const generateForecast = (historicalData) => {
    const lastSixMonths = historicalData.slice(-6);
    const avgGrowthRate = lastSixMonths.reduce((sum, item) => sum + item.growthRate, 0) / 6;
    
    // Simple linear regression for trend
    const revenueValues = lastSixMonths.map(item => item.revenue);
    const trend = calculateTrend(revenueValues);
    
    const forecast = [];
    let lastRevenue = historicalData[historicalData.length - 1].revenue;

    // Generate 6 months of forecast
    for (let i = 1; i <= 6; i++) {
      const futureDate = addMonths(new Date(), i);
      const month = futureDate.getMonth();
      
      // Apply trend and seasonal factors
      const seasonalFactors = {
        0: 0.85, 1: 0.90, 2: 1.05, 3: 1.15, 4: 1.20, 5: 1.18,
        6: 1.10, 7: 1.12, 8: 1.08, 9: 1.00, 10: 0.95, 11: 0.80
      };
      
      const seasonalMultiplier = seasonalFactors[month];
      const trendGrowth = 1 + (trend / 100);
      const predictedRevenue = Math.round(lastRevenue * trendGrowth * seasonalMultiplier);
      
      // Calculate confidence intervals
      const confidenceRange = predictedRevenue * 0.15; // ±15%
      const confidence = Math.max(60, 90 - (i * 5)); // Decreasing confidence over time

      forecast.push({
        date: futureDate,
        month: format(futureDate, 'MMM yyyy'),
        shortMonth: format(futureDate, 'MMM'),
        revenue: predictedRevenue,
        minRevenue: predictedRevenue - confidenceRange,
        maxRevenue: predictedRevenue + confidenceRange,
        confidence,
        isPrediction: true
      });

      lastRevenue = predictedRevenue;
    }

    return forecast;
  };

  const calculateTrend = (values) => {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;
    
    return (slope / avgY) * 100; // Convert to percentage
  };

  // Analytics calculations
  const analytics = useMemo(() => {
    if (revenueData.length === 0) return {};

    const currentMonth = revenueData[revenueData.length - 1];
    const previousMonth = revenueData[revenueData.length - 2];
    const lastYear = revenueData.slice(-12);
    const previousYear = revenueData.slice(-24, -12);

    // Current metrics
    const monthlyGrowth = previousMonth ? 
      ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue) * 100 : 0;

    // Year-over-year growth
    const currentYearRevenue = lastYear.reduce((sum, item) => sum + item.revenue, 0);
    const previousYearRevenue = previousYear.reduce((sum, item) => sum + item.revenue, 0);
    const yearlyGrowth = previousYearRevenue > 0 ? 
      ((currentYearRevenue - previousYearRevenue) / previousYearRevenue) * 100 : 0;

    // Seasonal analysis
    const seasonalData = {};
    revenueData.forEach(item => {
      if (!seasonalData[item.season]) {
        seasonalData[item.season] = { revenue: 0, count: 0 };
      }
      seasonalData[item.season].revenue += item.revenue;
      seasonalData[item.season].count += 1;
    });

    Object.keys(seasonalData).forEach(season => {
      seasonalData[season].avgRevenue = seasonalData[season].revenue / seasonalData[season].count;
    });

    // Best and worst performing months
    const sortedByRevenue = [...lastYear].sort((a, b) => b.revenue - a.revenue);
    const bestMonth = sortedByRevenue[0];
    const worstMonth = sortedByRevenue[sortedByRevenue.length - 1];

    // Growth trend analysis
    const last6Months = revenueData.slice(-6);
    const growthTrend = calculateTrend(last6Months.map(item => item.revenue));
    
    // Volatility calculation (standard deviation of growth rates)
    const growthRates = last6Months.slice(1).map(item => item.growthRate);
    const avgGrowthRate = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    const variance = growthRates.reduce((sum, rate) => sum + Math.pow(rate - avgGrowthRate, 2), 0) / growthRates.length;
    const volatility = Math.sqrt(variance);

    // Forecast accuracy (if we had previous forecasts)
    const forecastAccuracy = Math.max(75, 90 - Math.abs(growthTrend) * 2);

    return {
      currentMonth,
      monthlyGrowth,
      yearlyGrowth,
      currentYearRevenue,
      seasonalData,
      bestMonth,
      worstMonth,
      growthTrend,
      volatility,
      forecastAccuracy,
      last6Months
    };
  }, [revenueData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatGrowth = (growth) => {
    const absGrowth = Math.abs(growth);
    const sign = growth > 0 ? '+' : growth < 0 ? '' : '';
    return `${sign}${absGrowth.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUp size={16} className="growth-positive" />;
    if (growth < 0) return <ArrowDown size={16} className="growth-negative" />;
    return <Minus size={16} className="growth-neutral" />;
  };

  const getSeasonIcon = (season) => {
    switch (season) {
      case 'Spring': return <Flower2 size={20} className="season-spring" />;
      case 'Summer': return <Sun size={20} className="season-summer" />;
      case 'Autumn': return <Leaf size={20} className="season-autumn" />;
      case 'Winter': return <Snowflake size={20} className="season-winter" />;
      default: return <Calendar size={20} />;
    }
  };

  const renderTrends = () => (
    <div className="trends-overview">
      <div className="trends-controls">
        <div className="view-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="control-select"
          >
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="24months">Last 24 Months</option>
          </select>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className="control-select"
          >
            <option value="monthly">Monthly View</option>
            <option value="quarterly">Quarterly View</option>
          </select>
          <label className="toggle-control">
            <input
              type="checkbox"
              checked={showPredictions}
              onChange={(e) => setShowPredictions(e.target.checked)}
            />
            <span>Show Predictions</span>
          </label>
        </div>
        <div className="action-controls">
          <button className="btn-secondary">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="btn-primary">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="key-metrics">
        <div className="metric-card trend-metric">
          <div className="metric-header">
            <TrendingUp size={24} className="metric-icon" />
            <span className="metric-label">Monthly Growth</span>
          </div>
          <div className="metric-value">{formatGrowth(analytics.monthlyGrowth || 0)}</div>
          <div className="metric-growth">
            {getGrowthIcon(analytics.monthlyGrowth || 0)}
            <span className={`growth-text ${analytics.monthlyGrowth > 0 ? 'positive' : analytics.monthlyGrowth < 0 ? 'negative' : 'neutral'}`}>
              vs last month
            </span>
          </div>
        </div>

        <div className="metric-card trend-metric">
          <div className="metric-header">
            <BarChart3 size={24} className="metric-icon" />
            <span className="metric-label">Yearly Growth</span>
          </div>
          <div className="metric-value">{formatGrowth(analytics.yearlyGrowth || 0)}</div>
          <div className="metric-growth">
            {getGrowthIcon(analytics.yearlyGrowth || 0)}
            <span className={`growth-text ${analytics.yearlyGrowth > 0 ? 'positive' : analytics.yearlyGrowth < 0 ? 'negative' : 'neutral'}`}>
              vs last year
            </span>
          </div>
        </div>

        <div className="metric-card trend-metric">
          <div className="metric-header">
            <Activity size={24} className="metric-icon" />
            <span className="metric-label">Growth Trend</span>
          </div>
          <div className="metric-value">{formatGrowth(analytics.growthTrend || 0)}</div>
          <div className="metric-growth">
            <span className="trend-indicator">
              {analytics.growthTrend > 2 ? 'Strong Growth' : 
               analytics.growthTrend > 0 ? 'Moderate Growth' : 
               analytics.growthTrend > -2 ? 'Stable' : 'Declining'}
            </span>
          </div>
        </div>

        <div className="metric-card trend-metric">
          <div className="metric-header">
            <Target size={24} className="metric-icon" />
            <span className="metric-label">Forecast Accuracy</span>
          </div>
          <div className="metric-value">{Math.round(analytics.forecastAccuracy || 85)}%</div>
          <div className="metric-growth">
            <span className="accuracy-indicator">
              {analytics.forecastAccuracy > 85 ? 'High Confidence' : 'Moderate Confidence'}
            </span>
          </div>
        </div>
      </div>

      <div className="revenue-chart-container">
        <div className="chart-header">
          <h3>Revenue Trend Analysis</h3>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color historical"></div>
              <span>Historical Data</span>
            </div>
            {showPredictions && (
              <div className="legend-item">
                <div className="legend-color forecast"></div>
                <span>Forecast</span>
              </div>
            )}
          </div>
        </div>

        <div className="revenue-chart">
          <div className="chart-y-axis">
            {[1000000, 800000, 600000, 400000, 200000, 0].map(value => (
              <div key={value} className="y-axis-label">
                {value === 0 ? '0' : `₹${(value / 100000).toFixed(0)}L`}
              </div>
            ))}
          </div>
          
          <div className="chart-content">
            <div className="chart-bars">
              {/* Historical data */}
              {revenueData.slice(-12).map((item, index) => (
                <div key={index} className="chart-bar historical">
                  <div 
                    className="bar-fill"
                    style={{ 
                      height: `${(item.revenue / 1000000) * 100}%`,
                      backgroundColor: item.growthRate > 0 ? '#22c55e' : item.growthRate < 0 ? '#ef4444' : '#64748b'
                    }}
                  />
                  <div className="bar-value">{formatCurrency(item.revenue).replace('₹', '₹')}</div>
                  <div className="bar-label">{item.shortMonth}</div>
                  <div className="bar-growth">
                    {getGrowthIcon(item.growthRate)}
                    <span className={item.growthRate > 0 ? 'positive' : item.growthRate < 0 ? 'negative' : 'neutral'}>
                      {formatGrowth(item.growthRate)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Forecast data */}
              {showPredictions && forecastData.map((item, index) => (
                <div key={`forecast-${index}`} className="chart-bar forecast">
                  <div 
                    className="bar-fill forecast"
                    style={{ height: `${(item.revenue / 1000000) * 100}%` }}
                  />
                  <div className="confidence-range" style={{
                    height: `${((item.maxRevenue - item.minRevenue) / 1000000) * 100}%`,
                    bottom: `${(item.minRevenue / 1000000) * 100}%`
                  }} />
                  <div className="bar-value forecast">{formatCurrency(item.revenue).replace('₹', '₹')}</div>
                  <div className="bar-label">{item.shortMonth}</div>
                  <div className="bar-confidence">{item.confidence}% confidence</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForecasting = () => (
    <div className="forecasting-section">
      <div className="forecasting-header">
        <h3>Revenue Forecasting & Predictions</h3>
        <div className="forecast-period">
          Next 6 Months Outlook
        </div>
      </div>

      <div className="forecast-summary">
        <div className="forecast-metrics">
          <div className="forecast-card">
            <div className="card-header">
              <Zap size={20} />
              <span>Predicted Growth</span>
            </div>
            <div className="card-value">
              {formatGrowth(analytics.growthTrend || 0)}
            </div>
            <div className="card-subtitle">
              Based on 6-month trend analysis
            </div>
          </div>

          <div className="forecast-card">
            <div className="card-header">
              <Target size={20} />
              <span>Next Month Forecast</span>
            </div>
            <div className="card-value">
              {forecastData.length > 0 ? formatCurrency(forecastData[0].revenue) : '₹0'}
            </div>
            <div className="card-subtitle">
              {forecastData.length > 0 ? `${forecastData[0].confidence}% confidence` : 'No data'}
            </div>
          </div>

          <div className="forecast-card">
            <div className="card-header">
              <Activity size={20} />
              <span>Volatility Index</span>
            </div>
            <div className="card-value">
              {(analytics.volatility || 0).toFixed(1)}%
            </div>
            <div className="card-subtitle">
              {analytics.volatility > 10 ? 'High' : analytics.volatility > 5 ? 'Moderate' : 'Low'} volatility
            </div>
          </div>
        </div>
      </div>

      <div className="forecast-details">
        <div className="forecast-table">
          <h4>6-Month Revenue Forecast</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Predicted Revenue</th>
                  <th>Confidence Range</th>
                  <th>Confidence Level</th>
                  <th>Expected Growth</th>
                </tr>
              </thead>
              <tbody>
                {forecastData.map((item, index) => {
                  const previousRevenue = index === 0 ? 
                    (revenueData.length > 0 ? revenueData[revenueData.length - 1].revenue : item.revenue) :
                    forecastData[index - 1].revenue;
                  const expectedGrowth = ((item.revenue - previousRevenue) / previousRevenue) * 100;

                  return (
                    <tr key={index}>
                      <td className="month-cell">{item.month}</td>
                      <td className="revenue-cell">{formatCurrency(item.revenue)}</td>
                      <td className="range-cell">
                        {formatCurrency(item.minRevenue)} - {formatCurrency(item.maxRevenue)}
                      </td>
                      <td className="confidence-cell">
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill"
                            style={{ width: `${item.confidence}%` }}
                          />
                          <span>{item.confidence}%</span>
                        </div>
                      </td>
                      <td className={`growth-cell ${expectedGrowth > 0 ? 'positive' : expectedGrowth < 0 ? 'negative' : 'neutral'}`}>
                        {getGrowthIcon(expectedGrowth)}
                        {formatGrowth(expectedGrowth)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="forecast-insights">
          <h4>Forecast Insights</h4>
          <div className="insights-list">
            <div className="insight-item">
              <CheckCircle size={16} className="insight-positive" />
              <span>Seasonal patterns show strong Q2 performance expected</span>
            </div>
            <div className="insight-item">
              <AlertCircle size={16} className="insight-warning" />
              <span>December typically shows 20% revenue decline due to holidays</span>
            </div>
            <div className="insight-item">
              <CheckCircle size={16} className="insight-positive" />
              <span>Current growth trend suggests 12% annual increase</span>
            </div>
            <div className="insight-item">
              <AlertCircle size={16} className="insight-info" />
              <span>Market volatility may affect Q3 predictions by ±15%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSeasonalAnalysis = () => (
    <div className="seasonal-analysis">
      <div className="seasonal-header">
        <h3>Seasonal Analysis & Patterns</h3>
        <div className="analysis-period">
          Based on 24 months of historical data
        </div>
      </div>

      <div className="seasonal-overview">
        <div className="seasonal-cards">
          {Object.entries(analytics.seasonalData || {}).map(([season, data]) => (
            <div key={season} className={`seasonal-card ${season.toLowerCase()}`}>
              <div className="seasonal-header">
                {getSeasonIcon(season)}
                <h4>{season}</h4>
              </div>
              <div className="seasonal-metrics">
                <div className="seasonal-metric">
                  <span className="metric-label">Avg Revenue</span>
                  <span className="metric-value">{formatCurrency(data.avgRevenue || 0)}</span>
                </div>
                <div className="seasonal-metric">
                  <span className="metric-label">Total Months</span>
                  <span className="metric-value">{data.count}</span>
                </div>
                <div className="seasonal-metric">
                  <span className="metric-label">Performance</span>
                  <span className="metric-value">
                    {data.avgRevenue > 900000 ? 'Excellent' : 
                     data.avgRevenue > 750000 ? 'Good' : 
                     data.avgRevenue > 600000 ? 'Average' : 'Below Average'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="seasonal-charts">
        <div className="monthly-pattern">
          <h4>Monthly Revenue Patterns</h4>
          <div className="pattern-chart">
            {revenueData.slice(-12).map((item, index) => (
              <div key={index} className="pattern-bar">
                <div 
                  className="pattern-fill"
                  style={{ 
                    height: `${(item.revenue / Math.max(...revenueData.slice(-12).map(d => d.revenue))) * 100}%`,
                    backgroundColor: `var(--season-${item.season.toLowerCase()})`
                  }}
                />
                <div className="pattern-value">{(item.revenue / 100000).toFixed(0)}L</div>
                <div className="pattern-label">{item.shortMonth}</div>
                <div className="pattern-season">{getSeasonIcon(item.season)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="seasonal-insights">
          <h4>Seasonal Insights</h4>
          <div className="insights-grid">
            <div className="insight-card seasonal">
              <h5>Peak Season</h5>
              <div className="insight-content">
                <span className="insight-value">Spring (Mar-May)</span>
                <span className="insight-detail">
                  {analytics.bestMonth ? `Best: ${analytics.bestMonth.month}` : 'No data'}
                </span>
              </div>
            </div>
            
            <div className="insight-card seasonal">
              <h5>Low Season</h5>
              <div className="insight-content">
                <span className="insight-value">Winter (Dec-Feb)</span>
                <span className="insight-detail">
                  {analytics.worstMonth ? `Lowest: ${analytics.worstMonth.month}` : 'No data'}
                </span>
              </div>
            </div>
            
            <div className="insight-card seasonal">
              <h5>Seasonal Variance</h5>
              <div className="insight-content">
                <span className="insight-value">±{((analytics.volatility || 0) * 1.5).toFixed(0)}%</span>
                <span className="insight-detail">Between peak and low seasons</span>
              </div>
            </div>
          </div>

          <div className="pattern-recommendations">
            <h5>Recommendations</h5>
            <div className="recommendations-list">
              <div className="recommendation-item">
                <CheckCircle size={14} />
                <span>Increase inventory before March construction season</span>
              </div>
              <div className="recommendation-item">
                <CheckCircle size={14} />
                <span>Focus marketing efforts during April-May peak period</span>
              </div>
              <div className="recommendation-item">
                <AlertCircle size={14} />
                <span>Plan for 20% revenue drop during December holidays</span>
              </div>
              <div className="recommendation-item">
                <CheckCircle size={14} />
                <span>Use winter months for equipment maintenance and training</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGrowthMetrics = () => (
    <div className="growth-metrics">
      <div className="metrics-header">
        <h3>Growth Metrics & KPIs</h3>
        <div className="metrics-period">
          Performance indicators and growth analysis
        </div>
      </div>

      <div className="kpi-dashboard">
        <div className="kpi-grid">
          <div className="kpi-card primary">
            <div className="kpi-header">
              <TrendingUp size={24} />
              <span>Revenue Growth Rate</span>
            </div>
            <div className="kpi-value">{formatGrowth(analytics.yearlyGrowth || 0)}</div>
            <div className="kpi-target">
              <span>Target: +15%</span>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${Math.min(((analytics.yearlyGrowth || 0) / 15) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="kpi-card secondary">
            <div className="kpi-header">
              <BarChart3 size={24} />
              <span>Monthly Momentum</span>
            </div>
            <div className="kpi-value">{formatGrowth(analytics.monthlyGrowth || 0)}</div>
            <div className="kpi-status">
              <span className={analytics.monthlyGrowth > 5 ? 'status-excellent' : 
                             analytics.monthlyGrowth > 0 ? 'status-good' : 
                             analytics.monthlyGrowth > -5 ? 'status-warning' : 'status-poor'}>
                {analytics.monthlyGrowth > 5 ? 'Excellent' : 
                 analytics.monthlyGrowth > 0 ? 'Good' : 
                 analytics.monthlyGrowth > -5 ? 'Stable' : 'Declining'}
              </span>
            </div>
          </div>

          <div className="kpi-card tertiary">
            <div className="kpi-header">
              <Activity size={24} />
              <span>Growth Consistency</span>
            </div>
            <div className="kpi-value">{(100 - (analytics.volatility || 0) * 2).toFixed(0)}%</div>
            <div className="kpi-description">
              {analytics.volatility < 5 ? 'Very Consistent' : 
               analytics.volatility < 10 ? 'Moderately Consistent' : 'Highly Variable'}
            </div>
          </div>

          <div className="kpi-card quaternary">
            <div className="kpi-header">
              <Target size={24} />
              <span>Forecast Reliability</span>
            </div>
            <div className="kpi-value">{Math.round(analytics.forecastAccuracy || 85)}%</div>
            <div className="kpi-description">
              Based on trend analysis accuracy
            </div>
          </div>
        </div>
      </div>

      <div className="detailed-metrics">
        <div className="metrics-table">
          <h4>Detailed Growth Analysis</h4>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Growth Rate</th>
                  <th>Orders</th>
                  <th>Avg Order Value</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.slice(-6).map((item, index) => (
                  <tr key={index}>
                    <td className="period-cell">{item.month}</td>
                    <td className="revenue-cell">{formatCurrency(item.revenue)}</td>
                    <td className={`growth-cell ${item.growthRate > 0 ? 'positive' : item.growthRate < 0 ? 'negative' : 'neutral'}`}>
                      {getGrowthIcon(item.growthRate)}
                      {formatGrowth(item.growthRate)}
                    </td>
                    <td className="orders-cell">{item.orders}</td>
                    <td className="aov-cell">{formatCurrency(item.avgOrderValue)}</td>
                    <td className="performance-cell">
                      <span className={`performance-badge ${
                        item.revenue > 900000 ? 'excellent' : 
                        item.revenue > 750000 ? 'good' : 
                        item.revenue > 600000 ? 'average' : 'below'
                      }`}>
                        {item.revenue > 900000 ? 'Excellent' : 
                         item.revenue > 750000 ? 'Good' : 
                         item.revenue > 600000 ? 'Average' : 'Below Target'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="growth-analysis">
          <h4>Growth Analysis Summary</h4>
          <div className="analysis-grid">
            <div className="analysis-item">
              <div className="analysis-label">Compound Annual Growth Rate (CAGR)</div>
              <div className="analysis-value">
                {((Math.pow((analytics.currentYearRevenue || 0) / (analytics.currentYearRevenue || 1) * 0.8, 1) - 1) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">Revenue Acceleration</div>
              <div className="analysis-value">
                {analytics.growthTrend > analytics.monthlyGrowth ? 'Accelerating' : 
                 analytics.growthTrend < analytics.monthlyGrowth ? 'Decelerating' : 'Steady'}
              </div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">Market Position</div>
              <div className="analysis-value">
                {analytics.yearlyGrowth > 15 ? 'Market Leader' : 
                 analytics.yearlyGrowth > 8 ? 'Strong Performer' : 
                 analytics.yearlyGrowth > 0 ? 'Stable Growth' : 'Needs Attention'}
              </div>
            </div>
            <div className="analysis-item">
              <div className="analysis-label">Risk Level</div>
              <div className="analysis-value">
                {analytics.volatility < 5 ? 'Low Risk' : 
                 analytics.volatility < 10 ? 'Moderate Risk' : 'High Risk'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="revenue-trends">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <TrendingUp size={28} />
            Revenue Trends
          </h1>
          <p>Advanced revenue analysis, forecasting, and growth insights</p>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'trends' ? 'active' : ''}`}
          onClick={() => setActiveTab('trends')}
        >
          <LineChart size={20} />
          Trend Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'forecasting' ? 'active' : ''}`}
          onClick={() => setActiveTab('forecasting')}
        >
          <Target size={20} />
          Forecasting
        </button>
        <button
          className={`tab-btn ${activeTab === 'seasonal' ? 'active' : ''}`}
          onClick={() => setActiveTab('seasonal')}
        >
          <Calendar size={20} />
          Seasonal Analysis
        </button>
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <Activity size={20} />
          Growth Metrics
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'trends' && renderTrends()}
        {activeTab === 'forecasting' && renderForecasting()}
        {activeTab === 'seasonal' && renderSeasonalAnalysis()}
        {activeTab === 'metrics' && renderGrowthMetrics()}
      </div>
    </div>
  );
};

export default RevenueTrends;