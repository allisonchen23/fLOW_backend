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
    console.log("Data ");
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

/* Unable to work due to async runtime? */
const getLastTimestamp = async (id) => {
    const max = await pool.query('SELECT MAX("timestamp") FROM data WHERE device_id=($1)', [id]);
    return max.rows[0].max;
};

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
    // console.log("last month: " + lastDay.getMonth() + " day: " + lastDay.getDate() + " year: " + lastDay.getFullYear());
    // console.log(lastDay.getSeconds());
    
    //Set curDay to the start date
    let curDay = new Date(lastDay);
    curDay.setDate(curDay.getDate() - 6);
    curDay.setHours(0);
    curDay.setMinutes(0);
    curDay.setSeconds(0);
    // console.log("cur month: " + curDay.getMonth() + " day: " + curDay.getDate() + " year: " + curDay.getFullYear());

    // console.log(curDay.getDate()  + " lastDay's date: " + lastDay.getDate());
    // console.log(curDay.getHours() + " " + curDay.getMinutes() + " " + curDay.getSeconds());
    // curDay.setDate(latestTime.)
    
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
        console.log(id);
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
    Arguments: 
*/
const sumRange = async (start_timestamp, end_timestamp, id) => {
    const query_result = await pool.query('SELECT SUM (volume) FROM data WHERE device_id=($1) AND timestamp>=($2) AND timestamp<($3)', [id, start_timestamp, end_timestamp]);
    let sum = query_result.rows[0].sum;
    if (sum != null) {
        return sum;
    }
    else {
        return 0;
    }
};

/**
 * Sum volume over all dates for a specific device
 * @param {} request 
 * @param {*} response 
 */
const sumVolume = (async (request, response) => {
    const id = parseInt(request.params.id);
    const query_result = await pool.query('SELECT SUM (volume) FROM data WHERE device_id=($1)', [id]);
    response.status(200).send(query_result.rows[0])
    response.end();
});

const getUserIds = (async (request, response) => {
    let query_result = await pool.query('SELECT DISTINCT device_id FROM data;');
    console.log(query_result);
    let user_ids = [];
    for (let entry of query_result.rows) {
        user_ids.push(entry["device_id"]);
    }
    console.log(user_ids);
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