


const costController = {

  getCostInputPage: (req, res) => {
    console.log('user', req.user)
    res.render('costInput')
  }
} 

module.exports = costController