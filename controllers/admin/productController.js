const Product = require('../../models/productSchema')
const Category = require('../../models/categorySchema')
const Brand = require('../../models/brandSchema')
const User = require('../../models/userSchema')
const fs = require('fs')
const path = require('path')
const multer = require('multer')

exports.loadProducts = async (req,res)=>{
    const Products= await Product.find({})
    console.log(Products)
    try{
        res.render('admin/products', { layout: 'layout/admin', title: 'Products',Products});
    }catch(error){
        console.log(error)
    }
}

exports.loadAddProduct = async(req,res)=>{
    try{
        console.log('ahkdh')
        const categories = await Category.find({is_delete:false})
        const brands = await Brand.find({is_delete:false})
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

const upload = multer({ storage: storage });

exports.addProduct = async (req, res) => {
        try {
            const { productName, category, brand, stock, color, price, size, description } = req.body;
            const uploadedImages = req.files;
    
            const imagePaths = uploadedImages.map(file => `/public/uploads/${file.filename}`); // Only store relative path
            console.log(productName, category, brand, stock, color, price, size, description)
            console.log(imagePaths)
            // Create a new product object
            const newProduct = new Product({
                product_name: productName,
                category_id: category,
                brand_id: brand,
                variants: [
                    {
                        stock: stock,
                        color: color,
                        price: price,
                        size: size,
                        images: imagePaths // Store only the relative paths of the images
                    }
                ],
                description: description,
                is_delete: false
            });
            console.log(newProduct)
    
            await newProduct.save();
    
            res.json({
                success:true,
                message: 'Product added successfully!',
            });
        } catch (error) {
            console.log(error);
            
        }
    }