const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const db = require('../models/index');
const User = db.User

passport.use(
  new LocalStrategy(
    { usernameField: 'account', passReqToCallback: true },
    (req, account, password, cb) => {
      req.flash('signInInput', account)
      User.findOne({ where: { name: account } })
        .then(async (user) => {
          if (!user) {
            console.log("can't find user")
            return cb(null, false);
          }
          result = await bcrypt.compareSync(password, user.password)
          if (!result) {
            return cb(null, false);
          }

          const ip = (req.headers["x-forwarded-for"] || "").split(",").pop() ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress;

          user.update({ lastIp: ip })
            .then((data) => {
              return cb(null, user)
            })
            .catch(err => cb(null, false))

        })
        .catch(err => console.log(err))
    },
  ),
);

passport.serializeUser((user, cb) => {
  cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
  User.findByPk(id, { include: [{ model: User, as: 'findShareUser' }] })
    .then((user) => {
      return cb(null, user.toJSON())
    })
    .catch(err => console.log(err))
});

module.exports = passport;
