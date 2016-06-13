$(function() {
    app.socket = io.connect();

    app.moderator = new Vue({
        el: "#moderator",
        data: {
            responses: [],
            polls: [],
            summary: []
        },
        computed: {
            pollResultData: function() {
                var filtered = _.where(this.responses, { poll_id: this.selected });
                return _.countBy(filtered, function(res){ return res.option; });
            }
        },
        methods: {

        }
    })

    app.socket.on('load responses', function(data) {
        console.log(data);
        app.moderator.responses = data;
    });

    app.socket.on('load polls', function(data) {
        console.log(data);
        app.moderator.polls = data;
    });

    // respond to updates on responses
    app.socket.on('responses', function(data) {
        // just add it if old_val is null
        if (data.old_val == null) { app.moderator.responses.push(data.new_val); }
        else  {
            updateRecords(app.moderator.responses, data);
            app.moderator.responses = _.countBy(app.moderator.responses, function(val){ return val.poll_id + val.option; });
        }
    });

    // respond to updates on polls
    app.socket.on('polls', function(data) {
        // just add it if old_val is null
        if (data.old_val == null) { app.moderator.polls.push(data.new_val); }
        else  {
            updateRecords(app.moderator.polls, data);
        }
    });
});

app = {
    socket: undefined,
    updateRecords: function(array, data) {
        array.forEach(function(q, i) {
                // find matching value
                if (q.id == data.old_val.id) {
                    // delete response when new_val is null
                    if (data.new_val == null) { array.splice(i, 1) }
                    // updating the client with the new value
                    else { array[i] = data.new_val }
                }
            });
    }
}
