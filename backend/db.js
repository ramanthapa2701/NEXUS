const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Sequelize connection pool mapping to your exact .env variables
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Keeps your terminal output clean
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('🚀 Nexus Database connected smoothly to PostgreSQL');
  } catch (error) {
    console.error('❌ PostgreSQL Connection Failure Error:', error.message);
  }
};

checkConnection();

module.exports = sequelize;