const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// eslint-disable-next-line no-unused-vars
usersRouter.get('/', async (req, res) => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
})

usersRouter.post('/', async (req, res, next) => {
  try {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(req.body.password, saltRounds)
    const user = new User({
      username: req.body.username,
      name: req.body.name,
      passwordHash
    })

    const savedUser = await user.save()
    res.json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter