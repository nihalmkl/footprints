const Product = require('../../models/productSchema')
const Category = require('../../models/categorySchema')
const Brand = require('../../models/brandSchema')
const User = require('../../models/userSchema')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

exports.loadProducts = async (req,res)=>{
    // const Products= await Product.find({})
    // try{
    //     res.render('admin/products', { layout: 'layout/admin', title: 'Products',Products});
    // }catch(error){
    //     console.log(error)
    // }
}

exports.loadAddProduct = async(req,res)=>{
    try{
        console.log('ahkdh')
        const categories = await Category.find({isBlocked:false})
        console.log(categories)
        const brands = await Brand.find({isBlocked:false})
        res.render('admin/add_product', { layout: 'layout/admin', title: 'Products',categories,brands });
    }catch(error){
        console.log(error)
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/upload/re-image'); // Directory to store uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filenames
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage:storage, fileFilter:fileFilter });

exports.addProduct = async (req,res)=>{
    upload.array('productImages', 4)(req, res, async function(err) {
        if (err) {
            return res.status(400).send('Error uploading images.');
        }
    try{ 
        const { productName, category, brand, stock, color, price, size, description } = req.body;
        
        const images = req.files.map(file => file.path);
        const newProduct = new Product({
            product_name: productName,
            category_id: category,
            brand_id: brand,
            variants: [
                {
                    stock: stock,
                    color: color,
                    price: price,
                    size: size
                }
            ],
            description: description,
            images: images, 
            is_delete: false 
        });
        await newProduct.save()
        res.redirect('/admin/products')
}catch(error){
    console.log(error)
    res.status(500).json({message:'Internal Server Error'})
  }
})
}
