const express = require('express');
const bodyParser = require('body-parser');
const app = express ();
const cors = require('cors')

const port = 3000;
// const db = require('./queries');
const db = require('./fLOW_queries');

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(cors());
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/#/pages/about.js');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Request headers you wish to allow
//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader('Access-Control-Allow-Credentials', true);

//     // Pass to next layer of middleware
//     next();
// });

app.get('/', (request,response) => {
    response.json({info: 'Node.js, Express, and Postgres API'});
});

app.get('/data', db.getData);
app.get('/add/:timestamp/:id/:volume', db.addEntry);
app.get('/data/:id', db.getDeviceData);
app.get('/summary/:id', db.sumVolume);
app.get('/dailysum/:id', db.getDailySum);
app.get('/available_user_ids', db.getUserIds);
// app.get('/data', db.getData);
// app.post('/users', db.createUser)
// app.put('/users/:id', db.updateUser)
// app.delete('/users/:id', db.deleteUser)

app.listen(port, () => {
    console.log(`App running on port ${port}.`);
});