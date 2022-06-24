require('dotenv').config()

module.exports = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
  DB: process.env.POSTGRESQL_DB,
  DB_HOST: process.env.POSTGRESQL_DB_HOST,
  DB_USER: process.env.POSTGRESQL_DB_USER,
  DB_PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
  DB_PORT: 5432,
  DB_DIALECT: 'postgres'
}
