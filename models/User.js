const mongoose = require('mongoose');

//   name: String,
//   email: String,
//   password: String

// user_id: String,
// email: String,
// username: String,
// password: String,
// user_type: String,
// create_date: Date,
// modify_date: Date
const UserSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true,
        lowercase: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        maxlength: 20
    },
    password: {
        type: String,
        required: true,
        // maxlength: 50
    },
    user_type: {
        type: String,
        maxlength: 20,
        default: 'user'
    },
    status: {
        type: String,
        maxlength: 20,
        default: 'inactive'
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    modify_date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
