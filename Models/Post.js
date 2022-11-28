const mongoose = require('mongoose')
const slugify = require('slugify')
const { Schema } = mongoose;
let markdownIt = require('markdown-it');

const postSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    imgURL: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    reqTime: {
        type: Number,
        required: true,
        default: 6
    },
    desc: {
        type: String,
        required: true
    },
    markdown: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    slug:{
        type: String,
        unique: true,
        required: true
    },
    likes: {
        type: Number,
        default: 0,
        required: true
    }
})

const reqTime = async(para)=>{
    let words = await para.split(' ').length
    words = await (para == '' ? 0 : words)
    return Number(words*0.01);
}

const renderMarkDown = async(markdown)=>{
    md = new markdownIt();
    let result = md.render(markdown);
    return result
}

postSchema.pre('validate', async function (next){
    this.slug = slugify(this.title, {lower: true, strict: true})
    this.reqTime = await reqTime(this.desc)
    this.markdown = await renderMarkDown(this.markdown)
    next()
})
// const Post = mongoose.model('Post', postSchema)

module.exports = mongoose.model('Post', postSchema)