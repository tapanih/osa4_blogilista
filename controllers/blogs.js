const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (req, res) => {
  const blog = new Blog({
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes === undefined ? 0 : req.body.likes
  })

  const savedBlog = await blog.save()
  res.status(201).json(savedBlog.toJSON())
})

module.exports = blogsRouter