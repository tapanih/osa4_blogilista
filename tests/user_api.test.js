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

  test('creating a new user fails when the username is already taken', async () => {
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

  test('creating a new user fails when the username is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'no',
      name: 'short username',
      password: 'mypass'
    }

    const result = await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('shorter than the minimum allowed length (3)')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('creating a new user fails when the password is less than 3 characters long', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'username',
      name: 'short password',
      password: 'ok'
    }

    const result = await api
      .post('/api/users/')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('password should be at least 3 characters long')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  afterAll(() => {
    mongoose.connection.close()
  })
})