'use strict';

const express = require('express');

const router = express.Router();
const book = require('../models/books.js');
const bookshelf = require('../models/bookshelves.js');
const superagent = require('superagent');
const modelFinder = require('../models/model-finder.js');
const app = express();

app.set('view engine', 'ejs');

router.param('', modelFinder);

router.get('/', getBooks);
router.post('/searches', createSearch);
router.get('/searches/new', newSearch);
router.get('/books/:id', getBook);
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

router.get('*', (request, response) => response.status(404).send('This route does not exist'));

function getBooks(req, res, next) {

  book.get()
    .then(results => {
      const output = {
        count: results.length,
        results: results,
      };
      if (!output) {
        res.render('pages/searches/new');
      }
      else {
        res.render('pages/index', { books: output.results });
      }
    })
    .catch(next);
}

function createSearch(req, res, next) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => {
      let bookArr = apiResponse.body.items.map((apiBooks) => new Book(apiBooks.volumeInfo));
      return bookArr;
    })
    .then(allBooks => {
      res.render('pages/searches/show', { results: allBooks });
    })
    .catch(next);
}

function newSearch(req, res, next) {
  res.render('pages/searches/new');
}

function getBook(req, res, next) {
  book.get(req.params.id)
    .then(result => {
      let bookshelf = [
        {
          bookid: req.params.id,
          name: 'cities'
        }];

      res.render('pages/books/show', { book: result[0], bookshelves: bookshelf });
    })
    .catch(next);
}

function createBook(req, res, next) {
  createShelf(req.body.bookshelf);
  console.log('console logging params', req.params);

  book.post(req.body)
    .then(result => {
      console.log('in result', result);
      const output = {
        count: result.length,
        results: result,
      };

      res.redirect(`/books/${output.results.id}`);
    })
    .catch(next);
}

function getBookshelves() {
  bookshelf.get()
    .then(results => {
      return results;
    });
}

function createShelf(shelf) {
  let normalizedShelf = shelf.toLowerCase();
  bookshelf.get()
    .then(results => {
      if (results.length === 0) {
        bookshelf.post(shelf);
        bookshelf.get()
          .then(results => {
            console.log('added to shelf', results[0]._id);

            return results[0]._id;
          });
      }
      else {
        console.log('in shelf', results[0]._id);
        return results[0]._id;
      }
    });
}

function updateBook(req, res, next) {
  book.put(req.params.id, req.body)
    .then(res.redirect(`/books/${req.params.id}`))
    .catch(next);
}

function deleteBook(req, res, next) {
  book.delete(req.params.id)
    .then(res => {
    })
    .then(res.redirect('/'))
    .catch(next);
}

function Book(info) {
  let placeholderImage = 'https://i.imgur.com/J5LVHEL.jpg';

  this.title = info.title || 'No title available';
  this.author = info.authors || 'No authors available';
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No ISBN available';
  this.image_url = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
  this.description = info.description || 'No description available';
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : '';
}

module.exports = router;
