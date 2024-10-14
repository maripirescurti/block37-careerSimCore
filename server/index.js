// import
const { 
  client,
  createTables,
  createUser,
  createCategory,
  
 } = require('./db');


// init function
const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
}

init();