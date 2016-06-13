var r = require('rethinkdb');

var connection = null;
r.connect( {host: 'localhost', port: 28015}, function(err, conn) {
    if (err) throw err;
    connection = conn;

    // create database
    r.dbCreate('play').run(conn, function(err, result) {
    	console.log(JSON.stringify(result, null, 2));

    	// create tables
    	r.db('play').tableCreate('polls').run(conn, function(err, result) {
	    	console.log(JSON.stringify(result, null, 2));

	    	// add some test data
	    	r.db('play').table('polls').insert(
	    	[
			    {
			    	"active":true,
			    	"options":["Red","Blue","Yellow","Other"],
			    	"statement":"What is your favourite colour?"
			    },
			    {
			    	"active":true,
			    	"options":["Paris","New York","London","Switzerland"],
			    	"statement":"What is your favourite holiday destination?"
			    },
			    {
			    	"active":true,
			    	"options":["Golden State","Cleveland"],
			    	"statement":"Who will win the NBA championship?"
			    }
			]).run(connection, function(err, result) {
			    if (err) throw err;
			    console.log(JSON.stringify(result, null, 2));
			})
		})

		r.db('play').tableCreate('responses').run(conn, function(err, result) {
	    	//if (err) throw err;
	    	console.log(JSON.stringify(result, null, 2));
		})
	})
})