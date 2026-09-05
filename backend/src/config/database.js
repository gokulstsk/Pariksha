const { Sequelize } = require('sequelize');
require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isQa = nodeEnv === 'qa';

let rawDatabaseUrl = isQa
  ? (process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED)
  : (process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED || null);

// Clean channel_binding parameter for node-postgres compatibility
const databaseUrl = rawDatabaseUrl
  ? rawDatabaseUrl.replace(/([?&])channel_binding=[^&]+(&|$)/, '$1').replace(/[?&]$/, '')
  : null;

const isPostgres = Boolean(
  isQa ||
  process.env.DB_DIALECT === 'postgres' ||
  (databaseUrl && (databaseUrl.startsWith('postgres://') || databaseUrl.startsWith('postgresql://')))
);

let sequelize;

if (isPostgres && databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else {
  // MySQL configuration
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = process.env.DB_PORT || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'test_platform_db';

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

// Ensure database connection readiness
const initDatabase = async () => {
  if (isPostgres) {
    console.log(`[Database] PostgreSQL database target configured for environment: '${nodeEnv}'`);
    return;
  }

  const mysql = require('mysql2/promise');
  const dbHost = process.env.DB_HOST || '127.0.0.1';
  const dbPort = process.env.DB_PORT || 3306;
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbName = process.env.DB_NAME || 'test_platform_db';

  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    console.log(`[Database] MySQL database '${dbName}' verified/created.`);
  } catch (err) {
    console.error('[Database] Error verifying/creating MySQL database:', err.message);
    throw err;
  }
};

module.exports = {
  sequelize,
  initDatabase,
  isPostgres
};

