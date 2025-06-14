// API configuration for the Steel Trading application

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/backend/api'  // For cPanel deployment
  : 'http://localhost/backend/api';  // For local development

export const API_ENDPOINTS = {
  // Customer endpoints
  customers: `${API_BASE_URL}/customers`,
  customerAnalytics: `${API_BASE_URL}/customers/analytics`,
  customerContacts: (customerId) => `${API_BASE_URL}/customers/contacts/${customerId}`,
  
  // Product endpoints
  products: `${API_BASE_URL}/products`,
  productAnalytics: `${API_BASE_URL}/products/analytics`,
  productCategories: `${API_BASE_URL}/products/categories`,
  productPriceHistory: (productId) => `${API_BASE_URL}/products/price-history/${productId}`,
  updateProductPrice: `${API_BASE_URL}/products/update-price`,
  
  // Invoice endpoints
  invoices: `${API_BASE_URL}/invoices`,
  invoiceAnalytics: `${API_BASE_URL}/invoices/analytics`,
  revenueTrends: `${API_BASE_URL}/invoices/revenue-trends`,
  generateInvoiceNumber: `${API_BASE_URL}/invoices/generate-number`,
};

// API utility functions
export const api = {
  // Generic request function
  async request(url, options = {}) {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // GET request
  async get(url) {
    return this.request(url);
  },

  // POST request
  async post(url, data) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT request
  async put(url, data) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // DELETE request
  async delete(url) {
    return this.request(url, {
      method: 'DELETE',
    });
  },
};

// Customer API functions
export const customerAPI = {
  getAll: () => api.get(API_ENDPOINTS.customers),
  getById: (id) => api.get(`${API_ENDPOINTS.customers}/${id}`),
  create: (customer) => api.post(API_ENDPOINTS.customers, customer),
  update: (id, customer) => api.put(`${API_ENDPOINTS.customers}/${id}`, customer),
  delete: (id) => api.delete(`${API_ENDPOINTS.customers}/${id}`),
  getAnalytics: () => api.get(API_ENDPOINTS.customerAnalytics),
  getContacts: (customerId) => api.get(API_ENDPOINTS.customerContacts(customerId)),
  addContact: (contact) => api.post(`${API_ENDPOINTS.customers}/contacts`, contact),
};

// Product API functions
export const productAPI = {
  getAll: () => api.get(API_ENDPOINTS.products),
  getById: (id) => api.get(`${API_ENDPOINTS.products}/${id}`),
  create: (product) => api.post(API_ENDPOINTS.products, product),
  update: (id, product) => api.put(`${API_ENDPOINTS.products}/${id}`, product),
  delete: (id) => api.delete(`${API_ENDPOINTS.products}/${id}`),
  getAnalytics: () => api.get(API_ENDPOINTS.productAnalytics),
  getCategories: () => api.get(API_ENDPOINTS.productCategories),
  getPriceHistory: (productId) => api.get(API_ENDPOINTS.productPriceHistory(productId)),
  updatePrice: (priceUpdate) => api.post(API_ENDPOINTS.updateProductPrice, priceUpdate),
};

// Invoice API functions
export const invoiceAPI = {
  getAll: () => api.get(API_ENDPOINTS.invoices),
  getById: (id) => api.get(`${API_ENDPOINTS.invoices}/${id}`),
  create: (invoice) => api.post(API_ENDPOINTS.invoices, invoice),
  update: (id, invoice) => api.put(`${API_ENDPOINTS.invoices}/${id}`, invoice),
  delete: (id) => api.delete(`${API_ENDPOINTS.invoices}/${id}`),
  getAnalytics: () => api.get(API_ENDPOINTS.invoiceAnalytics),
  getRevenueTrends: () => api.get(API_ENDPOINTS.revenueTrends),
  generateNumber: () => api.get(API_ENDPOINTS.generateInvoiceNumber),
};