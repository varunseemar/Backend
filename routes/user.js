const express = require('express')
const User = require('../schemas/user.schema')
const StorySchema = require('../schemas/story.schema')
const bcrypt = require('bcrypt')
const router = express.Router();
const jwt = require('jsonwebtoken')
const authUserLogin = require('../middleware/authLogin')

router.post('/Register', async (req,res)=>{
    try{
        const {username,password} = req.body;
        const userExsist = await User.findOne({username})
        console.log(userExsist)
        if(userExsist){
            return res.status(400).send("User already Registered")
        }
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password,salt);
        const user = new User({
            username,
            password : hashPassword,
        });
        await user.save();
        const token = jwt.sign({_id:user.id},process.env.JWTOKEN)
        res.json({
            username,
            token,
        })
    }
    catch(err){
        throw new Error(err.message);
    }
})

router.post('/Login', async (req,res)=>{
    try{
        const {username,password} = req.body;
        const userExsist = await User.findOne({username})
        console.log(userExsist)
        if(!userExsist){
            return res.status(400).send("Wrong Username or Password");
        }
        const validPassword = bcrypt.compareSync(password,userExsist.password);
        if(!validPassword){
            return res.status(400).send("Wrong Username or Password");
        }
        const token = jwt.sign({_id : userExsist._id},process.env.JWTOKEN);
        res.json({
            username:userExsist.username,
            token,
        })
    }
    catch(err){
        throw new Error(err.message);
    }
})

router.post('/Load/:username', authUserLogin , async (req,res)=>{
    try{
        const {username} = req.params;
        const userExsist = await User.findOne({username})
        console.log(userExsist)
        if(!userExsist){
            return res.status(404).send("User doesn't Exist");
        }
        if(userExsist){
            return res.status(200).send("User Loaded Successfully")
        }
        res.json({
            username:userExsist.username,
        })
    }
    catch(err){
        throw new Error(err.message);
    }
})

router.get('/bookmark/:username', async (req, res) => {
    try{
        const {username} = req.params;
        const userExsist = await User.findOne({username}).populate({
            path: 'bookmarks.storyId',
            select: 'slides',
        });
        console.log(userExsist)
        if(!userExsist){
            return res.status(404).send("User doesn't Exist");
        }
        const bookmarks = await Promise.all(userExsist.bookmarks.map(async (bookmark) => {
            const story = await StorySchema.findById(bookmark.storyId);
            if(!story){
                return null;
            } 
            const slide = story.slides[bookmark.slide];
            return{
                storyId: story._id,
                slideId: slide.slideId,
                heading: slide.heading,
                description: slide.description,
                imageUrl: slide.imageUrl
            };
        }));
        const filteredBookmarks = bookmarks.filter(bookmark => bookmark !== null);
        res.status(200).json({ bookmarks: filteredBookmarks });
    } 
    catch(err){
        console.error('Error fetching bookmarks:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/bookmark/remove/:username', async (req, res) => {
    const {storyId, slide} = req.query;
    const {username} = req.params;
    const userExsist = await User.findOne({username})
    console.log(userExsist)
    try{
        if(!userExsist){
            return res.status(404).send('User not found');
        }
        userExsist.bookmarks = userExsist.bookmarks.filter(
            (bookmark) => !(bookmark.storyId.toString() === storyId && bookmark.slide === parseInt(slide))
        );
        await userExsist.save();
        res.status(200).send('Bookmark removed successfully');
    }
    catch(error){
        console.error('Error removing bookmark:', error);
        res.status(500).send('Server error');
    }
});

router.post('/bookmark/:username', async (req, res) => {
    const {username} = req.params;
    const { storyId , slide } = req.body;
    const userExsist = await User.findOne({username});
    console.log(userExsist)
    if(!userExsist){
        return res.status(404).send("User doesn't Exist");
    }
    try{
        const existingBookmark = userExsist.bookmarks.find(
            (bookmark) => bookmark.storyId.toString() === storyId && bookmark.slide === slide
        );
        if(!existingBookmark){
            userExsist.bookmarks.push({ storyId, slide });
            await userExsist.save();
            return res.status(200).json({ message: "Bookmark added" });
        } 
        else{
            return res.status(400).json({ message: "Bookmark already exists" });
        }
    } 
    catch(error){
        return res.status(500).json({ message: "Server error", error });
    }
});

router.get('/like/:username', async (req, res) => {
    try{
        const {username} = req.params;
        const userExsist = await User.findOne({username}).populate({
            path: 'likes.storyId',
            select: 'slides',
        });
        console.log(userExsist)
        if(!userExsist){
            return res.status(404).send("User doesn't Exist");
        }
        const likes = await Promise.all(userExsist.likes.map(async (like) => {
            const story = await StorySchema.findById(like.storyId);
            if(!story){
                return null;
            } 
            const slide = story.slides[like.slide];
            return{
                storyId: story._id,
                slideId: slide.slideId,
                heading: slide.heading,
                description: slide.description,
                imageUrl: slide.imageUrl
            };
        }));
        const filteredLikes = likes.filter(like => like !== null);
        res.status(200).json({ likes: filteredLikes });
    } 
    catch(err){
        console.error('Error fetching likes:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/like/remove/:username', async (req, res) => {
    const {storyId, slide} = req.query;
    const {username} = req.params;
    const userExsist = await User.findOne({username})
    console.log(userExsist)
    try{
        if(!userExsist){
            return res.status(404).send('User not found');
        }
        userExsist.likes = userExsist.likes.filter(
            (like) => !(like.storyId.toString() === storyId && like.slide === parseInt(slide))
        );
        await userExsist.save();
        res.status(200).send('Like removed successfully');
    }
    catch(error){
        console.error('Error removing Like:', error);
        res.status(500).send('Server error');
    }
});

router.post('/like/:username', async (req, res) => {
    const {username} = req.params;
    const { storyId , slide } = req.body;
    const userExsist = await User.findOne({username});
    console.log(userExsist)
    if(!userExsist){
        return res.status(404).send("User doesn't Exist");
    }
    try{
        const existingLike = userExsist.likes.find(
            (like) => like.storyId.toString() === storyId && like.slide === slide
        );
        if(!existingLike){
            userExsist.likes.push({ storyId, slide });
            await userExsist.save();
            return res.status(200).json({ message: "Like added" });
        } 
        else{
            return res.status(400).json({ message: "Like already exists" });
        }
    } 
    catch(error){
        return res.status(500).json({ message: "Server error", error });
    }
});

module.exports = router;