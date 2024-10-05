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
  const categoryId = req.params.id; // Confirm this is correct
  const { categoryName } = req.body;

  try {
    const category = await Category.findOne({
      category_name: new RegExp(categoryName, "i"),
    });
    if (category) {
      return res.json({ success: false });
    }
    const existCategory = await Category.findOneAndUpdate(
      { _id: categoryId },
      { category_name: categoryName }
    );
    if (!existCategory) {
      return res.json({ success: false });
    }
    res.json({ success: true, message: "category name updated " });
  } catch (error) {
    console.error("Error in updating category: ", error); // Log the error for debugging
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

    // Saving the new category
    await newCategory.save();
    return res.json("Category Added Successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error");
  }
};

exports.deleteCategory = async (req, res) => {
  console.log("hi");
  try {
    console.log(req.body);

    const { categoryId } = req.body;
    console.log(categoryId);
    console.log("hi");

    const category = await Category.findOne({ _id: categoryId });
    console.log("sdifsdfj",category)

    if (!category) {
      return res.json({ success: false });
    }
    if (category.is_delete) {
      console.log("Restoring category...");
      await Category.updateOne({ _id: categoryId }, { is_delete: false }); // Restore category
     return res.json({success:true ,message:"category restored"})

  } else {
      console.log("Deleting category...");
      await Category.updateOne({ _id: categoryId }, { is_delete: true }); // Soft-delete category
   return res.json({success:true,message:"category deleted" })

  }
    //  res.redirect('/admin/category')
  } catch (error) {
    console.log(error)
  }
};


