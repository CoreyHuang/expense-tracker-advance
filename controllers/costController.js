


const costController = {

  getCostInputPage: (req, res) => {
    res.render('costInput')
  },

  getCostQueryPage: (req, res) => {

    res.render('costQuery')
  }
} 

module.exports = costController