// Enhanced PDF generator with DZD currency support

import { COMPANY_DEFAULTS, CURRENCY } from "./constants";

interface InvoiceItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface InvoiceData {
  id: number;
  client_name: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export async function generatePDF(invoiceData: InvoiceData): Promise<void> {
  const invoiceHtml = createInvoiceHTML(invoiceData);

  const newWindow = window.open("", "_blank", "width=800,height=600");
  if (newWindow) {
    newWindow.document.write(invoiceHtml);
    newWindow.document.close();

    setTimeout(() => {
      newWindow.focus();
      newWindow.print();
    }, 500);
  }
}

export async function downloadInvoicePDF(
  invoiceData: InvoiceData,
): Promise<void> {
  const invoiceHtml = createInvoiceHTML(invoiceData);

  const blob = new Blob([invoiceHtml], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `invoice-${invoiceData.id}-${invoiceData.client_name.replace(/\s+/g, "-")}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Also trigger print dialog
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  }
}

function createInvoiceHTML(invoiceData: InvoiceData): string {
  const companyInfo = JSON.parse(
    localStorage.getItem("company_info") || JSON.stringify(COMPANY_DEFAULTS),
  );

  return `
    <!DOCTYPE html>
    <html dir="ltr">
    <head>
      <title>Invoice #${invoiceData.id}</title>
      <meta charset="UTF-8">
      <style>
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          line-height: 1.6;
          color: #333;
          background: white;
          padding: 20mm;
          font-size: 12pt;
        }
        
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
          padding: 40px;
        }
        
        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 40px;
          border-bottom: 3px solid #0066cc;
          padding-bottom: 20px;
        }
        
        .company-info h1 {
          color: #0066cc;
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .company-info p {
          color: #666;
          margin: 2px 0;
        }
        
        .invoice-details {
          text-align: right;
        }
        
        .invoice-title {
          font-size: 32px;
          font-weight: bold;
          color: #0066cc;
          margin-bottom: 10px;
        }
        
        .invoice-meta {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border-left: 4px solid #0066cc;
        }
        
        .invoice-meta-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        
        .invoice-meta-row strong {
          color: #333;
        }
        
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin: 30px 0;
        }
        
        .billing-info {
          flex: 1;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-right: 20px;
        }
        
        .billing-info:last-child {
          margin-right: 0;
        }
        
        .billing-info h3 {
          color: #0066cc;
          margin-bottom: 10px;
          font-size: 16px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .billing-info p {
          margin: 5px 0;
          color: #555;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 30px 0;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .items-table thead {
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
        }
        
        .items-table th,
        .items-table td {
          padding: 15px 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        .items-table th {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        
        .items-table tbody tr:nth-child(even) {
          background: #f8f9fa;
        }
        
        .items-table tbody tr:hover {
          background: #e3f2fd;
        }
        
        .text-right {
          text-align: right !important;
        }
        
        .text-center {
          text-align: center !important;
        }
        
        .totals-section {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }
        
        .totals-table {
          width: 350px;
          border-collapse: collapse;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .totals-table td {
          padding: 12px 15px;
          border: 1px solid #ddd;
          background: white;
        }
        
        .totals-table .total-row {
          border-top: 2px solid #ddd;
        }
        
        .totals-table .grand-total {
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        
        .currency {
          font-weight: bold;
          color: #0066cc;
        }
        
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 11px;
          border-top: 2px solid #eee;
          padding-top: 20px;
        }
        
        .print-button {
          background: linear-gradient(135deg, #0066cc, #004499);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .print-button:hover {
          background: linear-gradient(135deg, #004499, #003366);
        }
        
        .arabic-currency {
          font-size: 16px;
          color: #0066cc;
          font-weight: bold;
        }
        
        @media screen {
          body {
            background: #f5f5f5;
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <button class="print-button no-print" onclick="window.print()">🖨️ Print Invoice</button>
        
        <div class="invoice-header">
          <div class="company-info">
            <h1>${companyInfo.name}</h1>
            <p>${companyInfo.address}</p>
            <p>Phone: ${companyInfo.phone}</p>
            <p>Email: ${companyInfo.email}</p>
          </div>
          <div class="invoice-details">
            <div class="invoice-title">INVOICE</div>
            <div class="invoice-meta">
              <div class="invoice-meta-row">
                <span>Invoice #:</span>
                <strong>${invoiceData.id}</strong>
              </div>
              <div class="invoice-meta-row">
                <span>Date:</span>
                <strong>${new Date(invoiceData.date).toLocaleDateString()}</strong>
              </div>
              <div class="invoice-meta-row">
                <span>Due Date:</span>
                <strong>${new Date(new Date(invoiceData.date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div class="billing-section">
          <div class="billing-info">
            <h3>Bill To:</h3>
            <p><strong>${invoiceData.client_name}</strong></p>
          </div>
          <div class="billing-info">
            <h3>Ship To:</h3>
            <p><strong>${invoiceData.client_name}</strong></p>
          </div>
        </div>
        
        <table class="items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-center">Quantity</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceData.items
              .map(
                (item) => `
              <tr>
                <td>
                  <strong>${item.product_name}</strong>
                </td>
                <td class="text-center">${item.quantity}</td>
                <td class="text-right"><span class="currency">${item.unit_price.toFixed(2)} ${CURRENCY.CODE}</span></td>
                <td class="text-right"><span class="currency">${(item.quantity * item.unit_price).toFixed(2)} ${CURRENCY.CODE}</span></td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <div class="totals-section">
          <table class="totals-table">
            <tr>
              <td>Subtotal:</td>
              <td class="text-right"><span class="currency">${invoiceData.subtotal.toFixed(2)} ${CURRENCY.CODE}</span></td>
            </tr>
            <tr>
              <td>Tax (${invoiceData.tax}%):</td>
              <td class="text-right"><span class="currency">${(invoiceData.subtotal * (invoiceData.tax / 100)).toFixed(2)} ${CURRENCY.CODE}</span></td>
            </tr>
            <tr>
              <td>Discount (${invoiceData.discount}%):</td>
              <td class="text-right"><span class="currency">-${(invoiceData.subtotal * (invoiceData.discount / 100)).toFixed(2)} ${CURRENCY.CODE}</span></td>
            </tr>
            <tr class="grand-total">
              <td><strong>TOTAL:</strong></td>
              <td class="text-right"><strong><span class="currency">${invoiceData.total.toFixed(2)} ${CURRENCY.CODE}</span> <span class="arabic-currency">${CURRENCY.SYMBOL}</span></strong></td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Payment is due within 30 days. Please include invoice number on your payment.</p>
          <p>All amounts are in ${CURRENCY.NAME} (${CURRENCY.CODE}) - جميع المبالغ بالدينار الجزائري</p>
        </div>
      </div>
      
      <script>
        window.addEventListener('load', function() {
          setTimeout(function() {
            window.focus();
          }, 100);
        });
      </script>
    </body>
    </html>
  `;
}
