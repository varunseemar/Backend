const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    slides:[
        {
          heading:{
            type: String,
            required: true,
          },
          description:{
            type: String,
            required: true,
          },
          imageUrl:{
            type: String,
            required: true,
          },
          category:{
            type : String,
            enum : ['Food','Health And Fitness','Travel','Movie','Education','World'],
            default : 'Food'
          },
          slideId:{
            type : String,
            required : true,
          },
          totalLikes:{
            type: Number,
            default: 0,
          },
        },
      ],
      likes:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          username: String,
        },
      ],
      bookmarks:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          username: String,
        },
      ],
      addedBy:{
        type: String,
      },
    },
    { timestamps: true }
);

module.exports = mongoose.model('StorySchema',storySchema);