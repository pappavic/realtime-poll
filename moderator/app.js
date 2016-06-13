var r = require('rethinkdb');
var express = require('express');
var sockio = require('socket.io');
var config = require('./config');

var app = express();
app.use(express.static(__dirname + '/public'));

var io = sockio.listen(app.listen(config.port), {log: false});
console.log('Server started on port', config.port);

// query to get number of responses 
responses = r.table('responses');
polls = r.table('polls');

// changefeed for responses
r.connect({db: 'play'}).then(function(conn) {
    polls.changes().run(conn)
        .then(function(cursor) {
            cursor.each(function(err, change) {
                console.log('New change:', change);
                // ...emit a message to all clients with the changes
                io.sockets.emit('polls', change);
            });
        });

    responses.changes().run(conn)
        .then(function(cursor) {
            cursor.each(function(err, change) {
                console.log('New change:', change);
                // ...emit a message to all clients with the changes
                io.sockets.emit('responses', change);
            });
        });
});


io.sockets.on('connection', function(socket) {
    // When a client first connects, send all responses already in the database to the client
    r.connect({db: 'play'}).then(function(conn) {
        return responses.run(conn)
            .finally(function() { conn.close(); });
    })
    .then(function(cursor) { return cursor.toArray(); })
    .then(function(result) { socket.emit('load responses', result); })
    .error(function(err) { console.log('Error retrieving responses: ', err); });

    r.connect({db: 'play'}).then(function(conn) {
        return polls.run(conn)
            .finally(function() { conn.close(); });
    })
    .then(function(cursor) { return cursor.toArray(); })
    .then(function(result) { socket.emit('load polls', result); })
    .error(function(err) { console.log('Error retrieving polls: ', err); });
});
