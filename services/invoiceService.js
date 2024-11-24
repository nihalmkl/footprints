const pdfkit = require('pdfkit');
const Address = require('../models/addressSchema');
const Orders = require('../models/orderSchema');

async function generateInvoice(orderId) {
    // Fetch the order details, including related models
    const order = await Orders.findOne({ _id: orderId }).populate([
        'user_id',
        { path: 'items.product_id', model: 'Product' },
        { path: 'coupon_applied', model: 'Coupon' }
    ]);
    if (!order) {
        throw new Error("Order not found");
    }
  
    // Fetch the address details
    const address = order.address && order.address[0]

    if (!address) {
        throw new Error("Address not found");
    }

    // Prepare invoice data
    const invoiceData = {
        shopName: "FootPrints",
        shopAddress: "Chennai, Selam",
        shopContact: "footprint@gmail.com",
        invoiceNumber: order.order_id,
        invoiceDate: order.placed_at.toDateString(),
        dueDate: order.payment_status === 'Completed' ? new Date(order.placed_at).toDateString() : 'TBD',
        billTo: {
            customerName: order.user_id.username,
            customerAddress: address.street_address + ', ' + address.city + ', ' + address.state + ' ' + address.pincode,
            customerContact: address.phone
        },
        items: order.items.map(item => ({
            productName: item.product_id.product_name,
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity
        })),
        subtotal: order.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        discounts: order.discount,
        shippingCost: order.delivery_charge || 40,
        grandTotal: order.total_amount,
        paymentMethod: order.payment_method === 'card' ? 'RazorPay' : order.payment_method,
        transactionId: order.razorpay_id || 'N/A',
        returnPolicy: 'Returns are accepted within 10 days of delivery.'
    };

    return invoiceData;
}

function generatePDF(invoiceData, res) {
    const doc = new pdfkit();
    const fileName = `invoice_${invoiceData.invoiceNumber}.pdf`;

    // Set the response headers before piping the PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.fontSize(16).text('INVOICE', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Seller: ${invoiceData.shopName}`);
    doc.text(`Address: ${invoiceData.shopAddress}`);
    doc.text(`Contact: ${invoiceData.shopContact}`).moveDown();
    doc.text(`Invoice Number: ${invoiceData.invoiceNumber}   Date: ${invoiceData.invoiceDate}   Due Date: ${invoiceData.dueDate}`);

    // Bill To and Ship To
    doc.text(`Bill To: ${invoiceData.billTo.customerName}`);
    doc.text(`Address: ${invoiceData.billTo.customerAddress}`);
    doc.text(`Contact: ${invoiceData.billTo.customerContact}`).moveDown();

    doc.text('---------------------------------------------------------------------------------');
    doc.text('      Product                Qty            Unit Price          Total');
    doc.text('---------------------------------------------------------------------------------');

    invoiceData.items.forEach(item => {
        doc.text(` ${item.productName}      ${item.quantity}           ${item.unitPrice.toFixed(2)}          ${item.totalPrice.toFixed(2)}`);
    });

    doc.text('----------------------------------------------------------------------------------');
    doc.text(`   Subtotal: ${invoiceData.subtotal.toFixed(2)}`);
    doc.text(`   Discounts: ${invoiceData.discounts.toFixed(2)}`);
    doc.text(`   Shipping: ${invoiceData.shippingCost.toFixed(2)}`);
    doc.text('---------------------------------------------------------------------------------');
    doc.text(`   Grand Total: ${invoiceData.grandTotal.toFixed(2)}`);

    doc.text(`   Payment Method: ${invoiceData.paymentMethod}`);
    doc.text(`   Transaction ID: ${invoiceData.transactionId}`).moveDown();

    doc.text('---------------------------------------------------------------------------------');
    doc.text('Terms:');
    doc.text(invoiceData.returnPolicy).moveDown();

    doc.text('Thank you for shopping with us!', { align: 'center' });

    doc.end();
}

module.exports = { generateInvoice, generatePDF };
