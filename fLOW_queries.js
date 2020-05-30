const Pool = require('pg').Pool;
//const url = require('url');
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
    console.log("Data here ");
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


const getLastTimestamp = (id) => {
    pool.query()
};
const getDailySum = (request, response) => {
    const id = parseInt(request.params.id);
    // const day = new Date();
    //response.status(200).send(`Today: ${day}`);
    var sum = sumVolume(id, 200, 201);
    // console.log(sum);
    response.status(200).json(sum);
};
// Sum up the 
const sumRange = async (start_timestamp, end_timestamp, id) => {
    const query_result = await pool.query('SELECT SUM (volume) FROM data WHERE device_id=($1) AND timestamp>=($2) AND timestamp<=($3)', [id, start_timestamp, end_timestamp]);
    return query_result.rows[0].sum;
};

const sumVolume = (async (request, response) => {
    const id = parseInt(request.params.id);
    const start_timestamp = 200;
    const end_timestamp = 201;
    await sumRange(start_timestamp, end_timestamp, id).then((result) => {
        response.status(200).send('' + result);
    });
    response.end();
});

module.exports = {
    getData,
    addEntry,
    getDeviceData,
    getDailySum,
    sumVolume,
}