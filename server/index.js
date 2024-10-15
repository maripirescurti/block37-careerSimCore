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
  fetchUsers,
  fetchCategories,
  fetchPetTypes,
  fetchProviders,
  fetchPets,
  fetchFavorites,
  destroyFavorite,
 } = require('./db');
 const express = require('express');
 const app = express();

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

app.get('/api/users/:id/pets', async(req, res, next) => {
  try {
    res.send(await fetchPets(req.params.id));
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/users/:id/favorites', async(req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch(ex) {
    next(ex);
  }
});

// CREATE
app.post('/api/users/providera', async(req, res, next) => {
  try {
    res.status(201).send(await createProvider({category_id: req.params.category_id, pet_type_id: req.body.pet_type_id}));
  } catch(ex) {
    next(ex);
  }
});

app.post('/api/users/:id/pets', async(req, res, next) => {
  try {
    res.status(201).send(await createPet({user_id: req.params.id, pet_type_id: req.body.pet_type_id}));
  } catch(ex) {
    next(ex);
  }
});

app.post('/api/users/:id/favorites', async(req, res, next) => {
  try {
    res.status(201).send(await createFavorite({user_id: req.params.id, provider_id: req.body.provider_id}));
  } catch(ex) {
    next(ex);
  }
});

// DELETE
app.delete('/api/users/:userId/favorites/:id', async(req, res, next) => {
  try {
    await destroyFavorite({ id: req.params.id, user_id: req.params.userId});
    res.sendStatus(204);
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
  app.listen(port, () => console.log('listening on port ${port}'));
};

init();