$(function() {
    app.askPoll = new Vue({
        el: "#poll-question",
        data: {
            polls: []
        },
        methods: {
            // option voted
            submitVote: function(e) {
                poll_id = e.target.name;
                option = e.target.innerText;
                console.log(poll_id);
                console.log(option)
                app.addResponse(poll_id, option);
            }
        }
    })

    app.socket = io.connect();

    app.socket.on('load polls', function(data) {
        app.askPoll.$set('polls', data);
    });

    app.socket.on('polls', function(data) {
        console.log("poll change detected");
        // Update the list of polls
        polls = app.askPoll.$data.polls;

        // update list of polls
        if (data.old_val == null) { polls.push(data.new_val); }
        else  {
            polls.forEach(function(q, i) {
                // Find the matching poll
                if (q.id == data.old_val.id) {
                    // delete poll
                    if (data.new_val == null) { polls.$remove(i) }
                    // update poll
                    else { polls.$set(i, data.new_val) }
                }
            });
        }
    });
});

app = {
    socket: undefined,

    // push the response to the server
    addResponse: function(poll_id, option) {
        response = {
            poll_id: poll_id,
            option: option,
        }
        console.log(response);
        app.socket.emit('new response', response);
    },
}

