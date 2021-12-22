const db = require('../models/index')
const User = db.User
const ShareUser = db.ShareUser
const Category = db.Category
const OwnCategory = db.OwnCategory
const Payment = db.Payment
const d = require('../components/debug')
const bcrypt = require('bcrypt')
const { Op } = require('sequelize')

const userController = {

  test: (req, res) => {

    // console.log('fas', req.body)
    // res.render('signIn')
    res.render('category')
  },

  getSignInPage: (req, res) => {
    return res.render('signIn')
  },

  getSignUpPage: (req, res) => {
    return res.render('signup')
  },

  signUp: (req, res) => {
    Object.keys(req.body).forEach((d) => req.body[d] = req.body[d].trim())
    req.flash('signUpInput', req.body)
    const { account, email, password, passwordCheck } = req.body
    if (!account || !password || !passwordCheck) return res.redirect('back')
    if (password !== passwordCheck) return res.redirect('back')
    if (account.length > 30 || email.length > 30 || password.length > 30)
      return res.redirect('back')

    User.findOne({ where: { [Op.or]: [{ name: account }, { email }] } })
      .then((user) => {
        if (user) return res.redirect('signin')
        User.create({
          name: account, email,
          password: bcrypt.hashSync(password, 10)
        })
          .then((user) => {
            d('user', user)
            return res.redirect('signin')
          })
          .catch((err) => { console.log(err) })
      })
      .catch((err) => { console.log(err) })
    // res.redirect('back')

  },

}

module.exports = userController
