require('dotenv').config();
const mongoose = require('mongoose');
const DB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_URL;

const connectDB = async () => {
 return new Promise((resolve, reject) => {
  mongoose.set('strictQuery', false);
  mongoose
   .connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'data',
   })
   .then(() => {
    console.log('db connected');
    resolve();
   })
   .catch((err) => {
    console.log(err);
    reject(err);
   });
 });
};

const conn = mongoose.connection;
module.exports = { connectDB: connectDB, connection: conn };
