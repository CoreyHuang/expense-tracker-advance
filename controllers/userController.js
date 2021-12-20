const db = require('../models/index')
const User = db.User
const ShareUser = db.ShareUser
const Category = db.Category
const OwnCategory = db.OwnCategory
const Payment = db.Payment

const userController = {

  test: (req, res) => {

  
    res.render('costQuery')
    // res.render('category')
  }
}

module.exports = userController
