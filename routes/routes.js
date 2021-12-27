

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
router.get('/signUp', userController.getSignUpPage)
router.post('/signUp', userController.signUp)
router.get('/costInput',costController.getCostInputPage)
router.post('/costInput', costController.postCost)
router.get('/costInput/category', costController.getNewCategoryPage)
router.post('/costInput/category', costController.postNewCategory)

router.get('/costQuery', costController.getCostQueryPage)
router.get('/costQuery/:queryItem', costController.getCostQueryRange)
router.get('/costQuery/:queryItem/range', costController.getCostQueryForSearch)

router.get('/costQueryShare', costController.getCostQuerySharePage)

router.get('/logout', userController.logout)

router.get('/users/setting', userController.getSettingPage)
router.post('/users/setting', userController.postSetting)

router.get('*', userController.getSignInPage)
module.exports = router