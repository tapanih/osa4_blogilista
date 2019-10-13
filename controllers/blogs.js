const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
    .populate('user', { username: 1, name: 1 })
  res.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!(req.token && decodedToken.id)) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)
    const blog = new Blog({
      title: req.body.title,
      author: req.body.author,
      user: user._id,
      url: req.body.url,
      likes: req.body.likes === undefined ? 0 : req.body.likes
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
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
      user: blog.user,
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