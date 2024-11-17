const PDFDocument = require('pdfkit');
const moment = require('moment');

const generateSalesReportPDF = (res, orders, totals, filter, startDate, endDate) => {
  const { totalOrders, totalSales, totalDiscount } = totals;

  const doc = new PDFDocument({
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
    size: 'A4',
  });

  const fileName = 'Footprints_Sales_Report.pdf';
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/pdf');
  doc.pipe(res);

  const drawTableHeader = (doc, startX, currentY, columnWidths, headers) => {
    headers.forEach((header, index) => {
      doc.fontSize(12).font('Helvetica-Bold').text(header, startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
        width: columnWidths[index],
        align: 'center',
      });
    });
    doc.moveTo(startX, currentY + 15)
      .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), currentY + 15)
      .stroke();
    return currentY + 25;
  };

  const startNewPage = (doc) => {
    doc.addPage();
    return 50; 
  };

  doc.fontSize(20).text('Sales Report', { align: 'center' }).moveDown();
  doc.fontSize(12)
    .text(`Report Date: ${moment().format('DD MMMM YYYY')}`, { align: 'center' })
    .moveDown();

  if (startDate && endDate) {
    doc.fontSize(12)
      .text(
        `Date Range: ${moment(startDate).format('DD MMMM YYYY')} to ${moment(endDate).format('DD MMMM YYYY')}`,
        { align: 'center' }
      )
      .moveDown();
  } else {
    doc.fontSize(12).text(`Filter: ${filter}`, { align: 'center' }).moveDown();
  }

  const headers = ['Date', 'Product', 'Quantity', 'Discount', 'Total', 'Payment'];
    const columnWidths = [100, 120, 80, 80, 80, 100]; 
    const startX = 50; 
    let currentY = doc.y + 10; 

  currentY = drawTableHeader(doc, startX, currentY, columnWidths, headers);

  orders.forEach(order => {
    const orderDate = moment(order.created_at).format('DD MMMM YYYY');
    const row = [
      orderDate || 'N/A',
      order.product_name || 'N/A',
      order.quantity || 0,
      (order.discount || 0).toFixed(2),
      (order.total_price || 0).toFixed(2),
      order.payment_method || 'N/A',
    ];

    row.forEach((data, index) => {
      doc.fontSize(10).font('Helvetica').text(data, startX + columnWidths.slice(0, index).reduce((a, b) => a + b, 0), currentY, {
        width: columnWidths[index],
        align: 'center',
      });
    });

    currentY += 20;

    if (currentY + 20 > doc.page.height - 50) {
      currentY = startNewPage(doc);
    }
  });

  // Summary
  doc.moveTo(startX, currentY).lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), currentY).stroke();
  doc.moveDown(2);
  doc.fontSize(12).font('Helvetica-Bold').text('Summary', startX, currentY + 20, { align: 'center' });
  doc.fontSize(12).font('Helvetica')
    .text(`Total Orders: ${totalOrders}`, startX, currentY + 40, { align: 'right' })
    .text(`Total Sales: ${totalSales.toFixed(2)}`, startX, currentY + 60, { align: 'right' })
    .text(`Total Discount: ${totalDiscount.toFixed(2)}`, startX, currentY + 80, { align: 'right' });

  doc.end();
};

module.exports = { generateSalesReportPDF };