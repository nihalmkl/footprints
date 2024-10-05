const User = require('../../models/userSchema')

exports.loadUsers = async(req,res)=>{
    try{
        let users = await User.find({
            isAdmin:false
        })
        if(users.length === 0){
            console.log('No user fount')
        }
        console.log(users)
        res.render('admin/users', { layout: 'layout/admin', title: 'Users', users });
    }catch(error){
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