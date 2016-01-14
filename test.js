var tape = require('tape')

var WSKey = require('oclc-wskey')
var wkopts = {
  key: 'jdfRzYZbLc8HZXFByyyLGrUqTOOmkJOAPi4tAN0E7xI3hgE2xDgwJ7YPtkwM6W3ol5yz0d0JHgE1G2Wa',
  secret: 'UYnwZbmvf3fAXCEa0JryLQ==',
  redirect_uri: 'http://library.worldshare.edu/test.php',
  scope: ['WMS_NCIP', 'WMS_CIRC']
}
var key = new WSKey(wkopts)

var Auth = require('./')
var authopts = {
  wskey: key,
  authenticatingInstitutionId: 128807
}

tape('Authorization Code url', function (t) {
  var a = Auth(authopts)
  var expect = [
    'https://authn.sd00.worldcat.org/oauth2/authorizeCode?',
    'client_id=jdfRzYZbLc8HZXFByyyLGrUqTOOmkJOAPi4tAN0E7xI3hgE2xDgwJ7YPtkwM6W3ol5yz0d0JHgE1G2Wa',
    '&authenticatingInstitutionId=128807',
    '&contextInstitutionId=128807',
    '&redirect_uri=http%3A%2F%2Flibrary.worldshare.edu%2Ftest.php',
    '&response_type=code',
    '&scope=WMS_NCIP%20WMS_CIRC'
  ].join('')

  var opts = {response_type: 'code'}
  var actual = a.getAuthUrl(opts)

  t.equal(actual, expect, 'builds url')
  t.end()
})
