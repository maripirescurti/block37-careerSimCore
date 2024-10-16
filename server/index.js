// import
const { 
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
  fetchPets,
  fetchFavorites,
  fetchReviews,
  fetchComments,
  destroyFavorite,
  authenticate,
  findUserByToken,
 } = require('./db');

 const express = require('express');
 const app = express();
 app.use(express.json());

 // middleware to ensure logged user
 const isLoggedIn = async(req, res, next) => {
  try {
    req.user = await findUserByToken(req.headers.authorization);
    next();
  } catch(ex) {
    next(ex);
  }
 };

 app.post('/api/auth/login', async(req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch(ex) {
    next(ex);
  }
 });

 app.get('/api/auth/me', isLoggedIn, (req, res, next) => {
  try {
    res.send(req.user);
  } catch(ex) {
    next(ex);
  }
 });

// APP ROUTES
// GET ROUTE
app.get('/api/users', async(req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/categories', async(req, res, next) => {
  try {
    res.send(await fetchCategories());
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/species', async(req, res, next) => {
  try {
    res.send(await fetchSpecies());
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/services', async(req, res, next) => {
  try {
    res.send(await fetchServices());
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/users/:id/pets', isLoggedIn, async(req, res, next) => {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.send(await fetchPets(req.params.id));
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/users/:id/favorites', isLoggedIn, async(req, res, next) => {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.send(await fetchFavorites(req.params.id));
  } catch(ex) {
    next(ex);
  }
});

// CREATE
app.post('/api/users/services', async(req, res, next) => {
  try {
    res.status(201).send(await createService({
      name: req.body.name,
      category_id: req.body.category_id, 
      species_id: req.body.species_id
    }));
  } catch(ex) {
    next(ex);
  }
});

app.post('/api/users/:id/pets', isLoggedIn, async(req, res, next) => {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const pet_last_name = req.user.last_name;
    res.status(201).send(await createPet({
      user_id: req.params.id, 
      pet_name: req.body.pet_name,
      species_id: req.body.species_id,
      breed: req.body.breed,
      age: req.body.age,
      weight: req.body.weight,
      pet_last_name,
    }));
  } catch(ex) {
    next(ex);
  }
});

app.post('/api/users/:id/favorites', isLoggedIn, async(req, res, next) => {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    res.status(201).send(await createFavorite({user_id: req.params.id, service_id: req.body.service_id}));
  } catch(ex) {
    next(ex);
  }
});

