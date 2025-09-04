const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const pool = require("../db");
const dotenv = require("dotenv");
dotenv.config();

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.JWT_SECRET;

  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      //jwt_payload是解碼後的東西，done(error, user, info)
      try {
        const user = await pool.query("SELECT * FROM users WHERE id = $1", [
          jwt_payload.id,
        ]);
        if (user.rows.length > 0) {
          return done(null, user.rows[0]);
          //done(error, user, info)
        } else {
          return done(null, false);
        }
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
