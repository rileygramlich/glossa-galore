const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1/glossa', {
  useNewUrlParser: true
});

const db = mongoose.connection;
	
db.on('connected', function() {
  console.log(`Connected to MongoDB at ${db.host}:${db.port}`);
})

// gotta connect to api's here I do believe