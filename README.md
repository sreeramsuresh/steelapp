# Steel Invoice Pro

A modern, responsive invoice management application specifically designed for steel trading businesses. Built with React, TypeScript, and Vite.

## Features

### 🏗️ Steel Business Focused
- Specialized fields for steel products (specifications, HSN codes, units)
- Support for various steel units (kg, ton, piece, meter, feet)
- GST-compliant invoice generation
- Professional invoice templates

### 📋 Invoice Management
- Create and edit invoices with comprehensive customer details
- Add multiple steel items with detailed specifications
- Automatic calculations for subtotal, GST, and total amounts
- Invoice status tracking (draft, sent, paid, overdue)

### 🎨 Modern UI/UX
- Clean, professional interface inspired by modern business applications
- Responsive sidebar navigation with organized sections
- Real-time preview of invoices
- Intuitive form controls and navigation
- Mobile-friendly collapsible sidebar

### 📄 PDF Generation
- Generate professional PDF invoices with one click
- Print-ready format optimized for A4 paper
- Company branding and professional layout
- Download individual invoices as PDF files
- Bulk PDF download for multiple invoices
- Direct PDF generation from invoice form
- Loading states and progress indicators

### 🔍 Invoice Management
- View all invoices in a comprehensive list
- Search invoices by number or customer name
- Filter invoices by status
- Quick access to edit, view, and download functions
- Draft invoices management
- Organized navigation for all business features

## Technology Stack

- **Frontend**: React 18 with JSX
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **PDF Generation**: jsPDF with html2canvas
- **Styling**: Custom CSS with modern design principles

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3030`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating an Invoice

1. Click "New Invoice" in the navigation
2. Fill in the invoice details (number, dates)
3. Enter customer information including GST number
4. Add steel items with:
   - Item name and specifications
   - HSN codes for GST compliance
   - Quantities and rates
   - GST percentages
5. Add notes and terms as needed
6. Preview the invoice before saving
7. Save the invoice to your list

### Managing Invoices

1. Navigate to "All Invoices" to see your invoice list
2. Use the search bar to find specific invoices
3. Filter by status (draft, sent, paid, overdue)
4. Edit, view, or download invoices using the action buttons

### PDF Generation

- **From Invoice Form**: Click "Download PDF" button to generate PDF directly
- **From Invoice List**: Click the download icon next to any invoice to generate PDF
- **Bulk Download**: Use "Download All PDFs" button to download multiple invoices at once
- **Preview First**: Click "Preview" in the invoice form to see formatted invoice before downloading
- All PDFs include complete invoice details in professional A4 format
- Loading indicators show generation progress

## Customization

### Company Information
Edit the company details in `src/types/index.js` in the `createCompany` function:

```javascript
export const createCompany = () => ({
  name: 'Your Steel Trading Co.',
  address: {
    street: 'Your Address',
    city: 'Your City',
    state: 'Your State',
    zipCode: 'Your ZIP',
    country: 'India'
  },
  phone: 'Your Phone',
  email: 'your@email.com',
  gstNumber: 'Your GST Number'
});
```

### Styling
The application uses custom CSS. Main styles are in `src/App.css`. You can customize:
- Colors and theme
- Typography
- Layout and spacing
- Component styles

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── InvoicePreview.jsx
│   └── Sidebar.jsx
├── pages/              # Main application pages
│   ├── InvoiceForm.jsx
│   ├── InvoiceList.jsx
│   └── ComingSoon.jsx
├── types/              # Data structure definitions
│   └── index.js
├── utils/              # Utility functions
│   └── invoiceUtils.js
├── App.jsx             # Main application component
├── App.css             # Application styles
└── main.jsx            # Application entry point
```

## License

This project is created for educational and commercial use. Please ensure compliance with local business and tax regulations when using for commercial purposes.
