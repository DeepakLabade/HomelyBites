const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chefSchema = new Schema ({
    kitchenName : {
        type: String, 
        required: true,
    },
    OwnerName : {
        type: String,
        required: true,
    },
    emailId: {
        type: String,
    },
    experience: {
        type: Number,
        default: 0,
        set: (v) => v === "" ? "0" : v ,
    },
    image: {
        type: String,
        default: "https://images.unsplash.com/photo-1552590635-27c2c2128abf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kaWFuJTIwcmVzdGF1cmFudCUyMGZvb2QlMjBkaXNofGVufDB8fDB8fHww",
        set: (v) => v === "   " ? "https://images.unsplash.com/photo-1552590635-27c2c2128abf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aW5kaWFuJTIwcmVzdGF1cmFudCUyMGZvb2QlMjBkaXNofGVufDB8fDB8fHww" : v,
    },
    phoneNo: {
        type: Number,
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    city: String,
    state: String,
    foodType: String,
    approved: {
        type: Boolean,
        default: false,
    }
});

const chefInfo = mongoose.model("chefInfo", chefSchema);
module.exports = chefInfo;