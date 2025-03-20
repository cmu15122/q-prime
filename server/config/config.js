require('dotenv').config();

module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
  DB: process.env.POSTGRESQL_DB,
  DB_HOST: process.env.POSTGRESQL_DB_HOST,
  DB_USER: process.env.POSTGRESQL_DB_USER,
  DB_PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
  DB_PORT: process.env.DB_PORT,
  DB_DIALECT: 'postgres',
  PROTOCOL: process.env.PROTOCOL,
  DOMAIN: process.env.DOMAIN,
  CLIENT_PORT: process.env.CLIENT_PORT,
  TOKEN_KEY: process.env.TOKEN_KEY,
  OWNER_EMAIL: process.env.OWNER_EMAIL,
  // SOCKET_ADMIN_MODE: process.env.SOCKET_ADMIN_MODE,
  // SOCKET_ADMIN_PASSWORD: process.env.SOCKET_ADMIN_PASSWORD,
  OWNER_ACCESS_TOKEN: '',
};
