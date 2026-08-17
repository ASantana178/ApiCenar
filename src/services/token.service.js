const jwt = require('jsonwebtoken');
const config = require('../config/env');

function signAccessToken(user) {
  const expiresIn = config.jwt.expiresIn;
  const token = jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      userName: user.userName,
      email: user.email,
    },
    config.jwt.secret,
    { expiresIn }
  );

  const decoded = jwt.decode(token);
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000).toISOString()
    : null;

  return { token, expiresAt };
}

function toPublicUser(user) {
  return {
    id: user._id.toString(),
    userName: user.userName,
    email: user.email,
    role: user.role,
  };
}

module.exports = { signAccessToken, toPublicUser };
