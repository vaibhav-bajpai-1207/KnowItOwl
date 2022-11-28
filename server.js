const cookieParser = require('cookie-parser')
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const port = 3000

// view engine : EJS
app.set('view engine', 'ejs')

// Mongoose connection
const mongoURI = 'mongodb://127.0.0.1:27017'
mongoose.connect(mongoURI, ()=>console.log("Connected to mongo successfuly"))

// setting content type
app.use(express.json())
// needs to come before routes
app.use(express.urlencoded({extended: false}))  //lets us access parameters from forms in req.body
// To let us use Cookies
app.use(cookieParser())

// Route imports
const auth = require('./Routes/auth')
const post = require('./Routes/post')

let obj = {
    name: "https://cdn.pixabay.com/photo/2022/02/12/21/02/heather-7009925_960_720.jpg"
}
app.get('/test', (req, res)=>{
    // res.render('test', {posts: posts})
    res.render('test', {obj: obj})
})

app.use('/auth', auth)
app.use('/', post)

app.listen(port, ()=>{
    console.log(`CompleteBlog running at http://127.0.0.1:${port}`)
})