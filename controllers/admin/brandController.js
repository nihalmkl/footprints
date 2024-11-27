const Brand = require("../../models/brandSchema");

exports.loadBrand = async (req, res) => {
  try {
    const limit = 4 
    const page = parseInt(req.query.page)||1
    const skip = (page -1)*limit

    let brands = await Brand.find({}).skip(skip).limit(limit);
    const totalBrands = await Brand.countDocuments();
    const totalPages = Math.ceil(totalBrands / limit);
    res.render("admin/brand", {
      layout: "layout/admin",
      title: "Brands",
      brands,
      currentPage: page,
      totalPages: totalPages,
      currentRoute: '/admin/brands'
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.editBrand = async (req, res) => {
  const brandId = req.params.id; 
  const { brandName } = req.body;

  try {
    const brand = await Brand.findOne({
      brand_name: new RegExp(`^${brandName}$`, "i"), 
      _id: { $ne: brandId } 
    });

    if (brand) {
      return res.json({ exist: true, message: "Brand name already exists" });
    }

    await Brand.findOneAndUpdate(
      { _id: brandId },
      { brand_name: brandName },
      { new: true } 
    );

    res.json({ success: true, message: "Brand name updated successfully" });
  } catch (error) {
    console.error("Error in updating brand: ", error); 
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.addBrand = async (req, res) => {
  const { brandName } = req.body;
  try {
    const existBrand = await Brand.find({
      brand_name: { $regex: new RegExp(`^\\s*${brandName}\\s*$`, "i") }, 
    });

    if (existBrand.length > 0) {
      return res.status(400).json("Brand Already Exists");
    }

    const newBrand = new Brand({
      brand_name: brandName,
      is_delete: false,
    });

    await newBrand.save();
    return res.json("Brand Added Successfully");
  } catch (error) {
    console.error(error);
    return res.status(500).json("Internal Server Error");
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { brandId } = req.body;

    const brand = await Brand.findOne({ _id: brandId });

    if (!brand) {
      return res.json({ success: false });
    }
    if (brand.is_delete) {
      await Brand.updateOne({ _id: brandId }, { is_delete: false }); 
      return res.json({ deleted: true, message: "Brand restored" });
    } else {
      await Brand.updateOne({ _id: brandId }, { is_delete: true }); 
      return res.json({ restored: true, message: "Brand deleted" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Error" });
  }
};
