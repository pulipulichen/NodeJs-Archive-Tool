const isDateString = function (dateString) {
  return /^\d{8}/.test(dateString)
}

module.exports = isDateString