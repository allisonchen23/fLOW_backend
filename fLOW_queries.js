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

/* Unable to work due to async runtime? */
const getLastTimestamp = async (id) => {
    const max = await pool.query('SELECT MAX("timestamp") FROM data WHERE device_id=($1)', [id]);
    return max.rows[0].max;
};

const getDailySum = async (request, response) => {
    /* Ray: get timestamps from last seven days */
    console.log("start");
    let id = parseInt(request.params.id);
    let latestTime = await getLastTimestamp(id);
    let latestMiliTime = latestTime*1000;
    let latestDate = new Date(latestMiliTime);

    let prevWeekStartingDate = latestDate;
    prevWeekStartingDate.setDate(latestDate.getDate()-6);
    prevWeekStartingDate.setHours(0);
    prevWeekStartingDate.setMinutes(0);
    prevWeekStartingDate.setSeconds(0);
    prevWeekStartingDate.setMilliseconds(0);
    
    let start, end, startDate, endDate;
    let results = [];
    for(let i = 0; i < 7; ++i) {
        startDate = prevWeekStartingDate;
        startDate.setDate(startDate + i);
        endDate = startDate;
        endDate.setDate(startDate.getDate()+1);
        //getTime() return in ms
        start = startDate.getTime()/1000; 
        end = endDate.getTime()/1000;

        let sum = await sumRange(start, end, id);
        results.push(sum);
    }

    console.log(results);

    
    response.end();

    // const day = new Date();
    //response.status(200).send(`Today: ${day}`);
    //var sum = sumVolume(id, 200, 201);
    // console.log(sum);
    //response.status(200).json(sum);
};

/*
    Helper function to sum data between start_timestamp and
    end_timestamp with ID id
    Arguments: 
*/
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