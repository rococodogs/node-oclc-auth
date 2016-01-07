module.exports = buildLoginUrl

var WSKey = require('oclc-wskey')
var qs = require('querystring')
var BASE_URL = 'https://authn.sd00.worldcat.org/oauth2/authorizeCode'

function buildLoginUrl (opts) {
  opts = opts || {}

  var clientId = opts.clientId || (opts.wskey && opts.wskey instanceof WSKey ? opts.wskey.key : undefined)
  var authenticatingId = opts.authenticatingInstitutionId || opts.contextInstitutionId
  var contextId = opts.contextInstitutionId || opts.authenticatingInstitutionId
  var redirectUri = opts.redirectUri
  var scope = getScope(opts.scope)
  var type = opts.type || 'token'

  if (!clientId) handleError('clientId (or WSKey)')
  if (!authenticatingId) handleError('authenticatingId')
  if (!contextId) handleError('contextId')
  if (!redirectUri) handleError('redirectUri')
  if (!scope || !scope.length) handleError('scope')

  var querystring = qs.stringify({
    client_id: clientId,
    authenticatingInstitutionId: authenticatingId,
    contextInstitutionId: contextId,
    redirect_uri: redirectUri,
    response_type: type,
    scope: scope.join(' '),
  })

  return BASE_URL + '?' + querystring
}

function getScope (scope) {
  if (typeof scope === 'string')
      return scope.replace(/\,\s*/g, ' ').split(/\s+/g)
  else if (Array.isArray(scope))
      return scope
  else
      return []
}

function handleError (thingNotProvided) {
  throw new Error('No ' + thingNotProvided + ' provided')
}
