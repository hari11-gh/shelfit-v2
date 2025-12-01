module.exports = function auth(req, res, next) {
  req.user = null;
  next();
};
