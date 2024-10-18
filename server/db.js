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
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS pets;
    DROP TABLE IF EXISTS services;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS species;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL
    );

    CREATE TABLE categories(
      id UUID PRIMARY KEY,
      category_name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE species(
      id UUID PRIMARY KEY,
      type_name VARCHAR(50) NOT NULL UNIQUE
    );

    CREATE TABLE services(
      id UUID PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category_id UUID REFERENCES categories(id) NOT NULL,
      species_id UUID REFERENCES species(id) NOT NULL,
      description TEXT,
      image_url VARCHAR(255)
    );

    CREATE TABLE pets(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      pet_name VARCHAR(100) NOT NULL,
      species_id UUID REFERENCES species(id) NOT NULL,
      breed VARCHAR(100),
      age INTEGER,
      weight INTEGER
    );

    CREATE TABLE favorites(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      service_id UUID REFERENCES services(id) NOT NULL,
      UNIQUE (user_id, service_id)
    );
    
    CREATE TABLE reviews(
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES users(id) NOT NULL,
      service_id UUID REFERENCES services(id) NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      review_text TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (user_id, service_id)
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
  const hashedPassword = await bcrypt.hash(password, 5);
  const response = await client.query(SQL, [uuid.v4(), first_name, last_name, username, email, hashedPassword]);
  return response.rows[0];
};

const createCategory = async({ category_name }) => {
  const SQL = `
    INSERT INTO categories(id, category_name)
    VALUES($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), category_name]);
  return response.rows[0];
};

const createSpecies = async({ type_name }) => {
  const SQL = `
    INSERT INTO species(id, type_name)
    VALUES($1, $2)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), type_name]);
  return response.rows[0];
};

const authenticate = async({ username, password}) => {
  const SQL = `
    SELECT id, username, password
    FROM users
    WHERE username = $1;
  `;
  const response = await client.query(SQL, [username]);
  if(!response.rows.length || (await bcrypt.compare(password, response.rows[0].password))=== false){
    const error = Error('not authorized');
    error.status = 401;
    throw error;
  }
  const token = await jwt.sign({ id: response.rows[0].id }, JWT);
  return {token};
}

const createService = async({ name, category_id, species_id, description, image_url }) => {
  const SQL = `
    INSERT INTO services(id, name, category_id, species_id, description, image_url)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), name, category_id, species_id, description, image_url]);
  return response.rows[0];
};

const createPet = async({ user_id, pet_name, species_id, breed, age, weight }) => {
  const SQL = `
    INSERT INTO pets(id, user_id, pet_name, species_id, breed, age, weight)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, pet_name, species_id, breed, age, weight]);
  return response.rows[0];
};

const createFavorite = async({ user_id, service_id }) => {
  const SQL = `
    INSERT INTO favorites(id, user_id, service_id)
    VALUES($1, $2, $3)
    RETURNING *
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, service_id]);
  return response.rows[0];
};

const createReview = async({ user_id, service_id, rating, review_text }) => {
  const SQL = `
    INSERT INTO reviews (id, user_id, service_id, rating, review_text)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [uuid.v4(), user_id, service_id, rating, review_text];
  const { rows } = await client.query(SQL, values);
  return rows[0];
};

