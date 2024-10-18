const mongoose = require("mongoose");
const initData = require("./data.js")
const foodItems = require("../models/listing.js")


const MONGO_URL = "mongodb://127.0.0.1:27017/HomelyBites";

main().then(()=> {
        console.log("connected to the DB")
    }).catch((err) => {
        console.log(err)
    })

async function main() {
    await mongoose.connect(MONGO_URL);
}


const initDB = async () => {
    await foodItems.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: "6710200d27322be1317d4d05"}))
    await foodItems.insertMany(initData.data);
    console.log("data was stored");
}

initDB();