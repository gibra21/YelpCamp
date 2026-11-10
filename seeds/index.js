const mongoose = require('mongoose');
const cities = require('./cities')
const Campground = require('../models/campground')
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp")
    .then(() => {
        console.log('mongoose connected')
    })
    .catch(() => {
        console.log('error, mongoose not connected')
    });


const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const rand1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
          location: `${cities[rand1000].city}, ${cities[rand1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            image: 'https://picsum.photos/400?random=${Math.random()}',
            description: "wfioohsjfjwfocksjmksvniovsv", 
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close()
})