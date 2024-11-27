const Product = require('../../models/productSchema')
const Category = require('../../models/categorySchema')
const Brand = require('../../models/brandSchema')
const Offer = require('../../models/offerSchema')
const User = require('../../models/userSchema')
const fs = require('fs')
const path = require('path')
const multer = require('multer')


exports.loadProducts = async (req, res) => {
    try {
        const limit = 10; 
        const page = parseInt(req.query.page) || 1; 
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .skip(skip)
            .limit(limit)
            .populate('category_id')
            .populate('brand_id')
            .populate('offer')
        const offers = await Offer.find({ is_delete: false })
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit);

        res.render('admin/products', {
            layout: 'layout/admin',
            title: 'Products',
            Products: products,
            currentPage: page,
            totalPages: totalPages > 5 ? 5 : totalPages, 
            Offers: offers,
            currentRoute: '/admin/products'
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).send('Internal Server Error');
    }
};



exports.loadAddProduct = async(req,res)=>{
    try{
        const categories = await Category.find({is_delete:false})
        const brands = await Brand.find({is_delete:false})
        res.render('admin/add-product', { layout: 'layout/admin', title: 'Products',categories,brands,currentRoute: '/admin/add_product' });
    }catch(error){
        res.status(500).json({success:false, message: "Server Error" });
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/upload/re-image'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage: storage });

// <------------------------ This for add  product---------------------------->
exports.addProduct = async (req, res) => {
    try {
        const { productName, category, brand, description } = req.body;
        const uploadedImages = req.files;

        const imagePaths = uploadedImages.map(file => `/public/uploads/${file.filename}`);

        const sizes = req.body.sizes;   
        const stocks = req.body.stocks;
        const prices = req.body.prices; 

        const variants = sizes.map((size, index) => ({
            size: size,
            stock: stocks[index],
            price: prices[index],
          
        }));

       
        const newProduct = new Product({
            product_name: productName,
            category_id: category,
            brand_id: brand,
            images: imagePaths ,
            variants: variants,
            description: description,
            is_delete: false
        });

        await newProduct.save();

        res.json({
            success: true,
            message: 'Product added successfully!',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Error adding product!',
            error: error.message
        });
    }
}
    
exports.deleteProduct = async (req, res) => {

    const productId = req.params.id
  try {
    const product = await Product.findById(productId)
    product.is_delete = !product.is_delete;
    await product.save();
    return res.json({delete:true})  
  } catch (error) {
    return res.status(500).json({delete:true})
  }
}

// <------------------------ This for loading  edit products page ---------------------------->

exports.editProductPage = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId).populate('category_id brand_id');

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const categories = await Category.find({is_delete:false}); 
        const brands = await Brand.find({is_delete:false});

        res.render('admin/edit_product', {
            layout: 'layout/admin',
            title: 'Products',
            product,
            categories,
            brands,
            currentRoute: '/admin/edit_product'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

// <------------------------ This for edit products---------------------------->

exports.editProduct = async (req, res) => {
    const { productName, category, brand, description,variants } = req.body;
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }

        product.product_name = productName;
        product.category_id = category;
        product.brand_id = brand;
        product.description = description;

         if (variants && Array.isArray(variants)) {
            product.variants = variants.map(variant => ({
                size: variant.size,
                stock: parseInt(variant.stock, 10),
                price: parseInt(variant.price, 10)
            }));
        }

        await product.save();
        res.status(200).send('Product updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
};


// <------------------------ This code for applying offer in product side ---------------------------->

exports.applyOffer = async (req, res) => {
    const { offer_id } = req.body
    const { productId } = req.params
    try {
        const offerValue = offer_id ? offer_id : null
        await Product.findByIdAndUpdate(productId, { offer: offerValue })
        res.json({ success: true, message: 'Offer applied successfully' })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: 'Failed to apply offer' })
    }
}
