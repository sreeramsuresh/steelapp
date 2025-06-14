import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  List, 
  Settings, 
  BarChart3, 
  Users, 
  Package,
  Calculator,
  TrendingUp,
  Menu,
  X,
  FileDown
} from 'lucide-react';

const Sidebar = ({ isOpen, onToggle, invoiceCount }) => {
  const location = useLocation();
  
  const navigationItems = [
    {
      section: 'Invoices',
      items: [
        {
          name: 'New Invoice',
          path: '/',
          icon: Plus,
          description: 'Create new invoice'
        },
        {
          name: 'All Invoices',
          path: '/invoices',
          icon: List,
          description: 'View all invoices',
          badge: invoiceCount
        },
        {
          name: 'Draft Invoices',
          path: '/drafts',
          icon: FileText,
          description: 'Manage draft invoices'
        }
      ]
    },
    {
      section: 'Business',
      items: [
        {
          name: 'Customers',
          path: '/customers',
          icon: Users,
          description: 'Manage customers'
        },
        {
          name: 'Steel Products',
          path: '/products',
          icon: Package,
          description: 'Manage steel inventory'
        },
        {
          name: 'Price Calculator',
          path: '/calculator',
          icon: Calculator,
          description: 'Steel price calculator'
        }
      ]
    },
    {
      section: 'Reports',
      items: [
        {
          name: 'Sales Analytics',
          path: '/analytics',
          icon: BarChart3,
          description: 'View sales reports'
        },
        {
          name: 'Revenue Trends',
          path: '/trends',
          icon: TrendingUp,
          description: 'Revenue analytics'
        }
      ]
    },
    {
      section: 'Settings',
      items: [
        {
          name: 'Company Settings',
          path: '/settings',
          icon: Settings,
          description: 'Configure company details'
        }
      ]
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <FileText size={28} />
            <div className="brand-text">
              <h2>Steel Invoice Pro</h2>
              <span>Business Management</span>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button className="sidebar-close-btn" onClick={onToggle}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigationItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <h3 className="nav-section-title">{section.section}</h3>
              <ul className="nav-items">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = isActiveRoute(item.path);
                  
                  return (
                    <li key={itemIndex} className="nav-item">
                      <Link 
                        to={item.path}
                        className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                        onClick={() => window.innerWidth <= 768 && onToggle()}
                        title={item.description}
                      >
                        <div className="nav-link-content">
                          <Icon size={20} className="nav-icon" />
                          <div className="nav-text">
                            <span className="nav-name">{item.name}</span>
                            <span className="nav-description">{item.description}</span>
                          </div>
                        </div>
                        {item.badge && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-label">Total Invoices</span>
              <span className="stat-value">{invoiceCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">This Month</span>
              <span className="stat-value">
                {new Date().toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle-btn" onClick={onToggle}>
        <Menu size={20} />
        <span>Menu</span>
      </button>
    </>
  );
};

export default Sidebar;