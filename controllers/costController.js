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
const sequelize = require("sequelize")
const Op = sequelize.Op
const bcrypt = require('bcrypt')

const costController = {

  getCostInputPage: (req, res) => {
    User.findByPk(req.user.id, {
      include: [{ model: Category, as: 'ownCategory' },
      { model: User, as: 'findShareUser' }]
    })
      .then((category) => {
        const shareUser = category.toJSON().findShareUser[0]
        let hasShareUser = false
        const categories = []
        category.toJSON().ownCategory.forEach(d => {
          return categories.push({ name: d.name, id: d.id })
        });
        if (shareUser) {
          return ShareUser.findOne({ where: { userId: shareUser.id, shareUserId: req.user.id } })
            .then((data) => {
              if (data) hasShareUser = true
              res.render('costInput', { categories, hasShareUser })
            })
            .catch((err) => console.log(err))
        }
        return res.render('costInput', { categories, hasShareUser })
      })
      .catch((err) => { console.log(err) })

  },

  postCost: (req, res) => {
    // d('req.body', req.body)
    // d('req.user', req.user)
    const { Date, category, inputPrice, shareCheck } = req.body
    Payment.create({
      categoryId: category,
      price: inputPrice,
      userId: req.user.id,
      shareUserId: req.user.findShareUser[0].id,
      isShare: shareCheck ? true : false,
      createdAt: Date
    })
      .then((data) => {
        req.flash('successMessage', '已成功新增')
        return res.redirect('/costInput')
      })
      .catch((err) => { console.log(err) })
  },

  getCostQueryPage: (req, res) => {
    Payment.findAll({
      raw: true, nest: true,
      where: { userId: req.user.id, isShare: false },
      limit: 20, order: [['createdAt', 'DESC']],
      include: [Category]
    })
      .then((allPayment) => {
        // d('allPayment', allPayment)
        res.render('costQuery', { allPayment })
      })
      .catch((err) => { console.log(err) })
  },

  getNewCategoryPage: (req, res) => {
    res.render('category')
  },

  postNewCategory: (req, res) => {
    const { inputCategory } = req.body
    if (inputCategory.trim().length > 5) return res.redirect('/costInput/category')
    User.findByPk(req.user.id, {
      include: [{ model: Category, as: 'ownCategory' }]
    })
      .then((user) => {
        if (user.toJSON().ownCategory.find((category) => category.name === inputCategory.trim())) {
          d('類別含重複名稱')
          req.flash('errorMessage', '類別名稱重複')
          return res.redirect('/costInput/category')
        }
        Category.create({ name: inputCategory.trim() })
          .then((category) => {
            OwnCategory.create({ userId: req.user.id, categoryId: category.id })
              .then(() => {
                req.flash('successMessage', '已成功新增')
                return res.redirect('/costInput')
              })
              .catch((err) => { console.log(err) })
          })
          .catch((err) => { console.log(err) })
      })
      .catch((err) => { console.log(err) })
  },


  getCostQueryRange: (req, res) => {
    d('PAR queryItem', req.params)
    const { queryItem } = req.params
    switch (queryItem) {

      case 'week':
        Payment.findAll({
          raw: true, nest: true, where: { isShare: false, userId: req.user.id },
          include: [{ model: Category }], order: [['createdAt', 'DESC']]
        })
          .then((payments) => {
            const sortResult = []
            payments.forEach((payment) => {
              let status = 0 // 0:無日期資料 1:有資料無類別 2:有資料有類別
              let index = -1
              let categoryIndex = -1

              //找尋是否已創建過資料
              sortResult.forEach((data, i) => {
                if (data.week === moment(payment.createdAt).week()) {
                  status = 1
                  index = i
                  if (data.category.find((k, i) => {
                    if (k.name === payment.Category.name) {
                      categoryIndex = i
                      return true
                    }
                  })) {
                    status = 2
                  }
                }
              })

              //根據上敘定義作不同處置
              if (status === 0) {
                let time = moment(payment.createdAt)
                sortResult.push({
                  week: time.week(),
                  price: payment.price,
                  category: [{
                    name: payment.Category.name,
                    price: payment.price,
                    percentage: 0
                  }],
                  startDate: time.add(1 - (time.format('d')), 'days').format(),
                  endDate: time.add(7 - (time.format('d')), 'days').format()
                })
              } else if (status === 1) {
                sortResult[index].price += payment.price
                sortResult[index].category.push({
                  name: payment.Category.name,
                  price: payment.price,
                  percentage: 0
                })
              } else {
                sortResult[index].price += payment.price
                sortResult[index].category[categoryIndex].price += payment.price
              }
            })

            // 計算佔比(之後整合到上面)
            sortResult.forEach(d => {
              d.category.forEach((unit) => {
                unit.percentage = ((unit.price / d.price) * 100).toFixed(2)
              })
              // 計算前五
              d.category.sort((x, y) => y.price - x.price)
            })

            // 只留類別佔比 top5
            sortResult.forEach((d) => {
              d.category.splice(5, d.category.length - 5)
            })
            // d('sortResult - final', sortResult)
            res.render('costQueryWeek', { sortResult })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'month':   ////////////////////////////////////////////////////////////////
        Payment.findAll({
          raw: true, nest: true, where: { isShare: false, userId: req.user.id },
          include: [{ model: Category }], order: [['createdAt', 'DESC']]
        })
          .then((payments) => {
            const sortResult = []
            payments.forEach((payment) => {
              let status = 0 // 0:無日期資料 1:有資料無類別 2:有資料有類別
              let index = -1
              let categoryIndex = -1

              //找尋是否已創建過資料
              sortResult.forEach((data, i) => {

                if (data.month === moment(payment.createdAt).month()) {
                  status = 1
                  index = i
                  if (data.category.find((k, i) => {
                    if (k.name === payment.Category.name) {
                      categoryIndex = i
                      return true
                    }
                  })) {
                    status = 2
                  }
                }
              })

              //根據上敘定義作不同處置
              if (status === 0) {
                let time = moment(payment.createdAt)
                sortResult.push({
                  month: time.month(),
                  price: payment.price,
                  category: [{
                    name: payment.Category.name,
                    price: payment.price,
                    percentage: 0
                  }],
                  startDate: time.format('YYYY-MM')
                })
              } else if (status === 1) {
                sortResult[index].price += payment.price
                sortResult[index].category.push({
                  name: payment.Category.name,
                  price: payment.price,
                  percentage: 0
                })
              } else {
                sortResult[index].price += payment.price
                sortResult[index].category[categoryIndex].price += payment.price
              }
            })

            // 計算佔比(之後整合到上面)
            sortResult.forEach(d => {
              d.category.forEach((unit) => {
                unit.percentage = ((unit.price / d.price) * 100).toFixed(2)
              })
              // 計算前五
              d.category.sort((x, y) => y.price - x.price)
            })

            // 只留類別佔比 top5
            sortResult.forEach((d) => {
              d.category.splice(5, d.category.length - 5)
            })
            // d('sortResult - MONTH', sortResult)
            // d('sortResult - MONTH', sortResult[0].category)
            res.render('costQueryMonth', { sortResult })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'range':
        res.render('costQueryRange')
        break;

      default:
        res.redirect('/costQuery')
        break;
    }

  },

  getCostQueryForSearch: (req, res) => {
    const { queryItem } = req.params
    const { startDate, endDate } = req.query
    const compareDate = moment(startDate).valueOf() < moment(endDate).valueOf()
    if (queryItem === 'range' && compareDate) {
      return Payment.findAll({
        raw: true, nest: true,
        where: {
          userId: req.user.id, isShare: false,
          createdAt: { [Op.between]: [startDate, endDate] }
        },
        include: [Category], order: [['createdAt', 'DESC']]
      })
        .then((payments) => {
          // d('payments', payments)
          const sortResult = []
          payments.forEach((payment) => {
            let status = 0 // 0:無日期資料 1:有資料無類別 2:有資料有類別
            let index = -1
            let categoryIndex = -1

            //找尋是否已創建過資料
            sortResult.forEach((data, i) => {
              if (sortResult[0]) { //是否存在初始值
                status = 1
                index = i
                if (data.category.find((k, i) => {
                  if (k.name === payment.Category.name) {
                    categoryIndex = i
                    return true
                  }
                })) {
                  status = 2
                }
              }
            })

            //根據上敘定義作不同處置
            if (status === 0) {
              let time = moment(payment.createdAt)
              sortResult.push({
                price: payment.price,
                category: [{
                  name: payment.Category.name,
                  price: payment.price,
                  percentage: 0
                }],
                startDate: startDate,
                endDate: endDate
              })
            } else if (status === 1) {
              sortResult[index].price += payment.price
              sortResult[index].category.push({
                name: payment.Category.name,
                price: payment.price,
                percentage: 0
              })
            } else {
              sortResult[index].price += payment.price
              sortResult[index].category[categoryIndex].price += payment.price
            }
          })

          // 計算佔比(之後整合到上面)
          sortResult.forEach(d => {
            d.category.forEach((unit) => {
              unit.percentage = ((unit.price / d.price) * 100).toFixed(2)
            })
            // 計算前五
            d.category.sort((x, y) => y.price - x.price)
          })

          // 只留類別佔比 top5
          sortResult.forEach((d) => {
            d.category.splice(5, d.category.length - 5)
          })

          // d('sortResult', sortResult)
          // d('sortResult', sortResult[0].category)
          return res.render('costQueryRange', { startDate, endDate, sortResult })
        })
        .catch((err) => { console.log(err) })
    }
    return res.render('costQueryRange', { startDate, endDate })
  },

  getCostQuerySharePage: (req, res) => {
    const share = true
    if (!req.user.findShareUser[0]) return res.render('costQuery', { share })
    Payment.findAll({
      raw: true, nest: true,
      where: {
        [Op.or]: [{
          userId: req.user.id, isShare: true, isShareCheck: true, shareUserId: req.user.findShareUser[0].id
        }, {
          userId: req.user.findShareUser[0].id, isShare: true, isShareCheck: true, shareUserId: req.user.id
        }]
      },
      limit: 20, order: [['createdAt', 'DESC']],
      include: [Category]
    })
      .then((allPayment) => {
        // d('allPayment', allPayment)
        res.render('costQuery', { allPayment, share })
      })
      .catch((err) => { console.log(err) })
  },
  //與 getCostQueryRange 高度重合，只差在搜尋條件 //////////////////////////////////////////////////////////////
  getQueryShareRange: (req, res) => {
    const share = true
    const { queryItem } = req.params
    switch (queryItem) {

      case 'week':
        if (!req.user.findShareUser[0]) return res.render('costQueryWeek', { share })
        Payment.findAll({
          raw: true, nest: true,
          where: {
            [Op.or]: [{
              isShare: true, userId: req.user.id,
              isShareCheck: true, shareUserId: req.user.findShareUser[0].id
            }, {
              isShare: true, userId: req.user.findShareUser[0].id,
              isShareCheck: true, shareUserId: req.user.id
            }]
          },
          include: [{ model: Category }], order: [['createdAt', 'DESC']]
        })
          .then((payments) => {
            const sortResult = []
            payments.forEach((payment) => {
              let status = 0 // 0:無日期資料 1:有資料無類別 2:有資料有類別
              let index = -1
              let categoryIndex = -1

              //找尋是否已創建過資料
              sortResult.forEach((data, i) => {
                if (data.week === moment(payment.createdAt).week()) {
                  status = 1
                  index = i
                  if (data.category.find((k, i) => {
                    if (k.name === payment.Category.name) {
                      categoryIndex = i
                      return true
                    }
                  })) {
                    status = 2
                  }
                }
              })

              //根據上敘定義作不同處置
              if (status === 0) {
                let time = moment(payment.createdAt)
                sortResult.push({
                  week: time.week(),
                  price: payment.price,
                  category: [{
                    name: payment.Category.name,
                    price: payment.price,
                    percentage: 0
                  }],
                  startDate: time.add(1 - (time.format('d')), 'days').format(),
                  endDate: time.add(7 - (time.format('d')), 'days').format()
                })
              } else if (status === 1) {
                sortResult[index].price += payment.price
                sortResult[index].category.push({
                  name: payment.Category.name,
                  price: payment.price,
                  percentage: 0
                })
              } else {
                sortResult[index].price += payment.price
                sortResult[index].category[categoryIndex].price += payment.price
              }
            })

            // 計算佔比(之後整合到上面)
            sortResult.forEach(d => {
              d.category.forEach((unit) => {
                unit.percentage = ((unit.price / d.price) * 100).toFixed(2)
              })
              // 計算前五
              d.category.sort((x, y) => y.price - x.price)
            })

            // 只留類別佔比 top5
            sortResult.forEach((d) => {
              d.category.splice(5, d.category.length - 5)
            })
            // d('sortResult - final', sortResult)
            res.render('costQueryWeek', { sortResult, share })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'month':   ////////////////////////////////////////////////////////////////
        if (!req.user.findShareUser[0]) return res.render('costQueryMonth', { share })
        Payment.findAll({
          raw: true, nest: true,
          where: {
            [Op.or]: [{
              isShare: true, userId: req.user.id, isShareCheck: true, shareUserId: req.user.findShareUser[0].id
            }, {
              isShare: true, userId: req.user.findShareUser[0].id, isShareCheck: true, shareUserId: req.user.id
            }]
          },
          include: [{ model: Category }], order: [['createdAt', 'DESC']]
        })
          .then((payments) => {
            const sortResult = []
            payments.forEach((payment) => {
              let status = 0 // 0:無日期資料 1:有資料無類別 2:有資料有類別
              let index = -1
              let categoryIndex = -1

              //找尋是否已創建過資料
              sortResult.forEach((data, i) => {

                if (data.month === moment(payment.createdAt).month()) {
                  status = 1
                  index = i
                  if (data.category.find((k, i) => {
                    if (k.name === payment.Category.name) {
                      categoryIndex = i
                      return true
                    }
                  })) {
                    status = 2
                  }
                }
              })

              //根據上敘定義作不同處置
              if (status === 0) {
                let time = moment(payment.createdAt)
                sortResult.push({
                  month: time.month(),
                  price: payment.price,
                  category: [{
                    name: payment.Category.name,
                    price: payment.price,
                    percentage: 0
                  }],
                  startDate: time.format('YYYY-MM')
                })
              } else if (status === 1) {
                sortResult[index].price += payment.price
                sortResult[index].category.push({
                  name: payment.Category.name,
                  price: payment.price,
                  percentage: 0
                })
              } else {
                sortResult[index].price += payment.price
                sortResult[index].category[categoryIndex].price += payment.price
              }
            })

            // 計算佔比(之後整合到上面)
            sortResult.forEach(d => {
              d.category.forEach((unit) => {
                unit.percentage = ((unit.price / d.price) * 100).toFixed(2)
              })
              // 計算前五
              d.category.sort((x, y) => y.price - x.price)
            })

            // 只留類別佔比 top5
            sortResult.forEach((d) => {
              d.category.splice(5, d.category.length - 5)
            })
            // d('sortResult - MONTH', sortResult)
            // d('sortResult - MONTH', sortResult[0].category)
            res.render('costQueryMonth', { sortResult, share })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'range':
        res.render('costQueryRange', { share })
        break;

      case 'unrecorded':
        if (!req.user.findShareUser[0]) return res.render('costQueryUnrecorded', { share })
        Payment.findAll({
          raw: true, nest: true,
          where: { userId: req.user.id, isShare: true, isShareCheck: false, shareUserId: req.user.findShareUser[0].id },
          order: [['createdAt', 'DESC']],
          include: [Category]
        })
          .then((allPayment) => {
            // d('allPayment', allPayment)
            res.render('costQueryUnrecorded', { allPayment })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'unconfirmed':
        if (!req.user.findShareUser[0]) return res.render('costQueryUnconfirmed', { share })
        Payment.findAll({
          raw: true, nest: true,
          where: { userId: req.user.findShareUser[0].id, isShare: true, isShareCheck: false, shareUserId: req.user.id, isSendBack: false },
          order: [['createdAt', 'DESC']],
          include: [Category]
        })
          .then((allPayment) => {
            // d('allPayment', allPayment)
            res.render('costQueryUnconfirmed', { allPayment, CSRF: bcrypt.hashSync(req.user.name, 10) })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'returned':
        if (!req.user.findShareUser[0]) return res.render('costQueryReturn', { share })
        Payment.findAll({
          raw: true, nest: true,
          where: { userId: req.user.id, isShare: true, isShareCheck: false, shareUserId: req.user.findShareUser[0].id, isSendBack: true },
          order: [['createdAt', 'DESC']],
          include: [Category]
        })
          .then((allPayment) => {
            // d('allPayment', allPayment)
            res.render('costQueryReturn', { allPayment, CSRF: bcrypt.hashSync(req.user.name, 10) })
          })
          .catch((err) => { console.log(err) })
        break;

      default:
        res.redirect('/costQuery', { share })
        break;
    }
  },
  // 與 getCostQueryForSear 高度重合
  getQueryShareForSearch: (req, res) => {
    if (!req.user.findShareUser[0]) return res.render('costQueryRange', { share: true })
    const { queryItem } = req.params
    const { startDate, endDate } = req.query
    const compareDate = moment(startDate).valueOf() < moment(endDate).valueOf()
    if (queryItem === 'range' && compareDate) {
      return Payment.findAll({
        raw: true, nest: true,
        where: {
          [Op.or]: [{
            userId: req.user.id, isShare: true,
            isShareCheck: true, shareUserId: req.user.findShareUser[0].id,
            createdAt: { [Op.between]: [startDate, endDate] }
          }, {
            userId: req.user.findShareUser[0].id, isShare: true,
            isShareCheck: true, shareUserId: req.user.id,
            createdAt: { [Op.between]: [startDate, endDate] }
          }]
        },
        include: [Category], order: [['createdAt', 'DESC']]
      })
        .then((payments) => {
          // d('payments', payments)
          const sortResult = []
          payments.forEach((payment) => {
            let status = 0 // 0:無日期資料 1:有資料無類別 2:有資料有類別
            let index = -1
            let categoryIndex = -1

            //找尋是否已創建過資料
            sortResult.forEach((data, i) => {
              if (sortResult[0]) { //是否存在初始值
                status = 1
                index = i
                if (data.category.find((k, i) => {
                  if (k.name === payment.Category.name) {
                    categoryIndex = i
                    return true
                  }
                })) {
                  status = 2
                }
              }
            })

            //根據上敘定義作不同處置
            if (status === 0) {
              let time = moment(payment.createdAt)
              sortResult.push({
                price: payment.price,
                category: [{
                  name: payment.Category.name,
                  price: payment.price,
                  percentage: 0
                }],
                startDate: startDate,
                endDate: endDate
              })
            } else if (status === 1) {
              sortResult[index].price += payment.price
              sortResult[index].category.push({
                name: payment.Category.name,
                price: payment.price,
                percentage: 0
              })
            } else {
              sortResult[index].price += payment.price
              sortResult[index].category[categoryIndex].price += payment.price
            }
          })

          // 計算佔比(之後整合到上面)
          sortResult.forEach(d => {
            d.category.forEach((unit) => {
              unit.percentage = ((unit.price / d.price) * 100).toFixed(2)
            })
            // 計算前五
            d.category.sort((x, y) => y.price - x.price)
          })

          // 只留類別佔比 top5
          sortResult.forEach((d) => {
            d.category.splice(5, d.category.length - 5)
          })

          // d('sortResult', sortResult)
          // d('sortResult', sortResult[0].category)
          return res.render('costQueryRange', { startDate, endDate, sortResult, share: true })
        })
        .catch((err) => { console.log(err) })
    }
    return res.render('costQueryRange', { startDate, endDate, share: true })
  },


  postQueryShare: async (req, res) => {
    const { paymentId, csrf, modifyCost } = req.body
    const { queryItem } = req.params
    // d('csrf', bcrypt.compareSync(req.user.name, csrf))
    if (!(await bcrypt.compareSync(req.user.name, csrf)))
      return res.redirect('back')

    switch (queryItem) {

      case 'unconfirmed':
        Payment.findByPk(paymentId)
          .then((payment) => {
            payment.update({ isShareCheck: true })
              .then((data) => {
                d('data 123', data)
                return res.json({ status: '200', result: 'success' })
              })
              .catch((err) => { console.log(err) })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'returned':
        Payment.findByPk(paymentId)
          .then((payment) => {
            // d('payment', payment)
            payment.update({ isSendBack: true })
              .then((data) => {
                // d('data', data)
                return res.json({ status: '200', result: 'success' })
              })
              .catch((err) => { console.log(err) })
          })
          .catch((err) => { console.log(err) })
        break;

      case 'returnModify':
        Payment.findByPk(paymentId)
          .then((payment) => {
            // d('payment', payment)
            payment.update({ price: modifyCost, isSendBack: false })
              .then((data) => {
                // d('data', data)
                return res.redirect('back')
              })
              .catch((err) => { console.log(err) })
          })
          .catch((err) => { console.log(err) })
        break;

      default:
    }
  },



}

module.exports = costController