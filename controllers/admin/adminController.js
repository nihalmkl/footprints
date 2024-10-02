// const User = require('../../models/userSchema')
// const bcrypt = require('bcrypt')

exports.adminLogin = (req,res)=>{
    res.render('admin/login')
}

exports.loadAdminHome = async(req,res)=>{
    try {
        res.render('admin/dashboard',{layout:'layout/admin',title:'Dashboard'})
    } catch (error) {
        console.log(error)
    }
}
exports.loadProducts = async (req,res)=>{
    try{
        const products = [
            {
                _id: 1,
                name: "Journey Run's",
                category: "Sports Shoes",
                brand: "Nike",
                size: 9,
                color: "Black",
                stock: 7,
                price: 39.00,
                images: [
                    "https://imgs.search.brave.com/66TuCrlZbpYSv4VaHEWcjWt-pTVbPErlC_pwojkN1vM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODF1end4cTBmMEwu/anBn"
                ]
            },
            {
                _id: 2,
                name: "Blazer Phantom Low",
                category: "Casual Shoes",
                brand: "Nike",
                size: 10,
                color: "White",
                stock: 6,
                price: 99.00,
                images: [
                    "https://imgs.search.brave.com/66TuCrlZbpYSv4VaHEWcjWt-pTVbPErlC_pwojkN1vM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODF1end4cTBmMEwu/anBn"
                ]
            },
            {
                _id: 3,
                name: "Oxford Tecap Shoes",
                category: "Formal Shoes",
                brand: "Adidas",
                size: 8,
                color: "Brown",
                stock: 0,
                price: 59.00,
                images: [
                    "https://imgs.search.brave.com/66TuCrlZbpYSv4VaHEWcjWt-pTVbPErlC_pwojkN1vM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODF1end4cTBmMEwu/anBn"
                ]
            },
            {
                _id: 4,
                name: "Air Max 90 Premium",
                category: "Casual Shoes",
                brand: "Nike",
                size: 11,
                color: "Red",
                stock: 0,
                price: 99.00,
                images: [
                    "https://imgs.search.brave.com/66TuCrlZbpYSv4VaHEWcjWt-pTVbPErlC_pwojkN1vM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/ODF1end4cTBmMEwu/anBn"
                ]
            }
        ];

        const totalPages = 2;
        const currentPage = 1;

        res.render('admin/products', { layout: 'layout/admin', title: 'Products', products,totalPages,currentPage });
    }catch(error){
        console.log(error)
    }
}
exports.loadAddProduct = async(req,res)=>{
    try{  
    res.render('admin/add_product', { layout: 'layout/admin', title: 'Products' });
}catch(error){
    console.log(error)
}
   
}

exports.loadCategory = async(req,res)=>{
    try{
        res.render('admin/category', { layout: 'layout/admin', title: 'Categories' });
    }catch(error){
        console.log(error)
    }
}

exports.loadOrders = async(req,res)=>{
    try{
        res.render('admin/users', { layout: 'layout/admin', title: 'Users' });
    }catch(error){
        console.log(error)
    }
}