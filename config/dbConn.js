const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.DATABASE_URI + '/techNotesDB')
    }catch(err){
        console.log(err)
    }
}

module.exports = connectDB