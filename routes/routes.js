

const router = require('express')()
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const costController = require('../controllers/costController')
const passport = require('passport')


const userAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) return res.redirect('/signIn')
  return next()
}
const adminAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated() || !req.user.isAdmin) return res.redirect('/signIn')
  return next()
}

// 管理者進入點
router.post('/signIn', passport.authenticate('local', { failureRedirect: '/signIn' }),
  function (req, res) {
    if (!req.user.isAdmin)
      return res.redirect('/costInput');
    return res.redirect('/admin')
  })
router.get('/signIn', userController.getSignInPage)
router.get('/signUp', userController.getSignUpPage)
router.post('/signUp', userController.signUp)
router.get('/costInput', userAuthenticated, costController.getCostInputPage)
router.post('/costInput', userAuthenticated, costController.postCost)
router.get('/costInput/category', userAuthenticated, costController.getNewCategoryPage)
router.post('/costInput/category', userAuthenticated, costController.postNewCategory)

router.get('/costQuery', userAuthenticated, costController.getCostQueryPage)
router.get('/costQuery/:queryItem', userAuthenticated, costController.getCostQueryRange)
router.get('/costQuery/:queryItem/range', userAuthenticated, costController.getCostQueryForSearch)

router.get('/costQueryShare', userAuthenticated, costController.getCostQuerySharePage)
router.get('/costQueryShare/:queryItem', userAuthenticated, costController.getQueryShareRange)
router.get('/costQueryShare/:queryItem/range', userAuthenticated, costController.getQueryShareForSearch)
router.post('/costQueryShare/:queryItem', userAuthenticated, costController.postQueryShare)
router.get('/logout', userAuthenticated, userController.logout)

router.get('/users/setting', userAuthenticated, userController.getSettingPage)
router.post('/users/setting', userAuthenticated, userController.postSetting)

router.get('/admin', adminAuthenticated, adminController.getAdminPage)

router.get('*', userController.getSignInPage)
module.exports = router