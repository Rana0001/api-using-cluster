const dotenv = require('dotenv');
const colors = require('colors');
dotenv.config(
    {path: '.env'}
);

const mongoose = require('mongoose');



mongoose.set('strictQuery', true);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected: `.green +`${process.env.MONGODB_URL}`.bgBlue.underline);
    } catch (error) {
        console.error(`Error: ${error.message}`.red.underline.bold);
        process.exit(1);
    }
}

module.exports = connectDB;