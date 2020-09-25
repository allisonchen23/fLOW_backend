const express = require('express');
const bodyParser = require('body-parser');
const app = express ();
const cors = require('cors')

const port = 3000;
const db = require('./fLOW_queries');

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(cors());

app.get('/', (request,response) => {
    response.json({info: 'Node.js, Express, and Postgres API'});
});

app.get('/data', db.getData);
app.get('/add/:timestamp/:id/:volume', db.addEntry);
app.get('/data/:id', db.getDeviceData);
app.get('/summary/:id', db.sumVolume);
app.get('/dailysum/:id', db.getDailySum);
app.get('/available_user_ids', db.getUserIds);

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});