const createComment = async({ review_id, user_id, comment_text }) => {
  const SQL = `
    INSERT INTO comments (id, review_id, user_id, comment_text)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), review_id, user_id, comment_text]);
  return response.rows[0];
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
    FROM categories
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const fetchSpecies = async() => {
  const SQL = `
    SELECT * 
    FROM species
  `;
  const response = await client.query(SQL);
  return response.rows;
}

const fetchServices = async() => {
  const SQL = `
    SELECT services.*, 
           categories.category_name
    FROM services
    LEFT JOIN categories ON services.category_id = categories.id
`;  const response = await client.query(SQL);
  return response.rows;
}

const fetchSingleService = async (id) => {
  const SQL = `
    SELECT services.*, 
           categories.category_name, 
           species.type_name AS species_name,
           reviews.id AS review_id,
           reviews.rating,
           reviews.review_text
    FROM services
    LEFT JOIN categories ON services.category_id = categories.id
    LEFT JOIN species ON services.species_id = species.id
    LEFT JOIN reviews ON services.id = reviews.service_id
    WHERE services.id = $1
  `;
  const response = await client.query(SQL, [id]);

  const service = {
    ...response.rows[0],
    reviews: [],
  };

  response.rows.forEach(row => {
    if (row.review_id) {
      service.reviews.push({
        id: row.review_id,
        rating: row.rating,
        review_text: row.review_text,
      });
    }
  });
  return service;
};

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

const fetchReviews = async (serviceId) => {
  const SQL = `
    SELECT *
    FROM reviews
    WHERE service_id = $1;
  `;
  const { rows } = await client.query(SQL, [serviceId]);
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

const updatePet = async({ user_id, age, weight }) => {
  const SQL = `
    UPDATE pets
    SET age = $1, weight = $2, created_at = NOW()
    WHERE user_id = $3
    RETURNING *;
  `;
  const values = [age, weight, user_id];
  const { rows } = await client.query(SQL, values);

  if (rows.length === 0) {
    throw new Error('Review not found');
  }

  return rows[0]; 
};

const updateReview = async({ user_id, service_id, rating, review_text }) => {
  const SQL = `
    UPDATE reviews
    SET rating = $1, review_text = $2, created_at = NOW()
    WHERE user_id = $3 AND service_id = $4
    RETURNING *;
  `;
  const values = [rating, review_text, user_id, service_id];
  const { rows } = await client.query(SQL, values);

  if (rows.length === 0) {
    throw new Error('Review not found');
  }

  return rows[0]; 
};

const updateComment = async({ review_id, comment_id, user_id, comment_text }) => {
  const SQL = `
    UPDATE comments
    SET comment_text = $1, created_at = NOW()
    WHERE review_id = $2 AND id = $3 AND user_id = $4
    RETURNING *;
  `;
  const values = [comment_text, review_id, comment_id, user_id];
  const { rows } = await client.query(SQL, values);

  if (rows.length === 0) {
    throw new Error('Comment not found');
  }

  return rows[0]; 
};

const destroyFavorite = async({ user_id, id }) => {
  console.log(user_id)
  console.log(id)
  const SQL = `
    DELETE FROM favorites
    WHERE user_id = $1 AND id = $2
    RETURNING *;
  `;
  const response = await client.query(SQL, [user_id, id]);
  return response.rows[0]; // This will return the deleted favorite if needed
};

const destroyReview = async (reviewId, userId) => {
  const SQL = `
    DELETE FROM reviews
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  
  try {
    const { rowCount } = await client.query(SQL, [reviewId, userId]);
    if (rowCount === 0) {
      throw new Error('Review not found or not authorized to delete.');
    }
    return { message: 'Review deleted successfully' };
  } catch (error) {
    console.error('Error deleting review:', error);
    throw new Error('Could not delete review');
  }
};

const destroyComment = async (commentId, userId) => {
  const SQL = `
    DELETE FROM comments
    WHERE id = $1 AND user_id = $2
    RETURNING *;
  `;
  
  try {
    const { rowCount } = await client.query(SQL, [commentId, userId]);
    if (rowCount === 0) {
      throw new Error('Comment not found or not authorized to delete.');
    }
    return { message: 'Comment deleted successfully' };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Could not delete comment');
  }
};


const findUserByToken = async (token) => {
  let id;
  try {
    // Verify the token and extract the payload
    const payload = await jwt.verify(token, JWT);
    id = payload.id; // Get the user ID from the payload
  } catch (ex) {
    // Catch any errors during token verification
    const error = new Error('not authorized');
    error.status = 401;
    throw error; // Propagate the error
  }

  // SQL query to find the user by ID
  const SQL = `
    SELECT id, username
    FROM users
    WHERE id = $1;
  `;

  try {
    // Execute the SQL query
    const response = await client.query(SQL, [id]);

    // Check if a user was found
    if (!response.rows.length) {
      const error = new Error('not authorized');
      error.status = 401;
      throw error; // Propagate the error if no user found
    }

    return response.rows[0]; // Return the found user
  } catch (dbError) {
    // Handle any database errors
    console.error('Database query error:', dbError);
    const error = new Error('database error');
    error.status = 500; // Internal server error
    throw error; // Propagate the error
  }
};

// exports
module.exports = {
  client,
  createTables,
  createUser,
  createCategory,
  createSpecies,
  createService,
  createPet,
  createFavorite,
  createReview,
  createComment,
  fetchUsers,
  fetchCategories,
  fetchSpecies,
  fetchServices,
  fetchSingleService,
  fetchPets,
  fetchFavorites,
  fetchReviews,
  fetchComments,
  updatePet,
  updateReview,
  updateComment,
  destroyFavorite,
  destroyReview,
  destroyComment,
  authenticate,
  findUserByToken
};
