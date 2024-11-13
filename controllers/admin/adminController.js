const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const Orders = require('../../models/orderSchema')
const moment = require('moment')
const Product = require('../../models/productSchema')

const PDFDocument = require("pdfkit");
const ExcelJS = require('exceljs')

exports.loadAdminLogin = async (req, res) => {
  try {
    
    if (req.session.admin) {
      res.redirect("/admin/dashboard", {
        layout: "layout/admin",
        title: "Dashboard",
      });
    } else {
      res.render("admin/adm-login", { layout: false });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const admin = await User.findOne({ email: email, isAdmin: true });
    console.log(admin);
    if (!admin) {
      return res.json({ success: false });
    }
    if (admin) {
      const passwordMatch = bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.json({ success: false });
      }
      req.session.admin = admin;
      res.json({ success: true });
    }
  } catch (error) {
    console.log("Login", error);
  }
};


exports.adminHome = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;

    let filterConditions = {};

    if (filter === 'day') {
      filterConditions.createdAt = {
        $gte: moment().startOf('day').toDate() 
      };
    } else if (filter === 'week') {
      filterConditions.createdAt = {
        $gte: moment().startOf('week').toDate() 
      };
    } else if (filter === 'month') {
      filterConditions.createdAt = {
        $gte: moment().startOf('month').toDate()
      };
    } else if (startDate && endDate) {
      filterConditions.createdAt = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate()
      };
    }

    const orders = await Orders.find(filterConditions);

    const totalUsers = await User.countDocuments();
    const totalQuantity = await Orders.aggregate([
      { $match: filterConditions },
      { $unwind: '$items' }, 
      { $group: { _id: null, totalQuantity: { $sum: '$items.quantity' } } }
    ]);

    const totalOrderedQuantity = totalQuantity.length > 0 ? totalQuantity[0].totalQuantity : 0;

    const totalSales = await Orders.aggregate([
      { $match: filterConditions }, 
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const salesAmount = totalSales.length > 0 ? totalSales[0].total : 0;

    const totalOrders = await Orders.countDocuments(filterConditions);

    res.render('admin/dashboard', {
      layout: "layout/admin",
      title: "Dashboard",
      orders: orders,
      totalOrders,
      salesAmount,
      totalProducts:totalOrderedQuantity,
      totalUsers
    });
  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).send({ message: "Error generating sales report" });
  }
};


exports.downloadPdf = async (req, res) => {
  try {
    const { filter, startDate, endDate } = req.query;
    
    let filterConditions = {};
    
    if (filter === 'day') {
      filterConditions.createdAt = {
        $gte: moment().startOf('day').toDate()
      };
    } else if (filter === 'week') {
      filterConditions.createdAt = {
        $gte: moment().startOf('week').toDate()
      };
    } else if (filter === 'month') {
      filterConditions.createdAt = {
        $gte: moment().startOf('month').toDate()
      };
    } else if (filter === 'year') {
      filterConditions.createdAt = {
        $gte: moment().startOf('year').toDate()
      };
    } else if (startDate && endDate) {
      filterConditions.createdAt = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate()
      };
    }

    const totalSales = await Orders.aggregate([
      { $match: filterConditions },
      { $group: { _id: null, total: { $sum: '$total_amount' } } }
    ]);

    const totalSalesAmount = totalSales.length > 0 ? totalSales[0].total : 0;

    const orders = await Orders.aggregate([
      { 
        $match: filterConditions
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product_id',
          foreignField: '_id',
          as: 'products'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $unwind: '$products'
      },
      {
        $project: {
          order_id: 1,
          user_name: '$user.username',
          created_at: '$createdAt',
          order_status: 1,
          total_price: '$total_amount',
          product_name: '$products.product_name',
          quantity: '$items.quantity',
          price: '$items.price',
          discount: '$discount',
        }
      }
    ]);

    const doc = new PDFDocument();
    const fileName = 'Footprits_Sales_Report.pdf';
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/pdf');
    
    doc.pipe(res);

    doc.fontSize(20).text('Sales Report', { align: 'center' }).moveDown();
    
    if (startDate && endDate) {
      doc.fontSize(12).text(`Date Range: ${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')}`, { align: 'center' }).moveDown();
    } else {
      doc.fontSize(12).text(`Filter: ${filter}`, { align: 'center' }).moveDown();
    }

    const headers = ['OrderID', 'User', 'Date', 'Status', 'Total', 'Product', 'Quantity', 'Price', 'Discount'];
    doc.fontSize(12).text(headers.join('   |   '), { underline: true }).moveDown();

    orders.forEach(order => {
      const orderDate = moment(order.createdAt).format('YYYY-MM-DD');
      const totalPrice = order.total_price || 0;
      const productName = order.product_name || 'N/A';
      const quantity = order.quantity || 0;
      const price = order.price || 0;
      const discount = order.discount || 0;
      const row = [
        order.order_id,
        order.user_name,
        orderDate,
        order.order_status,
        totalPrice.toFixed(2),
        productName,
        quantity,
        price.toFixed(2),
        discount.toFixed(2)
      ];
      
      doc.fontSize(10).text(row.join('   |   '));
      doc.moveDown(); 
    });

    doc.moveDown();
    doc.fontSize(14).text(`Total Sales: ${totalSalesAmount.toFixed(2)}`, { align: 'right' });

    doc.end();

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
}


