require('dotenv').config()

module.exports = {
  development: {
    HOST: process.env.POSTGRESQL_DB_HOST,
    USER: process.env.POSTGRESQL_DB_USER,
    PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
    DB: process.env.POSTGRESQL_DB,
    PORT: 5432,
    dialect: 'postgres'
  },
  test: {
    HOST: process.env.POSTGRESQL_DB_HOST,
    USER: process.env.POSTGRESQL_DB_USER,
    PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
    DB: process.env.POSTGRESQL_DB,
    PORT: 5432,
    dialect: 'postgres'
  },
  production: {
    HOST: process.env.POSTGRESQL_DB_HOST,
    USER: process.env.POSTGRESQL_DB_USER,
    PASSWORD: process.env.POSTGRESQL_DB_PASSWORD,
    DB: process.env.POSTGRESQL_DB,
    PORT: 5432,
    dialect: 'postgres'
  },
}
