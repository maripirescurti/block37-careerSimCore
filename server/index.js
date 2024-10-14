// import
const { client } = require('./db');

const init = async()=> {
  await client.connect();
  console.log('connected to database');
}

init();