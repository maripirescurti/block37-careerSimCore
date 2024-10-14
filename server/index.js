// import
const { 
  client,
  createTables,
  createUser,
  createCategory,
  createProvider,
 } = require('./db');


// init function
const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
  const [mari, ozan, luis, celdy, gui, groomer, walker, petsitter, vet, therapist, dog, cat, rabbit, hamster, lizard] = await Promise.all([
    createUser({ first_name: 'Mari', last_name: 'Curti', username: 'maricurti', email: 'mariana.pcurti@gmail.com', password: 'shh24!'}),
    createUser({ first_name: 'Ozan', last_name: 'Cicek', username: 'ozancicek94', email: 'ozancicek94@gmail.com', password: 'shh24!'}),
    createUser({ first_name: 'Luis', last_name: 'Curti', username: 'luisao67', email: 'luis_curti@gmail.com', password: 'shh24!'}),
    createUser({ first_name: 'Celdy', last_name: 'Pires', username: 'mcdivertida68', email: 'celdy@gmail.com', password: 'shh24!'}),
    createUser({ first_name: 'Gui', last_name: 'Curti', username: 'guiguigui', email: 'guicurti@gmail.com', password: 'shh24!'}),

    createCategory({ category_name: 'groomer'}),
    createCategory({ category_name: 'walker'}),
    createCategory({ category_name: 'petsitter'}),
    createCategory({ category_name: 'vet'}),
    createCategory({ category_name: 'therapist'}),

    createPetType({ type_name: 'dog'}),
    createPetType({ type_name: 'cat'}),
    createPetType({ type_name: 'rabbit'}),
    createPetType({ type_name: 'hamster'}),
    createPetType({ type_name: 'lizard'}),
  ])
}

init();