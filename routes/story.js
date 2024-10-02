const express = require('express')
const User = require('../schemas/user.schema')
const StorySchema = require('../schemas/story.schema')
const router = express.Router();
const authUserLogin = require('../middleware/authLogin')

router.post('/Post',authUserLogin, async(req,res)=>{
    try{
        const {formState, username} = req.body;
        const slides = formState;
        const addedBy = username;
        if(!slides || !addedBy){
            return res.status(400).json("Please provide all the required fields");
        }
        const story = new StorySchema({ slides, addedBy });
        await story.save();
        res.status(200).send("Story Posted Successfully");
    } 
    catch(error){
        throw new Error(error.message)
    }
});

router.put('/edit/:id', async(req, res) => {
    const {id} = req.params;
    const {formState, username} = req.body;
    const slides = formState;
    const addedBy = username;
    try{
        const story = await StorySchema.findById(id);
        if(!story){
            return res.status(404).json({ message: 'Story not found' });
        }
        if(story.addedBy !== addedBy){
            return res.status(403).json({ message: 'Unauthorized to update this story' });
        }
        story.slides = slides;
        await story.save();
        return res.status(200).json({ message: 'Story updated successfully', story });
    }
    catch(error){
        console.error("Error updating story:", error);
        return res.status(500).json({ message: 'Error updating the story', error: error.message });
    }
});

router.get('/filter/:filter', async(req,res)=>{
    let stories = {};
    try{
        const categoryFilter = req.params.filter;
        if(!categoryFilter){
            return res.status(400).json("Please provide a Filter");
        }
        if(categoryFilter === 'All'){
            stories = await StorySchema.find();
        }
        else{
            stories = await StorySchema.find({
                slides: { $elemMatch: { category: categoryFilter } },
            })
        }
        res.status(200).json(stories);
    } 
    catch(error){
        throw new Error(error.message)
    }
});

router.get('/', async(req, res) => {
    try{
      const stories = await StorySchema.find({});
      res.status(200).json(stories);
    } 
    catch(error){
      res.status(500).json({ error: error.message });
    }
});

router.get('/user/:username', async(req, res) => {
    try{
      const stories = await StorySchema.find({ addedBy: req.params.username });
      res.json(stories);
    }
    catch(error){
      res.status(500).send('Server error');
    }
});

router.get('/edit/:id', async(req, res) => {
    const {id} = req.params;
    try{
        const story = await StorySchema.findById(id);
        if(!story){
            return res.status(404).json({ message: 'Story not found' });
        }
        return res.status(200).json(story);
    }
    catch(err){
        return res.status(500).json({ message: 'Error finding the story', error: err.message });
    }
});

router.get('/:id', async(req,res) =>{
    const {id} = req.params;
    try{
        const story = await StorySchema.findById(id);
        if(!story){
            return res.status(404).json({ message: 'Story not found' });
        }
        return res.status(200).json(story);
    }
    catch(err){
        return res.status(500).json({ message: 'Error finding the story', error: err.message });
    }
})

router.put('/like/:id', async(req,res) =>{
    const {id} = req.params;
    const {slideId} = req.body;
    try{
        const story = await StorySchema.findById(id);
        if(!story){
            return res.status(404).json({ message: 'Story not found' });
        }
        story.slides[slideId].totalLikes = (Number(story.slides[slideId].totalLikes) + 1);
        await story.save();
        res.status(200).send("Story Like Increased Successfully");
    }
    catch(err){
        return res.status(500).json({ message: 'Error finding the story', error: err.message });
    }
})

router.put('/unlike/:id', async(req,res) =>{
    const {id} = req.params;
    const {slideId} = req.body;
    try{
        const story = await StorySchema.findById(id);
        if(!story){
            return res.status(404).json({ message: 'Story not found' });
        }
        story.slides[slideId].totalLikes = (Number(story.slides[slideId].totalLikes) - 1);
        await story.save();
        res.status(200).send("Story Like Decreased Successfully");
    }
    catch(err){
        return res.status(500).json({ message: 'Error finding the story', error: err.message });
    }
})

module.exports = router;