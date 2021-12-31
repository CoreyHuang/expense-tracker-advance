const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session')
const app = express()
const passport = require('./config/passport')
const flash = require('connect-flash')
const d = require('./components/debug')

app.engine('handlebars', engine({ helpers: require('./config/handlebars-helper') }));
app.set('view engine', 'handlebars');
app.set('views', './views');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const port = process.env.PORT || 3000
const sessionSecret = process.env.SECRET || 'corey'

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

  next()
})

app.listen(port, () => {
  console.log('server is enable...')
})


require('./routes/index')(app)