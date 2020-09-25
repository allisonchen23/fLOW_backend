const Pool = require('pg').Pool;
//const url = require('url');
const pool = new Pool ({
    user: 'allison_chen',
    password: 'postgres_sql_fLOW',
    host: '0.0.0.0',
    port: 5432,
    database: 'db1',
});

// Gets all data entries in the table
const getData = (request, response) => {
    pool.query('SELECT * FROM data ORDER BY timestamp', (error, results) => {
        if (error) {
        throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Add Data to the table
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

// Get all data for a specific device ID
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


// Helper function to obtain the timestamp of the last entry for a specific device ID
const getLastTimestamp = async (id) => {
    const max = await pool.query('SELECT MAX("timestamp") FROM data WHERE device_id=($1)', [id]);
    return max.rows[0].max;
};

// Return the daily sums for the last week of the specified devices selected
const getDailySum = async (request, response) => {
    let ids = request.params.id.split("_");
    let latestTime = 0;

    // Out of all the devices we want to look at, obtain the latest timestamp
    for (let id of ids) {
        let time = await getLastTimestamp(id);
        if (time > latestTime) {
            latestTime = time;
        }
    }

    let lastDay = new Date(latestTime*1000 + 3000);
    
    //Set curDay to the start date
    let curDay = new Date(lastDay);
    curDay.setDate(curDay.getDate() - 6);
    curDay.setHours(0);
    curDay.setMinutes(0);
    curDay.setSeconds(0);
    
    var weekSum = {};
    var curTS = curDay.getTime()/1000;

    // Initialize each day's sum to be 0
    // We keep 8 elements for 7 day calculations so we have the ending timestamp on hand for the last day
    for (let i = 0; i < 8; i++) {
        weekSum[curTS] = 0;
        curDay.setDate(curDay.getDate() + 1);
        curTS = curDay.getTime()/1000;
    }

    // Get the daily sums for each day of the week for each device 
    let keys = Object.keys(weekSum)
    for (let id of ids) {
        for (let idx in Object.keys(weekSum)) {
            if (idx == 7) {
                break;
            }
            
            let timestamp = keys[idx];
            let tomorrow_timestamp = keys[parseInt(idx)+1];
            weekSum[timestamp] += await sumRange(timestamp, tomorrow_timestamp, id)
        }
    }
    
    delete weekSum[Object.keys(weekSum)[7]];
    response.status(200).json(weekSum);
    response.end();
};

/*
    Helper function to sum data between start_timestamp and
    end_timestamp with ID id
*/
const sumRange = async (start_timestamp, end_timestamp, id) => {
    const query_result = await pool.query('SELECT SUM (volume) FROM data WHERE device_id=($1) AND timestamp>=($2) AND timestamp<($3)', [id, start_timestamp, end_timestamp]);
    let sum = query_result.rows[0].sum;
    
    if (sum != null) {
        sum = sum.toFixed(2);
        console.log("rounded sum: " + sum);
        return sum;
    }
    else {
        return 0;
    }
};

// Function to return sum of volume over all dates for a specific device
const sumVolume = (async (request, response) => {
    const id = parseInt(request.params.id);
    const query_result = await pool.query('SELECT SUM (volume) FROM data WHERE device_id=($1)', [id]);
    console.log(query_result.rows[0]);
    response.status(200).send(query_result.rows[0])
    response.end();
});

// Return list of unique device IDs from the table
const getUserIds = (async (request, response) => {
    let query_result = await pool.query('SELECT DISTINCT device_id FROM data;');
    let user_ids = [];
    for (let entry of query_result.rows) {
        user_ids.push(entry["device_id"]);
    }
    response.status(200).send(user_ids);
    response.end();
})
module.exports = {
    getData,
    addEntry,
    getDeviceData,
    getDailySum,
    sumVolume,
    getUserIds
}