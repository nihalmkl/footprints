const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");
const Orders = require('../../models/orderSchema')
const moment = require('moment')
const Product = require('../../models/productSchema')
const { generateSalesReportPDF } = require('../../utils/pdfGenerate')
const { generateSalesReportExcel } = require('../../utils/excelGenerate')


exports.loadAdminLogin = async (req, res) => {
  try {
    
    if (req.session.admin) {
      res.redirect("/admin/dashboard");
    } else {
      res.render("admin/adm-login", { layout: false });
    }
  } catch (err) {
    console.log(err);
  }
}

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const admin = await User.findOne({ email: email, isAdmin: true });
  
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
}


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
}


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
    } else if (startDate && endDate) {
      filterConditions.createdAt = {
        $gte: moment(startDate).toDate(),
        $lte: moment(endDate).toDate()
      };
    }

    const totals = await Orders.aggregate([
      { $match: filterConditions },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$total_amount" },
          totalDiscount: { $sum: "$discount" },
        },
      },
    ]);

    const totalOrders = totals.length > 0 ? totals[0].totalOrders : 0;
    const totalSales = totals.length > 0 ? totals[0].totalSales : 0;
    const totalDiscount = totals.length > 0 ? totals[0].totalDiscount : 0;

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
          payment_method:1,
        }
      }
    ]);

    generateSalesReportPDF(res, orders, { totalOrders, totalSales, totalDiscount }, filter, startDate, endDate)

  } catch (error) {
    console.error('Error generating PDF:', error)
    res.status(500).send('Error generating PDF')
  }
};


exports.downloadExcel = async (req, res) => {
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

    const totals = await Orders.aggregate([
      { $match: filterConditions },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSales: { $sum: "$total_amount" },
          totalDiscount: { $sum: "$discount" },
        },
      },
    ]);

    const totalOrders = totals.length > 0 ? totals[0].totalOrders : 0;
    const totalSales = totals.length > 0 ? totals[0].totalSales : 0;
    const totalDiscount = totals.length > 0 ? totals[0].totalDiscount : 0;

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
          payment_method:1,
        }
      }
    ]);
    await generateSalesReportExcel(res, orders, { totalOrders, totalSales, totalDiscount }, filter, startDate, endDate)

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
  }
  

  async function getBestSellingProducts() {
    try {
      const bestSellingProducts = await Orders.aggregate([
        { 
          $unwind: "$items" // Deconstruct items array for individual processing
        },
        { 
          $group: {
            _id: "$items.product_id", // Group by product_id
            totalQuantity: { $sum: "$items.quantity" } // Sum quantities for each product
          }
        },
        {
          $lookup: {
            from: "products", // Product collection name in MongoDB
            localField: "_id", // product_id from Orders
            foreignField: "_id", // product_id in Product collection
            as: "productDetails"
          }
        },
        {
          $unwind: "$productDetails" // Deconstruct productDetails array
        },
        {
          $project: {
            _id: 0, // Exclude the default _id field
            product_name: "$productDetails.name", // Replace with your product name field
            totalQuantity: 1 // Include total quantity
          }
        },
        { 
          $sort: { totalQuantity: -1 } // Sort by quantity (descending)
        }
      ])
      
      console.log(bestSellingProducts)
      return bestSellingProducts
    } catch (error) {
      console.error("Error fetching best-selling products:", error)
    }
  }