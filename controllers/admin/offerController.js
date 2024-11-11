
const Offer = require('../../models/offerSchema')
const Product = require('../../models/productSchema')
const Category = require('../../models/categorySchema')
exports.loadOffer = async (req, res) => {
  try {
      const offer = await Offer.find();
      const product = await Product.find({ isDelete: false }).populate("offer");
      const category = await Category.find({ isDeleted: false }).populate("offer");
      const selectoffer = await Offer.find(); 

      res.render('admin/offer', {
          layout: "layout/admin",
          title: "Offer",
          offer,
          product,
          category,
          selectoffer 
      });
  } catch (error) {
      console.log(error);
      res.status(500).send("Error loading offers");
  }
};

exports.addOffers = async (req, res) => {
    try {
      const nameRegex = /^[a-zA-Z\s\-]+$/
      const { offerName, offerPercentage, offerStartDate } = req.body
      console.log("hey",offerName)
      const currentDate = new Date()
  
      if (!offerName) {
        return res.json({ success: false, error: "Offer name is empty" })
      }
      if (offerName.length < 2) {
        return res.json({
          success: false,
          error: "Name must have a minimum of 2 characters.",
        })
      }
      if (!nameRegex.test(offerName)) {
        return res.json({
          success: false,
          error: "Name should not contain numbers or special characters.",
        })
      }
  
      if (offerPercentage == null) {
        return res.json({ success: false, error: "Offer percentage is empty" })
      }
      if (isNaN(offerPercentage)) {
        return res.json({
          success: false,
          error: "Percentage must be a number.",
        })
      }
      if (offerPercentage < 1 || offerPercentage > 100) {
        return res.json({
          success: false,
          error: "Percentage must be between 1 and 100.",
        })
      }
      if (offerPercentage !== Math.floor(offerPercentage)) {
        return res.json({
          success: false,
          error: "Percentage must be a whole number.",
        })
      }
  
      if (!offerStartDate) {
        return res.json({ success: false, error: "Offer start date is empty" })
      }
      const startDate = new Date(offerStartDate)
      if (isNaN(startDate)) {
        return res.json({ success: false, error: "Invalid date format" })
      }
      // if (startDate < currentDate) {
      //   return res.json({
      //     success: false,
      //     error: "Start date cannot be in the past.",
      //   })
      // }
      const newOffer = new Offer({
        offer_name: offerName,
        discount_percentage: offerPercentage,
        start_date: startDate,
      })
  
      await newOffer.save()
      res.json({ success: true, message: "New offer added successfully" })
    } catch (error) {
      console.error("Error occurred while adding new offer:", error)
      res.status(500).json({ error: "Internal server error" })
    }
  }
  
  exports.editOffers = async (req, res) => {
    try {
    
        const nameRegex = /^[a-zA-Z\s\-]+$/;
        const {
          editOfferId,
          editOfferName,
          editOfferPercentage,
          editOfferStartDate,
         
        } = req.body;
        console.log(editOfferStartDate,"djkdsauua")
        const currentDate = new Date();
  
        if (!editOfferName) {
          
          return res.json({ success: false, error: "offer name is empty" });
        }
  
        if (editOfferName.length < 2) {
          return res.json({
            success: false,
            error: "Name must need minimum 2 characters.",
          });
        }
  
        if (!nameRegex.test(editOfferName)) {
          return res.json({
            success: false,
            error: "Name should not contain numbers or special characters.",
          });
        }
  
        if (!editOfferPercentage) {
          return res.json({ success: false, error: "offerPercentage is empty" });
        }
  
        if (isNaN(editOfferPercentage)) {
          return res.json({
            success: false,
            error: "Percentage must be a number.",
          });
        }
  
        if (editOfferPercentage < 1 || editOfferPercentage > 100) {
          return res.json({
            success: false,
            error: "Percentage not more than 100 and less than 0",
          });
        }
  
        if (editOfferPercentage !== Math.floor(editOfferPercentage)) {
          return res.json({
            success: false,
            error: "Percentage must be a whole number.",
          });
        }
  
        if (!editOfferStartDate) {
          return res.json({ success: false, error: "offerStartDate is empty" });
        }
        // if (editOfferStartDate < currentDate) {
        //   return res.json({
        //     success: false,
        //     error: "Start date cannot be in the past.",
        //   });
        // }
        await Offer.findByIdAndUpdate(editOfferId, {
            offer_name: editOfferName,
            discount_percentage: editOfferPercentage,
            start_date: new Date(editOfferStartDate),
            
          });
    
          res.json({ success: true, message: "offer successfully edited" });
        
      } catch (error) {
        console.error("Error occurred while adding new offer:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    }


    exports.deleteOffer = async (req, res) => {
        try {
          const offerId = req.body.offerId
          const offer = await Offer.findById(offerId)
      
          if (!offer) {
            return res.json({ success: false, error: "This offer not found" })
          }
      
          await Offer.findByIdAndUpdate(offerId, { is_delete: true })
      
          await Product.updateMany(
            { offer: offerId },
            {
              $set: {
                offer: null,
                discount_amount: null
              }
            }
          )
      
          await Category.updateMany(
            { offer: offerId },
            {
              $set: {
                offer: null
              }
            }
          )
      
          return res.json({ success: true, message: "Offer successfully deleted" })
        } catch (error) {
          console.log("Error while deleting the offer", error)
          return res.status(500).json({ success: false, error: "Server error" })
        }
      }
      
      exports.restoreOffer = async (req, res) => {
        try {
          const offerId = req.body.offerId
          const offer = await Offer.findById(offerId)
      
          if (!offer) {
            return res.json({ success: false, error: "This offer not found" })
          }
      
          await Offer.findByIdAndUpdate(offerId, { is_delete: false })
          return res.json({ success: true, message: "Offer successfully restored" })
        } catch (error) {
          console.log("Error while restoring the offer", error)
          return res.status(500).json({ success: false, error: "Server error" })
        }
      }

