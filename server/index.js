// import
const { 
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

app.get('/api/service-categories', async(req, res, next) => {
  try {
    res.send(await fetchCategories());
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/pet-types', async(req, res, next) => {
  try {
    res.send(await fetchPetTypes());
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/service-providers', async(req, res, next) => {
  try {
    res.send(await fetchProviders());
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
app.post('/api/users/service-providera', async(req, res, next) => {
  try {
    res.status(201).send(await createProvider({
      provider_name: req.body.provider_name,
      category_id: req.body.category_id, 
      pet_type_id: req.body.pet_type_id
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
      pet_type_id: req.body.pet_type_id,
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
    res.status(201).send(await createFavorite({user_id: req.params.id, provider_id: req.body.provider_id}));
  } catch(ex) {
    next(ex);
  }
});

app.post('/api/users/:userId/providers/:providerId/reviews', isLoggedIn, async(req, res, next) => {
  try {
    if (req.params.userId !== req.user.id) {
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const review = await createReview({
      user_id: req.params.userId,
      provider_id: req.params.providerId,
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
  const [mari, ozan, luis, celdy, gui, groomer, walker, petsitter, vet, therapist, petShop, dog, cat, rabbit, hamster, lizard] = await Promise.all([
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

    createPetType({ type_name: 'Dog'}),
    createPetType({ type_name: 'Cat'}),
    createPetType({ type_name: 'Rabbit'}),
    createPetType({ type_name: 'Hamster'}),
    createPetType({ type_name: 'Lizard'})
  ]);

  console.log(await fetchUsers());

  console.log(await fetchCategories());

  console.log(await fetchPetTypes());

  const [scoobyDoo, purrfectGroomers, bugsBunnySitters, hamtaroFreud, wwwv] = await Promise.all([
    createProvider({ 
      provider_name: 'Scooby Doo Night Walkers', 
      description: 'Providing nighttime walks for your dogs',
      category_id: walker.id, 
      pet_type_id: dog.id
    }),
    createProvider({ 
      provider_name: 'Purrfect Groomers', 
      description: 'Grooming services for your kitties',
      category_id: groomer.id, 
      pet_type_id: cat.id
    }),
    createProvider({ 
      provider_name: 'Bugs Bunny Sitters', 
      description: 'The second home for bunnies',
      category_id: petsitter.id, 
      pet_type_id: rabbit.id
    }),
    createProvider({ 
      provider_name: 'Hamtaro vs Freud', 
      description: 'A place for hamster mental health',
      category_id: therapist.id, 
      pet_type_id: hamster.id
    }),
    createProvider({ 
      provider_name: 'Wild Wild West Vets', 
      description: 'A vet specialized in reptiles and cold-blooded creatures',
      category_id: vet.id, 
      pet_type_id: lizard.id
    })
  ]);

  const [simba, rex, lucy, moe, jamaica, indianaJones, johnny] = await Promise.all([
    createPet({ 
      user_id: mari.id, 
      pet_name: 'Simba',
      pet_type_id: dog.id,
      breed: maltipoo,
      age: 2.5,
      weight: 13 
    }),
    createPet({ 
      user_id: mari.id, 
      pet_name: 'Rex',
      pet_type_id: hamster.id,
      breed: roborovki,
      age: 2,
      weight: 1
    }),
    createPet({ 
      user_id: ozan.id, 
      pet_name: 'Lucy',
      pet_type_id: cat.id,
      breed: orange,
      age: 15,
      weight: 15 
    }),
    createPet({ 
      user_id: luis.id, 
      pet_name: 'Moe',
      pet_type_id: dog.id,
      breed: labrador,
      age: 13,
      weight: 60 
    }),
    createPet({ 
      user_id: celdy.id, 
      pet_name: 'Jamaica',
      pet_type_id: dog.id,
      breed: jackRussel,
      age: 6,
      weight: 20 
    }),
    createPet({ 
      user_id: gui.id, 
      pet_name: 'Indiana-Jones',
      pet_type_id: lizard.id,
      breed: beardedDragon,
      age: 1,
      weight: 5
    }),
    createPet({ 
      user_id: gui.id, 
      pet_name: 'Johnny',
      pet_type_id: rabbit.id,
      breed: hollandLop,
      age: 2,
      weight: 9
    })
  ]);

  const favorites = await Promise.all([
    createFavorite({ user_id: mari.id, provider_id: scoobyDoo.id }),
    createFavorite({ user_id: mari.id, provider_id: hamtaroFreud.id }),
    createFavorite({ user_id: ozan.id, provider_id: purrfectGroomers.id }),
    createFavorite({ user_id: luis.id, provider_id: scoobyDoo.id }),
    createFavorite({ user_id: gui.id, provider_id: wwwv.id }),
  ])

  console.log(await fetchProviders());

  console.log(await fetchPets());

  console.log(await fetchFavorites());
  console.log(await fetchFavorites(mari.id));
  console.log(await destroyFavorite(favorites[0].id));
  console.log(await fetchFavorites(mari.id));

  console.log(`CURL localhost:3000/api/users/${mari.id}/pets`);
  console.log(`CURL localhost:3000/api/users/${mari.id}/favorites`);

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();