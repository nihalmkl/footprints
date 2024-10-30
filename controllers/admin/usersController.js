const User = require('../../models/userSchema')

exports.loadUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = 4
        const skip = (page - 1) * limit

        const users = await User.find({ isAdmin: false })
            .skip(skip)
            .limit(limit)

        const totalUsers = await User.countDocuments({ isAdmin: false })
        const totalPages = Math.ceil(totalUsers / limit)

        res.render('admin/users', { 
            layout: 'layout/admin', 
            title: 'Users', 
            users, 
            currentPage: page, 
            totalPages 
        })
    } catch (error) {
        console.log(error)
    }
}




exports.blockUser = async (req,res) => {
    try {
        let id = req.params.id
        await User.updateOne({_id:id},{$set:{isBlocked:'true'}})
        let users = await User.find({
            isAdmin:false
        })
        res.redirect('/admin/users')
    } catch (error) {
        console.log(error)
    }
}
exports.unblockUser = async (req,res) =>{
  try{
    let id = req.params.id
    await User.updateOne({_id:id},{$set:{isBlocked:'false'}})
    res.redirect('/admin/users')
  }catch(error){
    console.log(error)
  
  }
}