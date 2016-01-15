var https = require('https')
var url = require('url')
var qs = require('querystring')

var AUTH_URL  = 'https://authn.sd00.worldcat.org/oauth2/authorizeCode'
var TOKEN_URL = 'https://authn.sd00.worldcat.org/oauth2/accessToken'

module.exports = OCLCAuth

function OCLCAuth (opts) {
  if (!(this instanceof OCLCAuth)) return new OCLCAuth(opts)

  this.wskey = opts.wskey
  this.authenticatingInstitutionId = opts.authenticatingInstitutionId || opts.contextInstitutionId
  this.contextInstitutionId = opts.contextInstitutionId || opts.authenticatingInstitutionId
}

module.exports.getAuthUrl =
OCLCAuth.prototype.getAuthUrl =
function getAuthUrl (opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  opts = opts || {}

  var redirect_uri = opts.redirect_uri || this.wskey.redirect_uri
  var scope = opts.scope || this.wskey.scope
  var type = opts.response_type || 'token'
  var clientId = opts.clientId || this.wskey.key
  var authId = opts.authenticatingInstitutionId || this.authenticatingInstitutionId
  var contextId = opts.contextInstitutionId || this.contextInstitutionId
  var async = (cb && typeof cb === 'function') ? true : false
  var missingThing

  if (!clientId)
    missingThing = 'clientId (or WSKey)'
  else if (!authId)
    missingThing = 'authenticatingInstitutionId'
  else if (!contextId)
    missingThing = 'contextInstitutionId'
  else if (!redirect_uri)
    missingThing = 'redirect_uri'
  else if (!scope || !scope.length)
    missingThing = 'scope'

  if (missingThing) {
    var err = new Error('No ' + missingThing + ' provided!')
    if (async) return cb(err)
    throw err
  }

  var querystring = qs.stringify({
    client_id: clientId,
    authenticatingInstitutionId: authId,
    contextInstitutionId: contextId,
    redirect_uri: redirect_uri,
    response_type: type,
    scope: scope.join(' '),
  })

  var url = AUTH_URL + '?' + querystring

  if (async) return cb(null, url)
  return url
}

OCLCAuth.prototype.requestToken = function requestToken (opts, callback) {
  var type = opts.grant_type
  var q

  switch (type) {
    case 'refresh':
      q = {
        grant_type: type,
        refresh_token: opts.refresh_token
      }
      break
    case 'authorization_code':
      q = {
        grant_type: type,
        code: opts.code,
        authenticatingInstitutionId: this.authenticatingInstitutionId,
        contextInstitutionId: this.contextInstitutionId,
        redirect_uri: this.wskey.redirect_uri
      }
      break
    case 'client_credentials':
      q = {
        grant_type: type,
        authenticatingInstitutionId: this.authenticatingInstitutionId,
        contextInstitutionId: this.contextInstitutionId,
        scope: this.wskey.scope
      }
      break
  }

  var parsed = url.parse(TOKEN_URL + '?' + qs.stringify(q))
  var formattedUrl = url.format(parsed)

  var opts = {
    hostname: parsed.hostname,
    method: 'POST',
    path: parsed.path,
    headers: {
      'Accept': 'application/json',
      'Authorization': this.wskey.HMACSignature('POST', url.format(parsed))
    }
  }
  var body = ''

  https.request(opts, function (res) {
    res.on('data', function (d) { body += d })
    res.on('end', function () {
      var data = JSON.parse(body)

      // TODO: handle errors
      if (data.access_token)
        return callback(null, data)
    })
  }).end()
}
