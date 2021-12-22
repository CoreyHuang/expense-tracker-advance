const db = require('../models/index')
const User = db.User
const ShareUser = db.ShareUser
const Category = db.Category
const OwnCategory = db.OwnCategory
const Payment = db.Payment

const userController = {

  test: (req, res) => {

    // console.log('fas', req.body)
    // res.render('signIn')
    res.render('category')
  },

  getSignInPage: (req, res) => {
    return res.render('signIn')
  },




}

module.exports = userController
