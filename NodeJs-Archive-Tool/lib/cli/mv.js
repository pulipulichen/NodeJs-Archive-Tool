const mv = require('mv')

module.exports = function (input, output) {
  return new Promise((resolve) => {
    mv(input, output, (err) => {
      if (err) {
        throw err
      }
      resolve()
    })
  })
}