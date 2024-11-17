const excelJS = require('exceljs');
const moment = require('moment');


const generateSalesReportExcel = async (res, orders, totals, filter, startDate, endDate) => {
    const { totalOrders, totalSales, totalDiscount } = totals;
  
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');
  
    // Title
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'Sales Report';
    worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A1').font = { size: 16, bold: true };
  
    // Report Date
    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Report Date: ${moment().format('DD MMMM YYYY')}`;
    worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A2').font = { size: 12 };
  
    // Date Range or Filter
    let dateRangeText = filter
      ? `Filter: ${filter}`
      : `Date Range: ${moment(startDate).format('DD MMMM YYYY')} to ${moment(endDate).format('DD MMMM YYYY')}`;
    worksheet.mergeCells('A3:F3');
    worksheet.getCell('A3').value = dateRangeText;
    worksheet.getCell('A3').alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getCell('A3').font = { size: 12 };
  
    // Table Headers
    worksheet.getCell('A5').value = 'Date';
    worksheet.getCell('B5').value = 'Product';
    worksheet.getCell('C5').value = 'Quantity';
    worksheet.getCell('D5').value = 'Discount';
    worksheet.getCell('E5').value = 'Total';
    worksheet.getCell('F5').value = 'Payment';
    worksheet.getRow(5).font = { bold: true };
  
    // Set column widths
    worksheet.getColumn('A').width = 20;
    worksheet.getColumn('B').width = 25;
    worksheet.getColumn('C').width = 10;
    worksheet.getColumn('D').width = 15;
    worksheet.getColumn('E').width = 15;
    worksheet.getColumn('F').width = 15;
  
    // Add order data rows
    let rowNum = 6;
    orders.forEach(order => {
      worksheet.getCell(`A${rowNum}`).value = moment(order.created_at).format('YYYY-MM-DD');
      worksheet.getCell(`B${rowNum}`).value = order.product_name;
      worksheet.getCell(`C${rowNum}`).value = order.quantity;
      worksheet.getCell(`D${rowNum}`).value = order.discount;
      worksheet.getCell(`E${rowNum}`).value = order.total_price;
      worksheet.getCell(`F${rowNum}`).value = order.payment_method;
      rowNum++;
    });
  
    worksheet.getCell(`A${rowNum}`).value = 'Summary:';
    worksheet.getCell(`A${rowNum}`).font = { bold: true };
  
    worksheet.getCell(`A${rowNum + 1}`).value = 'Total Orders:';
    worksheet.getCell(`B${rowNum + 1}`).value = totalOrders;
  
    worksheet.getCell(`A${rowNum + 2}`).value = 'Total Sales:';
    worksheet.getCell(`B${rowNum + 2}`).value = totalSales.toFixed(2);
  
    worksheet.getCell(`A${rowNum + 3}`).value = 'Total Discount:';
    worksheet.getCell(`B${rowNum + 3}`).value = totalDiscount.toFixed(2);
  
    worksheet.getRow(rowNum + 1).font = { bold: true };
    worksheet.getRow(rowNum + 2).font = { bold: true };
    worksheet.getRow(rowNum + 3).font = { bold: true };
  
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=footprint_sales_report.xlsx');
  
    await workbook.xlsx.write(res);
    res.end();
  };
  
  module.exports = { generateSalesReportExcel }