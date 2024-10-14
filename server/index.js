// import
const { 
  client,
  createTables,
 } = require('./db');


// init function
const init = async()=> {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');
}

init();