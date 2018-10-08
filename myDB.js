const monk = require('monk')

// Connection URL


const url = 'localhost:27017/myproject'; // Connection URL
const db = require('monk')(url);
const collection = db.get('document');

var initialDB = function() {
  return collection.remove()
  .then(() => {
      collection.insert([{a: 1}, {a: 2}, {a: 3}]);
  })

}

var updateDB = function() {
  return collection.update({ a: 2 }, { $set: { b: 1 } });
}

var close = function() {
  return db.close();
}

var query = function() {
  return collection.find();
}

exports.initialDB  = initialDB;
exports.updateDB = updateDB;
exports.close = close;
exports.query = query;