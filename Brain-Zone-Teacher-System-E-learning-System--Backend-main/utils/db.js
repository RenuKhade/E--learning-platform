const mysql = require('mysql');
const host = process.env.HOST   
const user = process.env.DB_USER 
const database = process.env.DATABASE
const password = process.env.DB_PASSWORD ? process.env.DB_PASSWORD : '';
const connection = mysql.createConnection({
    host: host,
    user: user,
    database: database,
    password: password ? password : ''

});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
}
);
module.exports = connection;
