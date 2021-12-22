const db = require('../models/index')
const User = db.User
const ShareUser = db.ShareUser
const Category = db.Category
const OwnCategory = db.OwnCategory
const Payment = db.Payment
const d = require('../components/debug')
const moment = require('moment')

const costController = {

  getCostInputPage: (req, res) => {
    res.render('costInput')
  },

  getCostQueryPage: (req, res) => {
    Payment.findAll({
      raw: true, nest: true,
      where: { userId: req.user.id }, limit: 20, order: [['updatedAt', 'DESC']],
      include: [Category]
    })
      .then((allPayment) => {
        d('allPayment', allPayment)
        res.render('costQuery', { allPayment })
      })
      .catch((err) => { console.log(err) })
  }
}

module.exports = costController