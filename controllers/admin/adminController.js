const User = require('../../models/userSchema')
const bcrypt = require('bcrypt')


exports.loadAdminLogin = async(req,res)=>{
    console.log(req.session.admin)
    try{
            res.redirect('/admin/dashboard',{layout:'layout/admin',title:'Dashboard'})
        
    }catch(err){
      console.log(err)
    }
    
}
exports.adminLogin = async (req,res) => {
    try {
        const {email,password} = req.body
        const admin = await User.findOne({email,isAdmin:true})
        if(admin){
            const passwordMatch = bcrypt.compare(password,admin.password)
            if(passwordMatch){
                req.session.admin = true
                return res.redirect('/admin/dashboard',{layout:'layout/admin',title:'Dashboard'})
            }else{
                return res.redirect('admin/adm-login')
            }
        }else{
            res.redirect('/admin/adm-login')
        }
    } catch (error) {
        console.log(error)
    }
}




exports.adminHome = async (req,res)=>{
    try {
       res.render('admin/dashboard',{layout:'layout/admin',title:'Dashboard'})
    } catch (error) {
        console.log(error.message)
    }
    
   
}


exports.adminLogout = async(req,res)=>{
    try{
        req.session.destroy(err =>{
            if(err){
                console.log("Error destrouing session",err)
            }
            res.redirect('/admin/adm-login')
        })
    }catch(err){
       console.log('unexpected error during logout',error)
    }
}