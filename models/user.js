var mongoose = require("mongoose");
var passposrtLocalMOngoose = require("passport-local-mongoose");


var userSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    
    FirstName: String,
    LastName: String,
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    notifications: [
    	{
    	   type: mongoose.Schema.Types.ObjectId,
    	   ref: 'Notification'
    	}
    ],
    followers: [
    	{
    		type: mongoose.Schema.Types.ObjectId,
    		ref: 'User'
    	}
    ]
});

userSchema.plugin(passposrtLocalMOngoose);





module.exports = mongoose.model("user", userSchema);