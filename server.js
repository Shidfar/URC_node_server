var http = require('http');
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser')
    command = require('./routes/commands');

var app = express();

//app.use(morgan('combined'))     /* 'default', 'short', 'tiny', 'dev' */
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

app.post('/commands/all', command.getAll);
app.post('/commands/press', command.sendCommand);
app.post('/commands/delete', command.deleteCommand);
// app.get('/commands/byDevice/:id');
// app.get('/commands/buDevice/all');
app.get('commands/byGateway/:id');

// app.get('/commands', command.findAll);
// app.get('/commands/:id', command.findById);
// app.post('/commands', command.addCommand);
// app.put('/commands/:id', command.updateCommand);
// app.delete('/commands/:id', command.deleteCommand);



app.listen(3000);
console.log('Listening on port 3000...');