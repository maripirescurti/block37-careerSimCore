// imports
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/ydimb_services_db');

// methods
const createTables = async() => {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS services;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(50)
    );
    CREATE TABLE services(
      id UUID PRIMARY KEY,
      name VARCHAR (100) UNIQUE NOT NULL
    );
    CREATE TABLE favorites(
      id UUID PRIMARY KEY,
      service_id UUID REFERENCES services(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      CONSTRAINT unique_favorite UNIQUE (service_id, user_id)
    );
  `;
  await client.query(SQL);
};

// exports
module.exports = {
  client,
  createTables,
};
