const express = require('express')
const User = require('../Models/User')
const Post = require('../Models/Post')
const jwt = require('jsonwebtoken');
const slugify = require('slugify');
const { findByIdAndDelete } = require('../Models/Post');
const router = express.Router()

// secret key for jwt
const secret = "I am a very bad b0y"

// Authenticate token middleware
const authenticateToken = (req, res, next)=>{
    const token = req.cookies.authToken
    if(token){
        jwt.verify(token, secret, (err, userId)=>{
            if(err){
                return res.sendStatus(403)
            }else{
                req.userId = userId
            }
        })
    }
    else{
        return res.sendStatus(401).json({"msg" : "Unauthorised"});
    }
    next()
}

// let posts = [
//     {
//         title: "title1"
//     },
//     {
//         title: "title2"
//     },
//     {
//         title: "title3"
//     }
// ]

// Calculating time required for reading a post
const reqTime = async(para)=>{
    let words = await para.split(' ')
    words = await (para == '' ? 0 : words)
    return words*0.01;
}

// Get Posts on Home Page
router.get('/', async(req, res)=>{
    let posts = []
    posts = await Post.find({})
    let name = ''
    if(req.cookies.authToken){
        await jwt.verify(req.cookies.authToken, secret, async (err, userId)=>{
            if(err){
                res.status(401).send(err)
            }else{
                // name = await User.findById(userId.userId).name.nickName
                let user = await User.findById(userId.userId)
                name = (user.name.nickName)
            }
        })
    }

    res.render('home', {
        posts: posts,
        name: name
    })
    // res.send("hello")
})

// Render the form for new post upload : GET : /newpost
router.get('/newpost', (req, res)=>{
    res.render('newPost')
    // res.send('newpost')
})

// Render the form for post update : GET : /updatepost/:id
router.get('/updatepost/:id', async(req, res)=>{
    const postId = req.params.id
    const post = await Post.findById(postId)
    // res.json(post)

    res.render('updatePost', {
        post: post
    })
})

// Update post : POST : /updatepost/:id
router.post('/updatepost/:id', authenticateToken, async(req, res)=>{
    const postId = req.params.id
    // console.log(postId)
    let post = await Post.findById(postId)
    let newPost = post
    // res.json(newPost)

    if(post){
        if(req.body.imgURL){
            newPost.imgURL = req.body.imgURL
            // console.log(newPost.imgURL)
        }
        if(req.body.title){
            newPost.title = req.body.title
            // console.log(newPost.title)
        }
        if(req.body.desc){
            newPost.desc = req.body.desc
            // console.log(newPost.desc)
        }
        if(req.body.markdown){
            newPost.markdown = req.body.markdown
            // console.log(newPost.markdown)
        }    
    }
    else{
        res.status(404).send('User does not exist')
    }

    post = await Post.findByIdAndUpdate(postId, newPost)
    // res.json(post)
    res.redirect(`/${post.slug}`)
})

// Delete a post : POST : /deletepost/:id
router.post('/deletepost/:id', async(req, res)=>{
    const postId = req.params.id
    const post = await Post.findByIdAndDelete(postId)
    res.redirect('/profile')
})

// Get User Profile : GET : /profile
router.get('/profile', authenticateToken, async (req, res)=>{
    const userId = req.userId.userId;

    const user = await User.findById(userId)
    const posts = await Post.find({userId: userId})
    
    res.render('userProfile', {
        user: user,
        posts: posts
    })
})

// Get Update User Form : GET : /updateuser
router.get('/updateuser',authenticateToken , async(req, res)=>{
    let user = await User.findById(req.userId.userId)
    res.render('updateUser', {
        user: user
    })
})

// Details about a post
router.get('/:slug', async(req, res)=>{
    try{
        // res.json({slug: req.params.slug})
        const post = await Post.findOne({slug: req.params.slug})
        let author = await User.findById(post.userId)
        const authorName = (author.name.fullName)
        
        res.render('viewpost', {
            post: post,
            authorName: authorName
        })
    }catch(e){
        console.log(e)
    }


})

// Add New Post page : GET : /newpost
router.post('/newpost',authenticateToken , async(req, res)=>{
    const newPost = new Post({
        userId:  req.userId.userId,
        imgURL: req.body.imgURL,
        title: req.body.title,
        desc: req.body.desc,
        markdown: req.body.markdown
    })
    let post = await newPost.save()
    res.redirect(`/${post.slug}`)
})

module.exports = router