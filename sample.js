const {Pool, Client} = require('pg');
const connectionString = 'postgressql://allison_chen:postgres_sql_fLOW@localhost:5432/db1';

const client = new Client ({
    connectionString: connectionString
});

client.connect();
client.query('SELECT NOW()', (err, res) => {
    console.log(err, res);
    client.end();
})