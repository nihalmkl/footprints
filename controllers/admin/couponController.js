const Coupon = require('../../models/couponSchema')

exports.loadCoupon = async (req, res) => {
  try {
      const limit = 4;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit; 

      const coupons = await Coupon.find({}).skip(skip).limit(limit);

      const totalCoupons = await Coupon.countDocuments();
      const totalPages = Math.ceil(totalCoupons / limit);

      res.render('admin/coupon', {
          layout: "layout/admin",
          title: "Coupon",
          coupons,
          currentPage: page,
          totalPages: totalPages
      });
  } catch (error) {
      console.log(error.message);
      res.status(500).send("Error loading coupons");
  }
};

 
exports.addCoupon = async (req, res) => {
    const { couponCode, discount, startDate, endDate, minAmount, maxAmount, couponDescription } = req.body;
    console.log("hi",req.body)
    const existingCoupon = await Coupon.findOne({
      coupon_code: { $regex: new RegExp(`^${couponCode}$`, "i") },
    });
    console.log("123",existingCoupon)
    if (existingCoupon) {
      return res.json({ success: false, error: "Coupon with this code already exists." });
    }
  
    if (!couponCode) return res.json({ success: false, error: 'Coupon code is empty' });

    if (!discount) return res.json({ success: false, error: 'Coupon discount is empty' });

    if (isNaN(discount)) return res.json({ success: false, error: 'Discount must be a number.' })

    if (discount < 1 || discount > 100) return res.json({ success: false, error: 'Discount must be between 1 and 100' })

    if (discount !== Math.floor(discount)) return res.json({ success: false, error: 'Discount must be a whole number.' })

    if (!startDate) return res.json({ success: false, error: 'Coupon start date is empty' })

    if (!endDate) return res.json({ success: false, error: 'Coupon end date is empty' })

    if (new Date(endDate) <= new Date(startDate)) return res.json({ success: false, error: 'End date must be after the start date.' })

    // const currentDate = new Date();
    // if (new Date(startDate) < currentDate) return res.json({ success: false, error: 'Start date cannot be in the past' })

  
    if (!minAmount) return res.json({ success: false, error: 'Coupon minAmount is empty' })

    if (isNaN(minAmount)) return res.json({ success: false, error: 'Min Amount must be a number.' })

    if (parseInt(minAmount) === 0) return res.json({ success: false, error: 'Min Amount cannot be zero.' })

  
    if (!maxAmount) return res.json({ success: false, error: 'Coupon maxAmount is empty' })

    if (isNaN(maxAmount)) return res.json({ success: false, error: 'Max Amount must be a number.' })

    if (parseInt(maxAmount) === 0) return res.json({ success: false, error: 'Max Amount cannot be zero.' })

  
    if (!couponDescription) return res.json({ success: false, error: 'Coupon description is empty' })

    console.log("jjj")
    const newCoupon = new Coupon({
      coupon_code: couponCode,
      discount: discount,
      start_date: startDate,
      expiry_date: endDate,
      min_pur_amount: minAmount,
      max_coupon_amount: maxAmount,
      description: couponDescription,
    });
     console.log("6756",newCoupon)
    await newCoupon.save();
    res.json({ success: true, message: 'Coupon successfully added' });
  };

exports.editCoupon = async (req, res) => {
    const couponId = req.params.id
    const { couponCode, discount, startDate, endDate, minAmount, maxAmount, couponDescription } = req.body;
    

    if (!couponCode) return res.json({ success: false, error: 'Coupon code is empty' })

    if (!discount) return res.json({ success: false, error: 'Coupon discount is empty' })

    if (isNaN(discount)) return res.json({ success: false, error: 'Discount must be a number.' })

    if (discount < 1 || discount > 100) return res.json({ success: false, error: 'Discount must be between 1 and 100' })

    if (discount !== Math.floor(discount)) return res.json({ success: false, error: 'Discount must be a whole number.' })


    if (!startDate) return res.json({ success: false, error: 'Coupon start date is empty' })

    if (!endDate) return res.json({ success: false, error: 'Coupon end date is empty' })

    if (new Date(endDate) <= new Date(startDate)) return res.json({ success: false, error: 'End date must be after the start date.' })

    // const currentDate = new Date();
    // if (new Date(startDate) < currentDate) return res.json({ success: false, error: 'Start date cannot be in the past' })


    if (!minAmount) return res.json({ success: false, error: 'Coupon minimum amount is empty' })

    if (isNaN(minAmount)) return res.json({ success: false, error: 'Minimum amount must be a number.' })

    if (parseInt(minAmount) === 0) return res.json({ success: false, error: 'Minimum amount cannot be zero.' })


    if (!maxAmount) return res.json({ success: false, error: 'Coupon maximum amount is empty' })

    if (isNaN(maxAmount)) return res.json({ success: false, error: 'Maximum amount must be a number.' })

    if (parseInt(maxAmount) === 0) return res.json({ success: false, error: 'Maximum amount cannot be zero.' })


    if (!couponDescription) return res.json({ success: false, error: 'Coupon description is empty' })

    const data = await Coupon.findByIdAndUpdate(couponId, {
        coupon_code: couponCode,
        discount: discount,
        start_date: new Date(startDate),
        expiry_date: new Date(endDate), 
        min_pur_amount: minAmount,        
        max_coupon_amount: maxAmount,    
        description: couponDescription    
    },{ new: true });
     console.log('success',data)
    res.json({ success: true, message: 'Coupon edited successfully' });
};


exports.deleteCoupon = async (req, res) => {
    const { couponId } = req.body
    if (!couponId) {
      return res.json({ success: false, error: 'Coupon ID not provided' })
    }
  
    try {
      const coupon = await Coupon.findById(couponId)
      
      if (!coupon) {
        return res.json({ success: false, error: 'Coupon not found' })
      }
  
      await Coupon.findByIdAndDelete(couponId)
      res.json({ success: true, message: 'Coupon deleted successfully' })
    } catch (error) {
      res.json({ success: false, error: 'Server error occurred' })
    }
  }
  