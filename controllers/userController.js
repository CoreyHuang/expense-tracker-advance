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

  logout: (req, res) => {
    req.logout()
    return res.redirect('/signIn')
  },

  getSettingPage: (req, res) => {
    res.render('setting', { CSRF: bcrypt.hashSync(req.user.name, 10) })
  },

  postSetting: async (req, res) => {
    const { inputPassword, inputPasswordCheck, inputEmail, inputShare, CSRF } = req.body
    d('req.body', req.body)
    // 表格判斷
    if (inputPassword !== inputPasswordCheck) res.redirect('/users/setting')
    const passwordCheck = await bcrypt.compareSync(inputPassword, req.user.password)
    if (!passwordCheck) res.redirect('/users/setting')
    const CSRFCheck = await bcrypt.compareSync(req.user.name, CSRF)
    if (!CSRFCheck) res.redirect('/users/setting')
    if (!inputEmail && !inputShare) res.redirect('/users/setting')


    // 資料修改
    User.findByPk(req.user.id, { include: [{ model: User, as: 'findShareUser' }] })
      .then(async (user) => {
        //修改自身email
        if (user.dataValues.email !== inputEmail) {
          await user.update({ email: inputEmail })
            .then(() => console.log('email修改成功'))
            .catch((err) => { console.log(err) })
        }
        //share account/email 增或改
        const shareUser = user.dataValues.findShareUser[0]
        if (inputShare && shareUser) {     //有存在 share user
          if (shareUser.name === inputShare || shareUser.email === inputShare) {
            d('輸入名稱已存在')
          } else {
            await User.findOne({ where: { [Op.or]: [{ name: inputShare }, { email: inputShare }] } })
              .then((user) => {
                if (!user || req.user.id === user.toJSON().id) return console.log('無此人')
                return ShareUser.update({ shareUserId: user.toJSON().id }, { where: { userId: req.user.id } })
                  .then(() => { console.log("update new shareId") })
                  .catch((err) => { console.log(err) })
              })
              .catch((err) => { console.log(err) })
          }
        } else if (inputShare && !shareUser) {  //無存在 share user
          await User.findOne({ where: { [Op.or]: [{ name: inputShare }, { email: inputShare }] } })
            .then((user) => {
              if (!user || req.user.id === user.toJSON().id) return console.log('無此人')
              return ShareUser.create({ userId: req.user.id, shareUserId: user.toJSON().id})
                .then(() => { console.log("create new shareId") })
                .catch((err) => { console.log(err) })
            })
            .catch((err) => { console.log(err) })
        }

        res.redirect('/users/setting')
      })
      .catch((err) => { console.log(err) })
  },


}

module.exports = userController
