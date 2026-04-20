const mongoose = require('mongoose');


function connectDb() {
    return mongoose.connect(process.env.mongo_url)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('Error connecting to MongoDB', err);
        throw err;
    });
}   

module.exports = connectDb;


            