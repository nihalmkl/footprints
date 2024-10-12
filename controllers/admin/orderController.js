exports.loadOrderPage = async (req,res)=>{
    try{
       res.render('admin/orders',{layout: "layout/admin",
        title: "Orders"})
    }catch(err){
       res.status(500).send('orders error')
    }
}

