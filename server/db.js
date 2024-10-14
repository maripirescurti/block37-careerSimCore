// imports
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/ydimb_services_db');

// exports
module.exports = {
  client,
};
