var r = require('rethinkdb');
var express = require('express');
var sockio = require('socket.io');
var config = require('./config');

var app = express();
app.use(express.static(__dirname + '/public'));

var io = sockio.listen(app.listen(config.port), {log: false});
console.log('Server started on port', config.port);

// RethinkDB query for currently active polls
activePolls = r.table('polls').filter({"active": true});

// Open a changefeed for polls
r.connect({db: 'play'}).then(function(conn) {
    activePolls.changes().run(conn)
        .then(function(cursor) {
            cursor.each(function(err, change) {
                console.log('New change:', change);
                // ...emit a message to all clients with the changes
                io.sockets.emit('polls', change);
            });
        });
});

io.sockets.on('connection', function(socket) {
    // When a client first connects, send all polls already in the database to the client
    r.connect({db: 'play'}).then(function(conn) {
        return activePolls.run(conn)
            .finally(function() { conn.close(); });
    })
    .then(function(cursor) { return cursor.toArray(); })
    .then(function(result) { socket.emit('load polls', result); })
    .error(function(err) { console.log('Error retrieving polls: ', err); });

    // new response added by a client (we receive a message)
    socket.on('new response', function(data, cb) {
        console.log('New response: ', data);

        r.connect({db: 'play'}).then(function(conn) {
            // add the new response
            return r.table('responses').insert(data).run(conn)
                .finally(function() { conn.close(); });
        })
        .error(function(err) { console.log('Error adding response: ', err); });
    });
});
