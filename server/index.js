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
  fetchUsers,
  fetchCategories,
  fetchSpecies,
  fetchServices,
  fetchSingleService,
  fetchPets,
  fetchFavorites,
  fetchReviews,
  destroyFavorite,
  authenticate,
  findUserByToken,
 } = require('./db');

 const express = require('express');
 const cors = require('cors');
 const app = express();
 app.use(express.json());
 app.use(cors());

 // for deployment 
 const path = require('path');
 app.use(express.static(path.join(__dirname, 'build')));
 app.get('/', async(req, res) => {res.sendFile(path.join(__dirname, 'build', 'index.html'))});
//  app.use('/assets', express);

 // middleware to ensure logged user
 const isLoggedIn = async(req, res, next) => {
  try {
    req.user = await findUserByToken(req.headers.authorization);
    next();
  } catch(ex) {
    next(ex);
  }
 };

 // Authentication Routes
 app.post('/api/auth/login', async(req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch(ex) {
    next(ex);
  }
 });

 app.post('/api/auth/register', async(req, res, next) => {
  const { first_name, last_name, username, email, password } = req.body;

  try {
    // check if user exists
    const existingUser = await fetchUsers(); 
    if (existingUser.some(user => user.username === username || user.email === email)) {
      return res.status(400).send({message: 'User with this username or email already exists.'});
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 5);

    // create user in database
    const newUser = await createUser({
      first_name,
      last_name,
      username,
      email,
      password: hashedPassword,
    });

    // respond with user's info (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).send(userWithoutPassword);
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

app.get('/api/services/:id', async(req, res, next) => {
  const serviceId = req.params.id;
  try {
    const service = await fetchSingleService(serviceId);
    if (!service) {
      return res.status(404).send({ message: 'Service not found' });
    }
    res.send(service);
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/services/:id/reviews', async(req, res, next) => {
  const serviceId = req.params.id;
  try {
    const service = await fetchReviews(serviceId);
    if (!reviews || reviews.length === 0) {
      return res.status(404).send({ message: 'No reviews found for this service' });
    }
    res.send(reviews);
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
      species_id: req.body.species_id,
      image_url: req.body.image_url
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

// init function
const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  // seeding data
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
      species_id: dog.id,
      image_url: 'https://cdn.britannica.com/38/233138-050-43F8C7F7/Scooby-Doo-Witchs-Ghost-promotional-art.jpg?w=300'
    }),
    createService({ 
      name: 'Purrfect Groomers', 
      description: 'Grooming services for your kitties',
      category_id: groomer.id, 
      species_id: cat.id,
      image_url: 'https://assets3.thrillist.com/v1/image/3059921/1200x630/flatten;crop_down;webp=auto;jpeg_quality=70'
    }),
    createService({ 
      name: 'Bugs Bunny Sitters', 
      description: 'The second home for bunnies',
      category_id: petsitter.id, 
      species_id: rabbit.id,
      image_url: 'https://www.dndecorlance.com/cdn/shop/products/F747410D-51A1-4F35-9F55-5EF5CEB8107D.jpg?v=1680458090&width=1946'
    }),
    createService({ 
      name: 'Hamtaro Freud', 
      description: 'A place for hamster mental health',
      category_id: therapist.id, 
      species_id: hamster.id,
      image_url: 'https://static.wixstatic.com/media/5be228_7f1183150cc749fabaa4ff90d6af3686~mv2.png/v1/fill/w_640,h_480,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/5be228_7f1183150cc749fabaa4ff90d6af3686~mv2.png'
    }),
    createService({ 
      name: 'Wild Wild West Vets', 
      description: 'A vet specialized in reptiles and cold-blooded creatures',
      category_id: vet.id, 
      species_id: lizard.id,
      image_url: 'https://www.huntersville.carolinavet.com/files/cvs-huntersville-avian-exotic-2.jpg'
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

  console.log(`# User register`);
  console.log(`curl -X POST http://localhost:3000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "password": "yourSecurePassword"
    }'
  `);

  console.log(`# Get logged-in user details`);
  console.log(`curl -X GET http://localhost:3000/api/auth/me -H "Authorization: <token>"`);

  console.log(`# Get all users`);
  console.log(`curl -X GET http://localhost:3000/api/users`);

  console.log(`# Get pets for a specific user`);
  console.log(`curl -X GET http://localhost:3000/api/users/<userId>/pets -H "Authorization: <token>"`);

  console.log(`# Get favorites for a specific user`);
  console.log(`curl -X GET http://localhost:3000/api/users/<userId>/favorites -H "Authorization: <token>"`);

  console.log(`# Create a service`);
  console.log(`curl -X POST http://localhost:3000/api/users/services -H "Content-Type: application/json" -d '{"name": "Provider Name", "category_id": 1, "species_id": 1}'`);

  console.log(`# Create a pet for a user`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/pets -H "Content-Type: application/json" -d '{"pet_name": "Pet Name", "species_id": 1, "breed": "Breed", "age": 2, "weight": 10}'`);

  console.log(`# Create a favorite for a user`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/favorites -H "Content-Type: application/json" -d '{"service_id": 1}'`);

  console.log(`# Create a review for a service`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/services/<serviceId>/reviews -H "Content-Type: application/json" -d '{"rating": 5, "review_text": "Great service!"}'`);

  console.log(`# Delete a favorite`);
  console.log(`curl -X DELETE http://localhost:3000/api/users/<userId>/favorites/<favoriteId> -H "Authorization: <token>"`);

  console.log(`# Get service categories`);
  console.log(`curl -X GET http://localhost:3000/api/categories`);

  console.log(`# Get pet types`);
  console.log(`curl -X GET http://localhost:3000/api/species`);

  console.log(`# Get service`);
  console.log(`curl -X GET http://localhost:3000/api/services`);
  
  console.log(`# Get single service`);
  console.log(`curl -X GET http://localhost:3000/api/services/<serviceId>`);
  
  console.log(`# Get service image url`);
  console.log(`curl -X POST http://localhost:3000/api/users/services -H "Content-Type: application/json" -d '{"name": "Provider Name", "category_id": "1", "species_id": "1", "image_url": "http://example.com/image.jpg"}'`);

  // express listen to port 3000
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();