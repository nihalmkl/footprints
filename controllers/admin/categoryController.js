const Category = require("../../models/categorySchema");

exports.loadCategory = async (req, res) => {
  try {
    let categories = await Category.find({});
    res.render("admin/category", {
      layout: "layout/admin",
      title: "Categories",
      categories,
    });
  } catch (error) {
    console.log(error);
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
    console.log(req.body);

    const { categoryId } = req.body;
    console.log(categoryId);
    console.log("hi");

    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.json({ success: false });
    }
    if (category.is_delete) {
      console.log("Restoring category...");
      await Category.updateOne({ _id: categoryId }, { is_delete: false }); 
      return res.json({deleted:true ,message:"category restored"})

  } else {
      console.log("Deleting category...");
      await Category.updateOne({ _id: categoryId }, { is_delete: true }); 
      return res.json({restored:true,message:"category deleted" })

  }
  } catch (error) {
    console.log(error)
  }
};


