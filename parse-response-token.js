var url = require('url')
var qs = require('querystring')
var token = require('./token')

module.exports = function parseResponseToken (response) {
  var parsed = url.parse(response)
  var hash = parsed.hash

  // strip leading hash
  if (hash.indexOf('#') === 0) hash = hash.substr(1)

  var tokenData = qs.parse(hash)
  return token(tokenData)
}
