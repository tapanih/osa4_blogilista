const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially 3 blogs in the db', () => {
  let token = null
  let userid = null

  beforeAll(async () => {
    await User.deleteMany({})
    const user = {
      username: 'testi',
      password: 'secret'
    }

    const res1 = await api
      .post('/api/users/')
      .send(user)

    userid = res1.body.id

    const res2 = await api
      .post('/api/login/')
      .send(user)

    token = res2.body.token
  })

  beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map(blog => new Blog({ ...blog, user: userid }))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs/')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const res = await api.get('/api/blogs/')
    expect(res.body.length).toBe(helper.initialBlogs.length)
  })

  test('blogs have a field called id', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs[0].id).toBeDefined()
    expect(blogs[2].id).toBeDefined()
  })

  test('blogs have a correct user field', async () => {
    const blogs = await helper.blogsInDb()
    expect(blogs[0].user.toString()).toBe(userid.toString())
    expect(blogs[2].user.toString()).toBe(userid.toString())
  })

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'First class tests',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html',
      likes: 10,
    }

    await api
      .post('/api/blogs/')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain('First class tests')
    const authors = blogsAtEnd.map(blog => blog.author)
    expect(authors).toContain('Robert C. Martin')
    const urls = blogsAtEnd.map(blog => blog.url)
    expect(urls).toContain('http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.html')
  })

  test('likes are defaulted to 0 if not provided', async() => {
    const newBlog = {
      title: 'TDD harms architecture',
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html'
    }

    await api
      .post('/api/blogs/')
      .set('Authorization', 'bearer ' + token)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const addedBlog = blogsAtEnd.find(blog => blog.title === 'TDD harms architecture')
    expect(addedBlog.likes).toBe(0)
  })

  test('a blog without a title can not be added', async () => {
    const newBlogWithoutTitle = {
      author: 'Robert C. Martin',
      url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
      likes: 2,
    }

    await api
      .post('/api/blogs/')
      .set('Authorization', 'bearer ' + token)
      .send(newBlogWithoutTitle)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
  })

  test('a blog without an url can not be added', async () => {
    const newBlogWithoutUrl = {
      title: 'Type wars',
      author: 'Robert C. Martin',
      likes: 2,
    }

    await api
      .post('/api/blogs/')
      .set('Authorization', 'bearer ' + token)
      .send(newBlogWithoutUrl)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(helper.initialBlogs.length)
  })

  test('a blog can not be deleted with an incorrect token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'bearer randomgarbage_6asajsfjhkjsfhskjfkjd')
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(blogToDelete.title)
  })

  test('a blog can be deleted with the correct token', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'bearer ' + token)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })

  test('likes of a blog can be updated', async () => {
    const blogsAtStart = await helper.blogsInDb()
    let blogToUpdate = blogsAtStart[0]

    blogToUpdate = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1
    }

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', 'bearer ' + token)
      .send(blogToUpdate)
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd.length).toBe(blogsAtStart.length)

    const likes = blogsAtEnd.map(blog => blog.likes)
    expect(likes).toContain(blogToUpdate.likes)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
