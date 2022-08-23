const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');

const api = require('./routes/api');


const app = express();

app.use(helmet());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;

    if (!isLoggedIn) {
        return res.status(401).json({
            error: 'You must log in',
        });
    }

    next();
}

app.use(cors({ origin: '*' }));

app.use(morgan('combined'));

app.use(express.json());

app.get('/auth/google', (req, res) => { });

app.get('/auth/google/callback', (req, res) => {});

app.get('/auth/logout', (req, res)=> {});

app.use('/v1', checkLoggedIn, api);


app.use(express.static(path.join(__dirname, '..', 'public')));


app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

module.exports = app;
