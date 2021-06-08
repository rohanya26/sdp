var mongoose = require("mongoose");
const Schema = mongoose.Schema;

var hankSchema = new Schema({
    name: String,
    image: String,
    description: String,
    link: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],
    reviews :[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
});
module.exports = mongoose.model(`hank`, hankSchema);