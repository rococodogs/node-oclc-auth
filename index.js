module.exports = AccessToken
module.exports.getLoginUrl = require('./get-login-url')
module.exports.parseResponseToken = parseResponseToken

var url = require('url')
var qs = require('querystring')

function parseResponseToken (response) {
  var parsed = url.parse(response)
  var hash = parsed.hash

  // strip leading hash
  if (hash.indexOf('#') === 0) hash = hash.substr(1)

  var tokenData = qs.parse(hash)
  return new AccessToken(tokenData)
}

function AccessToken (opts) {
  if (!(this instanceof AccessToken)) return new AccessToken(opts)
  if (typeof opts === 'string') return parseResponseToken(opts)

  this.access_token = opts.access_token
  this.contextInstitutionId = Number.parseInt(opts.contextInstitutionId, 10)
  this.expires_at = opts.expires_at
  this.expires_in = Number.parseInt(opts.expires_in, 10)
  this.principalID = opts.principalID
  this.principalIDNS = opts.principalIDNS
  this.token_type = opts.token_type || 'bearer'

  Object.defineProperty(this, 'expired', {
    get: function () {
      return Date.parse(this.expires_at) < Date.now()
    }
  })
}

AccessToken.prototype.toHeader = function () {
  return 'Bearer: ' + this
}

AccessToken.prototype.toString = function () {
  return this.access_token
}
