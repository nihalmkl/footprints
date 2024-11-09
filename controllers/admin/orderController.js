const Orders = require('../../models/orderSchema')

exports.loadOrderPage = async (req, res) => {
    try {
        const limit = 8; 
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;

        const orders = await Orders.find({})
            .skip(skip)
            .limit(limit)
            .populate('user_id')
            .populate('address_id')
            .populate('items.product_id');

        const totalOrders = await Orders.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);

        res.render('admin/orders', {
            layout: "layout/admin",
            title: "Orders",
            orders: orders,
            currentPage: page,
            totalPages: totalPages > 5 ? 5 : totalPages,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Orders error');
    }
};


exports.updateStatus = async (req, res) => {
    try {
        const orderId = req.params.id
        const newStatus = req.body.order_status

        await Orders.findByIdAndUpdate(orderId, { order_status: newStatus });

        res.status(200).json({ message: 'Order status updated successfully' }); 
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' })
    }
}

exports.loadOrderDetails = async (req,res) => {
    try {
        const orderId = req.params.orderId
        console.log("herr",orderId)
        const order = await Orders.findById(orderId).populate('items.product_id')
        console.log("3456",order)
        if(!order){
            res.redirect('admin/orders')
        }
        res.render('admin/order-details', {
            layout: "layout/admin",
            title: "Orders",
            orders: order, 
        })
    } catch (error) {
        console.error(err);
        res.status(500).send('Orders error')
    }
}