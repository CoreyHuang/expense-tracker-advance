const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session')
const app = express()
const passport = require('./config/passport')
const flash = require('connect-flash')
const d = require('./components/debug')
const https = require('https')
const fs = require('fs')
const options = {}

app.engine('handlebars', engine({ helpers: require('./config/handlebars-helper') }));
app.set('view engine', 'handlebars');
app.set('views', './views');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const port = process.env.PORT || 3000
const sessionSecret = process.env.SECRET || 'corey'

options.key = fs.readFileSync(process.env.KEY) || fs.readFileSync('./CA/server.key')
options.cert = fs.readFileSync(process.env.CERT) || fs.readFileSync('./CA/server.crt')
if (process.env.CA)
  options.ca = fs.readFileSync(process.env.CA) || ""

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(session({ secret: sessionSecret, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.signInInput = req.flash('signInInput')[0]
  res.locals.signUpInput = req.flash('signUpInput')[0]
  res.locals.successMessage = req.flash('successMessage')
  res.locals.errorMessage = req.flash('errorMessage')

  next()
})

app.use((req, res, next) => {
  d('req.protocol', req.protocol)
  d('req.headers.host', req.headers.host)
  if (req.protocol === 'http' && !(req.headers.host.includes('localhost')))
    res.redirect(`https://${req.headers.host}${req.url}`)
  next()
})

https.createServer(options, app).listen(443, () => {
  console.log("server starting on port:443")
});

app.listen(port, () => {
  console.log('server is enable...')
})


require('./routes/index')(app)