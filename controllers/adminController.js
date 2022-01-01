const db = require('../models/index')
const User = db.User
const d = require('../components/debug')

const adminController = {

  getAdminPage: (req, res) => {
    // const { name, useTimes, lastIp, isLocked } = req.user
    User.findAll({
      raw: true, nest: true,
      where: { isAdmin: false }, order: [['createdAt', 'DESC']]
    })
      .then((users) => {
        d('users', users)
        res.render('admin', { users })
      })
      .catch((err) => { console.log(err) })
  },
}

module.exports = adminController