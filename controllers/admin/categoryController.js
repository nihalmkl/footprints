const Category = require("../../models/categorySchema");
const Offer = require('../../models/offerSchema')

exports.loadCategory = async (req, res) => {
  try {
    const limit = 4
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit; 

    const categories = await Category.find({})
      .skip(skip)
      .limit(limit)
      .populate('offer')

    const totalCategories = await Category.countDocuments();
    const totalPages = Math.ceil(totalCategories / limit);
    const offers = await Offer.find({ is_delete: false })
    res.render("admin/category", {
      layout: "layout/admin",
      title: "Categories",
      categories,
      currentPage: page,
      totalPages: totalPages,
      Offers:offers,
      currentRoute: '/admin/categoties'
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error loading categories");
  }
};

exports.editCategory = async (req, res) => {
  const categoryId = req.params.id; 
  const { categoryName } = req.body;

  try {
    const category = await Category.findOne({
      category_name: new RegExp(`^${categoryName}$`, "i"), 
      _id: { $ne: categoryId } 
    });

    if (category) {
      return res.json({ exist: true, message: "Category name already exists" });
    }

    const existCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      { category_name: categoryName },
      { new: true } 
    );

    res.json({ success: true, message: "Category name updated successfully" });
  } catch (error) {
    console.error("Error in updating category: ", error); 
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.addCategory = async (req, res) => {
  const { categoryName } = req.body;
  try {
    
    const existCategory = await Category.find({
      category_name: { $regex: new RegExp(`^\\s*${categoryName}\\s*$`, "i") }, 
    });

    if (existCategory.length > 0) {
      return res.status(400).json("Category Already Exists");
    }

    const newCategory = new Category({
      category_name: categoryName, 
      is_delete: false,
    });

    await newCategory.save();
    return res.json("Category Added Successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error");
  }
};

exports.deleteCategory = async (req, res) => {
  try {

    const { categoryId } = req.body;

    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.json({ success: false });
    }
    if (category.is_delete) {
      await Category.updateOne({ _id: categoryId }, { is_delete: false }); 
      return res.json({deleted:true ,message:"category restored"})

  } else {
      await Category.updateOne({ _id: categoryId }, { is_delete: true }); 
      return res.json({restored:true,message:"category deleted" })

  }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.applyCategory= async (req, res) => {
  const { offer_id } = req.body
  const { categoryId } = req.params
  try {
    const offerValue = offer_id ? offer_id : null
      await Category.findByIdAndUpdate(categoryId, { offer: offerValue })
      res.json({ success: true, message: 'Offer applied to category successfully' })
  } catch (error) {
      console.error(error)
      res.status(500).json({ success: false, message: 'Failed to apply offer to category' })
  }
}