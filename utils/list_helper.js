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

module.exports = {
  dummy,
  totalLikes,
  favouriteBlog
}