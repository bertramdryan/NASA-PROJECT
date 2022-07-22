const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const planetsRouter = require('./routes/planets/planets.router');


const app = express();

const whiteList = ['http://localhost:3000']

app.use(cors({
        origin: (origin, callback) => {
        if (whiteList.indexOf(origin) !== -1 || !origin) {
                callback(null, true)
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    })
);

app.use(morgan('combined'));

app.use(express.json());

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(planetsRouter)
app.get('/', (req, res) => {
    // console.log(__dirname);
    // res.sendFile(path.join(__dirname, '..','public', 'build' ,'index.html'));
});

module.exports = app;
