const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})
    const user = new User({ username: 'admin', password: 'secret' })
    await user.save()
  })

  test('a new user can be created with an unique username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users/')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)
    const usernames = usersAtEnd.map(user => user.username)
    expect(usernames).toContain(newUser.username)
  })

  test('trying a create a new user fails when the username is already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'admin',
      name: 'Admin',
      password: 'adminpassword'
    }

    const result = await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('expected `username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  afterAll(() => {
    mongoose.connection.close()
  })
})