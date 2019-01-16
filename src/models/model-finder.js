'use strict';

module.exports = (request, response, next) => {
  request.books = require(`../models/books.js`);
  request.bookshelf = require('../models/bookshelves.js');
  next();
};
