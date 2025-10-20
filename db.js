require('dotenv').config();
let mysql = require('mysql2');
const { DATABASE_HOST, DATABASE_PORT, DATABASE_USER,  DATABASE_PASSWORD, DATABASE } = process.env;

let connection = mysql.createConnection({    
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    user     : DATABASE_USER,
    password : DATABASE_PASSWORD,
    database : DATABASE,
    charset: 'utf8mb4'
});

setInterval(() => {
    connection.query('SELECT 1', (err) => {
        if (err) {
            console.error('MySQL keep-alive error:', err);
            connection.destroy();
            connection = mysql.createConnection({ 
                host: DATABASE_HOST,
                port: DATABASE_PORT,
                user: DATABASE_USER,
                password: DATABASE_PASSWORD,
                database: DATABASE,
                charset: 'utf8mb4'
            });
        } else {
            console.log('MySQL keep-alive ping sent');
        }
    });
}, 5 * 60 * 1000);


module.exports = connection;