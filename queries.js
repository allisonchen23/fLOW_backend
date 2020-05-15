const Pool = require('pg').Pool;
const pool = new Pool ({
    user: 'test',
    password: 'postgres_sql_fLOW',
    host: '0.0.0.0',
    port: 5432,
    database: 'db1',
});
// const { Pool, Client} = require('pg');
// const connectionString = 'postgresql://allison_chen'

// Get Users
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
        if (error) {
        throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get Users
const getData = (request, response) => {
    pool.query('SELECT * FROM data ORDER BY timestamp ASC', (error, results) => {
        if (error) {
        throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get User By ID
const getUserById = (request, response) => {
    const id = parseInt(request.params.id);
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows)
    });
}

// Create User
const createUser = (request, response) => {
    const {name, email} = request.body;

    pool.query('INSERT INTO users (name,email) VALUES ($1, $2)', [name, email], 
        (error, results)=>{
            if (error) {
                throw error;
            }
            response.status(201).send(`User added with ID: ${results.insertID}`);
        });
}

// Update User
const updateUser = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, email} = request.body;

    pool.query('UPDATE users SET name = $1, email = $2 WHERE id = $3',
        [name, email, id],
        (error, results) => {
            if (error) {
                throw error;
            }

            response.status(200).send(`User modified with ID: ${id}`);
        });
}

// Delete User
const deleteUser = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`User deleted with ID: ${id}`);
    })
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getData
}