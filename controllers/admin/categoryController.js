const Category = require('../../models/categorySchema')

exports.loadCategory = async(req,res)=>{
    try{
        let categories = await Category.find({})
        const newCategoryName = req.body.categoryName;
        const newId = categories.length ? categories[categories.length - 1].id + 1 : 1;
        res.render('admin/category', { layout: 'layout/admin', title: 'Categories' ,categories,newCategoryName,newId});
    }catch(error){
        console.log(error)
    }
}
exports.addCategory = async(req,res)=>{
    const {categoryName} = req.body
    try{
        const existCategory = Category.findOne({categoryName})
        if(existCategory){
           return res.status(400).json('Category Already Exist')
        }
        const newCategory = new Category({
            categoryName
        })
        await newCategory.save()
        return res.json('Category Added Successfully')
    }catch(error){
       return res.status(500).json("Internal Server Error")

    }
}
