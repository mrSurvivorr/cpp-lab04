var express = require('express');
var createError = require('http-errors');
var path = require('path');
var bodyParser = require('body-parser');
var database = require('./db')

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

const hostname = 'localhost';
const port = process.env.PORT || 3000;

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

app.use(allowCrossDomain);

app.get('/', async (req, res) => {
  console.log(database.books)
  res.render('index', {
    books: database.books
  });
});

app.get('/getBook', (req, res) => {
  const book = database.books.find(b => b.id === parseInt(req.query.id));
  res.render('book', {book: book});
});

app.get('/createBook', (req, res) => {
  res.render('createBook');
});

app.get('/editBook', (req, res) => {
  const book = database.books.find(b => b.id === parseInt(req.query.id));
  res.render('editBook', {book: book});
});

app.post('/createBook', (req, res) => {
  database.books.push(
      {
        'id': (database.books[database.books.length - 1].id + 1),
        'picture': req.body.picture,
        'name': req.body.name,
        'author': req.body.author,
        'isAvailable': true
      }
  );
  res.redirect('/');
});

app.post('/editBook', (req, res) => {
  var index = database.books.findIndex(b => b.id === parseInt(req.body.id));
  var oldBook = database.books[index];
  database.books[index] = {
    'id': oldBook.id,
    'picture': req.body.picture,
    'name': req.body.name,
    'author': req.body.author,
    'isAvailable': oldBook.isAvailable
  };
  res.redirect('/');
});

app.post('/changeBookStatus', (req, res) => {
  database.books.forEach(function (b) {
    if (b.id === parseInt(req.body.id)){
      b.isAvailable = req.body.isAvailable === 'true';
    }
  });
  res.redirect('/');
});

app.post('/deleteBook', (req, res) => {
  var index = database.books.findIndex(b => b.id === parseInt(req.body.id));
  database.books.splice(index, 1);
  res.redirect('/');
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});


app.listen(port, hostname, () => {
  console.log(`Server running AT http://${hostname}:${port}/`);
});

module.exports = app;
