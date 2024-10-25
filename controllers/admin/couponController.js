const Coupon = require('../../models/couponSchema')

exports.loadCoupon = async (req,res)=>{
    
    const coupons = await Coupon.find({})
    console.log(coupons)
    try {
        res.render('admin/coupon', {
            layout: "layout/admin",
            title: "Coupon",
            coupons
    })
    } catch (error) {
        console.log(error.message)
    }
}
 
exports.addCoupon = async (req, res) => {
    try {
        console.log('hello')
        const coupons = new Coupon(req.body)
        console.log(coupons)
        await coupons.save()
        res.status(201).json({ success: true })
    } catch (error) {
        console.error(error)
        res.status(400).json({ success: false, message: 'Failed to add coupon.' })
    }
}


exports.editCoupon = async (req, res) => {
    try {
        const coupons = await Coupon.findById(req.params.id)
        if (!coupons) return res.status(404).send('Coupon not found')

        coupons.coupon_code = req.body.coupon_code
        coupons.discount = req.body.discount
        coupons.start_date = req.body.start_date
        coupons.expiry_date = req.body.expiry_date
        coupons.min_pur_amount = req.body.min_pur_amount
        coupons.description = req.body.description

        await coupons.save()
        res.status(200).json({ success: true })
    } catch (error) {
        console.error(error)
        res.status(400).json({ success: false, message: 'Failed to update coupon.' })
    }
}


exports.deleteCoupon = async (req, res) => {
    try {
        const couponId = req.params.id
        await Coupon.findByIdAndDelete(couponId)
        return res.json({ success: true, message: 'Coupon deleted successfully!' })
    } catch (error) {
        console.error(error)
        return res.json({ success: false, message: 'An error occurred while deleting the coupon.' })
    }
}