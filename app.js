const config = require('./utils/config')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const mongoose = require('mongoose')

mongoose.connect(config.MONGODB_URI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true })

app.use(cors())
app.use(bodyParser.json())
app.use('/api/blogs', blogsRouter)

module.exports = app