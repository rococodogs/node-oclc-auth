var tape = require('tape')
var AccessToken = require('./')
var data = {
  "access_token":"tk_Yebz4BpEp9dAsghA7KpWx6dYD1OZKWBlHjqW",
  "token_type":"bearer",
  "expires_in":"3599",
  "principalID":"cpe4c7f6-f5a4-41fa-35c9-9d59443f544p",
  "principalIDNS":"urn:oclc:platform:128807",
  "contextInstitutionId": "128807",
  "expires_at": "2013-08-23 18:45:29Z"
}
var token = new AccessToken(data)

// Token tests

tape('token.toString() prints `access_token` property', function (t) {
  t.plan(1)
  t.equals(token + '', data.access_token)
})

tape('token.expired is expired', function (t) {
  t.plan(1)
  t.ok(token.expired, 'should be true')
})

tape("updated token.expires_at isn't expired", function (t) {
  var future = new Date(Date.now() + 10e8)
               .toISOString()
               .replace('T', ' ')
               .replace(/\.(\d{2})\d/g, ':$1')

  var cloned = {}
  for (var key in data) {
    if (data.hasOwnProperty(key)) cloned[key] = data[key]
  }

  cloned['expires_at'] = future
  var newToken = AccessToken(cloned)
  t.plan(1)
  t.ok(!newToken.expired, 'newToken.expired should be false')
})

tape('token.toHeader() prints Bearer header', function (t) {
  t.equals(token.toHeader(), 'Bearer: ' + data.access_token)
  t.end()
})

tape('AccessToken.parseTokenResponse() works with full urls', function (t) {
  var qs = require('querystring').encode(data)
  var hash = '#' + qs
  var fullUrl = 'http://localhost/' + hash
  var parsedUrl = AccessToken.parseResponseToken(fullUrl)

  t.deepEquals(parsedUrl, token)
  t.end()
})

tape('AccessToken.getLoginUrl() builds url', function (t) {
  var expect = 'https://authn.sd00.worldcat.org/oauth2/authorizeCode?'
             + 'client_id=jdfRzYZbLc8HZXFByyyLGrUqTOOmkJOAPi4tAN0E7xI3hgE2xDgwJ7YPtkwM6W3ol5yz0d0JHgE1G2Wa'
             + '&authenticatingInstitutionId=128807&contextInstitutionId=128807'
             + '&redirect_uri=http%3A%2F%2Flibrary.worldshare.edu%2Ftest.html'
             + '&response_type=token&scope=WMS_NCIP'
  var fields = {
    clientId: 'jdfRzYZbLc8HZXFByyyLGrUqTOOmkJOAPi4tAN0E7xI3hgE2xDgwJ7YPtkwM6W3ol5yz0d0JHgE1G2Wa',
    authenticatingInstitutionId: 128807,
    redirectUri: 'http://library.worldshare.edu/test.html',
    scope: ['WMS_NCIP']
  }

  var url = AccessToken.getLoginUrl(fields)
  t.equals(url, expect)
  t.end()
})
