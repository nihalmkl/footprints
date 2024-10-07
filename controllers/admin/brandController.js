// const Brand = require('../../models/brandSchema')

// // Load Brands
// exports.loadBrand = async(req, res) => {
//     try {
//         let brands = await Brand.find({}) // Fetch all brands
//         const newBrandName = req.body.brandName;
//         const newId = brands.length ? brands[brands.length - 1].id + 1 : 1; // Generate new ID if needed
//         res.render('admin/brand', { layout: 'layout/admin', title: 'Brands', brands, newBrandName, newId });
//     } catch (error) {
//         console.log(error);
//     }
// };

// // Edit Brand
// exports.editBrand = async (req, res) => {
//     const brandId = req.params.id;
//     const { brandName } = req.body;

//     try {
//         const existBrand = await Brand.findOne({ brand_name: brandName }); // Check if brand name already exists
//         console.log(brand);
//         if (existBrand) {
//             return res.status(404).json({ error: 'Brand already exists, please choose another name' });
//         }
        
//         const updateBrand = await Brand.findByIdAndUpdate(brandId, { $set: { brand_name: brandName } }, { new: true }); // Update the brand name
//         console.log(updateBrand);
        
//         if (updateBrand) {
//             res.redirect('/admin/brand');
//         }
//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// // Add Brand
// exports.addBrand = async(req, res) => {
//     const { brandName } = req.body;
//     console.log(brandName);

//     try {
//         const existBrand = await Brand.find({ brand_name: { $regex: new RegExp('^' + brandName + '$', 'i') } }); // Check for existing brand with case-insensitive matching
//         console.log(existBrand);
        
//         if (existBrand.length > 0) {
//             return res.status(400).json('Brand Already Exists');
//         }
        
//         const newBrand = new Brand({
//             brand_name: brandName,
//             is_delete: false
//         });

//         await newBrand.save();
//         return res.json('Brand Added Successfully');
//     } catch (error) {
//         return res.status(500).json('Internal Server Error');
//     }
// };

// // Delete Brand (soft delete)
// exports.deleteBrand = async(req, res) => {
//     const brandId = req.params.id;

//     try {
//         await Brand.updateOne({ _id: brandId }, { is_delete: true }); // Soft delete the brand
//         res.redirect('/admin/brand');
//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };

// // Restore Brand (un-delete)
// exports.restoreBrand = async(req, res) => {
//     const brandId = req.params.id;

//     try {
//         await Brand.updateOne({ _id: brandId }, { is_delete: false }); // Restore soft-deleted brand
//         res.redirect('/admin/brand');
//     } catch (error) {
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// };
