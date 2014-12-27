var koa = require('koa');
var json = require('koa-json');
var bodyParser = require('koa-body-parser');
var router = require('koa-router');
var Q = require('q');
var Sequelize = require('sequelize');
var co = require('co');

module.exports = function() {
  var sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'my.db'
  });

  var Note = sequelize.define('Note', {
    content: Sequelize.STRING
  });

  var app = koa();
  app.use(bodyParser());
  app.use(json());
  app.use(function* (next) {
    this.Note = Note;
    yield* next;
  });
  
  app.use(router(app)); 

  app.get('/notes', function* (next) {
    this.body = yield this.Note.findAll();
  });

  app.post('/notes', function* (next) {   
    this.body = yield this.Note.create({
      content: this.request.body.content
    });
  });

  app.get('/notes/:id', function* (next) {
    var noteId = this.params.id;
    var note = yield this.Note.find(noteId);
    if(!note) {
      this.throw(404, 'Note not found');
      return;
    }

    this.body = note;
  });

  app.delete('/notes/:id', function* (next) {
    var noteId = this.params.id;    
    var note = yield this.Note.find(noteId);
    if(!note) {     
      this.throw(404, 'Note not found');
      return;
    }

    yield note.destroy();

    this.body = { 'message': 'ok' };
  });

  app.put('/notes/:id', function* (next) {
    var noteId = this.params.id;    
    var note = yield this.Note.find(noteId);
    if(!note) {     
      this.throw(404, 'Note not found');
      return;
    }

    note.content = this.request.body.content;
    yield note.save();

    this.body = { 'message': 'ok' };
  });

  return co(function* () {
    yield sequelize.drop();
    yield sequelize.sync();
    return Q.Promise(function(resolve) {
      server = app.listen(3000, function() {
        resolve(server);
      });
    });
  });
};
