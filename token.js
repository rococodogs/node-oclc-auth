// struct/wrapper for Access Token
module.exports = Token

function Token (opts) {
  if (!(this instanceof Token)) return new Token(opts)

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

Token.prototype.toHeader = function () {
  return 'Bearer: ' + this
}

Token.prototype.toString = function () {
  return this.access_token
}
