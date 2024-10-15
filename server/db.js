// imports
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/ydimb_services_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT = process.env.JWT || 'shh2!';

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
      type_name VARCHAR(50) NOT NULL UNIQUE
    );
    CREATE TABLE pets(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      pet_name VARCHAR(100) NOT NULL,
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
      provider_id UUID REFERENCES service_providers(id) NOT NULL,
      CONSTRAINT unique_favorite UNIQUE (user_id, provider_id)
    );
    CREATE TABLE reviews(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      provider_id UUID REFERENCES service_provider(sid) NOT NULL,
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

const createUser = async({first_name, last_name, username, email, password}) => {
  const SQL = `
    INSERT INTO users(id, first_name, last_name, username, email, password)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), first_name, last_name, username, email, await bcrypt.hash(password, 5)]);
  return response.rows[0];
};

const createCategory = async({ category_name }) => {
  const SQL = `
    INSERT INTO service-categories(id, category_name)
    VALUES($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), category_name]);
  return response.rows[0];
};

const createPetType = async({ type_name }) => {
  const SQL = `
    INSERT INTO pet-types(id, type_name)
    VALUES($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), type_name]);
  return response.rows[0];
};

const authenticate = async({ username, password}) => {
  const SQL = `
    SELECT id, password
    FROM users
    WHERE username = $1
  `;
  const response = await client.query(SQL, [username]);
  if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password))=== false){
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  const token = await jwt.sign({ id: response.rows[0].id, JWT});
  return {token};
}

const createProvider = async({ provider_name, category_id, pet_type_id }) => {
  const SQL = `
    INSERT INTO service-providers(id, provider_name, category_id, pet_type_id)
    VALUES($1, $2, $3, $4)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), provider_name, category_id, pet_type_id]);
  return response.rows[0];
};

const createPet = async({ user_id, pet_name, pet_type_id, breed, age, weight }) => {
  const SQL = `
    INSERT INTO pets(id, user_id, pet_name, pet_type_id, breed, age, weight)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, pet_name, pet_type_id, breed, age, weight]);
  return response.rows[0];
};

const createFavorite = async({ user_id, provider_id }) => {
  const SQL = `
    INSERT INTO favorite-providers(id, user_id, provider_id)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, provider_id]);
  return response.rows[0];
};

const createReview = async({ user_id, provider_id, rating, review_text }) => {
  const SQL = `
    INSERT INTO reviews (id, user_id, provider_id, rating, review_text)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [uuid.v4(), user_id, provider_id, rating, review_text];
  const { rows } = await client.query(SQL, values);
  return rows[0];
};

const createComment = async({ review_id, user_id, comment_text }) => {
  const SQL = `
    INSERT INTO comments (id, review_id, user_id, comment_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [uuid.v4(), review_id, user_id, comment_text];
  const { rows } = await client.query(SQL, values);
  return rows[0];
};

const fetchUsers = async() => {
  const SQL = `
    SELECT * 
    FROM users
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const fetchCategories = async() => {
  const SQL = `
    SELECT * 
    FROM service-categories
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const fetchPetTypes = async() => {
  const SQL = `
    SELECT * 
    FROM pet-types
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const fetchProviders = async() => {
  const SQL = `
    SELECT * 
    FROM service-providers
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const fetchPets = async(user_id) => {
  const SQL = `
    SELECT * 
    FROM pets
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
}

const fetchFavorites = async(user_id) => {
  const SQL = `
    SELECT * 
    FROM favorites
    WHERE user_id = $1
  `;
  const response = await client.query(SQL, [user_id]);
  return response.rows;
}

const fetchReviews = async (providerId) => {
  const SQL = `
    SELECT *
    FROM reviews
    WHERE provider_id = $1;
  `;
  const { rows } = await client.query(SQL, [providerId]);
  return rows;
};

const fetchComments = async (reviewId) => {
  const SQL = `
    SELECT *
    FROM comments
    WHERE review_id = $1;
  `;
  const { rows } = await client.query(SQL, [reviewId]);
  return rows;
};


const destroyFavorite = async(id, user_id) => {
  const SQL = `
    DELETE FROM favorites
    WHERE id = $1 AND user_id = $2
  `;
  await client.query(SQL, [id, user_id]);
}

const findUserByToken = async(token) => {
  let id;
  try {
    const payload = await jwt.verify(token, JWT);
    id = payload.id;
  } catch(ex) {
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  const SQL = `
    SELECT id, username
    FROM users
    WHERE id = $1
  `;
  const response = await client.query(SQL, [id]);
  if(!response.rows.length){
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  return response.rows[0]
}

// exports
module.exports = {
  client,
  createTables,
  createUser,
  createCategory,
  createPetType,
  createProvider,
  createPet,
  createFavorite,
  createReview,
  createComment,
  fetchUsers,
  fetchCategories,
  fetchPetTypes,
  fetchProviders,
  fetchPets,
  fetchFavorites,
  fetchReviews,
  fetchComments,
  destroyFavorite,
  authenticate,
  findUserByToken
};
