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
  createAppointment,
  createReview,
  createComment,
  fetchUsers,
  fetchSingleUser,
  fetchCategories,
  fetchSpecies,
  fetchServices,
  fetchSingleService,
  fetchPets,
  fetchFavorites,
  fetchAppointments,
  fetchReviews,
  fetchComments,
  updatePet,
  updateAppointment,
  updateReview,
  updateComment,
  destroyFavorite,
  destroyAppointment,
  destroyReview,
  destroyComment,
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
 const isLoggedIn = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
    return res.status(401).send('Not authorized: No token provided');
  }

  try {
    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).send('Not authorized: Invalid token');
    }
    req.user = user; // Attach user info to request
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
};
 
 // APP ROUTES
 // Authentication Routes
 app.post('/api/auth/login', async(req, res, next) => {
  try {
    res.send(await authenticate(req.body));
  } catch(ex) {
    next(ex);
  }
 });

 app.post('/api/auth/register', async(req, res, next) => {

  try {
    res.send(await createUser(req.body));
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

// GET ROUTES

app.get('/api/users', async(req, res, next) => {
  try {
    res.send(await fetchUsers());
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await fetchSingleUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Fixed message
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
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
    const reviews = await fetchReviews(serviceId);
    if (!reviews || reviews.length === 0) {
      return res.status(404).send({ message: 'No reviews found for this service' });
    }
    res.send(reviews);
  } catch(ex) {
    next(ex);
  }
});

app.get('/api/services/:serviceId/reviews/:reviewId/comments', async(req, res, next) => {
  const reviewId = req.params.reviewId;
  try {
    const comments = await fetchComments(reviewId);
    if (!comments || comments.length === 0) {
      return res.status(404).send({ message: 'No reviews found for this service' });
    }
    res.send(comments);
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

app.get('/api/users/:userId/appointments', isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.userId !== req.user.id) {
      const error = new Error('Not authorized');
      error.status = 401;
      throw error;
    }
    const appointments = await fetchAppointments(req.params.userId);
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
});

// CREATE
app.post('/api/services', async(req, res, next) => {
  try {
    res.status(201).send(await createService({
      name: req.body.name,
      category_id: req.body.category_id, 
      species_id: req.body.species_id,
      description: req.body.description,
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

app.post('/api/users/:userId/services/:serviceId/appointments', isLoggedIn, async(req, res, next) => {
  const { userId, serviceId } = req.params;
  const { appointment_date } = req.body;
  
  try {
    if(userId !== req.user.id){
      const error = new Error('Not authorized');
      error.status = 401;
      throw error;
    }

    const appointment = await createAppointment({
      user_id: userId,
      service_id: serviceId,
      appointment_date,
    });

    res.status(201).json(appointment);
  } catch(error) {
    console.error(error);
    next(error);sl
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

app.post('/api/users/:userId/services/:serviceId/reviews/:reviewId/comments', isLoggedIn, async(req, res, next) => {
  try {
    if (req.params.userId !== req.user.id) {
      const error = Error('not authorized');
      error.status = 401;
      throw error;
    }
    const comment = await createComment({
      review_id: req.params.reviewId,
      user_id: req.params.userId,
      comment_text: req.body.comment_text,
    });
    res.status(201).send(comment);
  } catch (ex) {
    next(ex);
  }
});

// UPDATE
app.put('/api/users/:userId/pets/:id', isLoggedIn, async (req, res, next) => {
  const { age, weight } = req.body;
  const { userId, id: pet_id} = req.params;

  if (!age && !weight) {
    return res.status(400).json({ message: 'Age or weight must be provided'});
  }

  try {

    if (userId !== req.user.id) {
      const error = new Error ('Not authorized');
      error.status = 401;
      throw error;
    }

    const updatedPet = await updatePet({
      user_id: userId,
      pet_id,
      age,
      weight,
    });

    res.status(200).json(updatedPet);
  } catch (error) {
    console.error(error); 
    if (error.message === 'Pet not found') {
      res.status(404).json({ message: 'Pet not found'});
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/appointments/:appointmentId', isLoggedIn, async (req, res, next) => {
  const { appointmentId } = req.params;
  const { status, appointment_date } = req.body;

  try {
    const updatedAppointment = await updateAppointment({
      appointment_id: appointmentId,
      status,
      appointment_date,
    });

    res.status(200).json(updatedAppointment);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    next(error);
  }
});

app.put('/api/users/:userId/services/:serviceId/reviews', isLoggedIn, async (req, res, next) => {
  const { rating, review_text } = req.body;
  const { userId, serviceId } = req.params;

  try {
    if (String(req.user.id) !== userId) {
      return res.status(401).send('Not authorized');
    }

    const updatedReview = await updateReview({
      user_id: userId,
      service_id: serviceId,
      rating,
      review_text,
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    if (error.message === 'Review not found') {
      return res.status(404).json({ message: 'Review not found' });
    }
    next(error);
  }
});

app.put('/api/users/:userId/services/:serviceId/reviews/:reviewId/comments/:commentId', isLoggedIn, async (req, res, next) => {
  const { comment_text } = req.body;
  const { reviewId, commentId } = req.params;
  const user_id = req.user.id;

  try {
    const updatedComment = await updateComment({
      review_id: reviewId,
      comment_id:commentId,
      user_id,
      comment_text,
    });
    res.status(200).json(updatedComment);
  } catch (error) {
    if (error.message === 'Comment not found') {
      return res.status(404).json({ message: 'Comment not found' });
    }
    console.error(error); 
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE

app.delete('/api/appointments/:appointmentId', isLoggedIn, async (req, res, next) => {
  const { appointmentId } = req.params;

  try {
    const deletedAppointment = await destroyAppointment(appointmentId);
    res.status(200).json(deletedAppointment);
  } catch (error) {
    if (error.message === 'Appointment not found') {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    next(error);
  }
});

app.delete('/api/users/:userId/favorites/:id', isLoggedIn, async (req, res, next) => {
  try {
    if (req.params.userId !== req.user.id) {
      const error = Error('Not authorized');
      error.status = 401;
      throw error;
    }

    const id = req.params.id;

    const deletedFavorite = await destroyFavorite({ user_id: req.params.userId, id });
    console.log(deletedFavorite);

    if (!deletedFavorite) {
      return res.status(404).send({ message: 'Favorite not found' });
    }

    res.status(200).send({ message: 'Favorite deleted successfully' });
  } catch (ex) {
    next(ex); 
  }
});

app.delete('/api/users/:userId/services/:serviceId/reviews/:reviewId', isLoggedIn, async (req, res, next) => {
  const { reviewId } = req.params;

  try {
    if (req.params.userId !== req.user.id) {
      return res.status(401).send('Not authorized to delete this review');
    }

    const response = await destroyReview(reviewId, req.user.id);
    res.status(200).send(response);
  } catch (ex) {
    next(ex);
  }
});

app.delete('/api/users/:userId/services/:serviceId/reviews/:reviewId/comments/:commentId', isLoggedIn, async (req, res, next) => {
  const { commentId } = req.params;

  try {
    if (req.params.userId !== req.user.id) {
      return res.status(401).send('Not authorized to delete this comment');
    }

    const response = await destroyComment(commentId, req.user.id);
    res.status(200).send(response);
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
  // seeding data
  const [mari, ozan, luis, celdy, gui, groomer, walker, petsitter, vet, therapist, dog, cat, rabbit, hamster, lizard] = await Promise.all([
    createUser({ first_name: 'Mari', last_name: 'Curti', username: 'maricurti', email: 'mari@example.com', password: 'shh2!'}),
    createUser({ first_name: 'Ozan', last_name: 'Cicek', username: 'ozancc', email: 'ozan@example.com', password: 'shh2!'}),
    createUser({ first_name: 'Luis', last_name: 'Curti', username: 'lulu', email: 'luis@example.com', password: 'shh2!'}),
    createUser({ first_name: 'Celdy', last_name: 'Pires', username: 'mcdivertida', email: 'celdy@example.com', password: 'shh2!'}),
    createUser({ first_name: 'Gui', last_name: 'Curti', username: 'guiguigui', email: 'gui@example.com', password: 'shh2!'}),

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
      category_id: walker.id, 
      species_id: dog.id,
      description: 'Providing nighttime walks for your dogs',
      image_url: 'https://cdn.britannica.com/38/233138-050-43F8C7F7/Scooby-Doo-Witchs-Ghost-promotional-art.jpg?w=300'
    }),
    createService({ 
      name: 'Purrfect Groomers', 
      category_id: groomer.id, 
      species_id: cat.id,
      description: 'Grooming services for your kitties',
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
      category_id: therapist.id, 
      species_id: hamster.id,
      description: 'A place for hamster mental health',
      image_url: 'https://static.wixstatic.com/media/5be228_7f1183150cc749fabaa4ff90d6af3686~mv2.png/v1/fill/w_640,h_480,fp_0.50_0.50,q_85,usm_0.66_1.00_0.01,enc_auto/5be228_7f1183150cc749fabaa4ff90d6af3686~mv2.png'
    }),
    createService({ 
      name: 'Wild Wild West Vets', 
      category_id: vet.id, 
      species_id: lizard.id,
      description: 'A vet specialized in reptiles and cold-blooded creatures',
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
  ]);

  const appointments = await Promise.all([
    createAppointment ({
      user_id: mari.id,
      service_id: scoobyDoo.id,
      appointment_date: '2024-11-01T10:00:00'
    }),
    createAppointment ({
      user_id: ozan.id,
      service_id: purrfectGroomers.id,
      appointment_date: '2024-11-05T14:00:00'
    }),
    createAppointment ({
      user_id: gui.id,
      service_id: wwwv.id,
      appointment_date: '2024-11-10T09:00:00'
    })
  ])

  const [review1, review2, review3, review4, review5] = await Promise.all([
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
    createReview({
      user_id: gui.id,
      service_id: wwwv.id,
      rating: 5,
      review_text: 'They took great care of my lizard'
    }),
    createReview({
      user_id: celdy.id,
      service_id: hamtaroFreud.id,
      rating: 5,
      review_text: 'I love their therapy methods. My hamaster is smarter'
    })
  ]);

  

  // Add this after creating reviews in the init function
  const comments = await Promise.all([
    createComment({
      review_id: review1.id, 
      user_id: ozan.id, 
      comment_text: 'My dog loves the night walks too!'
    }),
    createComment({
      review_id: review2.id, 
      user_id: mari.id, 
      comment_text: 'I agree, grooming is great but can be a bit expensive.'
    }),
    createComment({
      review_id: review3.id, 
      user_id: gui.id, 
      comment_text: 'BunBun always comes home happy!'
    }),
    createComment({
      review_id: review4.id, 
      user_id: luis.id,
      comment_text: 'Highly recommend this vet for lizards!'
    }),
    createComment({
      review_id: review5.id, 
      user_id: celdy.id, 
      comment_text: 'My hamster has improved significantly!'
    })
  ]);

  console.log('Comments seeded:', comments);


  console.log(await fetchServices());

  console.log(await fetchPets());

  console.log(await fetchFavorites());
  console.log(await fetchFavorites(mari.id));
  console.log(await destroyFavorite(favorites[0].id));
  console.log(await fetchFavorites(mari.id));

  // testing routes
  console.log(`\n# CURL commands to test the routes:\n`);

  console.log(`# User login`);
  console.log(`curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"username": "maricurti", "password": "shh2!"}'`);

  console.log(`# User registration`);
  console.log(`curl -X POST http://localhost:3000/api/auth/register \\
    -H "Content-Type: application/json" \\
    -d '{
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "johndoe@example.com",
      "password": "yourSecurePassword"
    }'`);

  console.log(`# Get logged-in user details`);
  console.log(`curl -X GET http://localhost:3000/api/auth/me \\
    -H "Authorization: Bearer <token>"`);

  console.log(`# Get all users`);
  console.log(`curl -X GET http://localhost:3000/api/users`);

  console.log(`# Get pets for a specific user`);
  console.log(`curl -X GET http://localhost:3000/api/users/<userId>/pets \\
    -H "Authorization: Bearer <token>"`);

  console.log(`# Get favorites for a specific user`);
  console.log(`curl -X GET http://localhost:3000/api/users/<userId>/favorites \\
    -H "Authorization: Bearer <token>"`);

  console.log(`# Create a service`);
  console.log(`curl -X POST http://localhost:3000/api/services \\
    -H "Content-Type: application/json" \\
    -d '{
      "name": "Provider Name",
      "category_id": "1",
      "species_id": "1",
      "description": "Service description",
      "image_url": "http://example.com/image.jpg"
    }'`);

  console.log(`# Create a pet for a user`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/pets \\
    -H "Authorization: Bearer <token>" \\
    -H "Content-Type: application/json" \\
    -d '{
      "pet_name": "Pet Name",
      "species_id": "1",
      "breed": "Breed",
      "age": 2,
      "weight": 10
    }'`);

  console.log(`# Create an appointment for a user`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/services/<serviceId>/appointments \\
    -H "Authorization: Bearer <token>" \\
    -H "Content-Type: application/json" \\
    -d '{
      "appointment_date": "2024-11-01T10:00:00"
    }'`);

  console.log(`# Get appointments for a user`);
  console.log(`curl -X GET http://localhost:3000/api/users/<userId>/appointments \\
    -H "Authorization: Bearer <token>"`);

  console.log(`# Update an appointment`);
  console.log(`curl -X PUT http://localhost:3000/api/appointments/<appointmentId> \\
    -H "Authorization: Bearer <token>" \\
    -H "Content-Type: application/json" \\
    -d '{
      "status": "confirmed",
      "appointment_date": "2024-11-05T14:00:00"
    }'`);

  console.log(`# Delete an appointment`);
  console.log(`curl -X DELETE http://localhost:3000/api/appointments/<appointmentId> \\
    -H "Authorization: Bearer <token>"`);

  console.log(`# Create a review for a service`);
  console.log(`curl -X POST http://localhost:3000/api/users/<userId>/services/<serviceId>/reviews \\
    -H "Authorization: Bearer <token>" \\
    -H "Content-Type: application/json" \\
    -d '{
      "rating": 5,
      "review_text": "Great service!"
    }'`);

  console.log(`# Get reviews for a service`);
  console.log(`curl -X GET http://localhost:3000/api/services/<serviceId>/reviews`);

  console.log(`# Update a pet`);
  console.log(`curl -X PUT http://localhost:3000/api/users/<userId>/pets/<petId> \\
    -H "Authorization: Bearer <token>" \\
    -H "Content-Type: application/json" \\
    -d '{
      "age": 3,
      "weight": 12
    }'`);

  console.log(`# Delete a review`);
  console.log(`curl -X DELETE http://localhost:3000/api/users/<userId>/services/<serviceId>/reviews/<reviewId> \\
    -H "Authorization: Bearer <token>"`);
  // express listen to port 3000
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};

init();