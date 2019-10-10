const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (req, res, next) => {
  const blog = new Blog({
    title: req.body.title,
    author: req.body.author,
    url: req.body.url,
    likes: req.body.likes === undefined ? 0 : req.body.likes
  })
  try {
    const savedBlog = await blog.save()
    res.status(201).json(savedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.put('/:id', async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ _id: req.params.id })
    const updatedBlog = {
      title: blog.title,
      author: blog.author,
      url: blog.url,
      likes: req.body.likes,
    }
    const savedBlog = await Blog.findByIdAndUpdate(req.params.id, updatedBlog)
    res.json(savedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
})

blogsRouter.delete('/:id', async (req, res, next) => {
  try {
    await Blog.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (expection) {
    next(expection)
  }
})

module.exports = blogsRouter