const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique:true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    online: {
        type: String, 
        default: ''
    }
});

// export model user with UserSchema
module.exports = mongoose.model("user", UserSchema);
