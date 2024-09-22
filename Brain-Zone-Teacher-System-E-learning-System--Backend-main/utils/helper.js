require('dotenv').config();
const connection = require('./db');

function checkIfExists(column, value) {
    return new Promise((resolve, reject) => {
        if (!connection || connection.state === 'disconnected') {
            reject(new Error('Database connection is not active.'));
            return;
        }

        connection.query(`SELECT * FROM teachers WHERE ${column} = ?`, [value], (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results.length > 0);
            }
        });
    });
}

module.exports = {
    checkIfExists
};
