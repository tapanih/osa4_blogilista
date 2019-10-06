// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs
    .map(blog => blog.likes)
    .reduce((a, b) => a + b, 0)
}

const favouriteBlog = (blogs) => {
  const maxLikes = Math.max(...blogs
    .map(blog => blog.likes))
  const blog = blogs.find(blog => blog.likes === maxLikes)
  if (blog) {
    return {
      title: blog.title,
      author: blog.author,
      likes: blog.likes
    }
  } else {
    return {}
  }
}

const mostBlogs = (blogs) => {

  if(!blogs || !blogs.length) {
    return {}
  }

  let counts = {}
  let maxAuthor = undefined
  let maxBlogs = 0
  blogs.forEach(blog => {
    if (counts[blog.author]) {
      counts[blog.author] += 1
    } else {
      counts[blog.author] = 1
    }
    if (maxBlogs < counts[blog.author]) {
      maxAuthor = blog.author
      maxBlogs = counts[blog.author]
    }
  })
  return {
    author: maxAuthor,
    blogs: maxBlogs
  }
}

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog,
  mostBlogs
}