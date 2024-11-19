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

    const best_products = await bestProducts()
    const best_categories = await bestCategories()
    const best_brands = await bestBrands()

    res.render('admin/dashboard', {
      layout: "layout/admin",
      title: "Dashboard",
      orders: orders,
      totalOrders,
      salesAmount,
      totalProducts:totalOrderedQuantity,
      totalUsers,
      best_products,
      best_categories,
      best_brands
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
  

  async function bestProducts() {
    try {
      const orders = await Orders.find()
      .populate("items.product_id", "product_name") 
      .exec();

    const productSales = {};

    for (const order of orders) {
      for (const item of order.items) {
        const productId = item.product_id._id.toString();
        const productName = item.product_id.product_name;

        if (!productSales[productId]) {
          productSales[productId] = { product_name: productName, total_quantity: 0 };
        }

        productSales[productId].total_quantity += item.quantity;
      }
    }

    const sortedProducts = Object.values(productSales).sort(
      (a, b) => b.total_quantity - a.total_quantity
    );

    const bestProducts = sortedProducts.slice(0, 10);

    return bestProducts;
  } catch (error) {
    console.error("Error fetching best-selling products:", error);
    throw error;
  }
  }

 async function bestCategories() {
      try {
        const bestCategories = await Orders.aggregate([
          {
            $unwind: "$items" 
          },
          {
            $lookup: {
              from: "products",
              localField: "items.product_id", 
              foreignField: "_id",
              as: "product_details"
            }
          },
          {
            $unwind: "$product_details" 
          },
          {
            $lookup: {
              from: "categories", 
              localField: "product_details.category_id", 
              foreignField: "_id", 
              as: "category_details"
            }
          },
          {
            $unwind: "$category_details" 
          },
          {
            $group: {
              _id: "$category_details._id",
              category_name: { $first: "$category_details.category_name" },
              total_quantity: { $sum: "$items.quantity" }
            }
          },
          {
            $sort: { total_quantity: -1 } 
          }
        ])
        return bestCategories
      } catch (error) {
        console.error("Error fetching best-selling categories:", error)
        throw error
      }
    }
  

async function bestBrands() {
      try {
        const bestBrands = await Orders.aggregate([
          {
            $unwind: "$items" 
          },
          {
            $lookup: {
              from: "products",
              localField: "items.product_id", 
              foreignField: "_id",
              as: "product_details"
            }
          },
          {
            $unwind: "$product_details" 
          },
          {
            $lookup: {
              from: "brands", 
              localField: "product_details.brand_id", 
              foreignField: "_id", 
              as: "brand_details"
            }
          },
          {
            $unwind: "$brand_details" 
          },
          {
            $group: {
              _id: "$brand_details._id",
              brand_name: { $first: "$brand_details.brand_name" },
              total_quantity: { $sum: "$items.quantity" }
            }
          },
          {
            $sort: { total_quantity: -1 } 
          }
        ])
        return bestBrands
      } catch (error) {
        console.error("Error fetching best-selling brands:", error)
        throw error
      }
    }
  