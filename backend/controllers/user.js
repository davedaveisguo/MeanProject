const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
require('dotenv').config();

exports.createUser=(req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      email: req.body.email,
      password: hash,
    });
    user.save()
      .then((result) => {
        res.status(201).json({
          message: "User created",
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          error: {
            message: 'email already exists'
          }
        });
      });
  });
}

exports.userLogin= (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      fetchedUser=user;
      // we hashed the password  but cannot unhash
      return bcrypt.compare(req.body.password, user.password);
    })
    // get back the result of comparison
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      // if login success   return a token with that user object
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
        console.log("user logged in and token is"+ token);
        res.status(200).json({
          token: token,
          expiresIn: 3600,
          userId: fetchedUser._id
        })
    })
    .catch((err) => {
      return res.status(401).json({
        message: "Invalid auth credentials",
      });
    });
}
