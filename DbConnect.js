const mysql = require('mysql');
const mysql1 = require('mysql');
module.exports = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'saunlp'
});