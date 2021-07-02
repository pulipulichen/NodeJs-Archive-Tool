const trash = require('trash')

module.exports = async function (file) {
  await trash(file)
}