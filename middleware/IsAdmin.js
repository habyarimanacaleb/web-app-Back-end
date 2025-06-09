// Middleware to check if the user is an admin
function isAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    next();
  }
  else if(req.user && req.user.role === 'admin') {
    next();
  }
   else {
    console.log('Access denied: User is not an admin');
    res.status(403).json({ error: 'Access denied' });
  }
}

module.exports = isAdmin;
