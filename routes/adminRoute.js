const express = require('express')
const admin_route = express.Router()
const upload = require('../config/multer')
const adminAuth = require('../middlewares/adminAuth')

const PDFDocument = require("pdfkit");
const ExcelJS = require('exceljs')

const Orders = require('../models/orderSchema')
//Admin controllers
const usersContorller = require('../controllers/admin/usersController')
const adminController = require('../controllers/admin/adminController')
const categoryController = require('../controllers/admin/categoryController')
const productController = require('../controllers/admin/productController')
const brandController = require('../controllers/admin/brandController')
const orderController = require('../controllers/admin/orderController')
const couponController = require('../controllers/admin/couponController')
const offerController = require('../controllers/admin/offerController')

//Login Admin
admin_route.get('/',adminController.loadAdminLogin)
admin_route.post('/adm-login',adminController.adminLogin)
admin_route.get('/dashboard',adminAuth.isLogged,adminController.adminHome)
admin_route.post("/adminLogout", adminController.adminLogout);


//Users Mangagement
admin_route.get('/users',adminAuth.isLogged,usersContorller.loadUsers)
admin_route.get('/blockUser/:id',usersContorller.blockUser)
admin_route.get('/unblockUser/:id',usersContorller.unblockUser)

//Category Management
admin_route.get('/categories',adminAuth.isLogged,categoryController.loadCategory)
admin_route.post('/edit-category/:id',categoryController.editCategory)
admin_route.post('/add-category',categoryController.addCategory)
admin_route.post('/delete-category',categoryController.deleteCategory)
admin_route.post('/apply_category/:categoryId', categoryController.applyCategory)
// Brand Management
admin_route.get('/brands',adminAuth.isLogged,brandController.loadBrand)
admin_route.post('/edit-brand/:id',brandController.editBrand)
admin_route.post('/add-brand',brandController.addBrand)
admin_route.post('/delete-brand',brandController.deleteBrand)

// Product Mangement
admin_route.get('/products',adminAuth.isLogged,productController.loadProducts)
admin_route.get('/add_product',productController.loadAddProduct)
admin_route.post('/add-product',upload.any(),productController.addProduct)
admin_route.get('/edit_product/:id',productController.editProductPage)
admin_route.post('/edit-product/:id', upload.array('productImages[]', 4),productController.editProduct);
admin_route.post('/delete_product/:id',productController.deleteProduct)
admin_route.post('/delete-image',productController.deleteImage)
admin_route.post('/apply_offer/:productId',adminAuth.isLogged,productController.applyOffer)

//order Management
admin_route.get('/orders',adminAuth.isLogged,orderController.loadOrderPage)
admin_route.post('/update-status/:id',orderController.updateStatus)
admin_route.get('/order-details/:orderId',orderController.loadOrderDetails)

admin_route.post('/orders/:orderId/respond-return', async (req, res) => {
    try {
        console.log('Hello');
        
      const orderId = req.params.orderId
      const { decision } = req.body 
     console.log("jdkakaka",decision)
      const order = await Orders.findById(orderId)
  
      if (order && order.return_request && order.admin_accepted === 'Pending') {
        order.admin_accepted = decision 
        await order.save()
  
        return res.redirect('/admin/orders') 
      } else {
        return res.status(404).send('Order not found or return request invalid')
      }
    } catch (error) {
      return res.status(500).send('Server error')
    }
  })

//coupon Management
admin_route.get('/promocodes',adminAuth.isLogged,couponController.loadCoupon)
admin_route.post('/addCoupon',adminAuth.isLogged,couponController.addCoupon)
admin_route.put('/editCoupon/:id',adminAuth.isLogged,couponController.editCoupon)
admin_route.post('/deleteCoupon',adminAuth.isLogged, couponController.deleteCoupon)
//offer Management
admin_route.get ('/offers',adminAuth.isLogged,offerController.loadOffer)
admin_route.post('/addOffers',adminAuth.isLogged,offerController.addOffers)
admin_route.post('/editOffers',adminAuth.isLogged,offerController.editOffers)
admin_route.post('/deleteOffer',adminAuth.isLogged,offerController.deleteOffer)
admin_route.post('/restoreOffer',adminAuth.isLogged,offerController.restoreOffer)


admin_route.get('/sales-report', async (req, res) => {
  try {
    const { startDate, endDate, frequency } = req.query
    let matchCondition = {}

    if (startDate && endDate) {
      matchCondition.placed_at = { $gte: new Date(startDate), $lte: new Date(endDate) }
    } else if (frequency) {
      const now = new Date()
      matchCondition.placed_at = {
        $gte: frequency === '1day' ? new Date(now.setDate(now.getDate() - 1)) :
              frequency === '1week' ? new Date(now.setDate(now.getDate() - 7)) :
              new Date(now.setMonth(now.getMonth() - 1))
      }
    }

    const salesData = await Orders.aggregate([
      { $match: matchCondition },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products", 
          localField: "items.product_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails._id", 
          productName: { $first: "$productDetails.product_name" },
          totalQuantitySold: { $sum: "$items.quantity" },
          totalSales: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalSales" },
          totalDiscount: { $sum: "$used_amount" },
          totalProducts: { $sum: "$totalQuantitySold" },
          totalUsers: { $addToSet: "$user_id" },
          productDetails: {
            $push: {
              productId: "$_id",
              productName: "$productName",
              quantitySold: "$totalQuantitySold",
              sales: "$totalSales"
            }
          }
        }
      },
      {
        $project: {
          totalOrders: 1,
          totalAmount: 1,
          totalDiscount: 1,
          totalProducts: 1,
          totalUsers: { $size: "$totalUsers" },
          productDetails: 1
        }
      }
    ])

    console.log("Sales Data:", salesData) 
    console.log("Product Details:", salesData[0]?.productDetails || []) 

    res.json(salesData)
  } catch (error) {
    console.error("Error fetching sales report:", error)
    res.status(500).send({ message: "Error generating sales report" })
  }
})




