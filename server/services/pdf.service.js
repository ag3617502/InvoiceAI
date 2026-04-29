const puppeteer = require('puppeteer');

const generateInvoicePDF = async (invoice, user) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();

    // Calculate tax amount
    const taxAmount = (invoice.cgst || 0) + (invoice.sgst || 0) + (invoice.igst || 0);

    // Prepare line items HTML
    const itemsHtml = invoice.items.map(item => `
      <tr class="border-b border-gray-200">
        <td class="py-3 px-4 text-sm text-gray-800">${item.description}</td>
        <td class="py-3 px-4 text-sm text-gray-800 font-mono">${item.hsnCode || '-'}</td>
        <td class="py-3 px-4 text-sm text-gray-800 text-center">${item.quantity}</td>
        <td class="py-3 px-4 text-sm text-gray-800 text-right font-mono">₹${(item.rate || 0).toLocaleString('en-IN')}</td>
        <td class="py-3 px-4 text-sm text-gray-800 text-center">${typeof item.gstRate === 'number' ? item.gstRate : 18}%</td>
        <td class="py-3 px-4 text-sm font-semibold text-gray-900 text-right font-mono">₹${(((item.quantity || 0) * (item.rate || 0)) * (1 + (typeof item.gstRate === 'number' ? item.gstRate : 18)/100)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        </style>
      </head>
      <body class="bg-white p-10">
        <div class="max-w-4xl mx-auto">
                 <!-- Header -->
          <div class="flex justify-between items-start border-b-2 border-gray-100 pb-8 mb-8">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 tracking-tight">${user.businessName || 'Business'}</h1>
              <p class="text-sm text-gray-500 mt-1">${user.email}</p>
              ${user.phone ? `<p class="text-sm text-gray-500">${user.phone}</p>` : ''}
              ${user.gstNumber ? `<p class="text-sm font-semibold text-primary mt-2">GSTIN: ${user.gstNumber}</p>` : ''}
            </div>
            <div class="text-right">
              <h2 class="text-4xl font-bold text-gray-400 uppercase tracking-wider">Invoice</h2>
              <p class="text-lg font-mono font-bold text-gray-900 mt-2">${invoice.invoiceNumber}</p>
            </div>
          </div>

          <!-- Details -->
          <div class="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Billed To</h3>
              <p class="text-lg font-bold text-gray-900">${invoice.clientId?.name || 'Client'}</p>
              <p class="text-sm text-gray-600 mt-1">${invoice.clientId?.company || ''}</p>
              <p class="text-sm text-gray-500">${invoice.clientId?.email || ''}</p>
            </div>
            <div class="text-right space-y-2">
              <p class="text-sm text-gray-600"><span class="font-bold text-gray-900">Issue Date:</span> ${new Date(invoice.issueDate).toLocaleDateString('en-IN')}</p>
              <p class="text-sm text-gray-600"><span class="font-bold text-gray-900">Due Date:</span> ${new Date(invoice.dueDate).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <!-- Items Table -->
          <div class="border border-gray-200 rounded-xl overflow-hidden mb-8">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4">HSN/SAC</th>
                  <th class="py-3 px-4 text-center">Qty</th>
                  <th class="py-3 px-4 text-right">Rate</th>
                  <th class="py-3 px-4 text-center">GST</th>
                  <th class="py-3 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Totals -->
          <div class="flex justify-end mb-8">
            <div class="w-72 space-y-3 text-sm">
              <div class="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span class="font-mono">₹${(invoice.subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              ${(invoice.discountAmount || 0) > 0 ? `
                <div class="flex justify-between text-red-500">
                  <span>Discount:</span>
                  <span class="font-mono">-₹${(invoice.discountAmount || 0).toLocaleString('en-IN')}</span>
                </div>
              ` : ''}
              ${invoice.isInterState ? `
                <div class="flex justify-between text-gray-600">
                  <span>IGST:</span>
                  <span class="font-mono">₹${(invoice.igst || 0).toLocaleString('en-IN')}</span>
                </div>
              ` : `
                <div class="flex justify-between text-gray-600">
                  <span>CGST:</span>
                  <span class="font-mono">₹${(invoice.cgst || 0).toLocaleString('en-IN')}</span>
                </div>
                <div class="flex justify-between text-gray-600">
                  <span>SGST:</span>
                  <span class="font-mono">₹${(invoice.sgst || 0).toLocaleString('en-IN')}</span>
                </div>
              `}
              <div class="flex justify-between items-center pt-3 border-t-2 border-gray-200 text-base font-bold text-gray-900">
                <span>Grand Total:</span>
                <span class="font-mono text-xl">₹${(invoice.total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          ${invoice.notes ? `
            <div class="border-t border-gray-200 pt-4 mt-8">
              <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Notes / Terms</h4>
              <p class="text-sm text-gray-600">${invoice.notes}</p>
            </div>
          ` : ''}

        </div>
      </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', bottom: '20px' },
    });

    return pdfBuffer;
  } catch (error) {
    throw new Error(`PDF Generation failed: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = { generateInvoicePDF };
