const Pool = require('pg').Pool;
const url = require('url');
const pool = new Pool ({
    user: 'allison_chen',
    password: 'postgres_sql_fLOW',
    host: '0.0.0.0',
    port: 5432,
    database: 'db1',
});

// Get Data
const getData = (request, response) => {
    pool.query('SELECT * FROM data ORDER BY timestamp', (error, results) => {
        if (error) {
        throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Add Data
const addEntry = (request, response) => {
    const id = parseInt(request.params.id);
    const timestamp = parseInt(request.params.timestamp)
    const volume = parseFloat(request.params.volume)
    //response.status(201).send(`ID: ${id}, Timestamp: ${timestamp}, Volume: ${volume}`);
    pool.query('INSERT INTO data (timestamp, device_id, volume) VALUES ($1, $2, $3)' +
        ' ON CONFLICT ON CONSTRAINT data_pkey DO UPDATE SET volume = EXCLUDED.volume',
        [timestamp, id, volume],
        (error, results) =>
        {
            if (error) {
                throw error;
            }
            response.status(201).send(`Following data added: ID: ${id}, Timestamp: ${timestamp}, Volume: ${volume}`)
        })
}

// Get all data for a device
const getDeviceData = (request, response) => {
    const id = parseInt(request.params.id);
    pool.query('SELECT * FROM data WHERE device_id=($1)', [id],
    (error, results) =>
        {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        }
    )
}

module.exports = {
    getData,
    addEntry,
    getDeviceData,
}