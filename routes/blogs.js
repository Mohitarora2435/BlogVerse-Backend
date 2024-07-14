const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { body, validationResult } = require('express-validator');
const fetchuser = require('../middleware/fetchuser');

// fetch blogs from user by auth token
router.get('/fetchblogs', fetchuser, async (req, res) => {
    try {
        const blogs = await Blog.find({ User: req.user.id });
        res.json(blogs);
    } catch (error) {
        console.error('Error finding blogs:', error);
        res.status(500).json({ error: 'Error finding blogs' });
    }
});

//Create blog for existing user
router.post('/createblog', fetchuser, [
    body('title', 'Title must have 3 characters').isLength({ min: 3 }),
    body('description', 'Description must have 5 characters').isLength({ min: 10 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description } = req.body;
        const newBlog = new Blog({ title, description, User: req.user.id }); // Associate the blog with the user
        await newBlog.save();
        res.status(201).json(newBlog);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Error creating blog' });
    }
});

router.put('/updateblog/:id', fetchuser, [
    body('title', 'Title must have 3 characters').isLength({ min: 3 }),
    body('description', 'Description must have 5 characters').isLength({ min: 10 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description } = req.body;
        const newBlog = {}
        if(title){newBlog.title = title}
        if(description){newBlog.description = description}

        let blog = await Blog.findById(req.params.id)
        if(!blog){return res.status(404).json({ error: 'Not Found' })}

        if(blog.User.toString() !== req.user.id){return res.status(401).json({ error: 'Access Denied' })}

        blog = await Blog.findByIdAndUpdate(req.params.id, {$set:newBlog}, {new:true})
        res.json(blog);

    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Error creating blog' });
    }
});

router.delete('/deleteblog/:id', fetchuser, async (req, res) => {

    try {
        let blog = await Blog.findById(req.params.id)
        if(!blog){return res.status(404).json({ error: 'Not Found' })}

        if(blog.User.toString() !== req.user.id){return res.status(401).json({ error: 'Access Denied' })}

        blog = await Blog.findByIdAndDelete(req.params.id)
        res.json({'Sucess': 'Blog has been deleted'});

    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Error creating blog' });
    }
});


module.exports = router;
