const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header. Expected 'Bearer <token>'" });
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.log.warn({ err }, "Invalid or expired token");
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = auth;