admin_route.get('/export-sales-report/pdf', async (req, res) => {
  try {
    const { startDate, endDate, frequency } = req.query
    console.log("321", startDate, frequency)

    let matchCondition = {}
    if (startDate && endDate) {
      matchCondition.placed_at = { $gte: new Date(startDate), $lte: new Date(endDate) }
    } else if (frequency) {
      const now = new Date()
      matchCondition.placed_at = {
        $gte: frequency === '1day' ? new Date(now.setDate(now.getDate() - 1)) :
              frequency === '1week' ? new Date(now.setDate(now.getDate() - 7)) :
              new Date(now.setMonth(now.getMonth() - 1))
      }
    }

    const salesData = await Orders.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$total_amount" },
          totalDiscount: { $sum: "$used_amount" },
          totalProducts: { $sum: { $sum: "$items.quantity" } }, 
          totalUsers: { $addToSet: "$user_id" } 
        }
      },
      {
        $project: {
          totalOrders: 1,
          totalAmount: 1,
          totalDiscount: 1,
          totalProducts: 1,
          totalUsers: { $size: "$totalUsers" } 
        }
      }
    ])

    const doc = new PDFDocument({ margin: 50 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.pdf"')
    doc.pipe(res)

    doc.fontSize(20).fillColor('#0073e6').text('Sales Report', { align: 'center' }).moveDown(0.5)
    doc.fontSize(12).fillColor('black').text(`Report Date: ${new Date().toLocaleDateString()}`, { align: 'right' })
    if (startDate && endDate) {
      doc.text(`Report Period: ${startDate} to ${endDate}`, { align: 'right' }).moveDown(2)
    }

    doc.fontSize(14).fillColor('#0073e6').text('Sales Summary', { underline: true }).moveDown(1)
    const tableTop = doc.y + 10
    const itemX = 70
    const valueX = 400
    const rowHeight = 25

    doc.fontSize(12).fillColor('white').rect(itemX - 10, tableTop - 15, 460, rowHeight).fill('#0073e6')
    doc.text('Item', itemX, tableTop)
    doc.text('Value', valueX, tableTop)

    const rows = [
      ['Total Orders', salesData[0].totalOrders],
      ['Total Amount', `₹${salesData[0].totalAmount.toFixed(2)}`],
      ['Total Discount Given', `₹${salesData[0].totalDiscount.toFixed(2)}`],
      ['Total Products Sold', salesData[0].totalProducts],
      ['Total Unique Users', salesData[0].totalUsers]
    ]

    doc.fontSize(12).fillColor('black')
    rows.forEach((row, index) => {
      const y = tableTop + rowHeight * (index + 1)
      
      doc.rect(itemX - 10, y - 10, 460, rowHeight).fill(index % 2 === 0 ? '#f2f2f2' : 'white')
      doc.fillColor('black').text(row[0], itemX, y)
      doc.text(row[1], valueX, y)
    })

    doc.fontSize(10).fillColor('gray').text('Thank you for reviewing this sales report.', 50, doc.page.height - 50, {
      align: 'center'
    })

    doc.end()
  } catch (error) {
    console.error("Error exporting sales report:", error)
    res.status(500).send({ message: "Error generating PDF report" })
  }
})

admin_route.get('/export-sales-report/excel', async (req, res) => {
  try {
    const { startDate, endDate, frequency } = req.query

    let matchCondition = {}
    if (startDate && endDate) {
      matchCondition.placed_at = { $gte: new Date(startDate), $lte: new Date(endDate) }
    } else if (frequency) {
      const now = new Date()
      matchCondition.placed_at = {
        $gte: frequency === '1day' ? new Date(now.setDate(now.getDate() - 1)) :
              frequency === '1week' ? new Date(now.setDate(now.getDate() - 7)) :
              new Date(now.setMonth(now.getMonth() - 1))
      }
    }

    const salesData = await Orders.aggregate([
      { $match: matchCondition },
      {$group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalAmount: { $sum: "$total_amount" },
        totalDiscount: { $sum: "$used_amount" },
        totalProducts: { $sum: { $sum: "$items.quantity" } }, 
        totalUsers: { $addToSet: "$user_id" } 
      }
    },
    {
      $project: {
        totalOrders: 1,
        totalAmount: 1,
        totalDiscount: 1,
        totalProducts: 1,
        totalUsers: { $size: "$totalUsers" } 
      }
    }
    ])

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Sales Report')

    worksheet.columns = [
      { header: 'Item', key: 'item', width: 30 },
      { header: 'Value', key: 'value', width: 20 }
    ]

    const rows = [
      { item: 'Total Orders', value: salesData[0].totalOrders.toFixed() },
      { item: 'Total Amount', value: `₹${salesData[0].totalAmount.toFixed(2)}` },
      { item: 'Total Discount Given', value: `₹${salesData[0].totalDiscount}` },
      { item: 'Total Products Sold', value: salesData[0].totalProducts },
      { item: 'Total Unique Users', value: salesData[0].totalUsers.length }
    ]

    worksheet.addRows(rows)

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="sales_report.xlsx"')

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    console.error("Error exporting Excel sales report:", error)
    res.status(500).send({ message: "Error generating Excel report" })
  }
})

module.exports = admin_route