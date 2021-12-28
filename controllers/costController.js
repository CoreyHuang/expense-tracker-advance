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
          return res.redirect('/costInput/category')
        }
        Category.create({ name: inputCategory.trim() })
          .then((category) => {
            OwnCategory.create({ userId: req.user.id, categoryId: category.id })
              .then(() => res.redirect('/costInput'))
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
          include: [{ model: Category }]
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
          include: [{ model: Category }]
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
    Payment.findAll({
      raw: true, nest: true,
      where: { userId: req.user.id, isShare: true, isShareCheck: true, shareUserId: req.user.findShareUser[0].id },
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
        Payment.findAll({
          raw: true, nest: true,
          where: {
            isShare: true, userId: req.user.id,
            isShareCheck: true, shareUserId: req.user.findShareUser[0].id
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
        Payment.findAll({
          raw: true, nest: true,
          where: { isShare: true, userId: req.user.id, isShareCheck: true, shareUserId: req.user.findShareUser[0].id },
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

      default:
        res.redirect('/costQuery', { share })
        break;
    }
  },
  // 與 getCostQueryForSear 高度重合
  getQueryShareForSearch: (req, res) => {
    const { queryItem } = req.params
    const { startDate, endDate } = req.query
    const compareDate = moment(startDate).valueOf() < moment(endDate).valueOf()
    if (queryItem === 'range' && compareDate) {
      return Payment.findAll({
        raw: true, nest: true,
        where: {
          userId: req.user.id, isShare: true,
          isShareCheck: true, shareUserId: req.user.findShareUser[0].id,
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
          return res.render('costQueryRange', { startDate, endDate, sortResult, share: true })
        })
        .catch((err) => { console.log(err) })
    }
    return res.render('costQueryRange', { startDate, endDate, share: true })
  },

}

module.exports = costController