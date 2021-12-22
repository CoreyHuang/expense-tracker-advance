const express = require('express');
const { engine } = require('express-handlebars');
const session = require('express-session')
const app = express()
const post = 3000
const passport = require('./config/passport')
const flash = require('connect-flash')
const d = require('./components/debug')

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }))
app.use(session({ secret: 'corey', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

app.use((req, res, next) => {
  res.locals.user = req.user
  res.locals.signInInput = req.flash('signInInput')[0]
  res.locals.signUpInput = req.flash('signUpInput')[0]
  
  next()
})

app.listen(post, () => {
  console.log('server is enable...')
})


require('./routes/index')(app)