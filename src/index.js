'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const methodOverride = require('method-override');

const errorHandler = require('./middleware/error');
const notFound = require('./middleware/404');

const apiRouter = require('./api/routes-sql');

const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride((req, res) => {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    let method = req.body._method;
    delete req.body._method;
    return method;
  }
}));

app.set('view engine', 'ejs');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(apiRouter);

app.use(notFound);
app.use(errorHandler);

let isRunning = false;

module.exports = {
  server: app,
  start: (port) => {
    if (!isRunning) {
      app.listen(port, () => {
        isRunning = true;
        console.log(`Server Up on port ${port}`);
      });
    }
    else {
      console.log('Server is already running');
    }
  },
};
