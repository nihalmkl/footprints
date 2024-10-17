const Orders = require('../../models/orderSchema')

exports.loadOrderPage = async (req, res) => {
    try {
        const orders = await Orders.find({})
            .populate('user_id')
            .populate('address_id')
            .populate('items.product_id')
            console.log(orders)
        res.render('admin/orders', {
            layout: "layout/admin",
            title: "Orders",
            orders: orders, 
            currentPage: 1,
            totalPages: 2,  
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Orders error')
    }
}

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