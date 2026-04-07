const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'ssdchr2_db',
  username: 'postgres',
  password: 'Samolan123',
  host: 'localhost',
  port: 5456,
  dialect: 'postgres',
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true
  }
});

module.exports = { sequelize };
