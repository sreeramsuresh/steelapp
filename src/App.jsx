import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceList from './pages/InvoiceList';
import ComingSoon from './pages/ComingSoon';
import CustomerManagement from './components/CustomerManagement';
import SteelProducts from './components/SteelProducts';
import PriceCalculator from './components/PriceCalculator';
import SalesAnalytics from './components/SalesAnalytics';
import CompanySettings from './components/CompanySettings';
import RevenueTrends from './components/RevenueTrends';
import './App.css';

function App() {
  const [invoices, setInvoices] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSaveInvoice = (invoice) => {
    setInvoices(prev => {
      const existingIndex = prev.findIndex(inv => inv.id === invoice.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = invoice;
        return updated;
      }
      return [...prev, invoice];
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="app">
        <Sidebar 
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          invoiceCount={invoices.length}
        />
        
        <div className={`app-main ${sidebarOpen ? 'app-main-shifted' : ''}`}>
          <main className="main-content">
            <Routes>
              <Route 
                path="/" 
                element={<InvoiceForm onSave={handleSaveInvoice} />} 
              />
              <Route 
                path="/edit/:id" 
                element={
                  <InvoiceForm 
                    onSave={handleSaveInvoice} 
                    existingInvoice={invoices.find(inv => inv.id === window.location.pathname.split('/').pop())}
                  />
                } 
              />
              <Route 
                path="/invoices" 
                element={<InvoiceList invoices={invoices} />} 
              />
              <Route 
                path="/drafts" 
                element={<InvoiceList invoices={invoices.filter(inv => inv.status === 'draft')} />} 
              />
              <Route path="/customers" element={<CustomerManagement />} />
              <Route path="/products" element={<SteelProducts />} />
              <Route path="/calculator" element={<PriceCalculator />} />
              <Route path="/analytics" element={<SalesAnalytics />} />
              <Route path="/trends" element={<RevenueTrends />} />
              <Route path="/settings" element={<CompanySettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
