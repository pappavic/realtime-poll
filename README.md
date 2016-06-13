# realtime-polls
Realtime polls using RethinkDB as backend. There are two seperate apps:
- polls: used for user input to answer the question
- moderator: results view

## Install
- RethinkDB (latest version as of today is 2.3)
- Node

## Setup commands
- npm install
- Run "node setup.js" to create the DB instance and populate some dummy data

## Models used:

poll
{
	id: "",
	statement: "",
	options: ["", ""]
}

responses
{
	poll_id: "",
	option: ""
}