require('dotenv').config();
const mongoose = require('mongoose');
const DB_CONNECTION_STRING = process.env.MONGODB_CONNECTION_URL;

mongoose.set({ strictQuery: false });
mongoose.connect(`${DB_CONNECTION_STRING}`, {
 useNewUrlParser: true,
 useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to database'));
db.once('open', () => {
 console.log('Connected to database successfully');
 module.exports = db;
});