app.post('/api/users/:userId/services/:serviceId/reviews', isLoggedIn, async(req, res, next) => {
  try {
    if (req.params.userId !== req.user.id) {
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const review = await createReview({
      user_id: req.params.userId,
      service_id: req.params.serviceId,
      rating: req.body.rating,
      review_text: req.body.review_text,
    });
    res.status(201).send(review);
  } catch (ex) {
    next(ex);
  }
});

app.post('/api/reviews/:reviewId/comments', isLoggedIn, async(req, res, next) => {
  try {
    if (req.params.userId !== req.user.id) {
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const comment = await createComment({
      review_id: req.params.reviewId,
      user_id: req.user.id,
      comment_text: req.body.comment_text,
    });
    res.status(201).send(comment);
  } catch (ex) {
    next(ex);
  }
});


// DELETE
app.delete('/api/users/:userId/favorites/:id', isLoggedIn, async(req, res, next) => {
  try {
    if(req.params.id !== req.user.id){
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    await destroyFavorite({ id: req.params.id, user_id: req.params.userId});
    res.sendStatus(204);
  } catch(ex) {
    next(ex);
  }
});

// GET COMMENTS
app.get('/api/reviews/:reviewId/comments', async (req, res, next) => {
  try {
    const comments = await fetchComments(req.params.reviewId);
    res.send(comments);
  } catch (ex) {
    next(ex);
  }
});

// init function
const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [mari, ozan, luis, celdy, gui, groomer, walker, petsitter, vet, therapist, dog, cat, rabbit, hamster, lizard] = await Promise.all([
    createUser({ first_name: 'Mari', last_name: 'Curti', username: 'maricurti', email: 'mariana.pcurti@gmail.com', password: 'shh2!'}),
    createUser({ first_name: 'Ozan', last_name: 'Cicek', username: 'ozancicek94', email: 'ozancicek94@gmail.com', password: 'shh2!'}),
    createUser({ first_name: 'Luis', last_name: 'Curti', username: 'luisao67', email: 'luis_curti@gmail.com', password: 'shh2!'}),
    createUser({ first_name: 'Celdy', last_name: 'Pires', username: 'mcdivertida68', email: 'celdy@gmail.com', password: 'shh2!'}),
    createUser({ first_name: 'Gui', last_name: 'Curti', username: 'guiguigui', email: 'guicurti@gmail.com', password: 'shh2!'}),

    createCategory({ category_name: 'Groomer'}),
    createCategory({ category_name: 'Walker'}),
    createCategory({ category_name: 'Petsitter'}),
    createCategory({ category_name: 'Vet'}),
    createCategory({ category_name: 'Therapist'}),

    createSpecies({ type_name: 'Dog'}),
    createSpecies({ type_name: 'Cat'}),
    createSpecies({ type_name: 'Rabbit'}),
    createSpecies({ type_name: 'Hamster'}),
    createSpecies({ type_name: 'Lizard'})
  ]);

  console.log(await fetchUsers());

  console.log(await fetchCategories());

  console.log(await fetchSpecies());

  const [scoobyDoo, purrfectGroomers, bugsBunnySitters, hamtaroFreud, wwwv] = await Promise.all([
    createService({ 
      name: 'Scooby Doo Night Walkers', 
      description: 'Providing nighttime walks for your dogs',
      category_id: walker.id, 
      species_id: dog.id
    }),
    createService({ 
      name: 'Purrfect Groomers', 
      description: 'Grooming services for your kitties',
      category_id: groomer.id, 
      species_id: cat.id
    }),
    createService({ 
      name: 'Bugs Bunny Sitters', 
      description: 'The second home for bunnies',
      category_id: petsitter.id, 
      species_id: rabbit.id
    }),
    createService({ 
      name: 'Hamtaro Freud', 
      description: 'A place for hamster mental health',
      category_id: therapist.id, 
      species_id: hamster.id
    }),
    createService({ 
      name: 'Wild Wild West Vets', 
      description: 'A vet specialized in reptiles and cold-blooded creatures',
      category_id: vet.id, 
      species_id: lizard.id
    })
  ]);

  const [simba, rex, lucy, moe, jamaica, indianaJones, johnny] = await Promise.all([
    createPet({ 
      user_id: mari.id, 
      pet_name: 'Simba',
      species_id: dog.id,
      breed: 'maltipoo',
      age: 2,
      weight: 13 
    }),
    createPet({ 
      user_id: mari.id, 
      pet_name: 'Rex',
      species_id: hamster.id,
      breed: 'roborovki',
      age: 2,
      weight: 1
    }),
    createPet({ 
      user_id: ozan.id, 
      pet_name: 'Lucy',
      species_id: cat.id,
      breed: 'orange',
      age: 15,
      weight: 15 
    }),
    createPet({ 
      user_id: luis.id, 
      pet_name: 'Moe',
      species_id: dog.id,
      breed: 'labrador',
      age: 13,
      weight: 60 
    }),
    createPet({ 
      user_id: celdy.id, 
      pet_name: 'Jamaica',
      species_id: dog.id,
      breed: 'jackRussel',
      age: 6,
      weight: 20 
    }),
    createPet({ 
      user_id: gui.id, 
      pet_name: 'Indiana-Jones',
      species_id: lizard.id,
      breed: 'beardedDragon',
      age: 1,
      weight: 5
    }),
    createPet({ 
      user_id: gui.id, 
      pet_name: 'Johnny',
      species_id: rabbit.id,
      breed: 'hollandLop',
      age: 2,
      weight: 9
    })
  ]);

  const favorites = await Promise.all([
    createFavorite({ user_id: mari.id, service_id: scoobyDoo.id }),
    createFavorite({ user_id: mari.id, service_id: hamtaroFreud.id }),
    createFavorite({ user_id: ozan.id, service_id: purrfectGroomers.id }),
    createFavorite({ user_id: luis.id, service_id: scoobyDoo.id }),
    createFavorite({ user_id: gui.id, service_id: wwwv.id }),
  ])

  const reviews = await Promise.all([
    createReview({
      user_id: mari.id,
      service_id: scoobyDoo.id,
      rating: 5,
      review_text: 'Amazing service! My dog loves the night walks!'
    }),
    createReview({
      user_id: ozan.id,
      service_id: purrfectGroomers.id,
      rating: 4,
      review_text: 'Great grooming, but a bit pricey'
    }),
    createReview({
      user_id: luis.id,
      service_id: bugsBunnySitters.id,
      rating: 5,
      review_text: 'BunBun is always well taken care of!'
    }),
  ]);

  const comments = await Promise.all([
    createComment({
      review_id: reviews[0].id,
      user_id: ozan.id,
      comment_text: 'I agree! The best nighttime service.'
    }),
    createComment({
      review_id: reviews[1].id,
      user_id: gui.id,
      comment_text: 'I found it worth every penny.'
    }),
    createComment({
      review_id: reviews[2].id,
      user_id: celdy.id,
      comment_text: 'Bunny loves it there!'
    }),
  ]);

  console.log(await fetchServices());

  console.log(await fetchPets());

  console.log(await fetchFavorites());
  console.log(await fetchFavorites(mari.id));
  console.log(await destroyFavorite(favorites[0].id));
  console.log(await fetchFavorites(mari.id));

  // testing routes
  console.log(`\n# CURL commands to test the routes:\n`);

  console.log(`# User login`);
  console.log(`curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d '{"username": "maricurti", "password": "shh2!"}'`);

  console.log(`# Get logged-in user details`);
  console.log(`curl -X GET http://localhost:3000/api/auth/me -H "Authorization: <token>"`);

  console.log(`# Get all users`);
  console.log(`curl -X GET http://localhost:3000/api/users`);

  console.log(`# Get pets for a specific user`);
  console.log(`curl -X GET http://localhost:3000/api/users/<userId>/pets -H "Authorization: <token>"`);

  console.log(`# Get favorites for a specific user`);
  console.log(`curl -X GET http://localhost:3000/api/users/<userId>/favorites -H "Authorization: <token>"`);

  console.log(`# Create a service provider`);
  console.log(`curl -X POST http://localhost:3000/api/users/services -H "Content-Type: application/json" -d '{"name": "Provider Name", "category_id": 1, "species_id": 1}'`);

  console.log(`# Create a pet for a user`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/pets -H "Content-Type: application/json" -d '{"pet_name": "Pet Name", "species_id": 1, "breed": "Breed", "age": 2, "weight": 10}'`);

  console.log(`# Create a favorite for a user`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/favorites -H "Content-Type: application/json" -d '{"service_id": 1}'`);

  console.log(`# Create a review for a service provider`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/services/<serviceId>/reviews -H "Content-Type: application/json" -d '{"rating": 5, "review_text": "Great service!"}'`);

  console.log(`# Create a comment for a review`);
  console.log(`curl -X POST http://localhost:3000/api/reviews/<reviewId>/comments -H "Authorization: <token>" -H "Content-Type: application/json" -d '{"comment_text": "I totally agree!"}'`);

  console.log(`# Delete a favorite`);
  console.log(`curl -X DELETE http://localhost:3000/api/users/<userId>/favorites/<favoriteId> -H "Authorization: <token>"`);

  console.log(`# Get service categories`);
  console.log(`curl -X GET http://localhost:3000/api/categories`);

  console.log(`# Get pet types`);
  console.log(`curl -X GET http://localhost:3000/api/species`);

  console.log(`# Get service providers`);
  console.log(`curl -X GET http://localhost:3000/api/services`);

  console.log(`# Get comments for a review`);
  console.log(`curl -X GET http://localhost:3000/api/reviews/<reviewId>/comments`);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();