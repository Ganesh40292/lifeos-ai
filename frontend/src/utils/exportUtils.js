/**
 * Utilities for exporting data in various formats (CSV, print-based PDF).
 */

export const exportUtils = {
  /**
   * Export JSON data to a CSV file download
   * @param {Array<Object>} data 
   * @param {Array<String>} headers - Friendly column names
   * @param {Array<String>} keys - Corresponding object keys
   * @param {String} filename 
   */
  downloadCSV: (data, headers, keys, filename = 'export.csv') => {
    if (!data || data.length === 0) return;

    const csvRows = [];
    
    // Add headers row
    csvRows.push(headers.join(','));

    // Add data rows
    for (const row of data) {
      const values = keys.map(key => {
        const val = row[key];
        // Clean value: escape quotes, handle objects/arrays
        const escaped = ('' + (val !== null && val !== undefined ? val : ''))
          .replace(/"/g, '""')
          .replace(/\n/g, ' ');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Print a specific DOM element to PDF cleanly
   * @param {String} elementId 
   * @param {String} title 
   */
  printToPDF: (elementId, title = 'LifeOS Report') => {
    const printElement = document.getElementById(elementId);
    if (!printElement) {
      console.error(`Element with id ${elementId} not found`);
      return;
    }

    // Create a new iframe for clean printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    
    // Copy all CSS stylesheets from parent document
    let stylesHtml = '';
    for (const sheet of document.styleSheets) {
      try {
        if (sheet.href) {
          stylesHtml += `<link rel="stylesheet" href="${sheet.href}">`;
        } else {
          const rules = Array.from(sheet.cssRules).map(r => r.cssText).join('\n');
          stylesHtml += `<style>${rules}</style>`;
        }
      } catch (e) {
        // Handle cross-origin stylesheet security constraints
      }
    }

    // Write content
    doc.write(`
      <html>
        <head>
          <title>${title}</title>
          ${stylesHtml}
          <style>
            body {
              background: #ffffff !important;
              color: #000000 !important;
              font-family: system-ui, -apple-system, sans-serif !important;
              padding: 40px !important;
            }
            .no-print {
              display: none !important;
            }
            /* Reset card designs for high contrast printing */
            .bg-bg-card, .bg-gray-900 {
              background: #ffffff !important;
              border: 1px solid #e4e4e7 !important;
              color: #000000 !important;
            }
            text {
              fill: #000000 !important;
            }
            h1, h2, h3, h4, p, span, td, th {
              color: #000000 !important;
            }
            .border-border, .border-gray-800 {
              border-color: #e4e4e7 !important;
            }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 24px;">
            <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">${title}</h1>
            <p style="font-size: 12px; color: #71717a;">Generated via LifeOS on ${new Date().toLocaleDateString()}</p>
          </div>
          <div>
            ${printElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    
    doc.close();

    // Give images and Recharts time to load/render inside the iframe
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }, 500);
  }
};
