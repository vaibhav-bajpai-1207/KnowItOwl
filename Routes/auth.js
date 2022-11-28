const express = require('express')
const User = require('../Models/User')
const Post = require('../Models/Post')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router()
const fetchuser = require('../middleware/fetchuser')

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

router.get('/login', (req, res)=>{
    res.render('login')
})

router.get('/new', (req, res)=>{
    res.render('signup')
})

router.get('/update', authenticateToken, async(req, res)=>{
    let userId = req.userId.userId
    let user = await User.findById(userId)
    user.password = ''
    res.render('updateUser', {
        user: user
    })
})

// add a new user : POST : /auth/new
router.post('/new', async(req, res)=>{
    if(await User.findOne({email: req.body.email})){
        res.status(404).send("User already exists")     
    }
    else{
        var salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(req.body.password, salt);
        const newUser = new User({
            email: req.body.email,
            name: {
                fullName: req.body.fullName,
                nickName: req.body.nickName
            },
            password: hash
        })

        await newUser.save()
        var token = jwt.sign({userId: newUser.id}, secret, { expiresIn: '7d' });
        res.cookie('authToken', token);
        res.redirect('/');
    }
})

// login an existing user : POST : /auth/login
router.post('/login', async(req, res)=>{
    try{
        const user = await User.findOne({email: req.body.email})
        if(user){
            if(bcrypt.compareSync(req.body.password, user.password)){
                var token = jwt.sign({userId: user.id}, secret, { expiresIn: '7d' });
                res.cookie('authToken', token);
                res.redirect('/');
                // res.json({authToken: token})
            }
            else{
                res.status(404).send("wrong password")
            }
        }
        else{
            res.status(404).send("user does not exist")
        }
    }catch(e){console.log(e)}
})

// Update an existing user : PUT : /auth/update/
router.post('/update', authenticateToken, async(req, res)=>{
    let userId = req.userId.userId
    let user = await User.findById(userId)
    let newUser = user
    if(user){
        if(req.body.fullName){
            newUser.name.fullName = req.body.fullName
            console.log(newUser.name.fullName)
        }
        if(req.body.nickName){
            newUser.name.nickName = req.body.nickName
        }
        
        user = await User.findByIdAndUpdate(user.id, newUser) 
        res.redirect('/profile')
    }
    else{
        res.status(404).send('User does not exist')
    }
})

// Delete a user profile : POST : /auth/deleteuser
router.post('/deleteuser', authenticateToken, async(req, res)=>{
    const userId = req.userId.userId
    await Post.deleteMany({userId: userId})
    const user = await User.findByIdAndDelete(userId)
    res.clearCookie('authToken')
    res.redirect('/')
})

// Logout a User : POST : /auth/logout
router.post('/logout', (req, res)=>{
    res.clearCookie('authToken')
    res.redirect('/')
})


module.exports = router