const mongoose = require('mongoose')

const bookmarkSchema = new mongoose.Schema({
    storyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StorySchema',
        required: true
    },
    slide:{
        type: Number,
        required: true
    }
});
const likeSchema = new mongoose.Schema({
    storyId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StorySchema',
        required: true
    },
    slide:{
        type: Number,
        required: true
    }
});
const userSchema = new mongoose.Schema({
    username:{
        type : String,
        require : true,
    },
    password:{
        type : String,
        require : true,
    },
    bookmarks:[bookmarkSchema],
    likes:[likeSchema],
    date:{
        type : Date,
        default : Date.now,
    }
})

module.exports = mongoose.model('User',userSchema);
