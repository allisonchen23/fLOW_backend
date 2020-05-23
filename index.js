const express = require('express');
const bodyParser = require('body-parser');
const app = express ();
const port = 3005;
// const db = require('./queries');
const db = require('./fLOW_queries');

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.get('/', (request,response) => {
    response.json({info: 'Node.js, Express, and Postgres API'});
});

app.get('/data', db.getData);
app.get('/add/:timestamp/:id/:volume', db.addEntry);
app.get('/data/:id', db.getDeviceData);
//app.get('/summary/:id', db.getDeviceLastWeek);
app.get('/dailysum/:id', db.getDailySum);
// app.get('/data', db.getData);
// app.post('/users', db.createUser)
// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});