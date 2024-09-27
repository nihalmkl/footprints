const mongoose = require('mongoose')
const connectDB = async()=>{
    try {
        // disabling strict mode for mongoose
        mongoose.set('strictQuery',false)
        const conn = await  mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.log(error)
        process.exit(1); 
    }
}

module.exports = connectDB