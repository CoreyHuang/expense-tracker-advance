const db = require('../models/index')
const User = db.User
const ShareUser = db.ShareUser
const Category = db.Category
const OwnCategory = db.OwnCategory
const Payment = db.Payment
const d = require('../components/debug')
const moment = require('moment')
const { Model } = require('sequelize/dist')
const user = require('../models/user')

const costController = {

  getCostInputPage: (req, res) => {
    User.findByPk(req.user.id, {
      include: [{ model: Category, as: 'ownCategory' }]
    })
      .then((category) => {
        d('category', category.toJSON())
        const categories = []
        category.toJSON().ownCategory.forEach(d => {
          return categories.push({ name: d.name, id: d.id })
        });
        res.render('costInput', { categories })
      })
      .catch((err) => { console.log(err) })

  },

  postCost: (req, res) => {
    d('test', req.body)
    const { Date, category, inputPrice, shareCheck } = req.body
    Payment.create({
      categoryId: category,
      price: inputPrice,
      userId: req.user.id,
      shareUserId: req.user.shareUser,
      isShare: shareCheck ? true : false,
      createdAt: Date
    })
      .then((data) => res.redirect('/costInput'))
      .catch((err) => { console.log(err) })
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
  },

  getNewCategoryPage: (req, res) => {
    
  },
}

module.exports = costController