

const router = require('express')()
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const costController = require('../controllers/costController')
const passport = require('passport')


const userAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated())  return res.redirect('/signIn')
  return next()
}
// router.get('/', userController.test)

/*************************
    最後要加上user 驗證
************************ */

router.post('/signIn', passport.authenticate('local', { failureRedirect: '/signIn' }),
  function (req, res) {
    res.redirect('/costInput');
  })
router.get('/signIn', userController.getSignInPage)
router.get('/costInput',costController.getCostInputPage)

router.get('*', userController.getSignInPage)
module.exports = router