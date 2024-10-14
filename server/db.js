// imports
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/ydimb_services_db');

// methods
const createTables = async() => {
  const SQL = `
    DROP TABLE IF EXISTS comments;
    DROP TABLE IF EXISTS reviews;
    DROP TABLE IF EXISTS favorite-providers;
    DROP TABLE IF EXISTS pets;
    DROP TABLE IF EXISTS service-providers;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS service-categories;
    DROP TABLE IF EXISTS pet-types;
    CREATE TABLE users(
      id UUID PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL
    );
        CREATE TABLE service-categories(
      id UUID PRIMARY KEY,
      category_name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE pet-types(
      id UUID PRIMARY KEY,
      type-name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE pets(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      pet_name VARCHAR(100) NOT NULL,
      pet_last_name VARCHAR(100) NOT NULL,
      pet_type_id UUID REFERENCES pet-types(id) NOT NULL,
      breed VARCHAR(100),
      age INTEGER,
      weight INTEGER,
    );
    CREATE TABLE service-providers(
      id UUID PRIMARY KEY,
      provider_name VARCHAR(100) NOT NULL,
      category_id UUID REFERENCES service-categories(id) NOT NULL,
      pet_type_id UUID REFERENCES pet-types(id) NOT NULL,
      description TEXT
    );
    CREATE TABLE favorite-providers(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      provider_id UUID REFERENCES service_provider(id) NOT NULL,
      CONSTRAINT unique_favorite UNIQUE (user_id, provider_id)
    );
    CREATE TABLE reviews(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      provider_id UUID REFERENCES service_provider(id) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE comments(
      id UUID PRIMARY KEY,
      review_id UUID REFERENCES reviews(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  await client.query(SQL);
};

// exports
module.exports = {
  client,
  createTables,
};
