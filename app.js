const express = require('express');
const { engine } = require('express-handlebars');
const app = express()
const post = 3000

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

app.listen(post, () => {
  console.log('server is enable...')
})

require('./routes/index')(app)