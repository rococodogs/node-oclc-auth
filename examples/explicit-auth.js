// usage:
// ```bash
// WSKEY_PUBLIC=publickey \
// WSKEY_SECRET=shhhh \
// INSTITUTION_ID=128807 \
// URI="http://localhost" \
// SCOPE="WMS_NCIP" \
// node server.js
// ```

var WSKey = require('oclc-wskey')
var express = require('express')
var cookieParser = require('cookie-parser')
var app = express()
var keyopts = {
  key: process.env.WSKEY_PUBLIC,
  secret: process.env.WSKEY_SECRET,
  redirect_uri: process.env.URI,
  scope: process.env.SCOPE
}
var key = new WSKey(keyopts)

var OCLCAuth = require('./')
var authopts = {
  wskey: key,
  authenticatingInstitutionId: process.env.INSTITUTION_ID
}
var auth = OCLCAuth(authopts)

app.use(cookieParser())
app.use(function (req, res, next) {
  if (req.path !== '/login' && !req.cookies.logged_in)
    return res.redirect('/login')

  if (!req.cookies.logged_in && req.path === '/' && req.query && req.query.code) {
    var codeopts = {
      grant_type: 'authorization_code',
      code: req.query.code
    }

    return auth.requestToken(codeopts, function (err, token) {
      if (err) console.log(err)
      if (token) {
        res.cookie('token', JSON.stringify(token))
        res.cookie('logged_in', true)
        return res.redirect('/')
      }
    })
  }

  next()
})

app.get('/', function (req, res) {
  res.end('hello friend!')
})

app.get('/login', function (req, res) {
  if (req.cookies.logged_in)
    return res.redirect('/')

  res.redirect(auth.getAuthUrl({response_type: 'code'}))
})

app.listen(8080)
