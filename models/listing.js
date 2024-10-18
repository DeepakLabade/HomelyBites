const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "default link",
        set: (v) => v === "   " ? "default link" : v,
    },
    price: Number,
    category: String,
    availability: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user",
    }
});

const foodItems = mongoose.model("foodItems", listingSchema);
module.exports = foodItems;