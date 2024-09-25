const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.ACCESS_TOKEN_SECRET,
  refreshSecret: process.env.REFRESH_TOKEN_SECRET,
  domain: process.env.DOMAIN,
};

export default config;
