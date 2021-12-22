const moment = require('moment')

module.exports = {
  moment: function (t) {
    return moment(t).format('YYYY-MM-DD') 
  },
}