exports.downloadExcel = async (req, res) => {
  try {
    const { startDate, endDate, frequency } = req.query;

    let matchCondition = {};
    if (startDate && endDate) {
      matchCondition.placed_at = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (frequency) {
      const now = new Date();
      matchCondition.placed_at = {
        $gte: frequency === 'day' ? new Date(now.setDate(now.getDate() - 1)) :
              frequency === 'week' ? new Date(now.setDate(now.getDate() - 7)) :
              new Date(now.setMonth(now.getMonth() - 1))
      };
    }

    const orders = await Orders.aggregate([
      { 
        $match: matchCondition 
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $lookup: {   
          from: 'products',
          localField: 'items.product_id',
          foreignField: '_id',
          as: 'products'
        }
      }
    ]);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Report');

    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'Sales Report';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add report generation date
    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Report Generated On: ${new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;

    // Add date range
    worksheet.mergeCells('A3:F3');
    const fromDate = startDate ? new Date(startDate) : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const toDate = endDate ? new Date(endDate) : new Date();
    worksheet.getCell('A3').value = `Report Date from: ${fromDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })} to ${toDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;

    const orderHeaders = [
      'Order ID',
      'Date',
      'Delivery Charge',
      'Total Amount',
      'Status',
      'User'
    ];
    worksheet.addRow(orderHeaders);
    worksheet.getRow(4).font = { bold: true };

    worksheet.getRow(4).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    const productHeaders = [
      'Product',
      'Quantity',
      'Price',
      'Discount',
      'Net Price'
    ];

    let totalPayableAmount = 0;

    let currentRow = 5;
    for (const order of orders) {
      totalPayableAmount += order.total_amount || 0;  

      worksheet.addRow([
        order.order_id,
        new Date(order.placed_at).toISOString().split('T')[0],
        (order.delivery_charge || 0).toFixed(2),   
        (order.total_amount || 0).toFixed(2),        
        order.order_status,
        order.user.username
      ]);
      currentRow++;

      worksheet.addRow(productHeaders);
      worksheet.getRow(currentRow).font = { bold: true, italic: true };
      currentRow++;

      for (const item of order.items) {
        const product = order.products.find(p => p._id.toString() === item.product_id.toString());
        if (product) {
          worksheet.addRow([
            product.product_name,
            item.quantity,
            (item.price || 0).toFixed(2),              
            (item.discount || 0).toFixed(2),            
            ((item.price || 0) * item.quantity - (item.discount || 0)).toFixed(2) 
          ]);
          currentRow++;
        }
      }

      worksheet.addRow([]);
      currentRow++;
    }

    worksheet.addRow([]);
    worksheet.addRow(['', '', '', 'Total Payable Amount:', `₹${totalPayableAmount.toFixed(2)}`]);
    const totalRow = worksheet.getRow(currentRow + 2);
    totalRow.font = { bold: true };
    totalRow.getCell(4).alignment = { horizontal: 'right' };

    worksheet.columns = [
      { width: 15 }, 
      { width: 12 }, 
      { width: 15 },
      { width: 15 }, 
      { width: 12 },
      { width: 15 }, 
    ];

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        if (typeof cell.value === 'number') {
          cell.numFmt = '#,##0.00';
        }
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=sales_report_${new Date().toISOString().split('T')[0]}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Error exporting Excel sales report:", error);
    res.status(500).send({ message: "Error generating Excel report" });
  }
}

exports.adminLogout = async (req, res) => {
    try {
      delete req.session.admin;
      res.send(); 
    } catch (err) {
      console.log("Unexpected error during logout:", err);
    }
  };
  