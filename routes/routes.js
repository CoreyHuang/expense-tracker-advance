

const router = require('express')()
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const costController = require('../controllers/costController')

router.get('/', userController.test)

module.exports = router