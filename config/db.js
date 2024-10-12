const mongoose = require('mongoose')
const env = require('dotenv').config()
const connectDB = async()=>{
    try {
        mongoose.set('strictQuery',false)
        const conn = await  mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (error) {
        console.log('DB connection failed',error.message)
        process.exit(1); 
    }
}

module.exports = connectDB