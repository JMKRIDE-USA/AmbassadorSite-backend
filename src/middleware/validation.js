const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const secret = require('../config.js').jwt_secret;

exports.verifyRefreshBodyField = (req, res, next) => {
  if (req.body && req.body.refresh_token) {
    return next();
  } else {
    return res.status(400).send({error: 'need to pass refresh_token field'});
  }
};

exports.validRefreshNeeded = (req, res, next) => {
  let b = Buffer.from(req.body.refresh_token, 'base64');
  let refresh_token = b.toString();
  let hash = crypto.createHmac('sha512', req.jwt.refreshKey).update(req.jwt.userId + secret).digest("base64");
  if (hash === refresh_token) {
    req.body = req.jwt;
    return next();
  } else {
    return res.status(400).send({error: 'Invalid refresh token'});
  }
};


exports.validJWTNeeded = (req, res, next) => {
  if (req.headers['authorization']) {
    try {
      let authorization = req.headers['authorization'].split(' ');
      if (authorization[0] !== 'Bearer') {
        return res.status(401).send();
      } else {
        req.jwt = jwt.verify(authorization[1], secret);
        return next();
      }

    } catch (err) {
      return res.status(403).send();
    }
  } else {
    return res.status(401).send();
  }
};

exports.validateCleanBodyFields = (allowedFields) => (req, res, next) => {
  for (let key in req.body) {
    if (req.body.hasOwnProperty(key)){
      if (! allowedFields.includes(key)) {
        return res.status(400).send({error: 'Invalid request body'});
      }
    }
  }
  return next();
};
