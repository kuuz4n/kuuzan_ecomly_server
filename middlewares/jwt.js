const { expressjwt: expjwt } = require("express-jwt");

const { Token } = require("../models/token");

const API = process.env.API_URL;

function authJwt() {
  return expjwt({
    secret: process.env.ACCESS_TOKEN_SECRET,
    algorithms: ["HS256"],
    isRevoked: isRevoked,
    // http://kevonecomly.com/login
  }).unless({
    path: [
      `${API}/login`,
      `${API}/login/`,

      `${API}/register`,
      `${API}/register/`,

      `${API}/verify-token`,
      `${API}/verify-token/`,

      `${API}/forgot-password`,
      `${API}/forgot-password/`,

      `${API}/verify-otp`,
      `${API}/verify-otp/`,

      `${API}/reset-password`,
      `${API}/reset-password/`,
    ],
  });
}

async function isRevoked(req, token) {
  // The token payload is now in token.payload
  const tokenPayload = token.payload;

  // Header names are lower-cased in Node.js
  const authHeader =
    req.headers &&
    (req.headers["authorization"] || (req.get && req.get("Authorization")));

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return true;
  }

  const accessToken = authHeader.split(" ")[1].trim();
  console.log("Token Debug:", {
    receivedToken: accessToken,
    userId: tokenPayload?.id,
    isAdmin: tokenPayload?.isAdmin,
    API_URL: API,
  });

  const tokenDoc = await Token.findOne({ accessToken });
  console.log("Database Check:", {
    tokenFound: !!tokenDoc,
    tokenUserId: tokenDoc?.userId,
    storedAccessToken: tokenDoc?.accessToken?.substring(0, 20) + "...", // Show first 20 chars
  });

  const adminRouteRegex = new RegExp(`^${API}\/admin(\/|$)`);
  console.log("Route Check:", {
    originalUrl: req.originalUrl,
    isAdmin: tokenPayload?.isAdmin,
    matchesAdminRoute: adminRouteRegex.test(req.originalUrl),
    pattern: adminRouteRegex.toString(),
  });

  const adminFault =
    !tokenPayload?.isAdmin && adminRouteRegex.test(req.originalUrl);

  return !tokenDoc || adminFault;
}

module.exports = authJwt;
